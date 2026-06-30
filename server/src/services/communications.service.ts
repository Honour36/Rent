import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { Resend } from 'resend';
import { z } from 'zod';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const ListCommunicationsSchema = z.object({
  tenantId: z.string().uuid().optional(),
  channel: z.enum(['email', 'whatsapp']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
});

export const ComposeCommunicationSchema = z.object({
  tenantId: z.string().uuid(),
  channel: z.enum(['email', 'whatsapp']),
  subject: z.string().max(255).optional(),
  body: z.string().min(1, 'Message body is required'),
});

export type ComposeCommunicationDto = z.infer<typeof ComposeCommunicationSchema>;

export class CommunicationsService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_mock');
  }

  async list(
    filters: z.infer<typeof ListCommunicationsSchema>,
    user: TokenPayload,
  ) {
    const { tenantId, channel, page, pageSize } = filters;

    const where: Record<string, unknown> = { account_id: user.accountId };
    if (tenantId) where.tenant_id = tenantId;
    if (channel) where.channel = channel;

    const [records, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        include: {
          tenant: { select: { id: true, full_name: true, phone: true, email: true } },
          sender: { select: { id: true, full_name: true } },
        },
        orderBy: { sent_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.communication.count({ where }),
    ]);

    return { records, total, page, pageSize };
  }

  async compose(data: ComposeCommunicationDto, user: TokenPayload) {
    // Verify the tenant belongs to this account
    const tenant = await prisma.tenant.findFirst({
      where: { id: data.tenantId, account_id: user.accountId },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    let waLink: string | null = null;

    if (data.channel === 'email') {
      if (!tenant.email) {
        throw new AppError('Tenant does not have an email address', 400);
      }

      try {
        await this.resend.emails.send({
          from: 'Rent System <onboarding@resend.dev>',
          to: [tenant.email],
          subject: data.subject || '(no subject)',
          html: data.body.replace(/\n/g, '<br>'),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new AppError(`Failed to send email: ${message}`, 500);
      }
    } else if (data.channel === 'whatsapp') {
      if (!tenant.phone) {
        throw new AppError('Tenant does not have a phone number', 400);
      }
      // Normalise phone — strip leading 0 if present and prepend country code prefix
      const phone = tenant.phone.replace(/\D/g, '');
      waLink = `https://wa.me/${phone}?text=${encodeURIComponent(data.body)}`;
    }

    const communication = await prisma.communication.create({
      data: {
        account_id: user.accountId,
        tenant_id: data.tenantId,
        channel: data.channel,
        direction: 'outbound',
        subject: data.subject ?? null,
        body: data.body,
        sent_by: user.sub,
        sent_at: new Date(),
      },
      include: {
        tenant: { select: { id: true, full_name: true, phone: true, email: true } },
        sender: { select: { id: true, full_name: true } },
      },
    });

    return { communication, waLink };
  }
}

export const communicationsService = new CommunicationsService();
