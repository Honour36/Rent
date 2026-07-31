import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { fillLeaseTemplate } from '../assets/lease-template';

export interface LeasePdfData {
  accountName: string;
  ownerName: string;
  tenantName: string;
  tenantDob: Date | null;
  tenantIdNumber: string | null;
  tenantEmail: string | null;
  tenantPhone: string | null;
  propertyAddress: string;
  propertyType: string | null; // "residential" / "commercial" / etc.
  leaseStart: Date;
  leaseEnd: Date;
  rentAmount: number;
  currency: string;
  depositAmount: number | null;
  signingCity?: string; // defaults to "Harare" - matches the source template
}

const PAGE_WIDTH = 595.28; // A4, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_SIZE = 10.5;
const HEADING_SIZE = 13;
const LINE_HEIGHT = 14;
const PARAGRAPH_GAP = 8;

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Human-readable duration between two dates, e.g. "6 months", "1 year", "2 years 3 months". */
export function describeDuration(start: Date, end: Date): string {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months < 1) months = 1;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (remMonths > 0) parts.push(`${remMonths} month${remMonths === 1 ? '' : 's'}`);
  return parts.length ? parts.join(' ') : '1 month';
}

/** Greedy word-wrap: splits text into lines that fit within maxWidth at the given font/size. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // A single word wider than the line (shouldn't happen at this body
      // size, but don't loop forever if it does) - just place it alone.
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Renders the lease template into a paginated PDF. Plain text-flow
 * rendering rather than filling an AcroForm on a static template PDF -
 * see the "Lease Agreements" decision note in context/library-docs.md for
 * why: this document's blanks are inline mid-sentence throughout dense
 * legal paragraphs, so positionally overlaying form fields on a rendered
 * copy would be fragile against any future wording tweak. Substituting
 * tokens before layout keeps the whole document as one source of truth.
 */
export async function generateLeasePdf(data: LeasePdfData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const paragraphs = fillLeaseTemplate({
    LESSOR: data.ownerName,
    LESSEE: data.tenantName,
    DOB: data.tenantDob ? formatDate(data.tenantDob) : '....................',
    ID_NUMBER: data.tenantIdNumber || '....................',
    EMAIL: data.tenantEmail || '....................',
    PHONE: data.tenantPhone || '....................',
    ADDRESS: data.propertyAddress,
    LEASE_START: formatDate(data.leaseStart),
    LEASE_END: formatDate(data.leaseEnd),
    DURATION: describeDuration(data.leaseStart, data.leaseEnd),
    RENT: data.rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    DEPOSIT: data.depositAmount != null
      ? data.depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00',
    USE_TYPE: (data.propertyType || 'residential').toLowerCase(),
    ACCOUNT_NAME: data.accountName,
    SIGNING_CITY: data.signingCity || 'Harare',
  });

  let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) newPage();
  };

  for (const para of paragraphs) {
    const font = para.heading ? boldFont : regularFont;
    const size = para.heading ? HEADING_SIZE : BODY_SIZE;
    const lines = wrapText(para.text, font, size, CONTENT_WIDTH);

    ensureSpace(lines.length * LINE_HEIGHT);

    for (const line of lines) {
      ensureSpace(LINE_HEIGHT);
      const x = para.heading
        ? MARGIN + (CONTENT_WIDTH - font.widthOfTextAtSize(line, size)) / 2
        : MARGIN;
      page.drawText(line, { x, y, size, font, color: rgb(0, 0, 0) });
      y -= LINE_HEIGHT;
    }
    y -= PARAGRAPH_GAP;
  }

  // Footer page numbers - added last since we now know the final count.
  const pages = pdfDoc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 60,
      y: MARGIN / 2,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
