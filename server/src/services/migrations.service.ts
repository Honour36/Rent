import * as XLSX from 'xlsx';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import {
  MIGRATION_FIELDS, MigrationField, matchHeaderToField, matchHeaderExact, matchHeaderFuzzy,
  matchMonthColumn, normalizeHeader,
} from '../config/migration-fields';
import { notificationsService } from './notifications.service';
import { sendMigrationSummaryEmail } from '../emails/email-service';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export interface ParsedPreview {
  headers: string[];
  mapping: Record<number, MigrationField | null>;
  monthMapping: Record<number, number>; // column index -> month number 1-12
  inferredYear: number;
  rows: unknown[][];
  totalRows: number;
  sheetName: string;
  warnings: string[];
}

export interface RowResult {
  row: number; // 1-based, matching what the user would count in their spreadsheet
  status: 'created' | 'matched' | 'skipped';
  detail: string;
  warnings: string[];
}

export interface CommitSummary {
  ownersCreated: number;
  ownersMatched: number;
  propertiesCreated: number;
  propertiesMatched: number;
  tenantsCreated: number;
  tenantsMatched: number;
  tenanciesCreated: number;
  paymentsImported: number;
  rowsSkipped: number;
  results: RowResult[];
}

// ─── Value parsing - all lenient, all "warn don't crash" ────────────────────
//
// With `raw: true`, a cell SheetJS recognizes as a genuine Excel date comes
// through as an actual JS Date object - use it directly, no reparsing
// needed. A cell that's just typed text (including text someone typed to
// *look* like a date) comes through as a string, which we then parse as
// D/M/Y (the locale actually used when someone types a date by hand here),
// not the US M/D/Y format SheetJS would have produced had we asked it to
// reformat dates into strings itself.

function cellRaw(row: unknown[], mapping: Record<number, MigrationField | null>, field: MigrationField): unknown {
  const idx = Object.entries(mapping).find(([, f]) => f === field)?.[0];
  if (idx === undefined) return null;
  const raw = row[Number(idx)];
  return raw === undefined ? null : raw;
}

function cellText(row: unknown[], mapping: Record<number, MigrationField | null>, field: MigrationField): string {
  const raw = cellRaw(row, mapping, field);
  if (raw === null || raw === undefined) return '';
  if (raw instanceof Date) return raw.toISOString();
  return String(raw).trim();
}

function parseMoney(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? raw : null;
  const cleaned = String(raw).replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeZimPhone(str: string): string {
  // Any country code already present (+263, +27, +44, +91, whatever) means
  // leave it alone - only bare local-format numbers (no + at all) get the
  // Zimbabwe assumption applied, since that's the only locale this data
  // realistically comes from without an explicit code.
  if (str.startsWith('+')) return str;
  if (str.startsWith('0')) return `+263${str.slice(1)}`;
  return str; // unrecognized shape - leave as-is rather than guess wrong
}

function parsePhone(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;
  // Numeric phone "numbers" (Excel stored the column as Number, not Text)
  // silently lose a leading zero - "774097734" instead of "0774097734".
  // Zimbabwean mobile numbers are 9 digits without the leading 0, so add
  // it back for the common case rather than importing a broken number.
  let str = String(raw).trim();
  if (typeof raw === 'number' && /^7\d{8}$/.test(str)) str = `0${str}`;
  // "0716165908/0772572113" - two numbers separated by "/". Only the first
  // is imported; there's no second phone field on Tenant/Owner to put it.
  str = str.split('/')[0].trim();
  return str ? normalizeZimPhone(str) : undefined;
}

function parseDate(raw: unknown): Date | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

  const str = String(raw).trim();
  if (!str) return null;

  // ISO string (what a genuine Date survives a JSON round-trip as, on the
  // commit request coming back from the frontend after preview).
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const iso = new Date(str);
    if (!isNaN(iso.getTime())) return iso;
  }

  // D/M/YYYY or D/M/YY - the format used when someone types a date by hand
  // here, including invalid-but-common typos like "31/9/2022" (September
  // has 30 days) - roll those forward rather than reject a whole row over it.
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? Number(y) + 2000 : Number(y);
    const date = new Date(year, Number(m) - 1, Number(d));
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

