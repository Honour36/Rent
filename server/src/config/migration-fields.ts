/**
 * Canonical fields the Migrations importer understands, and the header
 * names real-world spreadsheets use for each (built from an actual agency
 * export - "LESSOR"/"LESSEE" instead of "Owner"/"Tenant", "RENT $" with a
 * currency symbol baked into the header, etc.). Column matching is
 * alias-based, not a strict 1:1 header name requirement, because no two
 * agencies' spreadsheets use identical headers.
 *
 * Deliberately NOT included: monthly paid/unpaid grids (JAN..DEC) and
 * commission (COMM) - the former has no date or amount, just the word
 * "paid", so there's nothing reliable to reconstruct into a Payment
 * record; the latter isn't modelled per-owner in this schema (it's a
 * single account-wide rate in Settings), so an imported value would have
 * nowhere real to live.
 */
export type MigrationField =
  | 'property_address' | 'property_suburb' | 'property_city' | 'property_type'
  | 'owner_name' | 'owner_phone' | 'owner_email'
  | 'tenant_name' | 'tenant_phone' | 'tenant_email'
  | 'rent_amount' | 'currency'
  | 'lease_start' | 'lease_end' | 'deposit_amount';

export interface FieldDef {
  field: MigrationField;
  label: string;
  required: boolean;
  aliases: string[];
  hint: string;
}

export const MIGRATION_FIELDS: FieldDef[] = [
  { field: 'property_address', label: 'Property Address', required: true,
    aliases: ['PROPERTY ADDRESS', 'ADDRESS', 'PROPERTY', 'PROPERTY NAME'],
    hint: 'Used as both the property name and address.' },
  { field: 'owner_name', label: 'Owner (Lessor) Name', required: true,
    aliases: ['LESSOR', 'OWNER', 'LANDLORD', 'OWNER NAME'],
    hint: 'Every property needs an owner - rows without one are skipped.' },
  { field: 'property_suburb', label: 'Suburb', required: false, aliases: ['SUBURB'], hint: '' },
  { field: 'property_city', label: 'City', required: false, aliases: ['CITY', 'TOWN'], hint: '' },
  { field: 'property_type', label: 'Property Type', required: false,
    aliases: ['TYPE', 'PROPERTY TYPE'],
    hint: '"residential" or "commercial" - defaults to residential if blank or unrecognized.' },
  { field: 'owner_phone', label: 'Owner Phone', required: false,
    aliases: ['OWNER CONTACT', 'LESSOR CONTACT', 'OWNER PHONE', 'OWNER TEL'], hint: '' },
  { field: 'owner_email', label: 'Owner Email', required: false, aliases: ['OWNER EMAIL'], hint: '' },
  { field: 'tenant_name', label: 'Tenant (Lessee) Name', required: false,
    aliases: ['LESSEE', 'TENANT', 'TENANT NAME'],
    hint: 'Leave blank for a currently vacant property.' },
  { field: 'tenant_phone', label: 'Tenant Phone', required: false,
    aliases: ['CONTACT NO.', 'CONTACT NO', 'TENANT PHONE', 'PHONE', 'CELL', 'TEL', 'CELL NO'],
    hint: 'If two numbers are separated by "/", only the first is imported.' },
  { field: 'tenant_email', label: 'Tenant Email', required: false, aliases: ['TENANT EMAIL', 'EMAIL'], hint: '' },
  { field: 'rent_amount', label: 'Rent Amount', required: false,
    aliases: ['RENT $', 'RENT', 'MONTHLY RENT'], hint: 'Numbers only - currency symbols are stripped automatically.' },
  { field: 'currency', label: 'Currency', required: false, aliases: ['CURRENCY'], hint: 'Defaults to USD if blank.' },
  { field: 'lease_start', label: 'Lease Start Date', required: false,
    aliases: ['LEASE START', 'LEASE COMMENCEMENT', 'START DATE'],
    hint: "If missing (common - most spreadsheets only track expiry), today's date is used and flagged for you to correct." },
  { field: 'lease_end', label: 'Lease Expiry Date', required: false,
    aliases: ['LEASE EXPIRY DATE', 'LEASE EXPIRY', 'LEASE END'], hint: '' },
  { field: 'deposit_amount', label: 'Deposit Amount', required: false,
    aliases: ['DEPOSIT', 'DEPOSITS', 'SECURITY DEPOSIT'], hint: '' },
];

