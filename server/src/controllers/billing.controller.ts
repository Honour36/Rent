import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { billingService, SubscribeSchema } from '../services/billing.service';

export const billingController = {
  async subscribe(req: AuthRequest, res: Response) {
    try {
      const { tier } = SubscribeSchema.parse(req.body);
      const result = await billingService.subscribe(tier, req.user!);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(422).json({ success: false, error: 'Please choose a valid subscription tier.' });
      } else {
        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Could not start the subscription.' });
      }
    }
  },

  /**
   * POST /api/billing/paynow/callback - Paynow's result_url webhook. Public
   * (no auth - Paynow itself is calling this), form-urlencoded. Always
   * acknowledges 200 regardless of outcome, since Paynow only cares that
   * the endpoint received it, not what we did with it.
   */
  async callback(req: Request, res: Response) {
    try {
      await billingService.handleCallback(req.body ?? {});
    } catch (error) {
      console.error('[Billing] Error handling Paynow callback:', error);
    }
    res.status(200).send('ok');
  },

  async status(req: AuthRequest, res: Response) {
    try {
      const record = await billingService.getPaymentStatus(req.params.id, req.user!);
      res.json({ success: true, data: record });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  },

  async list(req: AuthRequest, res: Response) {
    try {
      const data = await billingService.listPayments(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  },
};
