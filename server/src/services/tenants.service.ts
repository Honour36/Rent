import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { deleteTenanciesCascade } from './cascade-delete.helper';

export const CreateTenantSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  dateOfBirth: z.string().optional(), // ISO date string, e.g. "1990-05-14"
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
  /**
   * Same ID number, email, or phone within an account means the same
   * person - block it before it becomes two rows. If none of those
   * identifying fields were given (name only), fall back to an exact name
   * match, since that's the only thing distinguishing the record at all.
   */
  private async assertNoDuplicate(data: { fullName: string; email?: string; phone?: string; idNumber?: string }, user: TokenPayload, excludeId?: string) {
    const or: any[] = [];
    if (data.idNumber?.trim()) or.push({ id_number: { equals: data.idNumber.trim(), mode: 'insensitive' } });
    if (data.email?.trim()) or.push({ email: { equals: data.email.trim(), mode: 'insensitive' } });
    if (data.phone?.trim()) or.push({ phone: data.phone.trim() });
    if (or.length === 0) or.push({ full_name: { equals: data.fullName.trim(), mode: 'insensitive' } });

    const existing = await prisma.tenant.findFirst({
      where: { account_id: user.accountId, ...(excludeId ? { id: { not: excludeId } } : {}), OR: or },
      select: { full_name: true, id_number: true, email: true, phone: true },
    });
    if (!existing) return;

    const field =
      data.idNumber?.trim() && existing.id_number?.toLowerCase() === data.idNumber.trim().toLowerCase() ? 'ID number' :
      data.email?.trim() && existing.email?.toLowerCase() === data.email.trim().toLowerCase() ? 'email address' :
      data.phone?.trim() && existing.phone === data.phone.trim() ? 'phone number' :
      'name';
    throw new AppError(`A tenant with this ${field} already exists (${existing.full_name}).`, 409);
  }

  async list(user: TokenPayload) {
    const now = new Date();
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
              where: { payment_type: 'rent' },
              select: { amount_paid: true, status: true, period_month: true, period_year: true },
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

      // Arrears = same cumulative balance formula as the Arrears report
      // (monthsActive x rent - totalPaid), not "is there a payment
      // recorded for literally this calendar month". That simpler check
      // used to flag freshly-imported tenants as overdue immediately -
      // their payment history only covers the months their spreadsheet
      // recorded, so of course nothing existed yet for today's real
      // month. A tenant whose imported history has no gaps (no blank
      // months) has balance 0 and correctly shows no arrears; a lease
      // that starts today (the fallback when a spreadsheet had no lease
      // start date) has 0 months active yet, so nothing is owed until a
      // real due date actually passes.
      //
      // hasArrears and isOverdue are intentionally the same value - there
      // is only one arrears state (balance > 0), not a separate "partial"
      // severity. Kept as two fields since the frontend type already reads
      // both; collapse there, not here.
      let hasArrears = false;
      if (activeTenancy) {
        const start = new Date(activeTenancy.lease_start);
        let monthsActive = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
        if (dayOfMonth < rentDueDay) monthsActive--;
        if (monthsActive < 0) monthsActive = 0;

        const totalDue = monthsActive * Number(activeTenancy.rent_amount);
        const totalPaid = activeTenancy.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const balance = totalDue - totalPaid;

        hasArrears = balance > 0;
      }
      const isOverdue = hasArrears;

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
    await this.assertNoDuplicate(data, user);

    const tenant = await prisma.tenant.create({
      data: {
        account_id: user.accountId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        id_number: data.idNumber,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
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
    });
    if (!existing) throw new AppError('Tenant not found', 404);

    await this.assertNoDuplicate({
      fullName: data.fullName ?? existing.full_name,
      email: data.email ?? existing.email ?? undefined,
      phone: data.phone ?? existing.phone ?? undefined,
      idNumber: data.idNumber ?? existing.id_number ?? undefined,
    }, user, id);

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        id_number: data.idNumber,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
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

    const tenancies = await prisma.tenancy.findMany({ where: { tenant_id: id }, select: { id: true } });
    const tenancyIds = tenancies.map(t => t.id);

    await prisma.$transaction(async (tx) => {
      await deleteTenanciesCascade(tx, tenancyIds);
      await tx.communication.deleteMany({ where: { tenant_id: id } });
      await tx.tenant.delete({ where: { id } });
    });

    return { deleted: true };
  }

  /**
   * Deletes many tenants in one transaction instead of one call per
   * tenant - see PropertiesService.bulkDelete for why per-row concurrent
   * transactions fail partway through at scale.
   */
  async bulkDelete(ids: string[], user: TokenPayload): Promise<{ deleted: number }> {
    const owned = await prisma.tenant.findMany({
      where: { id: { in: ids }, account_id: user.accountId },
      select: { id: true },
    });
    const ownedIds = owned.map(t => t.id);
    if (ownedIds.length === 0) return { deleted: 0 };

    const tenancies = await prisma.tenancy.findMany({ where: { tenant_id: { in: ownedIds } }, select: { id: true } });
    const tenancyIds = tenancies.map(t => t.id);

    await prisma.$transaction(
      async (tx) => {
        await deleteTenanciesCascade(tx, tenancyIds);
        await tx.communication.deleteMany({ where: { tenant_id: { in: ownedIds } } });
        await tx.tenant.deleteMany({ where: { id: { in: ownedIds } } });
      },
      { timeout: 120_000 }
    );

    return { deleted: ownedIds.length };
  }
}

export const tenantsService = new TenantsService();
