import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { deletePropertiesCascade } from './cascade-delete.helper';

export const CreateOwnerSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required.' }).min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  isDiaspora: z.boolean().default(false),
});

export const UpdateOwnerSchema = CreateOwnerSchema.partial();

export type CreateOwnerDto = z.infer<typeof CreateOwnerSchema>;
export type UpdateOwnerDto = z.infer<typeof UpdateOwnerSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class OwnersService {
  /**
   * Same email or phone within an account means the same owner - block it
   * before it becomes two rows. Falls back to an exact name match when
   * neither contact field was given.
   */
  private async assertNoDuplicate(data: { fullName: string; email?: string; phone?: string }, user: TokenPayload, excludeId?: string) {
    const or: any[] = [];
    if (data.email?.trim()) or.push({ email: { equals: data.email.trim(), mode: 'insensitive' } });
    if (data.phone?.trim()) or.push({ phone: data.phone.trim() });
    if (or.length === 0) or.push({ full_name: { equals: data.fullName.trim(), mode: 'insensitive' } });

    const existing = await prisma.owner.findFirst({
      where: { account_id: user.accountId, ...(excludeId ? { id: { not: excludeId } } : {}), OR: or },
      select: { full_name: true, email: true, phone: true },
    });
    if (!existing) return;

    const field =
      data.email?.trim() && existing.email?.toLowerCase() === data.email.trim().toLowerCase() ? 'email address' :
      data.phone?.trim() && existing.phone === data.phone.trim() ? 'phone number' :
      'name';
    throw new AppError(`An owner with this ${field} already exists (${existing.full_name}).`, 409);
  }

  async list(user: TokenPayload) {
    const owners = await prisma.owner.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { properties: true } },
        properties: {
          select: {
            id: true,
            name: true,
            address: true,
            units: { select: { id: true, status: true } },
          },
        },
      },
    });
    return owners;
  }

  async getById(id: string, user: TokenPayload) {
    const owner = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        properties: true,
        statements: true,
      },
    });

    if (!owner) throw new AppError('Owner not found', 404);
    return owner;
  }

  async create(data: CreateOwnerDto, user: TokenPayload) {
    await this.assertNoDuplicate(data, user);

    const owner = await prisma.owner.create({
      data: {
        account_id: user.accountId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        is_diaspora: data.isDiaspora,
      },
    });
    return owner;
  }

  async update(id: string, data: UpdateOwnerDto, user: TokenPayload) {
    // Verify ownership before updating
    const existing = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
    });
    if (!existing) throw new AppError('Owner not found', 404);

    await this.assertNoDuplicate({
      fullName: data.fullName ?? existing.full_name,
      email: data.email ?? existing.email ?? undefined,
      phone: data.phone ?? existing.phone ?? undefined,
    }, user, id);

    const owner = await prisma.owner.update({
      where: { id },
      data: {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        is_diaspora: data.isDiaspora,
      },
    });
    return owner;
  }

  /**
   * Renders the Property Management Agreement as a downloadable PDF, branded
   * with the account's own logo/name/address/contact details rather than a
   * fixed template - each agency's agreement carries their own identity.
   * Generated on demand (not persisted to storage) so it always reflects the
   * account's current branding and management fee, same as the application
   * PDF in applications.service.ts.
   */
  async generateManagementAgreementPdf(id: string, user: TokenPayload): Promise<Buffer> {
    const owner = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
      include: { properties: { select: { name: true, address: true, suburb: true, city: true } } },
    });
    if (!owner) throw new AppError('Owner not found', 404);

    const account = await prisma.account.findUnique({
      where: { id: user.accountId },
      select: {
        name: true, logo_url: true, address: true, suburb: true, city: true,
        phone: true, email: true, management_fee_pct: true,
      },
    });

    const agentName = account?.name ?? 'the Agent';
    const feePct = account?.management_fee_pct != null ? Number(account.management_fee_pct) : 15;
    const addressParts = [account?.address, account?.suburb, account?.city].filter(Boolean);

    // Best-effort logo fetch - a missing/unreachable logo shouldn't block the
    // agreement from being generated (same reasoning as the applicant ID
    // image embed in applications.service.ts).
    let logoBuffer: Buffer | null = null;
    if (account?.logo_url) {
      try {
        const res = await fetch(account.logo_url);
        if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
      } catch {
        logoBuffer = null;
      }
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width - 100;
      const DARK = '#111827';
      const GRAY = '#6b7280';

      // ── LETTERHEAD ──────────────────────────────────────────────────────
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, doc.page.width / 2 - 30, doc.y, { fit: [60, 60], align: 'center' });
          doc.moveDown(3.5);
        } catch {
          // Not a renderable image format - fall through without it.
        }
      }
      doc.fillColor(DARK).fontSize(16).font('Helvetica-Bold').text(agentName.toUpperCase(), { align: 'center' });
      doc.font('Helvetica').fillColor(GRAY).fontSize(9);
      if (addressParts.length) doc.text(addressParts.join(', '), { align: 'center' });
      const contactLine = [account?.phone, account?.email].filter(Boolean).join('  |  ');
      if (contactLine) doc.text(contactLine, { align: 'center' });
      doc.moveDown(1);
      doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold')
        .text('PROPERTY MANAGEMENT AGREEMENT', { align: 'center', underline: true });
      doc.moveDown(1.2);

      // ── RE: PROPERTIES ──────────────────────────────────────────────────
      const propertyLine = owner.properties.length
        ? owner.properties.map(p => [p.name, p.address, p.suburb, p.city].filter(Boolean).join(', ')).join('; ')
        : '_______________________________________________';
      doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK).text('Re: ', { continued: true }).font('Helvetica').text(propertyLine);
      doc.moveDown(1);

      // ── CLAUSES ─────────────────────────────────────────────────────────
      const clause = (text: string) => {
        doc.font('Helvetica').fontSize(10).fillColor(DARK).text(text, { align: 'justify', lineGap: 2 });
        doc.moveDown(0.6);
      };

      clause(`1. I/we do hereby appoint ${agentName} as the PROPERTY MANAGING AGENT in respect of the above mentioned property and I/we authorise the following:`);
      clause(`2. I/we agree to give ${agentName} a sole mandate to find a suitable tenant.`);
      clause('3. Length of tenancy and date available to be agreed between the parties and recorded on the lease agreement.');
      clause(`4. Proposed rental and minimum acceptable rental to be agreed between the parties and recorded on the lease agreement.`);
      clause('5. I/we agree to clear electricity, water and telephone bills which the previous tenant may have left unpaid before the new recommended tenant moves in.');
      clause(`6. I/we agree to pay ${agentName} management fees of ${feePct}% of the gross rental every month as per recommended Institute Tariff.`);
      clause(`7. Should the tenant(s) give notice to vacate the property, I/we authorise ${agentName} to relet or advise me, as I direct.`);
      clause(`8. I/we do hereby confirm that in the event of either party wishing to terminate this contract, notice will be given in writing (subject to any existing lease agreement).`);
      clause(`9. Should I decide to withdraw my instructions after signing this form, I/we agree to pay ${agentName} any proven expenses for advertising, transport and inspection fees.`);
      clause(`10. I/we do hereby authorise ${agentName} to spend a reasonable amount on any necessary and essential repairs without my prior consent. In the event of being unobtainable, ${agentName} is authorised to contact an alternative representative for consent on my behalf.`);
      clause(`11. I/we agree that ${agentName} must request that the tenant pay an equivalent of one month's rental to safeguard against loss of rental, outstanding water, electricity, telephone charges and related accounts.`);
      clause('12. Should the parties agree that a telephone line remain on the property, the relevant temporary transfer forms will be completed to ensure the account is changed into the name of the tenant.');

      doc.moveDown(1.5);
      doc.fontSize(10).fillColor(DARK);
      doc.text(`OWNER(S): ${owner.full_name}`);
      doc.moveDown(1.5);
      doc.text('SIGNATURE: _____________________________', { continued: true }).text('   DATE: _______________', { align: 'right' });
      doc.moveDown(2);
      doc.text(`FOR ${agentName.toUpperCase()}: _____________________________`);

      doc.moveDown(2);
      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
        .text(`Generated ${new Date().toLocaleString('en-GB')}`, { align: 'center', width: W });

      doc.end();
    });
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.owner.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Owner not found', 404);

    const properties = await prisma.property.findMany({ where: { owner_id: id }, select: { id: true } });
    const propertyIds = properties.map(p => p.id);

    await prisma.$transaction(async (tx) => {
      await deletePropertiesCascade(tx, propertyIds);
      // rent_collection_requests tied to this owner's own payments are
      // already gone via deletePropertiesCascade, but defensively clean up
      // any that somehow weren't (not expected to hit anything left).
      await tx.rentCollectionRequest.deleteMany({ where: { owner_id: id } });
      await tx.trustTransaction.deleteMany({ where: { owner_id: id } });
      await tx.communication.deleteMany({ where: { owner_id: id } });
      await tx.ownerStatement.deleteMany({ where: { owner_id: id } });
      await tx.owner.delete({ where: { id } });
    });

    return { deleted: true };
  }
}

export const ownersService = new OwnersService();