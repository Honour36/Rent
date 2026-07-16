import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { propertiesService, CreatePropertySchema } from '../services/properties.service';

/** Convert Zod errors into a single readable sentence without exposing internals. */
function zodMessage(err: ZodError): string {
  return err.errors.map(e => e.message).join('. ');
}

export const propertiesController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.list(req.user!);
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: 'Unable to load properties. Please try again.' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      const msg = status === 404 ? 'Property not found.' : 'Unable to load property details.';
      res.status(status).json({ success: false, error: msg });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const dto = CreatePropertySchema.parse(req.body);
      const data = await propertiesService.create(dto, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(422).json({ success: false, error: zodMessage(error), code: 'VALIDATION_ERROR' });
      } else if (error.code === 'TIER_LIMIT_REACHED') {
        res.status(403).json({ success: false, error: error.message, code: 'TIER_LIMIT_REACHED' });
      } else {
        res.status(400).json({ success: false, error: 'Could not save the property. Please check your inputs.' });
      }
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.update(req.params.id, req.body, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 400;
      const msg = status === 404 ? 'Property not found.' : 'Could not update property. Please check your inputs.';
      res.status(status).json({ success: false, error: msg });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const data = await propertiesService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      const msg = status === 404 ? 'Property not found.' : 
                  status === 400 ? error.message : 
                  'Could not delete property.';
      res.status(status).json({ success: false, error: msg });
    }
  },
};
