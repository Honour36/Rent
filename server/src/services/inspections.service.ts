import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { depositsService } from './deposits.service';
import { tenanciesService } from './tenancies.service';
import { noticesToVacateService } from './notices-to-vacate.service';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const ScheduleInspectionSchema = z.object({
  tenancyId: z.string().uuid(),
  type: z.enum(['move_in', 'periodic', 'move_out']),
  scheduledFor: z.string().min(1),
});
export type ScheduleInspectionDto = z.infer<typeof ScheduleInspectionSchema>;

export const CompleteInspectionSchema = z.object({
  outcome: z.enum(['pass', 'fail']),
  notes: z.string().max(2000).optional(),
  items: z.array(z.object({
    label: z.string().min(1),
    checked: z.boolean(),
    disputed: z.boolean().optional(),
    notes: z.string().max(500).optional(),
  })).optional(),
  // Only meaningful for type === 'move_out' - resolves the deposit and ends
  // the tenancy in the same step, since that's the defined lifecycle: a
  // completed move-out inspection is what actually frees the unit.
  depositResolvedAmount: z.number().nonnegative().optional(),
});
export type CompleteInspectionDto = z.infer<typeof CompleteInspectionSchema>;

class InspectionsService {
  async schedule(data: ScheduleInspectionDto, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({ where: { id: data.tenancyId, account_id: user.accountId } });
    if (!tenancy) throw new AppError('Tenancy not found', 404);

    const scheduledFor = new Date(data.scheduledFor);
    if (Number.isNaN(scheduledFor.getTime())) throw new AppError('Please choose a valid date and time.', 400);

    return prisma.inspection.create({
      data: {
        account_id: user.accountId,
        tenancy_id: data.tenancyId,
        type: data.type,
        scheduled_for: scheduledFor,
      },
    });
  }

  async list(user: TokenPayload) {
    return prisma.inspection.findMany({
      where: { account_id: user.accountId },
      orderBy: [{ status: 'asc' }, { scheduled_for: 'asc' }],
      include: {
        tenancy: {
          include: {
            tenant: { select: { full_name: true } },
            unit: { select: { unit_number: true, property: { select: { name: true } } } },
          },
        },
        conductor: { select: { full_name: true } },
        items: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  /**
   * The checklist "carries forward" - a move-out inspection should start
   * from the same list of items the move-in inspection used, so the
   * manager is re-checking the same things rather than starting from a
   * blank list. Returns item labels (reset to unchecked/undisputed) from
   * the most recently completed inspection for this tenancy, if any.
   */
  async getSuggestedItems(tenancyId: string, user: TokenPayload) {
    const tenancy = await prisma.tenancy.findFirst({ where: { id: tenancyId, account_id: user.accountId } });
    if (!tenancy) throw new AppError('Tenancy not found', 404);

    const last = await prisma.inspection.findFirst({
      where: { tenancy_id: tenancyId, status: 'completed' },
      orderBy: { completed_at: 'desc' },
      include: { items: { orderBy: { sort_order: 'asc' } } },
    });

    if (!last || last.items.length === 0) return [];
    return last.items.map((i) => ({ label: i.label, section: i.section }));
  }

  async cancel(id: string, user: TokenPayload) {
    const inspection = await prisma.inspection.findFirst({ where: { id, account_id: user.accountId } });
    if (!inspection) throw new AppError('Inspection not found', 404);
    if (inspection.status !== 'scheduled') throw new AppError('Only a scheduled inspection can be cancelled.', 400);
    return prisma.inspection.update({ where: { id }, data: { status: 'cancelled' } });
  }

  /**
   * Completing an inspection is where the lifecycle actually moves forward:
   * - move_in / periodic: just records the outcome and notes.
   * - move_out: also resolves the deposit (pass -> released in full unless
   *   a different amount is given, e.g. partial forfeit for minor damage;
   *   fail -> forfeited for the given amount) and ends the tenancy, which
   *   frees the unit back to vacant. If the tenancy has no deposit record
   *   (no deposit_amount was ever set), that step is skipped rather than
   *   blocking the move-out - not every tenancy will have taken a deposit.
   */
  async complete(id: string, data: CompleteInspectionDto, user: TokenPayload) {
    const inspection = await prisma.inspection.findFirst({ where: { id, account_id: user.accountId } });
    if (!inspection) throw new AppError('Inspection not found', 404);
    if (inspection.status === 'completed') throw new AppError('This inspection has already been completed.', 409);

    const updated = await prisma.$transaction(async (tx) => {
      const insp = await tx.inspection.update({
        where: { id },
        data: {
          status: 'completed',
          outcome: data.outcome,
          notes: data.notes ?? null,
          completed_at: new Date(),
          conducted_by: user.sub,
        },
      });

      if (data.items && data.items.length > 0) {
        await tx.inspectionItem.createMany({
          data: data.items.map((item, idx) => ({
            inspection_id: id,
            label: item.label,
            checked: item.checked,
            disputed: item.disputed ?? false,
            notes: item.notes ?? null,
            sort_order: idx,
          })),
        });
      }

      return insp;
    });

    if (inspection.type !== 'move_out') return { inspection: updated };

    let depositResult = null;
    const deposit = await prisma.deposit.findUnique({ where: { tenancy_id: inspection.tenancy_id } });
    if (deposit && deposit.status !== 'released' && deposit.status !== 'forfeited') {
      const paidResult = await depositsService.getForTenancy(inspection.tenancy_id, user);
      const paid = paidResult?.paid_amount ?? 0;
      const resolvedAmount = data.depositResolvedAmount ?? (data.outcome === 'pass' ? paid : 0);
      try {
        depositResult = await depositsService.resolve(inspection.tenancy_id, {
          outcome: data.outcome === 'pass' ? 'released' : 'forfeited',
          resolvedAmount,
          notes: `From move-out inspection: ${data.notes ?? ''}`.trim(),
        }, user);
      } catch (err) {
        console.error('Failed to auto-resolve deposit from move-out inspection:', err);
      }
    }

    const tenancy = await tenanciesService.endTenancy(inspection.tenancy_id, user);

    try {
      await noticesToVacateService.fulfilActiveForTenancy(inspection.tenancy_id);
    } catch (err) {
      console.error('Failed to mark notice to vacate as fulfilled:', err);
    }

    return { inspection: updated, deposit: depositResult, tenancy };
  }
}

export const inspectionsService = new InspectionsService();
