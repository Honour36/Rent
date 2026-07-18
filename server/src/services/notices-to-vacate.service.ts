import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const CreateNoticeSchema = z.object({
  tenancyId: z.string().uuid(),
  reason: z.enum(['eviction', 'sale', 'tenant_request', 'other']),
  noticeDate: z.string().min(1),
  vacateBy: z.string().min(1), // agent-chosen date - notice duration isn't fixed (e.g. 3 months for a sale)
  notes: z.string().max(1000).optional(),
});
export type CreateNoticeDto = z.infer<typeof CreateNoticeSchema>;

class NoticesToVacateService {
  async create(data: CreateNoticeDto, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({ where: { id: data.tenancyId, account_id: user.accountId } });
    if (!tenancy) throw new AppError('Tenancy not found', 404);
    if (tenancy.status !== 'active') throw new AppError('Only an active tenancy can be given notice.', 400);

    const noticeDate = new Date(data.noticeDate);
    const vacateBy = new Date(data.vacateBy);
    if (Number.isNaN(noticeDate.getTime()) || Number.isNaN(vacateBy.getTime())) {
      throw new AppError('Please choose valid dates.', 400);
    }
    if (vacateBy < noticeDate) throw new AppError('Vacate-by date must be after the notice date.', 400);

    // Withdraw any other still-active notice for this tenancy first - only
    // one active notice should govern a tenancy at a time.
    await prisma.noticeToVacate.updateMany({
      where: { tenancy_id: data.tenancyId, status: 'active' },
      data: { status: 'withdrawn' },
    });

    return prisma.noticeToVacate.create({
      data: {
        account_id: user.accountId,
        tenancy_id: data.tenancyId,
        reason: data.reason,
        notice_date: noticeDate,
        vacate_by: vacateBy,
        notes: data.notes ?? null,
        created_by: user.sub,
      },
    });
  }

  async withdraw(id: string, user: TokenPayload) {
    const notice = await prisma.noticeToVacate.findFirst({ where: { id, account_id: user.accountId } });
    if (!notice) throw new AppError('Notice not found', 404);
    if (notice.status !== 'active') throw new AppError('Only an active notice can be withdrawn.', 400);
    return prisma.noticeToVacate.update({ where: { id }, data: { status: 'withdrawn' } });
  }

  async list(user: TokenPayload) {
    return prisma.noticeToVacate.findMany({
      where: { account_id: user.accountId },
      orderBy: [{ status: 'asc' }, { vacate_by: 'asc' }],
      include: {
        tenancy: {
          include: {
            tenant: { select: { full_name: true } },
            unit: { select: { unit_number: true, property: { select: { name: true } } } },
          },
        },
      },
    });
  }

  /**
   * Called from inspections.service.ts when a move_out inspection completes,
   * so an active notice doesn't sit there forever once the move-out it was
   * for has actually happened.
   */
  async fulfilActiveForTenancy(tenancyId: string) {
    await prisma.noticeToVacate.updateMany({
      where: { tenancy_id: tenancyId, status: 'active' },
      data: { status: 'fulfilled' },
    });
  }
}

export const noticesToVacateService = new NoticesToVacateService();
