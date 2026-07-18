import { Response } from 'express';
import { notificationsService } from '../services/notifications.service';
import { AuthRequest } from '../middleware/auth.middleware';

class NotificationsController {
  /**
   * GET /api/notifications
   */
  list = async (req: AuthRequest, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 30;
      const notifications = await notificationsService.list(req.user!, limit);
      res.json({ success: true, data: notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load notifications.' });
    }
  };

  /**
   * GET /api/notifications/count
   */
  count = async (req: AuthRequest, res: Response) => {
    try {
      const count = await notificationsService.getUnreadCount(req.user!);
      res.json({ success: true, data: { count } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load notification count.' });
    }
  };

  /**
   * PATCH /api/notifications/:id/read
   */
  markRead = async (req: AuthRequest, res: Response) => {
    try {
      await notificationsService.markRead(req.params.id, req.user!);
      res.json({ success: true, data: null });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not update notification.' });
    }
  };

  /**
   * PATCH /api/notifications/mark-all-read
   */
  markAllRead = async (req: AuthRequest, res: Response) => {
    try {
      await notificationsService.markAllRead(req.user!);
      res.json({ success: true, data: null });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not update notifications.' });
    }
  };
}

export const notificationsController = new NotificationsController();
