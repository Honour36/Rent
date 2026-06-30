import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { unitsService, CreateUnitSchema, UpdateUnitSchema } from '../services/units.service';

export const unitsController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreateUnitSchema.parse(req.body);
      const data = await unitsService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to create unit' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const dto = UpdateUnitSchema.parse(req.body);
      const data = await unitsService.update(req.params.id, dto, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to update unit' });
    }
  }
};
