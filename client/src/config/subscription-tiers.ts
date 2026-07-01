export type TierKey = "free" | "starter" | "growth" | "professional";

export interface TierLimit {
  properties: number;       // -1 = unlimited
  units: number;
  agents: number;
  owners: number;
  storageGb: number;
}

export interface SubscriptionTier {
  key: TierKey;
  name: string;
  priceUsd: number;          // per month in USD
  tagline: string;
  limits: TierLimit;
  features: string[];
  highlighted?: boolean;    // "most popular" badge
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    key: "free",
    name: "Free",
    priceUsd: 0,
    tagline: "Try it out — no credit card needed",
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
    priceUsd: 15,
    tagline: "Perfect for independent landlords",
    limits: { properties: 5, units: 20, agents: 2, owners: 5, storageGb: 2 },
    features: [
      "Up to 5 properties, 20 units",
      "2 agents",
      "5 owners",
      "Owner statements & reports",
      "Maintenance tracking",
      "2 GB document storage",
      "WhatsApp & email dispatch",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    priceUsd: 35,
    tagline: "For growing property agencies",
    highlighted: true,
    limits: { properties: 20, units: 100, agents: 5, owners: 20, storageGb: 10 },
    features: [
      "Up to 20 properties, 100 units",
      "5 agents",
      "20 owners",
      "Full communications centre",
      "Bulk rent reminders",
      "Trust ledger",
      "10 GB document storage",
      "Priority support",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    priceUsd: 75,
    tagline: "Unlimited — full contact management",
    limits: { properties: -1, units: -1, agents: -1, owners: -1, storageGb: 50 },
    features: [
      "Unlimited properties & units",
      "Unlimited agents",
      "Unlimited owners",
      "Full contact management",
      "Custom branding & templates",
      "50 GB document storage",
      "Advanced analytics",
      "Dedicated support",
    ],
  },
];

export function getTierByKey(key: string): SubscriptionTier {
  return SUBSCRIPTION_TIERS.find(t => t.key === key) ?? SUBSCRIPTION_TIERS[0];
}

/** Returns true when the account is within the limit for a resource count. */
export function isWithinLimit(limit: number, current: number): boolean {
  return limit === -1 || current < limit;
}
