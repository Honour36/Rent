import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const CreatePaymentSchema = z.object({
  tenancyId: z.string().uuid(),
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000).max(2100),
  amountPaid: z.number().positive(),
  currency: z.string().min(1),
  zigUsdRate: z.number().positive().optional(),
  method: z.string().min(1),
  reference: z.string().optional(),
  paymentDate: z.string().or(z.date()).transform(val => new Date(val)),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class PaymentsService {
  async list(user: TokenPayload, filters: { tenancyId?: string; propertyId?: string; status?: string; tenantId?: string }) {
    return await prisma.payment.findMany({
      where: {
        account_id: user.accountId,
        ...(filters.tenancyId && { tenancy_id: filters.tenancyId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.propertyId && { tenancy: { unit: { property_id: filters.propertyId } } }),
        ...(filters.tenantId && { tenancy: { tenant_id: filters.tenantId } }),
      },
      include: {
        tenancy: {
          include: {
            tenant: true,
            unit: { include: { property: true } },
          },
        },
        receipts: true,
      },
      orderBy: { payment_date: 'desc' },
    });
  }

  async create(data: CreatePaymentDto, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({
      where: { id: data.tenancyId, account_id: user.accountId },
    });

    if (!tenancy) throw new AppError('Tenancy not found', 404);

    let status = 'partial';
    if (data.amountPaid >= Number(tenancy.rent_amount)) {
      status = 'paid';
      
      const dueDay = tenancy.rent_due_day || 1;
      const dueDate = new Date(data.periodYear, data.periodMonth - 1, dueDay);
      if (data.paymentDate > dueDate) {
        status = 'late';
      }
    }

    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          account_id: user.accountId,
          tenancy_id: data.tenancyId,
          period_month: data.periodMonth,
          period_year: data.periodYear,
          amount_paid: data.amountPaid,
          currency: data.currency,
          zig_usd_rate: data.zigUsdRate || null,
          method: data.method,
          reference: data.reference || null,
          status,
          recorded_by: user.sub,
          payment_date: data.paymentDate,
        },
      });

      const count = await tx.receipt.count({ where: { account_id: user.accountId } });
      const receiptNumber = `REC-${String(count + 1).padStart(4, '0')}`;
      
      const receipt = await tx.receipt.create({
        data: {
          account_id: user.accountId,
          payment_id: payment.id,
          receipt_number: receiptNumber,
          pdf_url: `/api/receipts/${payment.id}/pdf`,
        },
      });

      // Return enriched data for the owner-notification prompt on frontend
      const enriched = await tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          tenancy: {
            include: {
              tenant: { select: { id: true, full_name: true, email: true, phone: true } },
              unit: {
                include: {
                  property: {
                    include: { owner: { select: { id: true, full_name: true, email: true, phone: true } } },
                  },
                },
              },
            },
          },
          receipts: true,
        },
      });

      return { payment: enriched, receipt };
    });
  }

  async getById(id: string, user: TokenPayload) {
    const payment = await prisma.payment.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        tenancy: {
          include: {
            tenant: { select: { id: true, full_name: true, email: true, phone: true } },
            unit: {
              include: {
                property: {
                  include: { owner: { select: { id: true, full_name: true, email: true, phone: true } } },
                },
              },
            },
          },
        },
        receipts: true,
      },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async update(id: string, data: { amountPaid?: number; method?: string; reference?: string; paymentDate?: string }, user: TokenPayload) {
    const existing = await prisma.payment.findFirst({ where: { id, account_id: user.accountId } });
    if (!existing) throw new Error('Payment not found');
    return prisma.payment.update({
      where: { id },
      data: {
        ...(data.amountPaid !== undefined && { amount_paid: data.amountPaid }),
        ...(data.method && { method: data.method }),
        ...(data.reference !== undefined && { reference: data.reference }),
        ...(data.paymentDate && { payment_date: new Date(data.paymentDate) }),
      },
    });
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.payment.findFirst({ where: { id, account_id: user.accountId }, select: { id: true } });
    if (!existing) throw new Error('Payment not found');
    // Cascade delete receipt first
    await prisma.receipt.deleteMany({ where: { payment_id: id } });
    await prisma.payment.delete({ where: { id } });
    return { deleted: true };
  }
}

export const paymentsService = new PaymentsService();