function parsePropertyType(raw: unknown): 'residential' | 'commercial' {
  return normalizeHeader(String(raw ?? '')) === 'COMMERCIAL' ? 'commercial' : 'residential';
}

function parseCurrency(raw: unknown): 'USD' | 'ZiG' {
  return normalizeHeader(String(raw ?? '')) === 'ZIG' ? 'ZiG' : 'USD';
}

// ─── Monthly payment grid classification ────────────────────────────────────
//
// A blank cell means rent wasn't paid that month - it's not "no data", it's
// a confirmed arrear. "paid" means the full rent amount was paid. A number
// means that specific amount was paid against the full rent (a partial
// payment if it's less than the rent amount). "vacant"/"out" mean the unit
// had no tenant from that point - not a payment at all.

type MonthCellStatus =
  | { kind: 'paid'; amount: number }
  | { kind: 'partial'; amount: number }
  | { kind: 'unpaid' }
  | { kind: 'vacant' };

function classifyMonthCell(raw: unknown, rentAmount: number | null): MonthCellStatus {
  if (raw === null || raw === undefined) return { kind: 'unpaid' };
  const str = String(raw).trim();
  if (str === '' || str === '-' || str === '--') return { kind: 'unpaid' };

  const normalized = normalizeHeader(str);
  if (normalized === 'VACANT' || normalized === 'OUT') return { kind: 'vacant' };
  if (normalized === 'PAID' || normalized === 'P') {
    return rentAmount ? { kind: 'paid', amount: rentAmount } : { kind: 'unpaid' };
  }

  const amount = parseMoney(raw);
  if (amount !== null) {
    return rentAmount && amount >= rentAmount ? { kind: 'paid', amount } : { kind: 'partial', amount };
  }
  return { kind: 'unpaid' };
}

/** Best-guess year for a sheet's month columns, from the sheet name or any
 * title text above the header row (e.g. "list 2025", "RENTAL LIST 2024"). */
function inferYear(sheetName: string, titleRows: unknown[][]): number {
  const fromName = sheetName.match(/(20\d{2})/);
  if (fromName) return Number(fromName[1]);
  for (const row of titleRows) {
    for (const cell of row) {
      const match = String(cell ?? '').match(/(20\d{2})/);
      if (match) return Number(match[1]);
    }
  }
  return new Date().getFullYear();
}

// ─── Parsing an uploaded file into a previewable, editable shape ────────────

export class MigrationsService {
  parseFile(buffer: Buffer, _filename: string): ParsedPreview {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    } catch {
      throw new AppError('Could not read this file. Please upload a valid .xlsx or .csv file.', 400);
    }

