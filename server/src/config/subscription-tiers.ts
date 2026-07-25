/**
 * Server-side mirror of client/src/config/subscription-tiers.ts.
 *
 * This is the ONLY source of truth for what a tier actually costs - the
 * client sends a tier *key*, never an amount, and billing.service.ts looks
 * the price up from here. Keep these two files in sync if pricing changes.
 */
export const TIER_PRICING: Record<string, { name: string; priceUsd: number }> = {
  basic: { name: 'Basic', priceUsd: 4.99 },
  starter: { name: 'Starter', priceUsd: 19.99 },
  growth: { name: 'Growth', priceUsd: 49.99 },
  professional: { name: 'Professional', priceUsd: 99 },
};

export const TRIAL_DAYS = 30;
export const BILLING_PERIOD_DAYS = 30;

export function isValidTier(tier: string): tier is keyof typeof TIER_PRICING {
  return tier in TIER_PRICING;
}
