import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  communicationsService,
  ListCommunicationsSchema,
  ComposeCommunicationSchema,
} from '../services/communications.service';

export class CommunicationsController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = ListCommunicationsSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message });
        return;
      }

      const result = await communicationsService.list(parsed.data, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to list communications';
      res.status(500).json({ success: false, error: message });
    }
  }

  async compose(req: AuthRequest, res: Response): Promise<void> {
    try {
      const body = ComposeCommunicationSchema.parse(req.body);
      const result = await communicationsService.compose(body, req.user!);
      res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      if (err instanceof Error && err.constructor.name === 'ZodError') {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to send communication';
      res.status(statusCode).json({ success: false, error: message });
    }
  }
  async get(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await communicationsService.getById(req.params.id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to get communication';
      res.status(statusCode).json({ success: false, error: message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await communicationsService.update(req.params.id, req.body, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to update communication';
      res.status(statusCode).json({ success: false, error: message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await communicationsService.delete(req.params.id, req.user!);
      res.json({ success: true });
    } catch (err: unknown) {
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to delete communication';
      res.status(statusCode).json({ success: false, error: message });
    }
  }
}

export const communicationsController = new CommunicationsController();
