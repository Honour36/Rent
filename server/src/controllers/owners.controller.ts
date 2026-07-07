import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ownersService, CreateOwnerSchema, UpdateOwnerSchema } from '../services/owners.service';

export const ownersController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await ownersService.list(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to list owners' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await ownersService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to get owner' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreateOwnerSchema.parse(req.body);
      const data = await ownersService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to create owner' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const dto = UpdateOwnerSchema.parse(req.body);
      const data = await ownersService.update(req.params.id, dto, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to update owner' });
    }
  },
  async delete(req: AuthRequest, res: Response) {
    try {
      const data = await ownersService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to delete owner' });
    }
  },

};
