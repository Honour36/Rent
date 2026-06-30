import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { tenanciesService, ActivateTenancySchema } from '../services/tenancies.service';

export class TenanciesController {
  activate = async (req: AuthRequest, res: Response) => {
    try {
      const data = ActivateTenancySchema.parse(req.body);
      const tenancy = await tenanciesService.activate(req.params.id, data, req.user!);
      res.json({ success: true, data: tenancy });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  };

  getPendingByUnitId = async (req: AuthRequest, res: Response) => {
    try {
      const tenancy = await tenanciesService.getPendingByUnitId(req.params.unitId, req.user!);
      res.json({ success: true, data: tenancy });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  };
}

export const tenanciesController = new TenanciesController();
