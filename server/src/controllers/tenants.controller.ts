import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { tenantsService, CreateTenantSchema, UpdateTenantSchema } from '../services/tenants.service';

export const tenantsController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await tenantsService.list(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to list tenants' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await tenantsService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to get tenant' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreateTenantSchema.parse(req.body);
      const data = await tenantsService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to create tenant' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const dto = UpdateTenantSchema.parse(req.body);
      const data = await tenantsService.update(req.params.id, dto, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to update tenant' });
    }
  },
  async delete(req: AuthRequest, res: Response) {
    try {
      const data = await tenantsService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, error: error.message || 'Failed to delete tenant' });
    }
  },

};
