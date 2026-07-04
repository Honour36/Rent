import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { propertiesService, CreatePropertySchema } from '../services/properties.service';

export const propertiesController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.list(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to list properties' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to get property' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreatePropertySchema.parse(req.body);
      const data = await propertiesService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to create property' });
    }
  }
  async delete(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to delete property' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.update(req.params.id, req.body, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to update property' });
    }
  },

};
