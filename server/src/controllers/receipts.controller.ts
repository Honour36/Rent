import { Request, Response } from 'express';
import { receiptsService, SendReceiptSchema } from '../services/receipts.service';
import { TokenPayload } from '../middleware/auth.middleware';

function handleError(res: Response, error: any) {
  const status = error.statusCode || 500;
  // 422 = incomplete account details → frontend redirects to settings
  const code = status === 422 ? 'ACCOUNT_DETAILS_INCOMPLETE' : undefined;
  res.status(status).json({
    success: false,
    error: error.message || 'An unexpected error occurred.',
    ...(code && { code }),
  });
}

export class ReceiptsController {
  async getReceipt(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const receipt = await receiptsService.getReceiptByPaymentId(req.params.paymentId, user);
      res.json({ success: true, data: receipt });
    } catch (error: any) { handleError(res, error); }
  }

  async getReceiptPdf(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const pdfBuffer = await receiptsService.generateReceiptPdf(req.params.paymentId, user);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (error: any) { handleError(res, error); }
  }

  async getReceiptSignedUrl(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const url = await receiptsService.getReceiptSignedUrl(req.params.paymentId, user);
      res.json({ success: true, data: { url } });
    } catch (error: any) { handleError(res, error); }
  }

  async sendReceipt(req: Request, res: Response) {
    try {
      const user = (req as any).user as TokenPayload;
      const parsed = SendReceiptSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid channel. Use email or whatsapp.' });
        return;
      }
      const result = await receiptsService.sendReceipt(req.params.paymentId, parsed.data.channel, user);
      res.json({ success: true, data: result });
    } catch (error: any) { handleError(res, error); }
  }
}

export const receiptsController = new ReceiptsController();
