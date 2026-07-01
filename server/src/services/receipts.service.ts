import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';
import { z } from 'zod';
import { uploadFile, getSignedUrl, BUCKETS } from '../db/storage';

export const SendReceiptSchema = z.object({
  channel: z.enum(['email', 'whatsapp']),
});

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class ReceiptsService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_mock');
  }

  async getReceiptByPaymentId(paymentId: string, user: TokenPayload) {
    const receipt = await prisma.receipt.findFirst({
      where: { payment_id: paymentId, account_id: user.accountId },
      include: {
        payment: {
          include: {
            tenancy: {
              include: {
                tenant: true,
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    return receipt;
  }

  async generateReceiptPdf(paymentId: string, user: TokenPayload): Promise<Buffer> {
    const receipt = await this.getReceiptByPaymentId(paymentId, user);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // PDF Content
      doc.fontSize(20).text('PAYMENT RECEIPT', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Receipt Number: ${receipt.receipt_number}`);
      doc.text(`Date: ${new Date(receipt.created_at || new Date()).toLocaleDateString()}`);
      doc.moveDown();

      const tenantName = receipt.payment.tenancy.tenant.full_name;
      const propertyName = receipt.payment.tenancy.unit.property.name;
      const unitNumber = receipt.payment.tenancy.unit.unit_number;

      doc.text(`Received from: ${tenantName}`);
      doc.text(`For Property: ${propertyName}, Unit ${unitNumber}`);
      doc.text(`Payment Period: ${receipt.payment.period_month}/${receipt.payment.period_year}`);
      doc.moveDown();

      doc.fontSize(14).text(`Amount Paid: ${receipt.payment.currency} ${receipt.payment.amount_paid}`);
      if (receipt.payment.zig_usd_rate) {
        doc.fontSize(10).text(`Exchange Rate (ZiG/USD): ${receipt.payment.zig_usd_rate}`);
      }

      doc.moveDown();
      doc.fontSize(12).text(`Payment Method: ${receipt.payment.method}`);
      if (receipt.payment.reference) {
        doc.text(`Reference: ${receipt.payment.reference}`);
      }

      doc.moveDown(2);
      doc.fontSize(10).fillColor('gray').text('This is an auto-generated receipt.', { align: 'center' });

      doc.end();
    });
  }

  /**
   * Upload the generated receipt PDF to Supabase Storage and update the pdf_url on the receipt record.
   * Returns the signed URL so the caller can redirect the browser directly.
   */
  async persistReceiptPdf(paymentId: string, user: TokenPayload): Promise<string> {
    const receipt = await this.getReceiptByPaymentId(paymentId, user);
    const pdfBuffer = await this.generateReceiptPdf(paymentId, user);
    const storagePath = `receipts/${user.accountId}/${receipt.receipt_number}.pdf`;
    await uploadFile(BUCKETS.receipts, storagePath, pdfBuffer, 'application/pdf');
    await prisma.receipt.update({ where: { id: receipt.id }, data: { pdf_url: storagePath } });
    return getSignedUrl(BUCKETS.receipts, storagePath);
  }

  /**
   * Get a fresh signed URL for an already-stored receipt.
   */
  async getReceiptSignedUrl(paymentId: string, user: TokenPayload): Promise<string> {
    const receipt = await this.getReceiptByPaymentId(paymentId, user);
    // If already stored in bucket, get fresh signed URL
    if (receipt.pdf_url && !receipt.pdf_url.startsWith('/api/')) {
      return getSignedUrl(BUCKETS.receipts, receipt.pdf_url);
    }
    // Otherwise upload now and return
    return this.persistReceiptPdf(paymentId, user);
  }

  async sendReceipt(paymentId: string, channel: 'email' | 'whatsapp', user: TokenPayload) {
    const receipt = await this.getReceiptByPaymentId(paymentId, user);
    const tenant = receipt.payment.tenancy.tenant;

    let messageBody = '';

    if (channel === 'email') {
      if (!tenant.email) throw new AppError('Tenant does not have an email address', 400);

      const pdfBuffer = await this.generateReceiptPdf(paymentId, user);

      try {
        await this.resend.emails.send({
          from: 'Rent System <onboarding@resend.dev>', // Should be a verified domain in prod
          to: [tenant.email],
          subject: `Payment Receipt ${receipt.receipt_number}`,
          html: `<p>Dear ${tenant.full_name},</p><p>Please find attached your payment receipt for ${receipt.payment.period_month}/${receipt.payment.period_year}.</p>`,
          attachments: [
            {
              filename: `${receipt.receipt_number}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      } catch (err: any) {
        throw new AppError(`Failed to send email: ${err.message}`, 500);
      }
      messageBody = `Email sent to ${tenant.email} with receipt ${receipt.receipt_number}`;
    } else if (channel === 'whatsapp') {
      if (!tenant.phone) throw new AppError('Tenant does not have a phone number', 400);
      // For WhatsApp, we rely on the client to open the wa.me link.
      // We just log that the agent generated/clicked the link.
      messageBody = `WhatsApp link generated for receipt ${receipt.receipt_number}`;
    }

    // Log the communication
    await prisma.communication.create({
      data: {
        account_id: user.accountId,
        tenant_id: tenant.id,
        channel,
        direction: 'outbound',
        subject: channel === 'email' ? `Receipt ${receipt.receipt_number}` : null,
        body: messageBody,
        sent_by: user.sub,
        sent_at: new Date(),
      },
    });

    // Update receipt's sent_via array if not already present
    const updatedSentVia = Array.from(new Set([...(receipt.sent_via || []), channel]));
    await prisma.receipt.update({
      where: { id: receipt.id },
      data: { sent_via: updatedSentVia },
    });

    return { success: true, message: messageBody };
  }
}

export const receiptsService = new ReceiptsService();
