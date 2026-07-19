import { prisma } from '../db/prisma';

/**
 * Deletes everything that hangs off a set of tenancies, in FK-safe order,
 * ending with the tenancies themselves. Used by properties/tenants delete
 * (and available for units, if a direct unit-delete is ever added).
 *
 * IMPORTANT: every time a new table gets a tenancy_id or payment_id foreign
 * key (Deposit, Inspection, LeaseRenewal, NoticeToVacate,
 * RentCollectionRequest all did, across separate phases), it has to be
 * added here too, or every delete that cascades through a tenancy with one
 * of those records will fail with a foreign key violation. This function
 * existing in one place, instead of being copy-pasted per service, is the
 * fix for that class of bug recurring again.
 */
export async function deleteTenanciesCascade(tx: any, tenancyIds: string[]) {
  if (tenancyIds.length === 0) return;

  const payments = await tx.payment.findMany({ where: { tenancy_id: { in: tenancyIds } }, select: { id: true } });
  const paymentIds = payments.map((p: { id: string }) => p.id);

  await tx.rentCollectionRequest.deleteMany({ where: { payment_id: { in: paymentIds } } });
  await tx.receipt.deleteMany({ where: { payment_id: { in: paymentIds } } });
  await tx.payment.deleteMany({ where: { tenancy_id: { in: tenancyIds } } });
  await tx.trustTransaction.deleteMany({ where: { tenancy_id: { in: tenancyIds } } });
  await tx.deposit.deleteMany({ where: { tenancy_id: { in: tenancyIds } } });
  const inspections = await tx.inspection.findMany({ where: { tenancy_id: { in: tenancyIds } }, select: { id: true } });
  await tx.inspectionItem.deleteMany({ where: { inspection_id: { in: inspections.map((i: { id: string }) => i.id) } } });
  await tx.inspection.deleteMany({ where: { tenancy_id: { in: tenancyIds } } });
  await tx.leaseRenewal.deleteMany({ where: { tenancy_id: { in: tenancyIds } } });
  await tx.noticeToVacate.deleteMany({ where: { tenancy_id: { in: tenancyIds } } });
  await tx.tenancy.deleteMany({ where: { id: { in: tenancyIds } } });
}

/**
 * Deletes everything that hangs off a set of units - applications,
 * maintenance requests, and (via deleteTenanciesCascade) every tenancy that
 * ever lived on the unit - ending with the units themselves.
 */
export async function deleteUnitsCascade(tx: any, unitIds: string[]) {
  if (unitIds.length === 0) return;

  const tenancies = await tx.tenancy.findMany({ where: { unit_id: { in: unitIds } }, select: { id: true } });
  const tenancyIds = tenancies.map((t: { id: string }) => t.id);

  await deleteTenanciesCascade(tx, tenancyIds);
  await tx.maintenanceRequest.deleteMany({ where: { unit_id: { in: unitIds } } });
  await tx.application.deleteMany({ where: { unit_id: { in: unitIds } } });
  await tx.unit.deleteMany({ where: { id: { in: unitIds } } });
}
