import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const CreateTenantSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  employer: z.string().optional(),
  employmentStatus: z.string().optional(),
  monthlyIncome: z.number().positive().optional()
});

export const UpdateTenantSchema = CreateTenantSchema.partial();

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class TenantsService {
  async list(user: TokenPayload) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const dayOfMonth = now.getDate();

    const tenants = await prisma.tenant.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
      include: {
        tenancies: {
          where: { status: 'active' },
          take: 1,
          orderBy: { created_at: 'desc' },
          include: {
            unit: { include: { property: true } },
            payments: {
              where: { payment_type: 'rent', period_month: currentMonth, period_year: currentYear },
              select: { amount_paid: true, status: true, period_month: true, period_year: true },
              take: 1,
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
    });

    return tenants.map((t) => {
      const activeTenancy = t.tenancies[0] ?? null;
      const currentPayment = activeTenancy?.payments[0] ?? null;
      const rentDueDay = activeTenancy?.rent_due_day ?? 1;

      // Overdue = past due day this month, no paid/late payment recorded
      const isOverdue = activeTenancy
        ? dayOfMonth > rentDueDay &&
          (!currentPayment || currentPayment.status === 'unpaid' || currentPayment.status === 'partial')
        : false;

      const hasArrears = isOverdue || (currentPayment?.status === 'partial');

      return { ...t, activeTenancy, hasArrears, isOverdue, currentPayment };
    });
  }

  async getById(id: string, user: TokenPayload) {
    const tenant = await prisma.tenant.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        tenancies: {
          orderBy: { created_at: 'desc' },
          include: {
            unit: {
              include: { property: true },
            },
            payments: {
              orderBy: { payment_date: 'desc' },
              include: { receipts: true },
            },
          },
        },
        communications: {
          orderBy: { sent_at: 'desc' },
        },
      },
    });

    if (!tenant) throw new AppError('Tenant not found', 404);
    return tenant;
  }

  async create(data: CreateTenantDto, user: TokenPayload) {
    const tenant = await prisma.tenant.create({
      data: {
        account_id: user.accountId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        id_number: data.idNumber,
        employer: data.employer,
        employment_status: data.employmentStatus,
        monthly_income: data.monthlyIncome,
      },
    });
    return tenant;
  }

  async update(id: string, data: UpdateTenantDto, user: TokenPayload) {
    // Verify ownership before updating
    const existing = await prisma.tenant.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Tenant not found', 404);

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        id_number: data.idNumber,
        employer: data.employer,
        employment_status: data.employmentStatus,
        monthly_income: data.monthlyIncome,
      },
    });
    return tenant;
  }
  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.tenant.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Tenant not found', 404);
    await prisma.tenant.delete({ where: { id } });
    return { deleted: true };
  }
}

export const tenantsService = new TenantsService();