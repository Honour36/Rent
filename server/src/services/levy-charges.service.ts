import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const CreateLevyChargeSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  frequency: z.enum(['one_off', 'monthly', 'quarterly', 'annual']),
  notes: z.string().max(500).optional(),
});
export type CreateLevyChargeDto = z.infer<typeof CreateLevyChargeSchema>;

class LevyChargesService {
  async create(data: CreateLevyChargeDto, user: TokenPayload) {
    const property = await prisma.property.findFirst({ where: { id: data.propertyId, account_id: user.accountId } });
    if (!property) throw new AppError('Property not found', 404);

    return prisma.levyCharge.create({
      data: {
        account_id: user.accountId,
        property_id: data.propertyId,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        frequency: data.frequency,
        notes: data.notes ?? null,
      },
    });
  }

  async list(user: TokenPayload) {
    return prisma.levyCharge.findMany({
      where: { account_id: user.accountId },
      orderBy: [{ active: 'desc' }, { created_at: 'desc' }],
      include: { property: { select: { name: true } } },
    });
  }

  async listForProperty(propertyId: string, user: TokenPayload) {
    return prisma.levyCharge.findMany({
      where: { property_id: propertyId, account_id: user.accountId, active: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async setActive(id: string, active: boolean, user: TokenPayload) {
    const charge = await prisma.levyCharge.findFirst({ where: { id, account_id: user.accountId } });
    if (!charge) throw new AppError('Levy charge not found', 404);
    return prisma.levyCharge.update({ where: { id }, data: { active } });
  }
}

export const levyChargesService = new LevyChargesService();
