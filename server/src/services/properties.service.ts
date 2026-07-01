import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const CreatePropertySchema = z.object({
  ownerId: z.string().uuid().optional(),
  name: z.string().min(2),
  address: z.string().min(5),
  suburb: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(['residential', 'commercial']).default('residential')
});

export type CreatePropertyDto = z.infer<typeof CreatePropertySchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class PropertiesService {
  async list(user: TokenPayload) {
    const properties = await prisma.property.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
      include: {
        units: {
          include: {
            tenancies: {
              where: { status: 'active' },
              take: 1,
              include: {
                tenant: { select: { id: true, full_name: true } },
              },
            },
          },
        },
        owner: { select: { id: true, full_name: true, email: true } },
      },
    });
    return properties;
  }

  async getById(id: string, user: TokenPayload) {
    const property = await prisma.property.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        units: {
          include: {
            tenancies: {
              where: { status: 'active' },
              take: 1,
              include: {
                tenant: { select: { id: true, full_name: true, email: true, phone: true } },
              },
            },
          },
        },
        owner: { select: { id: true, full_name: true, email: true, phone: true } },
      },
    });

    if (!property) throw new AppError('Property not found', 404);
    return property;
  }

  async create(data: CreatePropertyDto, user: TokenPayload) {
    const property = await prisma.property.create({
      data: {
        account_id: user.accountId,
        owner_id: data.ownerId!,
        name: data.name,
        address: data.address,
        suburb: data.suburb,
        city: data.city,
        type: data.type,
      },
    });
    return property;
  }
}

export const propertiesService = new PropertiesService();
