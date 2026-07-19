import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { deletePropertiesCascade } from './cascade-delete.helper';

export const CreateOwnerSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required.' }).min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  isDiaspora: z.boolean().default(false),
});

export const UpdateOwnerSchema = CreateOwnerSchema.partial();

export type CreateOwnerDto = z.infer<typeof CreateOwnerSchema>;
export type UpdateOwnerDto = z.infer<typeof UpdateOwnerSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class OwnersService {
  async list(user: TokenPayload) {
    const owners = await prisma.owner.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { properties: true } },
        properties: {
          select: {
            id: true,
            name: true,
            address: true,
            units: { select: { id: true, status: true } },
          },
        },
      },
    });
    return owners;
  }

  async getById(id: string, user: TokenPayload) {
    const owner = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        properties: true,
        statements: true,
      },
    });

    if (!owner) throw new AppError('Owner not found', 404);
    return owner;
  }

  async create(data: CreateOwnerDto, user: TokenPayload) {
    const owner = await prisma.owner.create({
      data: {
        account_id: user.accountId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        is_diaspora: data.isDiaspora,
      },
    });
    return owner;
  }

  async update(id: string, data: UpdateOwnerDto, user: TokenPayload) {
    // Verify ownership before updating
    const existing = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Owner not found', 404);

    const owner = await prisma.owner.update({
      where: { id },
      data: {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        is_diaspora: data.isDiaspora,
      },
    });
    return owner;
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Owner not found', 404);

    const properties = await prisma.property.findMany({ where: { owner_id: id }, select: { id: true } });
    const propertyIds = properties.map(p => p.id);

    await prisma.$transaction(async (tx) => {
      await deletePropertiesCascade(tx, propertyIds);
      // rent_collection_requests tied to this owner's own payments are
      // already gone via deletePropertiesCascade, but defensively clean up
      // any that somehow weren't (not expected to hit anything left).
      await tx.rentCollectionRequest.deleteMany({ where: { owner_id: id } });
      await tx.trustTransaction.deleteMany({ where: { owner_id: id } });
      await tx.communication.deleteMany({ where: { owner_id: id } });
      await tx.ownerStatement.deleteMany({ where: { owner_id: id } });
      await tx.owner.delete({ where: { id } });
    });

    return { deleted: true };
  }
}

export const ownersService = new OwnersService();