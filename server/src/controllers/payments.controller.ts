import { Request, Response } from 'express';
import { paymentsService, CreatePaymentSchema } from '../services/payments.service';
import { TokenPayload } from '../middleware/auth.middleware';

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
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      
      const parsedBody = CreatePaymentSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ success: false, error: 'Invalid input data', details: parsedBody.error.errors });
      }

      const result = await paymentsService.create(parsedBody.data, user);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, error: error.message });
    }
  }
}

export const paymentsController = new PaymentsController();