    // A workbook can have several sheets (chart sheets, old years, etc, as
    // seen in real agency exports) - pick whichever sheet's first ~10 rows
    // score the most header-alias matches, since that's almost certainly
    // the actual data sheet.
    let best: { sheetName: string; rows: unknown[][]; headerRowIndex: number; score: number } | null = null;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet || !sheet['!ref']) continue; // chart sheets etc have no cell grid
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, blankrows: false });
      if (rows.length === 0) continue;

      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        const score = row.filter(c => matchHeaderToField(String(c ?? ''))).length;
        if (!best || score > best.score) {
          best = { sheetName, rows, headerRowIndex: i, score };
        }
      }
    }

    if (!best || best.score < 2) {
      throw new AppError(
        'Could not find a recognizable header row in this file. Make sure it has column headers like "PROPERTY ADDRESS" and "LESSOR" - see the template for reference.',
        422
      );
    }

    const headerRow = best.rows[best.headerRowIndex].map(h => String(h ?? '').trim());
    const dataRows = best.rows.slice(best.headerRowIndex + 1).filter(r => r.some(c => String(c ?? '').trim() !== ''));

    const mapping: Record<number, MigrationField | null> = {};
    const usedFields = new Set<MigrationField>();

    // Pass 1: exact matches, across every column, before any fuzzy match is
    // allowed to claim anything.
    headerRow.forEach((h, i) => {
      const match = matchHeaderExact(h);
      if (match && !usedFields.has(match)) {
        mapping[i] = match;
        usedFields.add(match);
      } else {
        mapping[i] = null;
      }
    });
    // Pass 2: fuzzy matches, only for columns still unmapped and fields still unclaimed.
    headerRow.forEach((h, i) => {
      if (mapping[i] !== null) return;
      const match = matchHeaderFuzzy(h);
      if (match && !usedFields.has(match)) {
        mapping[i] = match;
        usedFields.add(match);
      }
    });

    const warnings: string[] = [];
    const requiredFields = MIGRATION_FIELDS.filter(f => f.required).map(f => f.field);
    for (const f of requiredFields) {
      if (!Object.values(mapping).includes(f)) {
        warnings.push(`Couldn't find a column for "${MIGRATION_FIELDS.find(d => d.field === f)!.label}" (required) - map it manually below, or rows without it will be skipped.`);
      }
    }

    const monthMapping: Record<number, number> = {};
    headerRow.forEach((h, i) => {
      const m = matchMonthColumn(h);
      if (m) monthMapping[i] = m;
    });
    const inferredYear = inferYear(best.sheetName, best.rows.slice(0, best.headerRowIndex));
    if (Object.keys(monthMapping).length > 0) {
      warnings.push(`Detected monthly payment columns for ${inferredYear} - "paid" or an amount means rent was paid that month, blank means it wasn't (counted as an arrear).`);
    }

    return {
      headers: headerRow,
      mapping,
      monthMapping,
      inferredYear,
      rows: dataRows,
      totalRows: dataRows.length,
      sheetName: best.sheetName,
      warnings,
    };
  }

  // ─── Find-or-create helpers - same matching rules as the duplicate-prevention
  // in owners/properties/tenants.service.ts, but reusing a match instead of
  // rejecting it, since re-running an import (or importing an overlapping
  // sheet from a different year) should link up, not duplicate.
  //
  // Property matching in particular needs all three of name, owner, AND a
  // named tenant to agree before two rows are treated as the same
  // property/unit. Address alone isn't enough - a generic address like
  // "Stand 245" or "Flat 3" recurs across different owners' portfolios in
  // real spreadsheets, and two different owners' rows landing on the same
  // property would silently move one owner's rent and tenant history onto
  // the other's. A matching name + owner but a *different* (or absent)
  // tenant isn't a duplicate either - it's a second unit at the same
  // multi-unit property (e.g. one owner's 5 apartments in one complex, or
  // several shops under one landlord), so it gets its own unit under the
  // existing property rather than overwriting the first tenant's unit. ────

  private async findOrCreateOwner(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    accountId: string,
    name: string,
    phone?: string,
    email?: string
  ): Promise<{ id: string; created: boolean }> {
    const or: any[] = [];
    if (email) or.push({ email: { equals: email, mode: 'insensitive' } });
    if (phone) or.push({ phone });
    if (or.length === 0) or.push({ full_name: { equals: name, mode: 'insensitive' } });

    const existing = await tx.owner.findFirst({ where: { account_id: accountId, OR: or }, select: { id: true } });
    if (existing) return { id: existing.id, created: false };

    const created = await tx.owner.create({
      data: { account_id: accountId, full_name: name, phone, email },
    });
    return { id: created.id, created: true };
  }

  private async findOrCreateProperty(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    accountId: string,
    ownerId: string,
    address: string,
    tenantName: string,
    suburb: string | undefined,
    city: string | undefined,
    type: 'residential' | 'commercial'
  ): Promise<{ id: string; unitId: string; created: boolean }> {
    const existing = await tx.property.findFirst({
      where: {
        account_id: accountId,
        owner_id: ownerId,
        name: { equals: address, mode: 'insensitive' },
        address: { equals: address, mode: 'insensitive' },
      },
      include: {
        units: {
          include: { tenancies: { where: { status: 'active' }, include: { tenant: true }, take: 1 } },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (existing) {
      // Name + owner alone only narrows it to "same building" - it's a
      // duplicate row (created: false) only if this row names a tenant AND
      // that tenant matches an existing unit's active tenant. A row with
      // no tenant name never counts as a match, even against another
      // vacant unit - two blank apartments in the same building (e.g. two
      // empty shops for the same landlord) are still two different units,
      // not the same one re-imported twice.
      const normalizedTenant = tenantName ? normalizeHeader(tenantName) : '';
      const tenantMatch = normalizedTenant
        ? existing.units.find(u => u.tenancies[0] && normalizeHeader(u.tenancies[0].tenant.full_name) === normalizedTenant)
        : undefined;

      if (tenantMatch) {
        return { id: existing.id, unitId: tenantMatch.id, created: false };
      }

      // Tenant differs from every unit already on this property - this is
      // a different unit at the same multi-unit property, not a
      // duplicate. Reuse a vacant unit if one exists rather than creating
      // an unnecessary extra empty unit, but still report it as created -
      // never attach to a unit that already belongs to someone else.
      let unitId = existing.units.find(u => !u.tenancies[0])?.id;
      if (!unitId) {
        const newUnit = await tx.unit.create({
          data: {
            account_id: accountId, property_id: existing.id,
            unit_number: `Unit ${existing.units.length + 1}`, currency: 'USD', status: 'vacant',
          },
        });
        unitId = newUnit.id;
      }
      return { id: existing.id, unitId, created: true };
    }

    const property = await tx.property.create({
      data: { account_id: accountId, owner_id: ownerId, name: address, address, suburb, city, type },
    });
    const unit = await tx.unit.create({
      data: { account_id: accountId, property_id: property.id, unit_number: 'Main Unit', currency: 'USD', status: 'vacant' },
    });
    return { id: property.id, unitId: unit.id, created: true };
  }

  private async findOrCreateTenant(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    accountId: string,
    name: string,
    phone?: string,
    email?: string
  ): Promise<{ id: string; created: boolean }> {
    const or: any[] = [];
    if (email) or.push({ email: { equals: email, mode: 'insensitive' } });
    if (phone) or.push({ phone });
    if (or.length === 0) or.push({ full_name: { equals: name, mode: 'insensitive' } });

    const existing = await tx.tenant.findFirst({ where: { account_id: accountId, OR: or }, select: { id: true } });
    if (existing) return { id: existing.id, created: false };

    const created = await tx.tenant.create({ data: { account_id: accountId, full_name: name, phone, email } });
    return { id: created.id, created: true };
  }

  async commitImport(
    rows: unknown[][],
    mapping: Record<number, MigrationField | null>,
    monthMapping: Record<number, number>,
    year: number,
    user: TokenPayload
  ): Promise<CommitSummary> {
    const summary: CommitSummary = {
      ownersCreated: 0, ownersMatched: 0,
      propertiesCreated: 0, propertiesMatched: 0,
      tenantsCreated: 0, tenantsMatched: 0,
      tenanciesCreated: 0, paymentsImported: 0, rowsSkipped: 0,
      results: [],
    };

    const now = new Date();
    let rowsNeedingReview = 0;

    // Month columns in chronological order, resolving each to a concrete
    // (year, month) - handles a sheet whose first column is December
    // belonging to the *previous* year (seen in real agency exports that
    // start their financial-year sheet on Dec of the prior year).
    const monthColumns = Object.entries(monthMapping)
      .map(([colIndex, monthNum]) => ({ colIndex: Number(colIndex), monthNum }))
      .sort((a, b) => a.colIndex - b.colIndex);
    let resolvedYear = year;
    let prevMonthNum = 0;
    const monthPeriods = monthColumns.map(({ colIndex, monthNum }, i) => {
      if (i === 0 && monthNum === 12) resolvedYear = year - 1;
      else if (monthNum < prevMonthNum) resolvedYear = year;
      prevMonthNum = monthNum;
      return { colIndex, month: monthNum, year: resolvedYear };
    });

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const row = rows[i];
      const warnings: string[] = [];
      let needsReview = false;

      const address = cellText(row, mapping, 'property_address');
      const ownerName = cellText(row, mapping, 'owner_name');

      if (!address || !ownerName) {
        summary.rowsSkipped++;
        summary.results.push({
          row: rowNum, status: 'skipped',
          detail: !address ? 'No property address' : 'No owner (lessor) name',
          warnings: [],
        });
        continue;
      }

      // "VACANT" typed directly in the tenant name column, instead of a
      // month cell, also means no current tenant.
      const tenantNameRaw = cellText(row, mapping, 'tenant_name');
      const tenantNameIsVacancyMarker = ['VACANT', 'NONE', '-', 'N/A'].includes(normalizeHeader(tenantNameRaw));
      const tenantName = tenantNameIsVacancyMarker ? '' : tenantNameRaw;

      try {
        // eslint-disable-next-line no-await-in-loop
        await prisma.$transaction(async (tx) => {
          const owner = await this.findOrCreateOwner(
            tx, user.accountId, ownerName, parsePhone(cellRaw(row, mapping, 'owner_phone')), cellText(row, mapping, 'owner_email') || undefined
          );
          owner.created ? summary.ownersCreated++ : summary.ownersMatched++;
          if (!parsePhone(cellRaw(row, mapping, 'owner_phone')) && !cellText(row, mapping, 'owner_email')) needsReview = true;

          const property = await this.findOrCreateProperty(
            tx, user.accountId, owner.id, address, tenantName,
            cellText(row, mapping, 'property_suburb') || undefined,
            cellText(row, mapping, 'property_city') || undefined,
            parsePropertyType(cellRaw(row, mapping, 'property_type'))
          );
          property.created ? summary.propertiesCreated++ : summary.propertiesMatched++;

          const rentAmount = parseMoney(cellRaw(row, mapping, 'rent_amount'));
          const currency = parseCurrency(cellRaw(row, mapping, 'currency'));
          if (rentAmount) {
            await tx.unit.update({ where: { id: property.unitId }, data: { rent_amount: rentAmount, currency } });
          } else {
            needsReview = true;
          }

          // Classify every month cell up front so we can both (a) find the
          // most recent status to decide if this unit is currently
          // occupied or vacant, and (b) import a Payment for each month
          // that was actually paid (in part or in full).
          const monthStatuses = monthPeriods
            .filter(p => p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month <= now.getMonth() + 1))
            .map(p => ({ ...p, status: classifyMonthCell(row[p.colIndex], rentAmount) }));

          const lastNonBlank = [...monthStatuses].reverse().find(m => m.status.kind !== 'unpaid');
          const currentlyVacant = tenantNameIsVacancyMarker || (!tenantName && !lastNonBlank) || lastNonBlank?.status.kind === 'vacant';

          let tenancyCreated = 0;
          let paymentsForRow = 0;

          if (tenantName && !currentlyVacant) {
            const tenant = await this.findOrCreateTenant(
              tx, user.accountId, tenantName, parsePhone(cellRaw(row, mapping, 'tenant_phone')), cellText(row, mapping, 'tenant_email') || undefined
            );
            tenant.created ? summary.tenantsCreated++ : summary.tenantsMatched++;
            if (!parsePhone(cellRaw(row, mapping, 'tenant_phone'))) needsReview = true;

            const activeTenancy = await tx.tenancy.findFirst({ where: { unit_id: property.unitId, status: 'active' }, select: { id: true } });
            let tenancyId = activeTenancy?.id;

            if (!activeTenancy && rentAmount) {
              let leaseStart = parseDate(cellRaw(row, mapping, 'lease_start'));
              if (!leaseStart) {
                leaseStart = new Date();
                warnings.push("No lease start date in the spreadsheet - defaulted to today. Update it from the tenant's lease.");
                needsReview = true;
              }
              const leaseEnd = parseDate(cellRaw(row, mapping, 'lease_end'));
              const depositAmount = parseMoney(cellRaw(row, mapping, 'deposit_amount'));

              const newTenancy = await tx.tenancy.create({
                data: {
                  account_id: user.accountId, unit_id: property.unitId, tenant_id: tenant.id,
                  lease_start: leaseStart, lease_end: leaseEnd, rent_amount: rentAmount, currency,
                  deposit_amount: depositAmount, status: 'active',
                },
              });
              await tx.unit.update({ where: { id: property.unitId }, data: { status: 'occupied' } });
              tenancyId = newTenancy.id;
              tenancyCreated = 1;
              summary.tenanciesCreated++;

              // An imported tenant is, by definition, an existing tenancy -
              // assume the deposit was already collected at move-in rather
              // than surfacing it as outstanding. Falls back to one month's
              // rent (the common convention) when the sheet had no deposit
              // column value.
              await tx.deposit.create({
                data: {
                  account_id: user.accountId, tenancy_id: tenancyId,
                  required_amount: depositAmount ?? rentAmount, currency,
                  status: 'paid_in_full',
                },
              });
            } else if (!activeTenancy && !rentAmount) {
              warnings.push(`Tenant "${tenantName}" found but no rent amount was given, so no tenancy or payment history was imported - add a rent amount and try again, or add the tenancy manually.`);
            } else if (activeTenancy) {
              warnings.push('This unit already has an active tenant - the tenant on this row was matched/created but not linked to a new tenancy.');
            }

            // Import a Payment for every month actually paid (in full or in
            // part). Blank months intentionally get no row - that absence
            // is what your arrears report already sums as owed.
            if (tenancyId) {
              for (const m of monthStatuses) {
                if (m.status.kind !== 'paid' && m.status.kind !== 'partial') continue;
                // eslint-disable-next-line no-await-in-loop
                const existingPayment = await tx.payment.findFirst({
                  where: { tenancy_id: tenancyId, period_month: m.month, period_year: m.year },
                  select: { id: true },
                });
                if (existingPayment) continue; // already recorded (e.g. re-running an import)

                // eslint-disable-next-line no-await-in-loop
                await tx.payment.create({
                  data: {
                    account_id: user.accountId, tenancy_id: tenancyId,
                    period_month: m.month, period_year: m.year,
                    amount_paid: m.status.amount, currency,
                    method: 'other', status: m.status.kind === 'paid' ? 'paid' : 'partial',
                    payment_date: new Date(m.year, m.month - 1, 1),
                    recorded_by: user.sub,
                  },
                });
                paymentsForRow++;
              }
              summary.paymentsImported += paymentsForRow;
            }
          }

          if (currentlyVacant) {
            await tx.unit.update({ where: { id: property.unitId }, data: { status: 'vacant' } });
          }

          if (needsReview) rowsNeedingReview++;

          summary.results.push({
            row: rowNum,
            status: property.created || owner.created ? 'created' : 'matched',
            detail: `${address} - ${owner.created ? 'owner created' : 'owner matched'}` +
              (tenancyCreated ? ', tenancy created' : '') +
              (paymentsForRow > 0 ? `, ${paymentsForRow} payment${paymentsForRow === 1 ? '' : 's'} imported` : '') +
              (currentlyVacant ? ', marked vacant' : ''),
            warnings,
          });
        });
      } catch (err: any) {
        summary.rowsSkipped++;
        summary.results.push({ row: rowNum, status: 'skipped', detail: err.message || 'Unexpected error processing this row', warnings: [] });
      }
    }

    if (rowsNeedingReview > 0) {
      await notificationsService.create({
        accountId: user.accountId,
        type: 'import_needs_review',
        title: 'Imported properties need a few details',
        body: `${rowsNeedingReview} propert${rowsNeedingReview === 1 ? 'y needs' : 'ies need'} details added from your recent import - missing rent, contact info, or lease dates. Check the affected properties and tenants when you have a moment.`,
        entityType: 'migration',
      });
    }

    return summary;
  }

  /**
   * Called once by the frontend after every commit batch has finished (not
   * per-batch - a large import is several /commit calls, and this would
   * otherwise fire one email per batch). Never throws - a failed send here
   * must not turn a successful import into an error response.
   */
  async sendSummaryEmail(summary: CommitSummary, user: TokenPayload): Promise<{ sent: boolean }> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.sub },
        select: { email: true, full_name: true, account: { select: { name: true, email: true } } },
      });
      const to = dbUser?.email || dbUser?.account?.email;
      if (!to) return { sent: false };

      const skippedRows = summary.results
        .filter(r => r.status === 'skipped')
        .map(r => ({ row: r.row, detail: r.detail }));

      await sendMigrationSummaryEmail({
        to,
        name: dbUser?.full_name || 'there',
        accountName: dbUser?.account?.name || 'Rental',
        ownersCreated: summary.ownersCreated,
        ownersMatched: summary.ownersMatched,
        propertiesCreated: summary.propertiesCreated,
        propertiesMatched: summary.propertiesMatched,
        tenantsCreated: summary.tenantsCreated,
        tenantsMatched: summary.tenantsMatched,
        tenanciesCreated: summary.tenanciesCreated,
        paymentsImported: summary.paymentsImported,
        skippedRows,
      });
      return { sent: true };
    } catch (err) {
      console.error('[MigrationsService/sendSummaryEmail] Failed to send migration summary email:', err);
      return { sent: false };
    }
  }
}

export const migrationsService = new MigrationsService();
