import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Paynow } from 'paynow';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { TIER_PRICING, TRIAL_DAYS, BILLING_PERIOD_DAYS, isValidTier } from '../config/subscription-tiers';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const SubscribeSchema = z.object({
  tier: z.string(),
});

/**
 * Paynow's public API has no native recurring billing (see
 * forums.paynow.co.zw/t/recurring-automated-payments/8314 - card
 * tokenization exists but requires separate "verified merchant" approval,
 * is card-only, and isn't part of the documented SDK). So this is a
 * redirect-checkout charge per billing period, not silent auto-charging.
 * A cron reminder (jobs/subscription-renewal-reminders.job.ts) nudges
 * accounts to renew a few days before their period ends.
 */
function getPaynowClient(): Paynow {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  if (!integrationId || !integrationKey) {
    throw new AppError('Payment gateway is not configured yet.', 503);
  }

  const backendUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3001}`;

  const paynow = new Paynow(integrationId, integrationKey);
  paynow.resultUrl = `${backendUrl}/api/billing/paynow/callback`;
  return paynow;
}

export class BillingService {
  /**
   * True only during an account's first 30 days AND only if they have
   * never actually completed a paid subscription before - re-selecting a
   * tier later (e.g. downgrading, or a trial that already lapsed once)
   * should not grant a second free ride.
   */
  private async isEligibleForFreeTrial(accountId: string, createdAt: Date): Promise<boolean> {
    const trialEndsAt = new Date(createdAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
    if (trialEndsAt.getTime() <= Date.now()) return false;

    const hasEverPaid = await prisma.subscriptionPayment.findFirst({
      where: { account_id: accountId, status: 'paid' },
      select: { id: true },
    });
    return !hasEverPaid;
  }

  async subscribe(tierRaw: string, user: TokenPayload) {
    if (!isValidTier(tierRaw)) throw new AppError('Unknown subscription tier.', 400);
    const tier = tierRaw;
    const tierInfo = TIER_PRICING[tier];

    const account = await prisma.account.findUnique({ where: { id: user.accountId } });
    if (!account) throw new AppError('Account not found.', 404);

    if (await this.isEligibleForFreeTrial(account.id, account.created_at)) {
      // Picking a plan during the free trial - no charge, just activates it.
      await prisma.account.update({ where: { id: account.id }, data: { subscription_tier: tier } });
      return { requiresPayment: false as const, tier };
    }

    const paynow = getPaynowClient();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentId = randomUUID();
    // The id is embedded in the return URL up front (before Paynow even
    // knows about the payment) so that when the browser bounces back after
    // checkout, the frontend knows exactly which payment to check the
    // status of - Paynow's returnUrl is a fixed redirect, it doesn't append
    // any payment identifier of its own.
    paynow.returnUrl = `${frontendUrl}/dashboard/settings?tab=subscription&paymentId=${paymentId}`;

    const reference = `sub_${account.id}_${tier}_${Date.now()}`;
    const payment = paynow.createPayment(reference, account.email || undefined);
    payment.add(`${tierInfo.name} Plan - Monthly Subscription`, tierInfo.priceUsd);

    const initResponse = await paynow.send(payment);
    if (!initResponse || !initResponse.success || !initResponse.redirectUrl) {
      throw new AppError(initResponse?.error || 'Could not start the payment with Paynow. Please try again.', 502);
    }

    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + BILLING_PERIOD_DAYS);

    const record = await prisma.subscriptionPayment.create({
      data: {
        id: paymentId,
        account_id: account.id,
        tier,
        amount: tierInfo.priceUsd,
        currency: 'USD',
        reference,
        poll_url: initResponse.pollUrl,
        method: 'web',
        status: 'created',
        period_start: periodStart,
        period_end: periodEnd,
      },
    });

    return { requiresPayment: true as const, redirectUrl: initResponse.redirectUrl, paymentId: record.id };
  }

  /**
   * Called from the public Paynow result_url webhook. Deliberately does not
   * trust the webhook body's status field at face value - it re-verifies
   * by polling Paynow directly with the poll_url saved at creation time,
   * which is what the SDK's own hash verification is built around.
   */
  async handleCallback(body: Record<string, unknown>) {
    const reference = typeof body.reference === 'string' ? body.reference : undefined;
    if (!reference) return;

    const record = await prisma.subscriptionPayment.findUnique({ where: { reference } });
    if (!record || !record.poll_url || record.status === 'paid') return;

    const paynow = getPaynowClient();
    const status = await paynow.pollTransaction(record.poll_url);
    if (!status) return;

    const paidStatuses = ['paid', 'awaiting delivery', 'delivered'];
    if (paidStatuses.includes(status.status)) {
      await prisma.$transaction([
        prisma.subscriptionPayment.update({
          where: { id: record.id },
          data: { status: 'paid', paid_at: new Date(), paynow_reference: (status as any).paynowReference ?? null },
        }),
        prisma.account.update({
          where: { id: record.account_id },
          data: { subscription_tier: record.tier, subscription_paid_until: record.period_end },
        }),
      ]);
    } else if (status.status === 'cancelled' && record.status === 'created') {
      await prisma.subscriptionPayment.update({ where: { id: record.id }, data: { status: 'cancelled' } });
    }
  }

  /**
   * Used by the return page after the user comes back from Paynow. Gives
   * the poll a nudge in case the webhook hasn't landed yet, so the person
   * isn't stuck looking at "pending" for longer than necessary.
   */
  async getPaymentStatus(id: string, user: TokenPayload) {
    const record = await prisma.subscriptionPayment.findFirst({
      where: { id, account_id: user.accountId },
    });
    if (!record) throw new AppError('Payment not found.', 404);

    if (record.status === 'created') {
      await this.handleCallback({ reference: record.reference });
      const refreshed = await prisma.subscriptionPayment.findUnique({ where: { id } });
      return refreshed ?? record;
    }

    return record;
  }

  async listPayments(user: TokenPayload) {
    return prisma.subscriptionPayment.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
    });
  }
}

export const billingService = new BillingService();
