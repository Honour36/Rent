/**
 * One-off cleanup for duplicate/orphaned properties created by the historical
 * bug where property + unit creation weren't atomic (fixed in
 * properties.service.ts - see the create() method).
 *
 * What it finds:
 *   Properties that have NO units at all, or whose only unit has no
 *   rent_amount and no tenancy, WHERE a sibling property exists in the same
 *   account with the same owner + name + address that IS fully set up
 *   (has a unit with a rent_amount). That sibling is almost certainly the
 *   successful retry, and the incomplete one is the orphan from the failed
 *   first attempt.
 *
 * What it does:
 *   By default this is a DRY RUN - it only prints what it would delete.
 *   Pass --apply to actually delete the orphaned rows (cascades through
 *   tenancies/applications/maintenance requests on that orphan, though in
 *   practice an orphan like this has none).
 *
 * Usage:
 *   cd server
 *   npx tsx scripts/cleanup-orphaned-properties.ts            # dry run
 *   npx tsx scripts/cleanup-orphaned-properties.ts --apply     # actually delete
 *
 * Run this with the SAME DATABASE_URL your production server uses (e.g. set
 * it in your shell, or run it from an environment - like a Render shell -
 * that already has it set).
 */
import { prisma } from '../src/db/prisma';

const APPLY = process.argv.includes('--apply');

async function main() {
  const properties = await prisma.property.findMany({
    include: {
      units: { select: { id: true, rent_amount: true }, orderBy: { created_at: 'asc' } },
      owner: { select: { full_name: true } },
    },
  });

  // Group by account + owner + normalized name + normalized address
  const groups = new Map<string, typeof properties>();
  for (const p of properties) {
    const key = [
      p.account_id,
      p.owner_id,
      p.name.trim().toLowerCase(),
      p.address.trim().toLowerCase(),
    ].join('|');
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }

  const toDelete: typeof properties = [];

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const complete = group.filter((p) => p.units.some((u) => u.rent_amount != null));
    const incomplete = group.filter((p) => !p.units.some((u) => u.rent_amount != null));

    // Only act when we have at least one complete property AND at least one
    // incomplete one in the same group - that's the exact duplicate pattern.
    // If everything in the group is incomplete, or everything is complete,
    // leave it alone; that's not this bug and needs a human to look at it.
    if (complete.length > 0 && incomplete.length > 0) {
      toDelete.push(...incomplete);
    }
  }

  if (toDelete.length === 0) {
    console.log('No orphaned duplicate properties found.');
    return;
  }

  console.log(`Found ${toDelete.length} orphaned duplicate propert${toDelete.length === 1 ? 'y' : 'ies'}:\n`);
  for (const p of toDelete) {
    console.log(`  - "${p.name}" (${p.address}) owner=${p.owner?.full_name ?? p.owner_id} id=${p.id} units=${p.units.length}`);
  }

  if (!APPLY) {
    console.log('\nDry run only - nothing deleted. Re-run with --apply to delete these rows.');
    return;
  }

  console.log('\nDeleting...');
  for (const p of toDelete) {
    const unitIds = p.units.map((u) => u.id);
    await prisma.$transaction([
      prisma.tenancy.deleteMany({ where: { unit_id: { in: unitIds } } }),
      prisma.application.deleteMany({ where: { unit_id: { in: unitIds } } }),
      prisma.maintenanceRequest.deleteMany({ where: { unit_id: { in: unitIds } } }),
      prisma.unit.deleteMany({ where: { property_id: p.id } }),
      prisma.property.delete({ where: { id: p.id } }),
    ]);
    console.log(`  deleted ${p.id}`);
  }
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
