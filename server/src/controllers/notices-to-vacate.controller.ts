import { Response } from 'express';
import { noticesToVacateService, CreateNoticeSchema } from '../services/notices-to-vacate.service';
import { AuthRequest } from '../middleware/auth.middleware';

class NoticesToVacateController {
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await noticesToVacateService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load notices.' });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = CreateNoticeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await noticesToVacateService.create(parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  withdraw = async (req: AuthRequest, res: Response) => {
    try {
      const data = await noticesToVacateService.withdraw(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const noticesToVacateController = new NoticesToVacateController();
