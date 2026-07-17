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

/** Check that the account has filled in the minimum details needed to print a receipt. */
export async function assertAccountDetailsComplete(accountId: string): Promise<void> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { name: true, address: true, phone: true, email: true },
  });
  const missing: string[] = [];
  if (!account?.address) missing.push('office address');
  if (!account?.phone) missing.push('contact phone');
  if (!account?.email) missing.push('company email');
  if (missing.length > 0) {
    throw new AppError(
      `Receipt cannot be generated until your account details are complete. Please fill in: ${missing.join(', ')}. Go to Settings → Account.`,
      422,
    );
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
                  include: { property: true },
                },
              },
            },
          },
        },
      },
    });
    if (!receipt) throw new AppError('Receipt not found', 404);
    return receipt;
  }

  async generateReceiptPdf(paymentId: string, user: TokenPayload): Promise<Buffer> {
    // Guard: block if account details are incomplete
    await assertAccountDetailsComplete(user.accountId);

    const receipt = await this.getReceiptByPaymentId(paymentId, user);

    // Fetch account branding details + the agent who is generating the receipt
    const [account, agent] = await Promise.all([
      prisma.account.findUnique({
        where: { id: user.accountId },
        select: {
          name: true, address: true, suburb: true, city: true,
          phone: true, email: true, vat_number: true,
          bank_name: true, bank_account: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: user.sub },
        select: { full_name: true, email: true },
      }),
    ]);

    const payment = receipt.payment;
    const tenant = payment.tenancy.tenant;
    const unit = payment.tenancy.unit;
    const property = unit.property;
    const paymentDate = new Date(payment.payment_date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const receiptDate = new Date(receipt.created_at || new Date()).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    // Build address string
    const addressParts = [account?.address, account?.suburb, account?.city].filter(Boolean);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width - 100; // usable width
      const BLUE = '#111827';
      const DARK = '#111827';
      const GRAY = '#6b7280';
      const LINE = '#e5e7eb';

      const hr = (y?: number) => {
        doc.moveTo(50, y ?? doc.y).lineTo(50 + W, y ?? doc.y).strokeColor(LINE).lineWidth(0.5).stroke();
        doc.moveDown(0.5);
      };

      const row = (label: string, value: string, bold = false) => {
        const y = doc.y;
        doc.fontSize(10).fillColor(GRAY).text(label, 50, y, { width: W / 2 });
        doc.fontSize(10).fillColor(bold ? DARK : DARK).font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(value, 50 + W / 2, y, { width: W / 2, align: 'right' });
        doc.font('Helvetica').moveDown(0.35);
      };

      // ── HEADER ────────────────────────────────────────────────────────────
      doc.rect(50, 50, W, 80).fill('#f9fafb');
      doc.fillColor(BLUE).fontSize(20).font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', 60, 62, { width: W - 100 });
      doc.font('Helvetica').fillColor(DARK).fontSize(10)
        .text(`Receipt: ${receipt.receipt_number}`, 60, 88)
        .text(`Date: ${receiptDate}`, 60, 103);
      doc.fillColor(GRAY).fontSize(9)
        .text('Type: Property Management', 60 + W / 2, 80, { width: W / 2, align: 'right' });
      doc.moveDown(3.5);

      // ── AGENCY DETAILS ────────────────────────────────────────────────────
      hr();
      doc.fillColor(BLUE).fontSize(11).font('Helvetica-Bold').text(account?.name ?? 'Rental', { align: 'center' });
      doc.font('Helvetica').fillColor(DARK).fontSize(9);
      if (addressParts.length) doc.text(addressParts.join(', '), { align: 'center' });
      if (account?.vat_number) doc.text(`VAT #: ${account.vat_number}`, { align: 'center' });
      if (account?.phone) doc.text(`Tel: ${account.phone}`, { align: 'center' });
      if (account?.email) doc.text(`Email: ${account.email}`, { align: 'center' });
      doc.moveDown(0.5);
      hr();

      // ── RECEIVED FROM ────────────────────────────────────────────────────
      doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text('Received From:');
      doc.font('Helvetica').moveDown(0.3);
      hr();

      row('Name', tenant.full_name, true);
      row('Customer ID', tenant.id.slice(0, 8).toUpperCase());
      row('Lease ID', payment.tenancy_id.slice(0, 8).toUpperCase());
      row('Leased Property', `${property.name}, ${property.address ?? ''}`.trim().replace(/,\s*$/, ''));
      if (unit.unit_number && unit.unit_number !== 'Main Unit') {
        row('Unit', unit.unit_number);
      }
      doc.moveDown(0.3);
      hr();

      // ── PAYMENT DETAILS ──────────────────────────────────────────────────
      doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text('Payment Details:');
      doc.font('Helvetica').moveDown(0.3);
      hr();

      if (payment.reference) row('Ref #', payment.reference);
      row('Receipted By', agent?.full_name ?? user.sub);
      if (account?.bank_name || account?.bank_account) {
        row('Account', [account?.bank_name, account?.bank_account].filter(Boolean).join('  '));
      }
      row('Payment Date', paymentDate);
      row('Method', payment.method.replace('_', ' ').toUpperCase());
      if (payment.zig_usd_rate) row('ZiG/USD Rate', String(payment.zig_usd_rate));
      doc.moveDown(0.3);
      hr();

      // ── AMOUNT BLOCK ─────────────────────────────────────────────────────
      const amtY = doc.y;
      doc.rect(50, amtY, W, 46).fill('#f3f4f6');
      doc.fillColor(GRAY).fontSize(9).font('Helvetica').text('Payment Amount', 60, amtY + 8);
      doc.fillColor(BLUE).fontSize(18).font('Helvetica-Bold')
        .text(`${payment.currency} ${Number(payment.amount_paid).toLocaleString('en-ZW', { minimumFractionDigits: 2 })}`, 60, amtY + 20);
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text(`Currency: ${payment.currency}`, 60 + W / 2, amtY + 25, { width: W / 2, align: 'right' });
      doc.y = amtY + 56;
      doc.moveDown(0.5);

      // ── BEING PAYMENT FOR ────────────────────────────────────────────────
      hr();
      doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text('Being Payment For:');
      doc.font('Helvetica').moveDown(0.3);

      // Table header
      const col1 = 50, col2 = 50 + W * 0.6;
      doc.fillColor(GRAY).fontSize(9).font('Helvetica-Bold')
        .text('Account', col1, doc.y, { width: W * 0.6 })
        .text('Amount', col2, doc.y - doc.currentLineHeight(), { width: W * 0.4, align: 'right' });
      doc.font('Helvetica').moveDown(0.3);
      hr();

      // Row: Rent
      const beingY = doc.y;
      doc.fillColor(DARK).fontSize(10)
        .text(`Rent - ${property.name}`, col1, beingY, { width: W * 0.6 });
      doc.fontSize(10)
        .text(
          `${payment.currency} ${Number(payment.amount_paid).toLocaleString('en-ZW', { minimumFractionDigits: 2 })}`,
          col2, beingY, { width: W * 0.4, align: 'right' }
        );
      doc.moveDown(0.5);
      // Period
      doc.fillColor(GRAY).fontSize(9)
        .text(`Period: ${payment.period_month}/${payment.period_year}`, col1 + 8);

      doc.moveDown(1.5);
      hr();

      // ── FOOTER ───────────────────────────────────────────────────────────
      doc.fillColor(GRAY).fontSize(8)
        .text('This is a computer-generated receipt and does not require a physical signature.', 50, doc.y, { align: 'center', width: W });
      doc.moveDown(0.3);
      doc.fillColor(BLUE).fontSize(8)
        .text(`Generated by Rental · ${new Date().toLocaleString('en-GB')}`, { align: 'center', width: W });

      doc.end();
    });
  }

  async persistReceiptPdf(paymentId: string, user: TokenPayload): Promise<string> {
    const receipt = await this.getReceiptByPaymentId(paymentId, user);
    const pdfBuffer = await this.generateReceiptPdf(paymentId, user);
    const storagePath = `receipts/${user.accountId}/${receipt.receipt_number}.pdf`;
    await uploadFile(BUCKETS.receipts, storagePath, pdfBuffer, 'application/pdf');
    await prisma.receipt.update({ where: { id: receipt.id }, data: { pdf_url: storagePath } });
    return getSignedUrl(BUCKETS.receipts, storagePath);
  }

  async getReceiptSignedUrl(paymentId: string, user: TokenPayload): Promise<string> {
    // Always regenerate to pick up latest account details
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
        const account = await prisma.account.findUnique({ where: { id: user.accountId }, select: { name: true, email: true } });
        const result = await this.resend.emails.send({
          from: account?.email ? `${account.name} <${account.email}>` : `Rental <onboarding@resend.dev>`,
          to: [tenant.email],
          subject: `Payment Receipt ${receipt.receipt_number}`,
          html: `<p>Dear ${tenant.full_name},</p><p>Please find attached your payment receipt for ${receipt.payment.period_month}/${receipt.payment.period_year}.</p><p>Thank you for your payment.</p>`,
          attachments: [{ filename: `${receipt.receipt_number}.pdf`, content: pdfBuffer }],
        });
        if (result.error) {
          // Resend resolves with an `error` field instead of throwing.
          throw new Error(result.error.message);
        }
      } catch (err: any) {
        throw new AppError(`Failed to send email: ${err.message}`, 500);
      }
      messageBody = `Email sent to ${tenant.email} with receipt ${receipt.receipt_number}`;
    } else {
      if (!tenant.phone) throw new AppError('Tenant does not have a phone number', 400);
      messageBody = `WhatsApp link generated for receipt ${receipt.receipt_number}`;
    }

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

    const updatedSentVia = Array.from(new Set([...(receipt.sent_via || []), channel]));
    await prisma.receipt.update({ where: { id: receipt.id }, data: { sent_via: updatedSentVia } });

    return { success: true, message: messageBody };
  }
}

export const receiptsService = new ReceiptsService();
