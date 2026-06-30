import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardController {
  async getOverview(req: AuthRequest, res: Response) {
    try {
      const accountId = req.user!.accountId;
      const data = await dashboardService.getOverview(accountId);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('[DashboardController.getOverview]', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: message });
    }
  }
}

export const dashboardController = new DashboardController();
