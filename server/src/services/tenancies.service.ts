import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { uploadFile, getSignedUrl, BUCKETS } from '../db/storage';
import { generateLeasePdf } from './lease-pdf.helper';

export const ActivateTenancySchema = z.object({
  depositAmount: z.number().min(0).optional(),
  rentDueDay: z.number().min(1).max(28),
  leaseStartDate: z.string().datetime({ offset: true }).or(z.string()), // Accept ISO string
  // Lease duration isn't fixed - the agent and tenant agree on it per
  // tenancy (six months, a year, five years, whatever), so this is a
  // required field the agent picks, not a computed default.
  leaseEndDate: z.string().datetime({ offset: true }).or(z.string()),
  rentAmount: z.number().positive(),
});

export type ActivateTenancyDto = z.infer<typeof ActivateTenancySchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class TenanciesService {
  /**
   * Activates a pending tenancy.
   * - Validates lease details
   * - Generates the real lease agreement PDF and uploads it to storage
   * - Updates Tenancy status to 'active'
   * - Updates Unit status to 'occupied'
   * - Creates TrustTransaction for deposit received
   */
  async activate(id: string, data: ActivateTenancyDto, user: TokenPayload) {
    // 1. Fetch existing pending tenancy
    const tenancy = await prisma.tenancy.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        unit: { include: { property: { include: { owner: true } } } },
        tenant: true,
      }
    });

    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.status === 'active') throw new AppError('Tenancy is already active', 400);

    const leaseStart = new Date(data.leaseStartDate);
    const leaseEnd = new Date(data.leaseEndDate);
    if (Number.isNaN(leaseEnd.getTime())) throw new AppError('Please choose a valid lease end date.', 400);
    if (leaseEnd <= leaseStart) throw new AppError('Lease end date must be after the lease start date.', 400);

    const account = await prisma.account.findUnique({ where: { id: user.accountId }, select: { name: true, city: true } });

    return await prisma.$transaction(async (tx) => {
      // 2. Generate the real lease agreement PDF and upload to Supabase Storage
      const pdfBuffer = await generateLeasePdf({
        accountName: account?.name || 'the Agent',
        ownerName: tenancy.unit.property.owner.full_name,
        tenantName: tenancy.tenant.full_name,
        tenantDob: tenancy.tenant.date_of_birth,
        tenantIdNumber: tenancy.tenant.id_number,
        tenantEmail: tenancy.tenant.email,
        tenantPhone: tenancy.tenant.phone,
        propertyAddress: tenancy.unit.property.address || tenancy.unit.property.name,
        propertyType: tenancy.unit.property.type,
        leaseStart,
        leaseEnd,
        rentAmount: data.rentAmount,
        currency: tenancy.currency,
        depositAmount: data.depositAmount ?? null,
        signingCity: account?.city || undefined,
      });
      const storagePath = `leases/${user.accountId}/${id}.pdf`;
      await uploadFile(BUCKETS.leases, storagePath, pdfBuffer, 'application/pdf');
      const leasePdfUrl = storagePath;

      // 3. Update Tenancy to active
      const updatedTenancy = await tx.tenancy.update({
        where: { id },
        data: {
          status: 'active',
          rent_amount: data.rentAmount,
          deposit_amount: data.depositAmount || null,
          rent_due_day: data.rentDueDay,
          lease_start: leaseStart,
          lease_end: leaseEnd,
          lease_pdf_url: leasePdfUrl,
        }
      });

      // 4. Update Unit status to occupied
      await tx.unit.update({
        where: { id: tenancy.unit_id },
        data: { status: 'occupied' }
      });

      // 5. Create Trust Transaction if deposit provided
      if (data.depositAmount && data.depositAmount > 0) {
        await tx.trustTransaction.create({
          data: {
            account_id: user.accountId,
            tenancy_id: tenancy.id,
            owner_id: tenancy.unit.property.owner_id,
            type: 'deposit_received',
            amount: data.depositAmount,
            currency: tenancy.currency,
            description: `Security deposit for Unit ${tenancy.unit.unit_number}`,
          }
        });
      }

      return updatedTenancy;
    });
  }

  /**
   * Ends an active tenancy and frees the unit back to vacant. This didn't
   * exist anywhere in the codebase before - activate() (move-in) had no
   * counterpart, so a tenant moving out had no way to actually leave the
   * system. Called from inspections.service.ts when a move_out inspection
   * is completed, closing the property management lifecycle (tenant
   * leaves -> unit vacant -> ready for the next application).
   */
  async endTenancy(id: string, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({ where: { id, account_id: user.accountId } });
    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.status === 'ended') return tenancy; // already ended - idempotent, not an error

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.tenancy.update({ where: { id }, data: { status: 'ended' } });
      await tx.unit.update({ where: { id: tenancy.unit_id }, data: { status: 'vacant' } });
      return updated;
    });
  }

  /**
   * Retrieves pending tenancy by unit ID
   */
  async getPendingByUnitId(unitId: string, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        unit_id: unitId,
        account_id: user.accountId,
        status: 'pending_deposit',
      },
    });
    return tenancy;
  }

  /** Signed URL for the lease PDF generated at activation (or the latest renewal). */
  async getLeaseSignedUrl(tenancyId: string, user: TokenPayload): Promise<string> {
    const tenancy = await prisma.tenancy.findFirst({
      where: { id: tenancyId, account_id: user.accountId },
      select: { lease_pdf_url: true },
    });
    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (!tenancy.lease_pdf_url) throw new AppError('No lease document has been generated for this tenancy yet.', 404);
    return getSignedUrl(BUCKETS.leases, tenancy.lease_pdf_url);
  }
}

export const tenanciesService = new TenanciesService();
