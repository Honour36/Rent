import { Request, Response } from 'express';
import { rentCollectionService, ScheduleCollectionSchema } from '../services/rent-collection.service';
import { AuthRequest } from '../middleware/auth.middleware';

class RentCollectionController {
  /**
   * GET /api/rent-collection/public/:token
   */
  getPublic = async (req: Request, res: Response) => {
    try {
      const data = await rentCollectionService.getPublicByToken(req.params.token);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/rent-collection/public/:token
   */
  schedule = async (req: Request, res: Response) => {
    const parsed = ScheduleCollectionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const result = await rentCollectionService.schedule(req.params.token, parsed.data);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/rent-collection
   * Authenticated - list for the dashboard view.
   */
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await rentCollectionService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load rent collection schedule.' });
    }
  };
}

export const rentCollectionController = new RentCollectionController();
