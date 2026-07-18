import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const ResolveDepositSchema = z.object({
  outcome: z.enum(['released', 'forfeited']),
  resolvedAmount: z.number().nonnegative(),
  notes: z.string().max(1000).optional(),
});
export type ResolveDepositDto = z.infer<typeof ResolveDepositSchema>;

function statusFromPaid(paid: number, required: number): string {
  if (paid <= 0) return 'pending';
  if (paid < required) return 'partial';
  return 'paid_in_full';
}

class DepositsService {
  /**
   * Deposits aren't created at tenancy creation time (that logic lives in
   * three different places - application move-in, property auto-assign,
   * and any future tenancy creation flow) - instead the record is created
   * lazily, the first time it's actually needed, from tenancy.deposit_amount.
   * This keeps deposit tracking additive rather than requiring every
   * existing tenancy-creation call site to be touched.
   */
  async getOrCreateForTenancy(tenancyId: string, user: TokenPayload) {
    const existing = await prisma.deposit.findUnique({ where: { tenancy_id: tenancyId } });
    if (existing) return this.withComputedPaid(existing);

    const tenancy = await prisma.tenancy.findFirst({ where: { id: tenancyId, account_id: user.accountId } });
    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.deposit_amount == null) {
      throw new AppError('This tenancy has no deposit amount set. Set one on the tenancy first.', 400);
    }

    const created = await prisma.deposit.create({
      data: {
        account_id: user.accountId,
        tenancy_id: tenancyId,
        required_amount: tenancy.deposit_amount,
        currency: tenancy.currency,
      },
    });
    return this.withComputedPaid(created);
  }

  /**
   * Deposit installments are always summed fresh from the Payment table
   * rather than kept as a running total on the Deposit row - same
   * append-only-source-of-truth approach already used for trust_transactions
   * elsewhere in this codebase, so the number can never drift out of sync.
   */
  private async computePaid(tenancyId: string): Promise<number> {
    const result = await prisma.payment.aggregate({
      where: { tenancy_id: tenancyId, payment_type: 'deposit' },
      _sum: { amount_paid: true },
    });
    return Number(result._sum.amount_paid ?? 0);
  }

  private async withComputedPaid(deposit: any) {
    const paid = await this.computePaid(deposit.tenancy_id);
    return { ...deposit, paid_amount: paid, balance: Math.max(0, Number(deposit.required_amount) - paid) };
  }

  /**
   * Called right after a deposit-type payment is recorded (see
   * payments.service.ts) to roll the Deposit's status forward.
   */
  async recalcStatus(tenancyId: string) {
    const deposit = await prisma.deposit.findUnique({ where: { tenancy_id: tenancyId } });
    if (!deposit) return; // no deposit record to update (shouldn't happen if getOrCreate was called first)
    if (deposit.status === 'released' || deposit.status === 'forfeited') return; // already resolved, don't reopen

    const paid = await this.computePaid(tenancyId);
    const status = statusFromPaid(paid, Number(deposit.required_amount));
    if (status !== deposit.status) {
      await prisma.deposit.update({ where: { tenancy_id: tenancyId }, data: { status } });
    }
  }

  async getForTenancy(tenancyId: string, user: TokenPayload) {
    const deposit = await prisma.deposit.findFirst({
      where: { tenancy_id: tenancyId, account_id: user.accountId },
    });
    if (!deposit) return null;
    return this.withComputedPaid(deposit);
  }

  /**
   * Dashboard-wide list, for oversight of who's behind on deposit
   * installments and what's outstanding at move-out time.
   */
  async list(user: TokenPayload) {
    const deposits = await prisma.deposit.findMany({
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
    return Promise.all(deposits.map((d) => this.withComputedPaid(d)));
  }

  /**
   * Move-out resolution: release (return to tenant) or forfeit (kept
   * against damage), fully or partially. This is what a move-out
   * inspection's outcome will call once inspections exist - exposed as a
   * manual action for now so agents aren't blocked waiting on that phase.
   */
  async resolve(tenancyId: string, data: ResolveDepositDto, user: TokenPayload) {
    const deposit = await prisma.deposit.findFirst({ where: { tenancy_id: tenancyId, account_id: user.accountId } });
    if (!deposit) throw new AppError('No deposit record for this tenancy', 404);
    if (deposit.status === 'released' || deposit.status === 'forfeited') {
      throw new AppError('This deposit has already been resolved.', 409);
    }

    const paid = await this.computePaid(tenancyId);
    if (data.resolvedAmount > paid) {
      throw new AppError(`Cannot resolve for more than what was actually paid in (${paid}).`, 400);
    }

    const updated = await prisma.deposit.update({
      where: { tenancy_id: tenancyId },
      data: {
        status: data.outcome,
        resolved_amount: data.resolvedAmount,
        resolution_notes: data.notes ?? null,
        resolved_at: new Date(),
      },
    });
    return this.withComputedPaid(updated);
  }
}

export const depositsService = new DepositsService();
