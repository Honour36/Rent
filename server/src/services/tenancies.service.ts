import { z } from 'zod';
import { PDFDocument, rgb } from 'pdf-lib';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const ActivateTenancySchema = z.object({
  depositAmount: z.number().min(0).optional(),
  rentDueDay: z.number().min(1).max(28),
  leaseStartDate: z.string().datetime({ offset: true }).or(z.string()), // Accept ISO string
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
   * Generates a basic lease agreement PDF.
   * In a real application, this would use a pre-existing template and fill form fields.
   */
  private async generateLeasePdf(data: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    page.drawText('LEASE AGREEMENT', { x: 50, y: height - 50, size: 20 });
    page.drawText(`Property: ${data.property}`, { x: 50, y: height - 90, size: 12 });
    page.drawText(`Unit: ${data.unit}`, { x: 50, y: height - 110, size: 12 });
    page.drawText(`Tenant: ${data.tenantName}`, { x: 50, y: height - 130, size: 12 });
    page.drawText(`Lease Start Date: ${new Date(data.leaseStartDate).toLocaleDateString()}`, { x: 50, y: height - 150, size: 12 });
    page.drawText(`Rent Amount: ${data.currency} ${data.rentAmount}`, { x: 50, y: height - 170, size: 12 });
    page.drawText(`Deposit Amount: ${data.currency} ${data.depositAmount || 0}`, { x: 50, y: height - 190, size: 12 });
    page.drawText(`Rent Due Day: ${data.rentDueDay} of each month`, { x: 50, y: height - 210, size: 12 });
    
    page.drawText('This is an auto-generated lease agreement.', { x: 50, y: 100, size: 10, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Activates a pending tenancy.
   * - Validates lease details
   * - Generates lease PDF (mock uploaded for now)
   * - Updates Tenancy status to 'active'
   * - Updates Unit status to 'occupied'
   * - Creates TrustTransaction for deposit received
   */
  async activate(id: string, data: ActivateTenancyDto, user: TokenPayload) {
    // 1. Fetch existing pending tenancy
    const tenancy = await prisma.tenancy.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        unit: { include: { property: true } },
        tenant: true,
      }
    });

    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.status === 'active') throw new AppError('Tenancy is already active', 400);

    return await prisma.$transaction(async (tx) => {
      // 2. Generate Lease PDF (we won't upload to real storage for now, just simulate a URL)
      // In a real app, this buffer is uploaded to Supabase Storage
      const pdfBuffer = await this.generateLeasePdf({
        property: tenancy.unit.property.name,
        unit: tenancy.unit.unit_number,
        tenantName: tenancy.tenant.full_name,
        leaseStartDate: data.leaseStartDate,
        rentAmount: data.rentAmount,
        depositAmount: data.depositAmount,
        currency: tenancy.currency,
        rentDueDay: data.rentDueDay,
      });
      const dummyPdfUrl = `/api/tenancies/${id}/lease.pdf`; // Fake URL

      // 3. Update Tenancy to active
      const updatedTenancy = await tx.tenancy.update({
        where: { id },
        data: {
          status: 'active',
          rent_amount: data.rentAmount,
          deposit_amount: data.depositAmount || null,
          rent_due_day: data.rentDueDay,
          lease_start: new Date(data.leaseStartDate),
          lease_pdf_url: dummyPdfUrl,
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
}

export const tenanciesService = new TenanciesService();
