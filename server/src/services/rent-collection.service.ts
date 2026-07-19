import { z } from 'zod';
import { randomBytes } from 'crypto';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { notificationsService } from './notifications.service';

export const ScheduleCollectionSchema = z.object({
  scheduledFor: z.string().min(1, 'Please choose a date and time.'),
  notes: z.string().max(500).optional(),
});
export type ScheduleCollectionDto = z.infer<typeof ScheduleCollectionSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

class RentCollectionService {
  /**
   * Called right after a payment is recorded (see payments.service.ts).
   * One request per payment - the owner-facing link this backs is
   * effectively "here's the rent that just came in, tell us when you'll
   * collect it," so it doesn't make sense to have more than one open per
   * payment.
   */
  async createForPayment(paymentId: string, accountId: string, ownerId: string): Promise<{ token: string; url: string }> {
    const token = randomBytes(24).toString('hex');
    await prisma.rentCollectionRequest.create({
      data: { account_id: accountId, payment_id: paymentId, owner_id: ownerId, token, status: 'pending' },
    });
    const baseUrl = process.env.FRONTEND_URL || 'https://rent-pi-murex.vercel.app';
    return { token, url: `${baseUrl}/rent-collection/${token}` };
  }

  /**
   * Public: info for the owner-facing scheduling page (no auth - the owner
   * isn't a logged-in user of this system).
   */
  async getPublicByToken(token: string) {
    const request = await prisma.rentCollectionRequest.findUnique({
      where: { token },
      include: {
        owner: { select: { full_name: true } },
        payment: {
          include: {
            tenancy: {
              include: {
                tenant: { select: { full_name: true } },
                unit: { include: { property: { select: { name: true, address: true } } } },
              },
            },
            receipts: { select: { receipt_number: true } },
          },
        },
      },
    });

    if (!request) throw new AppError('This link is invalid or has expired.', 404);

    // The link is single-use: once the owner has submitted a date, it's spent.
    if (request.status !== 'pending') {
      return { expired: true, scheduledFor: request.scheduled_for };
    }

    return {
      expired: false,
      ownerName: request.owner.full_name,
      tenantName: request.payment.tenancy.tenant.full_name,
      propertyName: request.payment.tenancy.unit.property.name,
      propertyAddress: request.payment.tenancy.unit.property.address,
      unitNumber: request.payment.tenancy.unit.unit_number,
      amount: Number(request.payment.amount_paid),
      currency: request.payment.currency,
      receiptNumber: request.payment.receipts[0]?.receipt_number ?? null,
      paymentDate: request.payment.payment_date,
    };
  }

  /**
   * Public: owner submits their chosen collection date/time. Spends the
   * link and notifies the account's agents so it shows up on their side.
   */
  async schedule(token: string, data: ScheduleCollectionDto) {
    const request = await prisma.rentCollectionRequest.findUnique({
      where: { token },
      include: {
        owner: { select: { full_name: true } },
        payment: {
          include: {
            tenancy: { include: { unit: { include: { property: { select: { name: true } } } } } },
          },
        },
      },
    });

    if (!request) throw new AppError('This link is invalid or has expired.', 404);
    if (request.status !== 'pending') throw new AppError('This link has already been used.', 409);

    const scheduledFor = new Date(data.scheduledFor);
    if (Number.isNaN(scheduledFor.getTime())) throw new AppError('Please choose a valid date and time.', 400);

    const updated = await prisma.rentCollectionRequest.update({
      where: { token },
      data: { status: 'scheduled', scheduled_for: scheduledFor, notes: data.notes ?? null, responded_at: new Date() },
    });

    await notificationsService.create({
      accountId: request.account_id,
      type: 'rent_collection_scheduled',
      title: 'Rent collection date set',
      body: `${request.owner.full_name} will collect rent for ${request.payment.tenancy.unit.property.name} on ` +
        `${scheduledFor.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.`,
      entityType: 'rent_collection_request',
      entityId: request.id,
    });

    return { scheduledFor: updated.scheduled_for };
  }

  /**
   * Authenticated: list for the agent dashboard (upcoming collections view).
   */
  async list(user: TokenPayload) {
    return prisma.rentCollectionRequest.findMany({
      where: { account_id: user.accountId },
      orderBy: [{ status: 'asc' }, { scheduled_for: 'asc' }, { created_at: 'desc' }],
      include: {
        owner: { select: { full_name: true } },
        payment: {
          select: {
            amount_paid: true,
            currency: true,
            tenancy: { select: { unit: { select: { unit_number: true, property: { select: { name: true } } } } } },
          },
        },
      },
    });
  }
}

export const rentCollectionService = new RentCollectionService();
