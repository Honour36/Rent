import { Response } from 'express';
import { inspectionsService, ScheduleInspectionSchema, CompleteInspectionSchema } from '../services/inspections.service';
import { AuthRequest } from '../middleware/auth.middleware';

class InspectionsController {
  /**
   * GET /api/inspections
   */
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await inspectionsService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load inspections.' });
    }
  };

  /**
   * POST /api/inspections
   */
  schedule = async (req: AuthRequest, res: Response) => {
    const parsed = ScheduleInspectionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await inspectionsService.schedule(parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/inspections/:id/complete
   */
  complete = async (req: AuthRequest, res: Response) => {
    const parsed = CompleteInspectionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await inspectionsService.complete(req.params.id, parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/inspections/:id/cancel
   */
  cancel = async (req: AuthRequest, res: Response) => {
    try {
      const data = await inspectionsService.cancel(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const inspectionsController = new InspectionsController();
