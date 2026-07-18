import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

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
   * read an empty column).
   */
  async create(data: CreateRenewalDto, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({ where: { id: data.tenancyId, account_id: user.accountId } });
    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.status !== 'active') throw new AppError('Only an active tenancy can be renewed.', 400);

    const newLeaseEnd = new Date(data.newLeaseEnd);
    if (Number.isNaN(newLeaseEnd.getTime())) throw new AppError('Please choose a valid renewal end date.', 400);

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

      await tx.tenancy.update({ where: { id: data.tenancyId }, data: { lease_end: newLeaseEnd } });

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
