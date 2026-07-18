import { z } from 'zod';
import { randomBytes } from 'crypto';
import PDFDocument from 'pdfkit';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

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

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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
              select: { name: true, address: true, suburb: true, city: true },
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
            property: { select: { name: true, address: true, suburb: true, city: true } },
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

      // Header
      doc.rect(50, 50, W, 60).fill('#f9fafb');
      doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold').text('RENTAL APPLICATION', 60, 65);
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text(`Application ID: ${application.id}`, 60, 88);
      doc.y = 120;

      row('Property', application.unit.property.name);
      row('Unit', application.unit.unit_number);
      row('Monthly Rent', `${Number(application.unit.rent_amount).toLocaleString()} ${application.unit.currency}`);
      row('Status', application.status.replace(/_/g, ' ').toUpperCase());
      row('Submitted', application.submitted_at
        ? new Date(application.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Not submitted');

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

      if (idImageBuffer) {
        section('ID Document');
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
