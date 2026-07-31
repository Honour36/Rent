import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { uploadFile, BUCKETS } from '../db/storage';
import { generateLeasePdf } from './lease-pdf.helper';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const CreateRenewalSchema = z.object({
  tenancyId: z.string().uuid(),
  newLeaseEnd: z.string().min(1), // agent picks the renewal period - no fixed duration
  leaseFeeAmount: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateRenewalDto = z.infer<typeof CreateRenewalSchema>;

class LeaseRenewalsService {
  /**
   * Records a renewal decision and immediately applies it to the tenancy -
   * this is what finally puts a value into Tenancy.lease_end, which nothing
   * else in the codebase ever set (the "expiring leases" report has always
   * read an empty column). Also reissues a fresh lease agreement PDF for
   * the new period, replacing the one from the original move-in (or the
   * previous renewal) - the old signed document's end date is no longer
   * accurate once renewed.
   */
  async create(data: CreateRenewalDto, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({
      where: { id: data.tenancyId, account_id: user.accountId },
      include: {
        unit: { include: { property: { include: { owner: true } } } },
        tenant: true,
      },
    });
    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.status !== 'active') throw new AppError('Only an active tenancy can be renewed.', 400);

    const newLeaseEnd = new Date(data.newLeaseEnd);
    if (Number.isNaN(newLeaseEnd.getTime())) throw new AppError('Please choose a valid renewal end date.', 400);

    // The new lease period picks up where the previous one left off - if
    // lease_end was somehow never set (shouldn't happen post-activation,
    // but old tenancies from before this existed might not have one),
    // fall back to the original lease_start rather than fail.
    const newLeaseStart = tenancy.lease_end ?? tenancy.lease_start;
    if (newLeaseEnd <= newLeaseStart) throw new AppError('The new lease end date must be after the current lease end date.', 400);

    const account = await prisma.account.findUnique({ where: { id: user.accountId }, select: { name: true, city: true } });

    return prisma.$transaction(async (tx) => {
      const renewal = await tx.leaseRenewal.create({
        data: {
          account_id: user.accountId,
          tenancy_id: data.tenancyId,
          previous_lease_end: tenancy.lease_end,
          new_lease_end: newLeaseEnd,
          lease_fee_amount: data.leaseFeeAmount ?? null,
          currency: data.leaseFeeAmount != null ? tenancy.currency : null,
          notes: data.notes ?? null,
          created_by: user.sub,
        },
      });

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
        leaseStart: newLeaseStart,
        leaseEnd: newLeaseEnd,
        rentAmount: Number(tenancy.rent_amount),
        currency: tenancy.currency,
        depositAmount: tenancy.deposit_amount != null ? Number(tenancy.deposit_amount) : null,
        signingCity: account?.city || undefined,
      });
      const storagePath = `leases/${user.accountId}/${tenancy.id}.pdf`;
      await uploadFile(BUCKETS.leases, storagePath, pdfBuffer, 'application/pdf');

      await tx.tenancy.update({
        where: { id: data.tenancyId },
        data: { lease_end: newLeaseEnd, lease_pdf_url: storagePath },
      });

      return renewal;
    });
  }

  async list(user: TokenPayload) {
    return prisma.leaseRenewal.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
      include: {
        tenancy: {
          include: {
            tenant: { select: { full_name: true } },
            unit: { select: { unit_number: true, property: { select: { name: true } } } },
          },
        },
      },
    });
  }
}

export const leaseRenewalsService = new LeaseRenewalsService();
