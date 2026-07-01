import { Request, Response } from 'express';
import { receiptsService, SendReceiptSchema } from '../services/receipts.service';
import { TokenPayload } from '../middleware/auth.middleware';

export class ReceiptsController {
  async getReceipt(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const { paymentId } = req.params;

      const receipt = await receiptsService.getReceiptByPaymentId(paymentId, user);
      res.json({ success: true, data: receipt });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ error: error.message });
    }
  }

  async getReceiptPdf(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const { paymentId } = req.params;

      const pdfBuffer = await receiptsService.generateReceiptPdf(paymentId, user);

      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ error: error.message });
    }
  }

  /** Returns a short-lived signed URL to the receipt PDF stored in Supabase Storage. */
  async getReceiptSignedUrl(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const { paymentId } = req.params;
      const url = await receiptsService.getReceiptSignedUrl(paymentId, user);
      res.json({ success: true, data: { url } });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ error: error.message });
    }
  }

  async sendReceipt(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const { paymentId } = req.params;
      
      const parsedData = SendReceiptSchema.parse(req.body);

      const result = await receiptsService.sendReceipt(paymentId, parsedData.channel, user);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation Error', details: error.errors });
      } else {
        const status = error.statusCode || 500;
        res.status(status).json({ error: error.message });
      }
    }
  }
}

export const receiptsController = new ReceiptsController();
