import { z } from 'zod';
import { randomBytes } from 'crypto';
import PDFDocument from 'pdfkit';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { sendApplicationMoreInfoEmail } from '../emails/email-service';

// ─── Validation Schemas ──────────────────────────────────────────────────────

export const GenerateLinkSchema = z.object({
  unitId: z.string().uuid(),
});

export const ApplicationSubmitSchema = z.object({
  // Personal
  applicantName: z.string().min(2),
  applicantEmail: z.string().email().optional(),
  applicantPhone: z.string().optional(),
  idNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  // Employment
  employmentStatus: z.string().optional(),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().positive().optional(),
  // Rental History
  previousAddress: z.string().optional(),
  previousLandlord: z.string().optional(),
  previousLandlordPhone: z.string().optional(),
  previousRentAmount: z.number().positive().optional(),
  reasonForLeaving: z.string().optional(),
  // References
  reference1Name: z.string().optional(),
  reference1Phone: z.string().optional(),
  reference1Relation: z.string().optional(),
  reference2Name: z.string().optional(),
  reference2Phone: z.string().optional(),
  reference2Relation: z.string().optional(),
  // Additional
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  additionalNotes: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  // Commercial / business premises application only - stored in the same
  // flexible form_data JSON blob, no schema migration needed. Left optional
  // and unused for residential submissions.
  businessName: z.string().optional(),
  businessBoxNumber: z.string().optional(),
  physicalAddress: z.string().optional(),
  faxNumber: z.string().optional(),
  dateIncorporated: z.string().optional(),
  operatingFromLastPremisesFor: z.string().optional(),
  intendedUse: z.string().optional(),
  numberOfEmployees: z.number().int().positive().optional(),
  bankersName: z.string().optional(),
  bankersBranch: z.string().optional(),
  bankersAccountNumber: z.string().optional(),
  directors: z.array(z.object({
    name: z.string(),
    residentialAddress: z.string().optional(),
    idNumber: z.string().optional(),
    telephone: z.string().optional(),
  })).optional(),
});

export const UpdateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'more_info']),
  vettingNotes: z.string().optional(),
});

export type GenerateLinkDto = z.infer<typeof GenerateLinkSchema>;
export type ApplicationSubmitDto = z.infer<typeof ApplicationSubmitSchema>;
export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusSchema>;

