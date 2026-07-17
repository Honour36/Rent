import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const CreatePropertySchema = z.object({
  ownerId: z.string({ required_error: 'An owner must be selected before saving a property.' })
            .uuid('Please select a valid owner.'),
  name: z.string().min(2, 'Property name must be at least 2 characters.'),
  address: z.string().min(5, 'Please enter a full street address.'),
  suburb: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(['residential', 'commercial']).default('residential'),
  // Rent amount is optional at creation time - it can always be added or
  // changed later from Edit Property. It is never required just to save
  // the property record itself.
  rentAmount: z.number().positive().optional(),
  currency: z.enum(['USD', 'ZiG']).optional().default('USD'),
  tenantId: z.string().uuid().optional(),
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
          orderBy: { created_at: 'asc' },
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
          orderBy: { created_at: 'asc' },
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

    // Most properties in this system are basic, standalone properties (a
    // whole house, a shop) rather than a block with several sub-units - but
    // rent/status/occupancy are still stored per-unit under the hood. So we
    // always give a property exactly one "primary" unit representing the
    // property itself, whether or not a rent amount was supplied yet. This
    // is what Edit Property later updates when the agent adds/changes rent -
    // without it, there was nothing for Edit Property to update. Agents who
    // are genuinely managing a multi-unit building (e.g. a block of flats)
    // can still add further units from the property page.
    const unit = await prisma.unit.create({
      data: {
        account_id: user.accountId,
        property_id: property.id,
        unit_number: 'Main Unit',
        rent_amount: data.rentAmount ?? null,
        currency: data.currency ?? 'USD',
        status: data.tenantId ? 'occupied' : 'vacant',
      },
    });

    // Auto-assign tenant if provided (requires a rent amount to open a tenancy)
    if (data.tenantId && data.rentAmount) {
      await prisma.tenancy.create({
        data: {
          account_id: user.accountId,
          unit_id: unit.id,
          tenant_id: data.tenantId,
          lease_start: new Date(),
          rent_amount: data.rentAmount,
          currency: data.currency ?? 'USD',
          status: 'active',
        }
      });
    }

    return property;
  }

  async update(id: string, data: any, user: TokenPayload) {
    const existing = await prisma.property.findFirst({
      where: { id, account_id: user.accountId },
      include: { units: { orderBy: { created_at: 'asc' }, take: 1 } },
    });
    if (!existing) throw new Error('Property not found');

    const property = await prisma.property.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        suburb: data.suburb,
        city: data.city,
        type: data.type,
        ...(data.ownerId ? { owner_id: data.ownerId } : {}),
      },
    });

    // Rent amount lives on the property's primary unit under the hood - this
    // is what makes it possible to actually edit it from Edit Property. Only
    // touch it when the caller sent rentAmount/currency, and only against the
    // primary unit (index 0) - additional units on a genuine multi-unit
    // property are managed individually, not through this top-level field.
    if (data.rentAmount !== undefined || data.currency !== undefined) {
      const rentAmount = data.rentAmount === '' || data.rentAmount === undefined
        ? undefined
        : Number(data.rentAmount);
      const primaryUnit = existing.units[0];

      if (primaryUnit) {
        await prisma.unit.update({
          where: { id: primaryUnit.id },
          data: {
            ...(rentAmount !== undefined ? { rent_amount: rentAmount } : {}),
            ...(data.currency ? { currency: data.currency } : {}),
          },
        });
      } else {
        // Defensive: a property saved before this fix could have zero units.
        await prisma.unit.create({
          data: {
            account_id: user.accountId,
            property_id: id,
            unit_number: 'Main Unit',
            rent_amount: rentAmount ?? null,
            currency: data.currency ?? 'USD',
            status: 'vacant',
          },
        });
      }
    }

    return property;
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.property.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Property not found', 404);
    
    const units = await prisma.unit.findMany({ where: { property_id: id }, select: { id: true } });
    const unitIds = units.map(u => u.id);

    const tenancies = await prisma.tenancy.findMany({ where: { unit_id: { in: unitIds } }, select: { id: true } });
    const tenancyIds = tenancies.map(t => t.id);

    const payments = await prisma.payment.findMany({ where: { tenancy_id: { in: tenancyIds } }, select: { id: true } });
    const paymentIds = payments.map(p => p.id);

    await prisma.$transaction([
      prisma.receipt.deleteMany({ where: { payment_id: { in: paymentIds } } }),
      prisma.payment.deleteMany({ where: { tenancy_id: { in: tenancyIds } } }),
      prisma.trustTransaction.deleteMany({ where: { tenancy_id: { in: tenancyIds } } }),
      prisma.maintenanceRequest.deleteMany({ where: { unit_id: { in: unitIds } } }),
      prisma.application.deleteMany({ where: { unit_id: { in: unitIds } } }),
      prisma.tenancy.deleteMany({ where: { unit_id: { in: unitIds } } }),
      prisma.unit.deleteMany({ where: { property_id: id } }),
      prisma.property.delete({ where: { id } }),
    ]);

    return { deleted: true };
  }
}

export const propertiesService = new PropertiesService();

export const UpdatePropertySchema = CreatePropertySchema.partial();
export type UpdatePropertyDto = z.infer<typeof UpdatePropertySchema>;
