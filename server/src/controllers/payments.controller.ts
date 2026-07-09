import { Request, Response } from 'express';
import { paymentsService, CreatePaymentSchema } from '../services/payments.service';
import { TokenPayload } from '../middleware/auth.middleware';
import { ZodError } from 'zod';

function zodMessage(err: ZodError): string {
  return err.errors.map(e => e.message).join('. ');
}

export class PaymentsController {
  async list(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const { tenancyId, propertyId, status, tenantId } = req.query;
      const payments = await paymentsService.list(user, {
        tenancyId: tenancyId as string,
        propertyId: propertyId as string,
        status: status as string,
        tenantId: tenantId as string,
      });
      res.json({ success: true, data: payments });
    } catch {
      res.status(500).json({ success: false, error: 'Unable to load payments. Please try again.' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const data = await paymentsService.getById(req.params.id, user);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.message?.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, error: status === 404 ? 'Payment not found.' : 'Unable to load payment.' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const parsed = CreatePaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({ success: false, error: zodMessage(parsed.error) });
      }
      const result = await paymentsService.create(parsed.data, user);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, error: error.message || 'Could not record payment.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const data = await paymentsService.update(req.params.id, req.body, user);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message || 'Could not update payment.' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const data = await paymentsService.delete(req.params.id, user);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message || 'Could not delete payment.' });
    }
  }
}

export const paymentsController = new PaymentsController();
