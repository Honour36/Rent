import { Response } from 'express';
import { depositsService, ResolveDepositSchema } from '../services/deposits.service';
import { AuthRequest } from '../middleware/auth.middleware';

class DepositsController {
  /**
   * GET /api/deposits
   */
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await depositsService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load deposits.' });
    }
  };

  /**
   * GET /api/deposits/tenancy/:tenancyId
   * Creates the deposit record on first access if the tenancy has a
   * deposit_amount set and none exists yet.
   */
  getForTenancy = async (req: AuthRequest, res: Response) => {
    try {
      const data = await depositsService.getOrCreateForTenancy(req.params.tenancyId, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/deposits/tenancy/:tenancyId/resolve
   */
  resolve = async (req: AuthRequest, res: Response) => {
    const parsed = ResolveDepositSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await depositsService.resolve(req.params.tenancyId, parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const depositsController = new DepositsController();
