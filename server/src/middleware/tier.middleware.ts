import { Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from './auth.middleware';

interface TierLimits { properties: number; units: number; agents: number; owners: number; }

const LIMITS: Record<string, TierLimits> = {
  basic:        { properties: 1,   units: 5,   agents: 1,  owners: 1  },
  starter:      { properties: 10,  units: 40,  agents: 3,  owners: 10 },
  growth:       { properties: 50,  units: 300, agents: 10, owners: 50 },
  professional: { properties: -1,  units: -1,  agents: -1, owners: -1 },
};

/**
 * Off by default. Pre-launch, billing (Paynow checkout, webhook, tier
 * updates) works for real end-to-end without restricting anyone's actual
 * usage - this is the one switch that changes that. Flip
 * SUBSCRIPTION_ENFORCEMENT_ENABLED=true in the environment when ready to
 * gate usage by subscription tier; no code change needed at that point.
 */
function isEnforcementEnabled(): boolean {
  return process.env.SUBSCRIPTION_ENFORCEMENT_ENABLED === 'true';
}

async function countResource(resource: keyof TierLimits, accountId: string): Promise<number> {
  switch (resource) {
    case 'properties':
      return prisma.property.count({ where: { account_id: accountId } });
    case 'units':
      return prisma.unit.count({ where: { property: { account_id: accountId } } });
    case 'agents':
      return prisma.user.count({ where: { account_id: accountId, is_active: true } });
    case 'owners':
      return prisma.owner.count({ where: { account_id: accountId } });
  }
}

export function enforceTierLimit(resource: keyof TierLimits) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!isEnforcementEnabled()) return next();

    try {
      const account = await prisma.account.findUnique({
        where: { id: req.user!.accountId },
        select: { subscription_tier: true },
      });

      // No tier chosen yet (still trialing, or a pre-billing account) -
      // don't block. Enforcement only applies once someone has an actual
      // paid/trial tier on record.
      const tier = account?.subscription_tier;
      const limits = tier ? LIMITS[tier] : undefined;
      if (!limits) return next();

      const max = limits[resource];
      if (max === -1) return next(); // unlimited on this tier

      const count = await countResource(resource, req.user!.accountId);
      if (count >= max) {
        res.status(403).json({
          success: false,
          error: `Your ${tier} plan allows up to ${max} ${resource}. Upgrade to add more.`,
          code: 'TIER_LIMIT_REACHED',
        });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
