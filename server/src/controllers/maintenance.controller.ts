import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  maintenanceService,
  ListMaintenanceSchema,
  CreateMaintenanceSchema,
  UpdateMaintenanceSchema,
} from '../services/maintenance.service';

export class MaintenanceController {
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = ListMaintenanceSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.message });
        return;
      }
      const result = await maintenanceService.list(parsed.data, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to list maintenance requests';
      res.status(500).json({ success: false, error: message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await maintenanceService.getById(id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to fetch maintenance request';
      res.status(statusCode).json({ success: false, error: message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const body = CreateMaintenanceSchema.parse(req.body);
      const result = await maintenanceService.create(body, req.user!);
      res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      if (err instanceof Error && err.constructor.name === 'ZodError') {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to create maintenance request';
      res.status(statusCode).json({ success: false, error: message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = UpdateMaintenanceSchema.parse(req.body);
      const result = await maintenanceService.update(id, body, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      if (err instanceof Error && err.constructor.name === 'ZodError') {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      const anyErr = err as any;
      const statusCode = anyErr?.statusCode ?? 500;
      const message = anyErr?.message ?? 'Failed to update maintenance request';
      res.status(statusCode).json({ success: false, error: message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await maintenanceService.delete(req.params.id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to delete' });
    }
  }
}

export const maintenanceController = new MaintenanceController();