// ─── Error Helper ─────────────────────────────────────────────────────────────

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class ApplicationsService {
  /**
   * Generate a unique shareable link token for a unit (agent only).
   * Returns the token and the full public URL.
   */
  async generateLink(data: GenerateLinkDto, user: TokenPayload) {
    // Verify unit belongs to this account
    const unit = await prisma.unit.findFirst({
      where: { id: data.unitId, account_id: user.accountId },
      include: { property: { select: { name: true, address: true } } },
    });
    if (!unit) throw new AppError('Unit not found', 404);
    if (unit.status !== 'vacant') {
      throw new AppError('Application links can only be generated for vacant units.', 400);
    }
    if (unit.rent_amount == null) {
      throw new AppError('Set a rent amount for this property before generating an application link.', 400);
    }

    const token = randomBytes(24).toString('hex');

    const application = await prisma.application.create({
      data: {
        account_id: user.accountId,
        unit_id: data.unitId,
        token,
        status: 'pending',
        applicant_name: '',
        form_data: {},
        submitted_at: new Date(),
      },
    });

    const baseUrl = process.env.FRONTEND_URL || 'https://rent-pi-murex.vercel.app';
    return {
      token,
      url: `${baseUrl}/application/${token}`,
      applicationId: application.id,
      unit: {
        id: unit.id,
        unit_number: unit.unit_number,
        rent_amount: unit.rent_amount,
        currency: unit.currency,
        property: unit.property,
      },
    };
  }

  /**
   * Public: get unit info by token (no auth required).
   * Used to pre-fill the form header with property/unit details.
   */
  async getPublicByToken(token: string) {
    const application = await prisma.application.findUnique({
      where: { token },
      include: {
        unit: {
          include: {
            property: {
              select: { name: true, address: true, suburb: true, city: true, type: true },
            },
          },
        },
      },
    });

    if (!application) throw new AppError('Application link not found or expired', 404);

    // Link is expired if the form has already been filled (applicant_name present + form_data non-empty)
    const alreadySubmitted =
      application.status !== 'pending' ||
      (application.applicant_name && application.applicant_name.trim().length > 0 &&
        Object.keys(application.form_data as object).length > 0);

    if (alreadySubmitted) {
      return {
        token: application.token,
        alreadySubmitted: true,
        expired: true,
        unit: null,
      };
    }

    return {
      token: application.token,
      alreadySubmitted: false,
      expired: false,
      unit: {
        unit_number: application.unit.unit_number,
        rent_amount: Number(application.unit.rent_amount),
        currency: application.unit.currency,
        bedrooms: application.unit.bedrooms,
        bathrooms: application.unit.bathrooms,
        property: application.unit.property,
        status: application.unit.status,
      },
    };
  }

  /**
   * Public: submit application form (no auth required).
   */
  async submitPublic(token: string, data: ApplicationSubmitDto) {
    const application = await prisma.application.findUnique({
      where: { token },
    });

    if (!application) throw new AppError('Application link not found', 404);

    // Prevent double submission
    const alreadyFilled =
      application.applicant_name && application.applicant_name.length > 0 &&
      Object.keys(application.form_data as object).length > 0;

    if (alreadyFilled) {
      throw new AppError('This application has already been submitted', 409);
    }

    const updated = await prisma.application.update({
      where: { token },
      data: {
        applicant_name: data.applicantName,
        applicant_email: data.applicantEmail,
        applicant_phone: data.applicantPhone,
        submitted_at: new Date(),
        form_data: data as any,
        id_document_url: data.idDocumentUrl ?? null,
      },
    });

    return { success: true, applicationId: updated.id };
  }

  /**
   * Public: upload the applicant's ID document/photo before final submit
   * (no auth - the applicant isn't a logged-in user). Scoped to a single,
   * not-yet-submitted application token so it can't be used as an open file
   * drop, and only ever writes into that application's own folder.
   */
  async uploadPublicIdDocument(token: string, buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const application = await prisma.application.findUnique({ where: { token } });
    if (!application) throw new AppError('Application link not found', 404);

    const alreadyFilled =
      application.applicant_name && application.applicant_name.length > 0 &&
      Object.keys(application.form_data as object).length > 0;
    if (alreadyFilled) throw new AppError('This application has already been submitted', 409);

    const { uploadFile, BUCKETS } = await import('../db/storage');
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `applications/${token}/id-${Date.now()}-${safeName}`;
    return uploadFile(BUCKETS.documents, path, buffer, mimeType);
  }

  /**
   * Signed URL for the vetting page to render the applicant's uploaded ID
   * photo/document inline (private bucket, so it can't be viewed without
   * going through this authenticated, account-scoped lookup).
   */
  async getIdDocumentSignedUrl(id: string, user: TokenPayload): Promise<string | null> {
    const application = await prisma.application.findFirst({
      where: { id, account_id: user.accountId },
      select: { id_document_url: true },
    });
    if (!application) throw new AppError('Application not found', 404);
    if (!application.id_document_url) return null;

    const { getSignedUrl, BUCKETS } = await import('../db/storage');
    return getSignedUrl(BUCKETS.documents, application.id_document_url, 3600);
  }

  /**
   * List all applications for the account (agent dashboard).
   */
  async list(user: TokenPayload, status?: string) {
    const where: Record<string, unknown> = { account_id: user.accountId };
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      orderBy: { submitted_at: 'desc' },
      include: {
        unit: {
          include: {
            property: { select: { name: true, address: true } },
          },
        },
        reviewer: { select: { full_name: true } },
      },
    });

    return applications;
  }

  /**
   * Get a single application with full detail for vetting.
   */
  async getById(id: string, user: TokenPayload) {
    const application = await prisma.application.findFirst({
      where: { id, account_id: user.accountId },
      include: {
        unit: {
          include: {
            property: { select: { name: true, address: true, suburb: true, city: true, type: true } },
          },
        },
        reviewer: { select: { id: true, full_name: true } },
      },
    });

    if (!application) throw new AppError('Application not found', 404);
    return application;
  }

  /**
   * Render the full application (personal, employment, rental history,
   * references, notes) as a downloadable PDF for vetting/record-keeping.
   */
  async generatePdf(id: string, user: TokenPayload): Promise<Buffer> {
    const application = await this.getById(id, user);
    const fd = (application.form_data ?? {}) as Record<string, any>;
    const isCommercial = application.unit.property.type === 'commercial';

    const account = await prisma.account.findUnique({
      where: { id: user.accountId },
      select: { name: true, logo_url: true, address: true, suburb: true, city: true, phone: true, email: true },
    });

    // Fetch the ID image buffer *before* entering PDFKit's synchronous
    // render callback below - `doc.image()` needs the bytes already in
    // hand, and the Promise executor PDFKit streams through isn't async.
    let idImageBuffer: Buffer | null = null;
    if (application.id_document_url) {
      try {
        const { downloadFile, BUCKETS } = await import('../db/storage');
        idImageBuffer = await downloadFile(BUCKETS.documents, application.id_document_url);
      } catch {
        // Stored file might be a PDF (not embeddable as an image) or
        // otherwise unavailable - don't fail the whole download over it.
        idImageBuffer = null;
      }
    }

    // Same best-effort fetch as the management agreement PDF - a broken
    // logo URL shouldn't block the applicant's form from downloading.
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
      const LINE = '#e5e7eb';

      const hr = () => {
        doc.moveTo(50, doc.y).lineTo(50 + W, doc.y).strokeColor(LINE).lineWidth(0.5).stroke();
        doc.moveDown(0.5);
      };

      const section = (title: string) => {
        doc.moveDown(0.4);
        doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text(title);
        doc.moveDown(0.2);
        hr();
      };

      const row = (label: string, value?: string | null) => {
        const y = doc.y;
        doc.fontSize(10).fillColor(GRAY).font('Helvetica').text(label, 50, y, { width: W * 0.35 });
        doc.fontSize(10).fillColor(DARK).font('Helvetica-Bold')
          .text(value && String(value).trim() ? String(value) : '-', 50 + W * 0.35, y, { width: W * 0.65 });
        doc.moveDown(0.5);
      };

      // ── LETTERHEAD - mirrors the agency's own paper application form:
      // logo, agency name/contact centered, then the form title. ──────────
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, doc.page.width / 2 - 25, doc.y, { fit: [50, 50], align: 'center' });
          doc.moveDown(3);
        } catch {
          // Not a renderable image format - fall through without it.
        }
      }
      doc.fillColor(DARK).fontSize(15).font('Helvetica-Bold').text((account?.name ?? 'Rental').toUpperCase(), { align: 'center' });
      doc.font('Helvetica').fillColor(GRAY).fontSize(9);
      const addressParts = [account?.address, account?.suburb, account?.city].filter(Boolean);
      if (addressParts.length) doc.text(addressParts.join(', '), { align: 'center' });
      const contactLine = [account?.phone, account?.email].filter(Boolean).join('  |  ');
      if (contactLine) doc.text(contactLine, { align: 'center' });
      doc.moveDown(0.8);
      doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold')
        .text(isCommercial ? 'COMMERCIAL / BUSINESS PREMISES APPLICATION FORM' : 'TENANCY APPLICATION FORM', { align: 'center', underline: true });
      doc.moveDown(0.6);
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
        .text('This property is leased in its present condition unless the owner agrees in writing to carry out the necessary repairs.', { align: 'center' });
      doc.moveDown(0.8);
      hr();

      row('Property', application.unit.property.name);
      row('Unit', application.unit.unit_number);
      row(isCommercial ? 'Rent' : 'Monthly Rent', `${Number(application.unit.rent_amount).toLocaleString()} ${application.unit.currency}`);
      row('Status', application.status.replace(/_/g, ' ').toUpperCase());
      row('Submitted', application.submitted_at
        ? new Date(application.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Not submitted');

      if (isCommercial) {
        section('Business Details');
        row('Applicant / Business Name', application.applicant_name);
        row('Business Address / Box No.', fd.businessBoxNumber);
        row('Physical Address', fd.physicalAddress);
        row('Telephone', application.applicant_phone);
        row('Fax No.', fd.faxNumber);
        row('Email', application.applicant_email);
        row('Date Incorporated', fd.dateIncorporated);
        row('Operating From Last Premises For', fd.operatingFromLastPremisesFor);
        row('Intended Use of Premises', fd.intendedUse);
        row('Number of Employees', fd.numberOfEmployees != null ? String(fd.numberOfEmployees) : undefined);

        if (Array.isArray(fd.directors) && fd.directors.length > 0) {
          section('Directors');
          const col = [50, 50 + W * 0.28, 50 + W * 0.58, 50 + W * 0.8];
          doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold')
            .text('Full Name', col[0], doc.y, { width: W * 0.28 })
            .text('Residential Address', col[1], doc.y - doc.currentLineHeight(), { width: W * 0.3 })
            .text('ID Number', col[2], doc.y - doc.currentLineHeight(), { width: W * 0.22 })
            .text('Telephone', col[3], doc.y - doc.currentLineHeight(), { width: W * 0.2 });
          doc.moveDown(0.4);
          hr();
          doc.font('Helvetica').fontSize(9).fillColor(DARK);
          for (const d of fd.directors as Array<Record<string, string>>) {
            const y = doc.y;
            doc.text(d.name || '-', col[0], y, { width: W * 0.28 });
            doc.text(d.residentialAddress || '-', col[1], y, { width: W * 0.3 });
            doc.text(d.idNumber || '-', col[2], y, { width: W * 0.22 });
            doc.text(d.telephone || '-', col[3], y, { width: W * 0.2 });
            doc.moveDown(0.5);
          }
        }

        section('Rental History');
        row('Present Estate Agent / Lessor', fd.previousLandlord);
        row('Reasons for Vacating', fd.reasonForLeaving);

        section('Credit References');
        row('Reference 1 - Name', fd.reference1Name);
        row('Reference 1 - Phone', fd.reference1Phone);
        row('Reference 2 - Name', fd.reference2Name);
        row('Reference 2 - Phone', fd.reference2Phone);

        section('Bankers');
        row('Bank', fd.bankersName);
        row('Branch', fd.bankersBranch);
        row('A/C No.', fd.bankersAccountNumber);
      } else {
        section('Personal Details');
        row('Full Name', application.applicant_name);
        row('National ID', fd.idNumber);
        row('Date of Birth', fd.dateOfBirth);
        row('Phone', application.applicant_phone);
        row('Email', application.applicant_email);
        row('Emergency Contact', fd.emergencyContactName);
        row('Emergency Phone', fd.emergencyContactPhone);

        section('Employment');
        row('Status', fd.employmentStatus?.replace(/_/g, ' '));
        row('Employer', fd.employer);
        row('Job Title', fd.jobTitle);
        row('Monthly Income', fd.monthlyIncome != null ? String(fd.monthlyIncome) : undefined);

        section('Rental History');
        row('Previous Address', fd.previousAddress);
        row('Previous Landlord', fd.previousLandlord);
        row('Previous Landlord Phone', fd.previousLandlordPhone);
        row('Previous Rent', fd.previousRentAmount != null ? String(fd.previousRentAmount) : undefined);
        row('Reason for Leaving', fd.reasonForLeaving);

        section('References');
        row('Reference 1 - Name', fd.reference1Name);
        row('Reference 1 - Phone', fd.reference1Phone);
        row('Reference 1 - Relation', fd.reference1Relation);
        row('Reference 2 - Name', fd.reference2Name);
        row('Reference 2 - Phone', fd.reference2Phone);
        row('Reference 2 - Relation', fd.reference2Relation);
      }

      if (idImageBuffer) {
        section(isCommercial ? 'Supporting Document' : 'ID Document');
        const maxWidth = W;
        const maxHeight = 260;
        try {
          doc.image(idImageBuffer, 50, doc.y, { fit: [maxWidth, maxHeight] });
          doc.y += maxHeight + 10;
        } catch {
          // Not a renderable image format - skip rather than break the PDF.
        }
      }

      // Deliberately no "Additional Notes" or "Vetting Notes" section here:
      // this PDF is also handed to the applicant as their own copy, and
      // vetting_notes in particular is internal agent commentary that
      // shouldn't be shared with them.

      doc.moveDown(1);
      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
        .text(`Generated ${new Date().toLocaleString('en-GB')}`, { align: 'center', width: W });

      doc.end();
    });
  }

  /**
   * Update application status and vetting notes (agent only).
   */
  async updateStatus(id: string, data: UpdateApplicationStatusDto, user: TokenPayload) {
    const existing = await prisma.application.findFirst({
      where: { id, account_id: user.accountId },
      include: { unit: true },
    });
    if (!existing) throw new AppError('Application not found', 404);

    return await prisma.$transaction(async (tx) => {
      // 1. Update Application status
      const updatedApp = await tx.application.update({
        where: { id },
        data: {
          status: data.status,
          vetting_notes: data.vettingNotes,
          reviewed_at: new Date(),
          reviewed_by: user.sub,
        },
      });

      // 2. If approved, create Tenant and Tenancy
      if (data.status === 'approved' && existing.status !== 'approved') {
        if (existing.unit.rent_amount == null) {
          throw new AppError('Set a rent amount for this property before approving applications.', 400);
        }

        const formData = existing.form_data as any;

        // Create Tenant
        const tenant = await tx.tenant.create({
          data: {
            account_id: user.accountId,
            full_name: existing.applicant_name,
            email: existing.applicant_email,
            phone: existing.applicant_phone,
            id_number: formData.idNumber || null,
            employer: formData.employer || null,
            employment_status: formData.employmentStatus || null,
            monthly_income: formData.monthlyIncome || null,
          },
        });

        // Create pending Tenancy
        await tx.tenancy.create({
          data: {
            account_id: user.accountId,
            unit_id: existing.unit_id,
            tenant_id: tenant.id,
            status: 'pending_deposit',
            rent_amount: existing.unit.rent_amount,
            currency: existing.unit.currency,
            // Lease details to be filled later
            lease_start: new Date(), // Placeholder, updated on activation
          },
        });
      }

      return updatedApp;
    });
  }

  /**
   * Sets the application to "more_info" and reaches out to the applicant
   * using the contact details captured on their own submission (there's no
   * Tenant record yet at this stage, so this can't go through the
   * communications.service tenant/owner-scoped flow). Email is sent
   * server-side; a WhatsApp deep link is handed back for the frontend to
   * open, matching the existing wa.me pattern used for receipts.
   */
  async requestMoreInfo(id: string, notes: string | undefined, user: TokenPayload) {
    const application = await this.updateStatus(id, { status: 'more_info', vettingNotes: notes }, user);

    const [account, full] = await Promise.all([
      prisma.account.findUnique({ where: { id: user.accountId }, select: { name: true, email: true, phone: true } }),
      this.getById(id, user),
    ]);

    const message = `Hi ${full.applicant_name}, we need a bit more information to process your application for ${full.unit.property.name} - ${full.unit.unit_number}. Please get in touch or fill in any blank spaces left on your form. Thank you.`;

    let emailSent = false;
    if (full.applicant_email && account) {
      try {
        await sendApplicationMoreInfoEmail({
          to: full.applicant_email,
          applicantName: full.applicant_name,
          propertyName: full.unit.property.name,
          unitNumber: full.unit.unit_number,
          notes,
          accountName: account.name,
          agentEmail: account.email ?? '',
          agentPhone: account.phone ?? undefined,
        });
        emailSent = true;
      } catch {
        // Don't fail the status update over a flaky email provider - the
        // WhatsApp link (if a phone is on file) still gives the agent a way
        // to reach the applicant.
        emailSent = false;
      }
    }

    const waLink = full.applicant_phone
      ? `https://wa.me/${full.applicant_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      : null;

    return { application, emailSent, waLink };
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.application.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true, status: true },
    });
    if (!existing) throw new Error('Application not found');
    if (existing.status === 'approved') throw new Error('Cannot delete an approved application - it has already created a tenant record.');
    await prisma.application.delete({ where: { id } });
    return { deleted: true };
  }

  async update(id: string, data: { notes?: string; status?: string }, user: TokenPayload) {
    const existing = await prisma.application.findFirst({
      where: { id, account_id: user.accountId },
      select: { id: true },
    });
    if (!existing) throw new Error('Application not found');
    return prisma.application.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { vetting_notes: data.notes }),
      },
    });
  }
}

export const applicationsService = new ApplicationsService();