/** Normalizes a header for comparison: uppercase, collapse whitespace, strip punctuation. */
export function normalizeHeader(raw: string): string {
  return String(raw ?? '').toUpperCase().replace(/[^A-Z0-9$ ]/g, '').replace(/\s+/g, ' ').trim();
}

/** Exact alias match only (after normalization). */
export function matchHeaderExact(rawHeader: string): MigrationField | null {
  const normalized = normalizeHeader(rawHeader);
  if (!normalized) return null;
  for (const def of MIGRATION_FIELDS) {
    if (def.aliases.some(a => normalizeHeader(a) === normalized)) return def.field;
  }
  return null;
}

/** Partial/substring alias match - deliberately only used as a fallback,
 * and only after every column has had a chance at an exact match, so a
 * generic-ish header can't steal a field from a column that matched
 * exactly (e.g. "INSPECTION EXPIRY DATE" vs "LEASE EXPIRY DATE"). */
export function matchHeaderFuzzy(rawHeader: string): MigrationField | null {
  const normalized = normalizeHeader(rawHeader);
  if (!normalized) return null;
  for (const def of MIGRATION_FIELDS) {
    if (def.aliases.some(a => normalized.includes(normalizeHeader(a)))) return def.field;
  }
  return null;
}

/** Either match, for header-row detection scoring where order doesn't matter. */
export function matchHeaderToField(rawHeader: string): MigrationField | null {
  return matchHeaderExact(rawHeader) ?? matchHeaderFuzzy(rawHeader);
}

/** One example row for the downloadable template. */
export const TEMPLATE_HEADERS = [...MIGRATION_FIELDS.map(f => f.aliases[0]), 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const TEMPLATE_EXAMPLE_ROW = [
  '12 Example Street, Borrowdale', 'Mr J. Moyo', 'Harare', 'Harare', 'residential',
  '0772000000', 'jmoyo@example.com', 'Mrs T. Banda', '0771000000', 'tbanda@example.com',
  '650', 'USD', '2025-01-01', '2026-01-01', '650',
  'paid', 'paid', '400', '', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid',
];

// ─── Monthly payment columns (Jan-Dec) ───────────────────────────────────────
// Not part of MIGRATION_FIELDS above (those are one-per-property fields);
// each month is its own column mapped independently to a calendar month,
// carrying that month's payment status: "paid" (full rent), a number
// (partial or exact amount actually paid), or blank (rent wasn't paid -
// this is what feeds arrears; see commitImport in migrations.service.ts).

const MONTH_ALIASES: [number, string[]][] = [
  [1, ['JAN', 'JANUARY']], [2, ['FEB', 'FEBRUARY']], [3, ['MAR', 'MARCH']],
  [4, ['APR', 'APRIL']], [5, ['MAY']], [6, ['JUN', 'JUNE']],
  [7, ['JUL', 'JULY']], [8, ['AUG', 'AUGUST']], [9, ['SEP', 'SEPT', 'SEPTEMBER']],
  [10, ['OCT', 'OCTOBER']], [11, ['NOV', 'NOVEMBER']], [12, ['DEC', 'DECEMBER']],
];

/** 1-12 if this header is a month-name column, else null. */
export function matchMonthColumn(rawHeader: string): number | null {
  const normalized = normalizeHeader(rawHeader);
  if (!normalized) return null;
  for (const [num, aliases] of MONTH_ALIASES) {
    if (aliases.some(a => normalizeHeader(a) === normalized)) return num;
  }
  return null;
}
