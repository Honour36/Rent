import * as XLSX from 'xlsx';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { MIGRATION_FIELDS, MigrationField, matchHeaderToField, matchHeaderExact, matchHeaderFuzzy, normalizeHeader } from '../config/migration-fields';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export interface ParsedPreview {
  headers: string[];
  mapping: Record<number, MigrationField | null>;
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
  return str.split('/')[0].trim() || undefined;
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

    return {
      headers: headerRow,
      mapping,
      rows: dataRows,
      totalRows: dataRows.length,
      sheetName: best.sheetName,
      warnings,
    };
  }

  // ─── Find-or-create helpers - same matching rules as the duplicate-prevention
  // in owners/properties/tenants.service.ts, but reusing a match instead of
  // rejecting it, since re-running an import (or importing an overlapping
  // sheet from a different year) should link up, not duplicate. ────────────

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
    suburb: string | undefined,
    city: string | undefined,
    type: 'residential' | 'commercial'
  ): Promise<{ id: string; unitId: string; created: boolean }> {
    const existing = await tx.property.findFirst({
      where: { account_id: accountId, name: { equals: address, mode: 'insensitive' }, address: { equals: address, mode: 'insensitive' } },
      include: { units: { orderBy: { created_at: 'asc' }, take: 1 } },
    });
    if (existing) {
      let unit = existing.units[0];
      if (!unit) {
        // Matched a property that (unusually) has no unit yet - give it one
        // rather than leaving the row with nowhere to attach rent/tenancy.
        unit = await tx.unit.create({
          data: { account_id: accountId, property_id: existing.id, unit_number: 'Main Unit', currency: 'USD', status: 'vacant' },
        });
      }
      return { id: existing.id, unitId: unit.id, created: false };
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

  async commitImport(rows: unknown[][], mapping: Record<number, MigrationField | null>, user: TokenPayload): Promise<CommitSummary> {
    const summary: CommitSummary = {
      ownersCreated: 0, ownersMatched: 0,
      propertiesCreated: 0, propertiesMatched: 0,
      tenantsCreated: 0, tenantsMatched: 0,
      tenanciesCreated: 0, rowsSkipped: 0,
      results: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const row = rows[i];
      const warnings: string[] = [];

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

      try {
        // eslint-disable-next-line no-await-in-loop
        await prisma.$transaction(async (tx) => {
          const owner = await this.findOrCreateOwner(
            tx, user.accountId, ownerName, parsePhone(cellRaw(row, mapping, 'owner_phone')), cellText(row, mapping, 'owner_email') || undefined
          );
          owner.created ? summary.ownersCreated++ : summary.ownersMatched++;

          const property = await this.findOrCreateProperty(
            tx, user.accountId, owner.id, address,
            cellText(row, mapping, 'property_suburb') || undefined,
            cellText(row, mapping, 'property_city') || undefined,
            parsePropertyType(cellRaw(row, mapping, 'property_type'))
          );
          property.created ? summary.propertiesCreated++ : summary.propertiesMatched++;

          const rentAmount = parseMoney(cellRaw(row, mapping, 'rent_amount'));
          const currency = parseCurrency(cellRaw(row, mapping, 'currency'));
          if (rentAmount) {
            await tx.unit.update({ where: { id: property.unitId }, data: { rent_amount: rentAmount, currency } });
          }

          const tenantName = cellText(row, mapping, 'tenant_name');
          let tenancyCreated = false;
          if (tenantName) {
            const tenant = await this.findOrCreateTenant(
              tx, user.accountId, tenantName, parsePhone(cellRaw(row, mapping, 'tenant_phone')), cellText(row, mapping, 'tenant_email') || undefined
            );
            tenant.created ? summary.tenantsCreated++ : summary.tenantsMatched++;

            const activeTenancy = await tx.tenancy.findFirst({ where: { unit_id: property.unitId, status: 'active' }, select: { id: true } });
            if (!activeTenancy && rentAmount) {
              let leaseStart = parseDate(cellRaw(row, mapping, 'lease_start'));
              if (!leaseStart) {
                leaseStart = new Date();
                warnings.push('No lease start date in the spreadsheet - defaulted to today. Update it from the tenant\'s lease.');
              }
              const leaseEnd = parseDate(cellRaw(row, mapping, 'lease_end'));
              const depositAmount = parseMoney(cellRaw(row, mapping, 'deposit_amount'));

              await tx.tenancy.create({
                data: {
                  account_id: user.accountId, unit_id: property.unitId, tenant_id: tenant.id,
                  lease_start: leaseStart, lease_end: leaseEnd, rent_amount: rentAmount, currency,
                  deposit_amount: depositAmount, status: 'active',
                },
              });
              await tx.unit.update({ where: { id: property.unitId }, data: { status: 'occupied' } });
              tenancyCreated = true;
              summary.tenanciesCreated++;
            } else if (!activeTenancy && !rentAmount) {
              warnings.push(`Tenant "${tenantName}" found but no rent amount was given, so no tenancy was created - add one from the property page.`);
            } else if (activeTenancy) {
              warnings.push('This unit already has an active tenant - the tenant on this row was matched/created but not linked to a new tenancy.');
            }
          }

          summary.results.push({
            row: rowNum,
            status: property.created || owner.created ? 'created' : 'matched',
            detail: `${address} - ${owner.created ? 'owner created' : 'owner matched'}${tenancyCreated ? ', tenancy created' : ''}`,
            warnings,
          });
        });
      } catch (err: any) {
        summary.rowsSkipped++;
        summary.results.push({ row: rowNum, status: 'skipped', detail: err.message || 'Unexpected error processing this row', warnings: [] });
      }
    }

    return summary;
  }
}

export const migrationsService = new MigrationsService();
