import { Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from './auth.middleware';

interface TierLimits { properties: number; units: number; agents: number; owners: number; }

const LIMITS: Record<string, TierLimits> = {
  free:         { properties: 1,   units: 5,   agents: 1,  owners: 1  },
  starter:      { properties: 10,  units: 40,  agents: 3,  owners: 10 },
  growth:       { properties: 50,  units: 300, agents: 10, owners: 50 },
  professional: { properties: -1,  units: -1,  agents: -1, owners: -1 },
};

export function enforceTierLimit(resource: keyof TierLimits) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user!.accountId;
      const account = await prisma.account.findUnique({ where: { id: accountId }, select: { subscription_tier: true } });
      const tier = account?.subscription_tier ?? 'free';
      const limits = LIMITS[tier] ?? LIMITS['free'];
      const max = limits[resource];
      let current = 0;
      if (resource === 'properties') current = await prisma.property.count({ where: { account_id: accountId } });
      else if (resource === 'units')  current = await prisma.unit.count({ where: { account_id: accountId } });
      else if (resource === 'agents') current = await prisma.user.count({ where: { account_id: accountId } });
      else if (resource === 'owners') current = await prisma.owner.count({ where: { account_id: accountId } });
      if (max !== -1 && current >= max) {
        return res.status(403).json({ success: false, error: `Your ${tier} plan allows a maximum of ${max} ${resource}. Upgrade to add more.`, code: 'TIER_LIMIT_REACHED' });
      }
      next();
    } catch (err) { next(err); }
  };
}
