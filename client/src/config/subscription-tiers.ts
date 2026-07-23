export type TierKey = "basic" | "starter" | "growth" | "professional";

export interface TierLimit {
  properties: number;
  units: number;
  agents: number;
  owners: number;
  storageGb: number;
}

export interface SubscriptionTier {
  key: TierKey;
  name: string;
  priceUsd: number;
  tagline: string;
  limits: TierLimit;
  features: string[];
  highlighted?: boolean;
}

/**
 * Every tier gets a 1-month free trial - billing only starts from the
 * second month. There's deliberately no permanent free tier anymore; this
 * constant drives the trial messaging shown next to pricing everywhere
 * these tiers are rendered (see settings billing tab).
 */
export const TRIAL_DAYS = 30;

// Four tiers for now, priced from $4.99 up to $99 - more will be added
// above Professional as the product grows, but this is the current set.
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    key: "basic",
    name: "Basic",
    priceUsd: 4.99,
    tagline: "1 month free, then billed monthly - perfect to get started",
    limits: { properties: 1, units: 5, agents: 1, owners: 1, storageGb: 0.5 },
    features: [
      "1 property, up to 5 units",
      "1 agent (admin only)",
      "Payment recording & receipts",
      "Tenant application form",
      "500 MB document storage",
      "Email reminders (Resend)",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    priceUsd: 19.99,
    tagline: "Perfect for independent landlords",
    limits: { properties: 10, units: 40, agents: 3, owners: 10, storageGb: 5 },
    features: [
      "Up to 10 properties, 40 units",
      "3 agents",
      "10 owners",
      "Owner statements & reports",
      "Maintenance tracking",
      "5 GB document storage",
      "WhatsApp & email dispatch",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    priceUsd: 49.99,
    tagline: "For growing property agencies",
    highlighted: true,
    limits: { properties: 50, units: 300, agents: 10, owners: 50, storageGb: 25 },
    features: [
      "Up to 50 properties, 300 units",
      "10 agents",
      "50 owners",
      "Full communications centre",
      "Bulk rent reminders",
      "Trust ledger",
      "25 GB document storage",
      "Priority support",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    priceUsd: 99,
    tagline: "Unlimited - full contact management",
    limits: { properties: -1, units: -1, agents: -1, owners: -1, storageGb: 100 },
    features: [
      "Unlimited properties & units",
      "Unlimited agents & owners",
      "Full contact management",
      "Custom branding & templates",
      "100 GB document storage",
      "Advanced analytics",
      "Dedicated support",
      "White-label receipts",
    ],
  },
];

export function getTierByKey(key: string): SubscriptionTier {
  return SUBSCRIPTION_TIERS.find(t => t.key === key) ?? SUBSCRIPTION_TIERS[0];
}

export function isWithinLimit(limit: number, current: number): boolean {
  return limit === -1 || current < limit;
}
