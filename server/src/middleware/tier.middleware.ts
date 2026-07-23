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

export function enforceTierLimit(resource: keyof TierLimits) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      next();
    } catch (err) { next(err); }
  };
}
