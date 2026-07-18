import { Response } from 'express';
import { levyChargesService, CreateLevyChargeSchema } from '../services/levy-charges.service';
import { AuthRequest } from '../middleware/auth.middleware';

class LevyChargesController {
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await levyChargesService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load levy charges.' });
    }
  };

  listForProperty = async (req: AuthRequest, res: Response) => {
    try {
      const data = await levyChargesService.listForProperty(req.params.propertyId, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load levy charges.' });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = CreateLevyChargeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await levyChargesService.create(parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  deactivate = async (req: AuthRequest, res: Response) => {
    try {
      const data = await levyChargesService.setActive(req.params.id, false, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const levyChargesController = new LevyChargesController();
