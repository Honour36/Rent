import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { z } from 'zod';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const ListMaintenanceSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
  propertyId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
});

export const CreateMaintenanceSchema = z.object({
  unitId: z.string().uuid(),
  tenancyId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
});

export const UpdateMaintenanceSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
  cost: z.number().nonnegative().optional(),
  description: z.string().optional(),
  title: z.string().min(1).max(255).optional(),
});

export type CreateMaintenanceDto = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenanceDto = z.infer<typeof UpdateMaintenanceSchema>;

export class MaintenanceService {
  async list(filters: z.infer<typeof ListMaintenanceSchema>, user: TokenPayload) {
    const { status, priority, unitId, page, pageSize } = filters;
    let propertyId = filters.propertyId;

    const where: Record<string, unknown> = { account_id: user.accountId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (unitId) where.unit_id = unitId;

    // Filter by property via unit join — fetch matching unit ids first
    if (propertyId) {
      const units = await prisma.unit.findMany({
        where: { property_id: propertyId, account_id: user.accountId },
        select: { id: true },
      });
      where.unit_id = { in: units.map((u) => u.id) };
    }

    const [records, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          unit: {
            select: {
              id: true,
              unit_number: true,
              property: { select: { id: true, name: true } },
            },
          },
          logger: { select: { id: true, full_name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    return { records, total, page, pageSize };
  }

  async getById(id: string, user: TokenPayload) {
    const request = await prisma.maintenanceRequest.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        unit: {
          select: {
            id: true,
            unit_number: true,
            property: { select: { id: true, name: true, address: true } },
          },
        },
        logger: { select: { id: true, full_name: true } },
        tenancy: {
          select: {
            id: true,
            tenant: { select: { id: true, full_name: true, phone: true } },
          },
        },
      },
    });

    if (!request) throw new AppError('Maintenance request not found', 404);
    return request;
  }

  async create(data: CreateMaintenanceDto, user: TokenPayload) {
    // Verify unit belongs to this account
    const unit = await prisma.unit.findFirst({
      where: { id: data.unitId, account_id: user.accountId },
    });
    if (!unit) throw new AppError('Unit not found', 404);

    const request = await prisma.maintenanceRequest.create({
      data: {
        account_id: user.accountId,
        unit_id: data.unitId,
        tenancy_id: data.tenancyId ?? null,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        status: 'open',
        logged_by: user.sub,
      },
      include: {
        unit: {
          select: {
            id: true,
            unit_number: true,
            property: { select: { id: true, name: true } },
          },
        },
        logger: { select: { id: true, full_name: true } },
      },
    });

    return request;
  }

  async update(id: string, data: UpdateMaintenanceDto, user: TokenPayload) {
    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id, account_id: user.accountId },
    });
    if (!existing) throw new AppError('Maintenance request not found', 404);

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.title !== undefined) updateData.title = data.title;

    // Set resolved_at when status transitions to resolved/closed
    if (
      (data.status === 'resolved' || data.status === 'closed') &&
      existing.status !== 'resolved' &&
      existing.status !== 'closed'
    ) {
      updateData.resolved_at = new Date();
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        unit: {
          select: {
            id: true,
            unit_number: true,
            property: { select: { id: true, name: true } },
          },
        },
        logger: { select: { id: true, full_name: true } },
        tenancy: {
          select: {
            id: true,
            tenant: { select: { id: true, full_name: true, phone: true } },
          },
        },
      },
    });

    return updated;
  }
}

export const maintenanceService = new MaintenanceService();
