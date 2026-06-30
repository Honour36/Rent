import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const CreateUnitSchema = z.object({
  propertyId: z.string().uuid(),
  unitNumber: z.string().min(1),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  rentAmount: z.number().positive(),
  currency: z.enum(['ZiG', 'USD'])
});

export const UpdateUnitSchema = z.object({
  status: z.enum(['vacant', 'occupied', 'maintenance']).optional(),
  rentAmount: z.number().positive().optional(),
  currency: z.enum(['ZiG', 'USD']).optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional()
});

export type CreateUnitDto = z.infer<typeof CreateUnitSchema>;
export type UpdateUnitDto = z.infer<typeof UpdateUnitSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class UnitsService {
  async create(data: CreateUnitDto, user: TokenPayload) {
    const unit = await prisma.unit.create({
      data: {
        account_id: user.accountId,
        property_id: data.propertyId,
        unit_number: data.unitNumber,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        rent_amount: data.rentAmount,
        currency: data.currency,
        status: 'vacant',
      },
    });
    return unit;
  }

  async update(id: string, data: UpdateUnitDto, user: TokenPayload) {
    // Verify ownership before updating
    const existing = await prisma.unit.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Unit not found', 404);

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        status: data.status,
        rent_amount: data.rentAmount,
        currency: data.currency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
      },
    });
    return unit;
  }
}

export const unitsService = new UnitsService();
