import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { tenantsService, CreateTenantSchema, UpdateTenantSchema } from '../services/tenants.service';

function zodMessage(err: ZodError): string {
  return err.errors.map(e => e.message).join('. ');
}

export const tenantsController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await tenantsService.list(req.user!);
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: 'Unable to load tenants. Please try again.' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await tenantsService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      const msg = status === 404 ? 'Tenant not found.' : 'Unable to load tenant details.';
      res.status(status).json({ success: false, error: msg });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreateTenantSchema.parse(req.body);
      const data = await tenantsService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(422).json({ success: false, error: zodMessage(error), code: 'VALIDATION_ERROR' });
      } else if (error.code === 'TIER_LIMIT_REACHED') {
        res.status(403).json({ success: false, error: error.message, code: 'TIER_LIMIT_REACHED' });
      } else if (error.statusCode === 409) {
        res.status(409).json({ success: false, error: error.message });
      } else {
        res.status(400).json({ success: false, error: 'Could not save tenant. Please check your inputs.' });
      }
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const dto = UpdateTenantSchema.parse(req.body);
      const data = await tenantsService.update(req.params.id, dto, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(422).json({ success: false, error: zodMessage(error) });
      } else {
        const status = error.statusCode || 400;
        const msg = status === 404 ? 'Tenant not found.' : status === 409 ? error.message : 'Could not update tenant.';
        res.status(status).json({ success: false, error: msg });
      }
    }
  },


  async delete(req: AuthRequest, res: Response) {
    try {
      const data = await tenantsService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      const msg = status === 404 ? 'Tenant not found.' : 'Could not delete tenant.';
      res.status(status).json({ success: false, error: msg });
    }
  },
};
