import cron from 'node-cron';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';
import { sendSubscriptionRenewalReminderEmail } from '../emails/email-service';
import { TIER_PRICING } from '../config/subscription-tiers';

const LOCK_KEY = 'cron:subscription-renewal-reminders:lock';
const LOCK_TTL = 60 * 5; // 5 minutes
const REMINDER_DAYS_BEFORE = [3, 1];

export async function runSubscriptionRenewalReminders() {
  if (redis) {
    const lock = await redis.set(LOCK_KEY, 'locked', 'EX', LOCK_TTL, 'NX');
    if (!lock) {
      console.log('[Jobs] Subscription renewal reminders job is already running on another instance.');
      return;
    }
  }

  console.log('[Jobs] Starting subscription renewal reminders job...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const accounts = await prisma.account.findMany({
      where: {
        subscription_paid_until: { not: null },
        subscription_tier: { not: null },
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    for (const account of accounts) {
      if (!account.subscription_paid_until || !account.subscription_tier || !account.email) continue;

      const paidUntil = new Date(account.subscription_paid_until);
      paidUntil.setHours(0, 0, 0, 0);
      const diffDays = Math.round((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (!REMINDER_DAYS_BEFORE.includes(diffDays)) continue;

      const tierInfo = TIER_PRICING[account.subscription_tier];
      if (!tierInfo) continue;

      await sendSubscriptionRenewalReminderEmail({
        to: account.email,
        accountName: account.name,
        tierName: tierInfo.name,
        priceUsd: tierInfo.priceUsd,
        paidUntil: account.subscription_paid_until,
        renewUrl: `${frontendUrl}/dashboard/settings?tab=subscription`,
        daysLeft: diffDays,
      });
    }
    console.log('[Jobs] Subscription renewal reminders job completed.');
  } catch (error) {
    console.error('[Jobs] Error running subscription renewal reminders job:', error);
  }
}

export function startSubscriptionRenewalRemindersJob() {
  cron.schedule('0 8 * * *', () => {
    runSubscriptionRenewalReminders();
  });
  console.log('[Jobs] Scheduled subscription renewal reminders job (08:00 daily).');
}
