import { Response } from 'express';
import { leaseRenewalsService, CreateRenewalSchema } from '../services/lease-renewals.service';
import { AuthRequest } from '../middleware/auth.middleware';

class LeaseRenewalsController {
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await leaseRenewalsService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load lease renewals.' });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = CreateRenewalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await leaseRenewalsService.create(parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const leaseRenewalsController = new LeaseRenewalsController();
