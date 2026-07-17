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
  ownerId: z.string().uuid().optional(),
  channel: z.enum(['email', 'whatsapp']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
});

export const ComposeCommunicationSchema = z
  .object({
    recipientType: z.enum(['tenant', 'owner']).default('tenant'),
    tenantId: z.string().uuid().optional(),
    ownerId: z.string().uuid().optional(),
    channel: z.enum(['email', 'whatsapp']),
    subject: z.string().max(255).optional(),
    body: z.string().min(1, 'Message body is required'),
  })
  .refine(
    (data) => (data.recipientType === 'tenant' ? !!data.tenantId : !!data.ownerId),
    { message: 'A recipient is required', path: ['tenantId'] },
  );

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
    const { tenantId, ownerId, channel, page, pageSize } = filters;

    const where: Record<string, unknown> = { account_id: user.accountId };
    if (tenantId) where.tenant_id = tenantId;
    if (ownerId) where.owner_id = ownerId;
    if (channel) where.channel = channel;

    const [records, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        include: {
          tenant: { select: { id: true, full_name: true, phone: true, email: true } },
          owner: { select: { id: true, full_name: true, phone: true, email: true } },
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
    const isOwner = data.recipientType === 'owner';

    const tenant = !isOwner
      ? await prisma.tenant.findFirst({ where: { id: data.tenantId, account_id: user.accountId } })
      : null;
    if (!isOwner && !tenant) {
      throw new AppError('Tenant not found', 404);
    }

    const owner = isOwner
      ? await prisma.owner.findFirst({ where: { id: data.ownerId, account_id: user.accountId } })
      : null;
    if (isOwner && !owner) {
      throw new AppError('Owner not found', 404);
    }

    const recipient = isOwner ? owner! : tenant!;

    let waLink: string | null = null;

    if (data.channel === 'email') {
      if (!recipient.email) {
        throw new AppError(`${isOwner ? 'Owner' : 'Tenant'} does not have an email address`, 400);
      }

      const account = await prisma.account.findUnique({
        where: { id: user.accountId },
        select: { name: true, email: true },
      });

      try {
        const result = await this.resend.emails.send({
          from: account?.email ? `${account.name} <${account.email}>` : 'Rental <onboarding@resend.dev>',
          to: [recipient.email],
          subject: data.subject || '(no subject)',
          html: data.body.replace(/\n/g, '<br>'),
        });
        if (result.error) {
          // Resend returns a 200 with an `error` payload rather than throwing -
          // without this check a failed send was silently recorded as "sent".
          throw new Error(result.error.message);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to send communication email:', message);
        throw new AppError(`Failed to send email: ${message}`, 500);
      }
    } else if (data.channel === 'whatsapp') {
      if (!recipient.phone) {
        throw new AppError(`${isOwner ? 'Owner' : 'Tenant'} does not have a phone number`, 400);
      }
      // Normalise phone - strip non-digits before building the wa.me link
      const phone = recipient.phone.replace(/\D/g, '');
      waLink = `https://wa.me/${phone}?text=${encodeURIComponent(data.body)}`;
    }

    const communication = await prisma.communication.create({
      data: {
        account_id: user.accountId,
        tenant_id: isOwner ? null : data.tenantId,
        owner_id: isOwner ? data.ownerId : null,
        channel: data.channel,
        direction: 'outbound',
        subject: data.subject ?? null,
        body: data.body,
        sent_by: user.sub,
        sent_at: new Date(),
      },
      include: {
        tenant: { select: { id: true, full_name: true, phone: true, email: true } },
        owner: { select: { id: true, full_name: true, phone: true, email: true } },
        sender: { select: { id: true, full_name: true } },
      },
    });

    return { communication, waLink };
  }

  async getById(id: string, user: TokenPayload) {
    const communication = await prisma.communication.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        tenant: { select: { id: true, full_name: true, phone: true, email: true } },
        sender: { select: { id: true, full_name: true } },
      },
    });

    if (!communication) {
      throw new AppError('Communication not found', 404);
    }

    return communication;
  }

  async update(id: string, data: { subject?: string; body?: string }, user: TokenPayload) {
    const existing = await prisma.communication.findFirst({
      where: { id, account_id: user.accountId },
    });

    if (!existing) {
      throw new AppError('Communication not found', 404);
    }

    const communication = await prisma.communication.update({
      where: { id },
      data: {
        subject: data.subject !== undefined ? data.subject : existing.subject,
        body: data.body !== undefined ? data.body : existing.body,
      },
      include: {
        tenant: { select: { id: true, full_name: true, phone: true, email: true } },
        sender: { select: { id: true, full_name: true } },
      },
    });

    return communication;
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.communication.findFirst({
      where: { id, account_id: user.accountId },
    });

    if (!existing) {
      throw new AppError('Communication not found', 404);
    }

    await prisma.communication.delete({
      where: { id },
    });

    return { success: true };
  }
}

export const communicationsService = new CommunicationsService();
