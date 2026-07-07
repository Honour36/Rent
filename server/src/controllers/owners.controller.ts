import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { ownersService, CreateOwnerSchema } from '../services/owners.service';

function zodMessage(err: ZodError): string {
  return err.errors.map(e => e.message).join('. ');
}

export const ownersController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await ownersService.list(req.user!);
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: 'Unable to load owners. Please try again.' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await ownersService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      const msg = status === 404 ? 'Owner not found.' : 'Unable to load owner details.';
      res.status(status).json({ success: false, error: msg });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreateOwnerSchema.parse(req.body);
      const data = await ownersService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(422).json({ success: false, error: zodMessage(error), code: 'VALIDATION_ERROR' });
      } else if (error.code === 'TIER_LIMIT_REACHED') {
        res.status(403).json({ success: false, error: error.message, code: 'TIER_LIMIT_REACHED' });
      } else {
        res.status(400).json({ success: false, error: 'Could not save owner. Please check your inputs.' });
      }
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const dto = UpdateOwnerSchema.parse(req.body);
      const data = await ownersService.update(req.params.id, dto, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(422).json({ success: false, error: zodMessage(error) });
      } else {
        const status = error.statusCode || 400;
        const msg = status === 404 ? 'Owner not found.' : 'Could not update owner.';
        res.status(status).json({ success: false, error: msg });
      }
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const data = await ownersService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      const msg = status === 404 ? 'Owner not found.' : 'Could not delete owner.';
      res.status(status).json({ success: false, error: msg });
    }
  },
};
