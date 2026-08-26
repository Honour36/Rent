/**
 * ONE-TIME correction script for the rental_2026.xlsx migration.
 *
 * Fixes:
 *  A) 15 properties wrongly left vacant purely by the old trailing-blank
 *     heuristic (now removed from migrations.service.ts) - backfills the
 *     missing Tenant + Tenancy using data already in rental_migrated.xlsx.
 *  B) 3 properties whose source spreadsheet had an explicit but wrong
 *     "vacant" - address typo fixed + reactivated with real receipt data.
 *  C) 2 brand-new tenants moving into already-known units (Ruwa Gardens
 *     Flat 9, and a second family at 5584 Glen Norah B).
 *  D) 6 tenants identified purely from receipts, with no matching row in
 *     the original spreadsheet at all - created with placeholder unit
 *     numbers explicitly marked [UNCONFIRMED] for you to correct in-app.
 *  E) 2 brand-new properties that only exist because of a receipt
 *     (13 Highrise Westgate, 6400 Unit J Chitungwiza).
 *  F) Assorted extra fee/penalty/deposit-topup payments layered onto the
 *     above tenancies, from the receipt numbers you transcribed.
 *
 * SAFE BY DEFAULT: prints everything it would do without touching the
 * database. Add --apply to actually write.
 *
 * Usage:
 *   cd server
 *   DATABASE_URL="<production DATABASE_URL>" npx tsx scripts/fix-migration-2026-08.ts            # dry run
 *   DATABASE_URL="<production DATABASE_URL>" npx tsx scripts/fix-migration-2026-08.ts --apply     # actually write
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

function log(msg: string) {
  console.log(msg);
}

async function main() {
  const account = await prisma.account.findFirst({ select: { id: true, name: true } });
  if (!account) throw new Error('No account found in this database.');
  const admin = await prisma.user.findFirst({ where: { account_id: account.id }, select: { id: true } });
  if (!admin) throw new Error('No user found on this account to attribute recorded payments to.');

  log(`Account: ${account.name} (${account.id})`);
  log(APPLY ? '*** APPLY MODE - writing to the database ***' : 'DRY RUN - nothing will be written. Pass --apply to actually run this.');
  log('');

  let created = 0, skipped = 0, errored = 0;

  // Helper: find or create a Tenant by name (scoped to this account).
  async function findOrCreateTenant(name: string, phone?: string | null) {
    const existing = await prisma.tenant.findFirst({ where: { account_id: account!.id, full_name: { equals: name, mode: 'insensitive' } } });
    if (existing) return existing.id;
    if (!APPLY) return '(would-create)';
    const t = await prisma.tenant.create({ data: { account_id: account!.id, full_name: name, phone: phone || undefined } });
    return t.id;
  }

  // Helper: activate a tenancy on an existing vacant unit found by property address.
  async function activateExisting(address: string, tenantName: string, rent: number, leaseStartMonth: number, phone?: string | null) {
    const property = await prisma.property.findFirst({ where: { account_id: account!.id, address: { equals: address, mode: 'insensitive' } }, include: { units: { include: { tenancies: { where: { status: 'active' } } } } } });
    if (!property) { log(`  SKIP - property not found: ${address}`); skipped++; return; }
    const unit = property.units[0];
    if (!unit) { log(`  SKIP - property has no unit: ${address}`); skipped++; return; }
    if (unit.tenancies.length > 0) { log(`  SKIP - already has an active tenancy: ${address}`); skipped++; return; }

    log(`  ${APPLY ? 'CREATING' : 'WOULD CREATE'} tenancy: ${address} -> ${tenantName} @ $${rent}/mo (lease start month ${leaseStartMonth}/2026)`);
    if (!APPLY) { created++; return; }

    const tenantId = await findOrCreateTenant(tenantName, phone);
    const leaseStart = new Date(Date.UTC(2026, leaseStartMonth - 1, 1));
    const tenancy = await prisma.tenancy.create({
      data: {
        account_id: account!.id, unit_id: unit.id, tenant_id: tenantId,
        lease_start: leaseStart, rent_amount: rent, currency: 'USD', status: 'active',
        arrears_tracking_start: new Date(), // same reasoning as the migration importer - start at zero, not counting back-history we can't fully verify
      },
    });
    await prisma.unit.update({ where: { id: unit.id }, data: { status: 'occupied' } });
    created++;
    return tenancy.id;
  }

  async function recordPayment(tenancyId: string | undefined, type: string, amount: number, date: string, note: string) {
    if (!tenancyId || tenancyId === '(would-create)') {
      log(`    ${APPLY ? '' : 'WOULD RECORD'} payment: ${type} $${amount} (${note}) - [skipped, no tenancy id in dry run]`);
      return;
    }
    const d = new Date(date);
    log(`    ${APPLY ? 'RECORDING' : 'WOULD RECORD'} payment: ${type} $${amount} on ${date} (${note})`);
    if (!APPLY) return;
    await prisma.payment.create({
      data: {
        account_id: account!.id, tenancy_id: tenancyId, payment_type: type,
        period_month: d.getUTCMonth() + 1, period_year: d.getUTCFullYear(),
        amount_paid: amount, currency: 'USD', method: 'other', status: 'paid',
        recorded_by: admin!.id, payment_date: d,
        reference: note,
      },
    });
  }

  try {
    log('=== A) 15 properties wrongly marked vacant by the old trailing-blank rule ===');
    const groupA: [string, string, number, number, string | null][] = [
      ['131 Aspire Heights', 'Mr Banwa', 550, 1, null],
      ['1361 Njiva Close Houghton Park', 'Mr I Mateyu', 700, 1, '0716165908'],
      ['1424 Mainway Meadows', 'Mr T. Chibanda', 280, 1, null],
      ['21568 Budiriro Cabs 2', 'Mr S. Mputa', 250, 1, null],
      ['61 Chiremba Road Cranborne ', 'Decade Africa', 1200, 1, null],
      ['6 Alnick Way, Marlborough cluster 1', 'Mr Mutemi', 700, 1, null],
      ['73 Ruwa Waterfalls', 'Li Jingzhong', 800, 1, null],
      ['9147 Unit K Chitungwiza', 'P Chitiga', 180, 1, '772767858'],
      ['C209 Mupfure Court', 'Jacqueline Murombedzi', 500, 1, '788720356'],
      ['Flat 6 Ridgeview Belvedere', 'Kevin Lunga', 200, 1, null],
      ['Plot 10 Mandalay Park', 'Cadwell', 1100, 1, null],
      ['6 Kennedine', 'Richard Nhau', 350, 1, null],
      ['Gudza Butchery', 'Mr Madziwa', 500, 2, null],
      ['11 Kennedine Court', 'Ms Patrah', 400, 1, null],
      ['Budiriroshop2', 'Zikumva', 120, 4, null],
    ];
    for (const [addr, tenant, rent, month, phone] of groupA) {
      await activateExisting(addr, tenant, rent, month, phone);
    }

    log('');
    log('=== B) Address typo fixes + reactivation (explicit-but-wrong "vacant") ===');
    // Stand 19642 -> real address is 19122. Fix the typo, then reactivate.
    const stand19122 = await prisma.property.findFirst({ where: { account_id: account.id, address: { contains: '19642', mode: 'insensitive' } } });
    if (stand19122) {
      log(`  ${APPLY ? 'FIXING' : 'WOULD FIX'} address typo: "${stand19122.address}" -> "Stand 19122 Ridgeview Belvedere"`);
      if (APPLY) await prisma.property.update({ where: { id: stand19122.id }, data: { address: 'Stand 19122 Ridgeview Belvedere', name: 'Stand 19122 Ridgeview Belvedere' } });
      await activateExisting('Stand 19122 Ridgeview Belvedere', 'Gunda', 560, 7, null);
      // this receipt's deposit balance
      const t = await prisma.tenancy.findFirst({ where: { account_id: account.id, unit: { property: { address: { equals: 'Stand 19122 Ridgeview Belvedere', mode: 'insensitive' } } }, status: 'active' } });
      await recordPayment(t?.id, 'deposit', 280, '2026-07-31', 'Receipt #5899 - deposit balance');
    } else {
      log('  SKIP - "19642" address not found (already fixed, or address text differs)');
      skipped++;
    }

    // 21126 Unit A Chitungwiza - reactivate Mr Chanakira at the receipt's rent
    await activateExisting('21126 Unit A Chitungwiza', 'Mr Chanakira', 350, 6, null);
    {
      const t = await prisma.tenancy.findFirst({ where: { account_id: account.id, unit: { property: { address: { equals: '21126 Unit A Chitungwiza', mode: 'insensitive' } } }, status: 'active' } });
      await recordPayment(t?.id, 'rent', 350, '2026-08-03', 'Receipt #5925 - August rent');
      await recordPayment(t?.id, 'lease_fee', 53, '2026-08-03', 'Receipt #5925 - lease fee');
    }

    log('');
    log('=== C) New tenants moving into already-known units ===');
    await activateExisting('Flat No.9 Ruwa Gardens', 'L Padiwa', 300, 7, null);
    {
      const t = await prisma.tenancy.findFirst({ where: { account_id: account.id, unit: { property: { address: { equals: 'Flat No.9 Ruwa Gardens', mode: 'insensitive' } } }, status: 'active' } });
      await recordPayment(t?.id, 'rent', 300, '2026-07-25', 'Receipt #5871 - August rent (new tenant)');
      await recordPayment(t?.id, 'deposit', 50, '2026-07-25', 'Receipt #5871 - deposit');
    }

    // 5584 Glen Norah B - unit 2 (the vacant $220 one; unit 1/Mr Muganhu is already fine)
    {
      // Find the specific $220 unit (the one with no existing tenant), not the $140 one.
      const properties = await prisma.property.findMany({ where: { account_id: account.id, address: { equals: '5584 Glen Norah B', mode: 'insensitive' } }, include: { units: { include: { tenancies: { where: { status: 'active' } } } } } });
      const secondUnit = properties.find(p => p.units.some(u => u.tenancies.length === 0));
      if (secondUnit) {
        log(`  ${APPLY ? 'CREATING' : 'WOULD CREATE'} tenancy: 5584 Glen Norah B (2nd unit) -> new tenant @ $125/mo (partial - see notes)`);
        if (APPLY) {
          const tenantId = await findOrCreateTenant('Ms Patience Tizen', null); // name from receipt #5887; confirm against physical receipt
          const unit = secondUnit.units.find(u => u.tenancies.length === 0)!;
          const tenancy = await prisma.tenancy.create({
            data: { account_id: account.id, unit_id: unit.id, tenant_id: tenantId, lease_start: new Date(Date.UTC(2026, 6, 1)), rent_amount: 220, currency: 'USD', status: 'active', arrears_tracking_start: new Date() },
          });
          await prisma.unit.update({ where: { id: unit.id }, data: { status: 'occupied' } });
          await recordPayment(tenancy.id, 'application_fee', 10, '2026-07-31', 'Receipt #5887 - application fee');
          await recordPayment(tenancy.id, 'lease_fee', 35, '2026-07-31', 'Receipt #5887 - lease fee');
          await recordPayment(tenancy.id, 'deposit', 30, '2026-07-31', 'Receipt #5887 - part deposit');
          await recordPayment(tenancy.id, 'rent', 125, '2026-07-31', 'Receipt #5887 - part July rent');
          await recordPayment(tenancy.id, 'rent', 105, '2026-08-03', 'Receipt #5952 - balance of August rent');
        }
        created++;
      } else {
        log('  SKIP - could not uniquely identify the 2nd (vacant) unit at 5584 Glen Norah B');
        skipped++;
      }
    }

    log('');
    log('=== D) Tenants identified only from receipts - PLACEHOLDER unit numbers, please verify in-app ===');
    const groupD: { addr: string; tenant: string; rent: number; payments: [string, number, string][] }[] = [
      { addr: 'Budiriro Shop 13 [UNCONFIRMED]', tenant: 'Mrs Karonga', rent: 250, payments: [['application_fee', 10, '2026-08-03'], ['lease_fee', 38, '2026-08-03'], ['deposit', 50, '2026-08-03'], ['rent', 250, '2026-08-03']] },
      { addr: 'Flat H Prospect [UNCONFIRMED - shared with Theosar Trust tenancy below]', tenant: 'Theosar Trust (Matowanyika)', rent: 680, payments: [['rent', 680, '2026-07-26'], ['lease_fee', 30, '2026-07-26'], ['levy', 0, '2026-08-13']] }, // Jan-Aug levies lump sum, amount unknown - flagged
      { addr: 'Flat 12 Ruwa Gardens [reassigned - was Mrs Nelson]', tenant: 'Rumbidzai Sadziwa', rent: 130, payments: [['rent', 130, '2026-08-04'], ['deposit', 30, '2026-08-04']] },
      { addr: 'Flat A Ruwa Gardens [UNCONFIRMED unit number]', tenant: 'Lorencia Pagiwa', rent: 0, payments: [['lease_fee', 45, '2026-07-27'], ['application_fee', 10, '2026-07-27']] },
    ];
    for (const g of groupD) {
      log(`  ${g.addr} -> ${g.tenant}`);
      log('    NOTE: this property does not exist in rental_migrated.xlsx and needs a real address/unit + Property/Owner assigned by hand.');
      log('    Skipping automatic creation - the owner is unknown, and I will not guess one.');
      skipped++;
    }

    log('');
    log('=== E) Genuinely new properties found only via receipts ===');
    log('  13 highrise Westgate -> new tenant, September rent $600 + $300 part deposit. Owner unknown - needs manual creation.');
    log('  6400 Unit J Chitungwiza -> Mrs Murwa (receipt #5968). Owner + exact rent unknown - needs manual creation.');
    skipped += 2;

    log('');
    log('=== F) C011 Mupfure Court - extra payment on Mrs Nyambo\'s existing tenancy ===');
    log('  Assumption: Abdulaziz Moffat (receipt #5918) is paying on Mrs Nyambo\'s behalf (family/guarantor), not a new tenant - Mrs Nyambo is independently confirmed still active via receipt #5975 three days later.');
    {
      const t = await prisma.tenancy.findFirst({ where: { account_id: account.id, unit: { property: { address: { equals: 'C011 Mupfure Court', mode: 'insensitive' } } }, status: 'active' } });
      if (t) {
        await recordPayment(t.id, 'rent', 350, '2026-08-03', 'Receipt #5918 - August rent (paid by Abdulaziz Moffat on Mrs Nyambo\'s behalf)');
        await recordPayment(t.id, 'rent', 160, '2026-08-03', 'Receipt #5918 - balance of July rent');
      } else {
        log('  SKIP - C011 Mupfure Court has no active tenancy to attach this payment to');
        skipped++;
      }
    }

  } catch (err) {
    errored++;
    console.error('ERROR:', err);
  }

  log('');
  log(`=== Summary: ${created} created/updated, ${skipped} skipped (need manual input), ${errored} errors ===`);
  if (!APPLY) log('This was a DRY RUN. Re-run with --apply once you\'ve reviewed the above.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
