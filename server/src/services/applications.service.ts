import { z } from 'zod';
import { randomBytes } from 'crypto';
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

    // Only allow form submission if still pending (not already submitted with data)
    const alreadySubmitted =
      application.status !== 'pending' ||
      (application.applicant_name && application.applicant_name.length > 0 &&
        Object.keys(application.form_data as object).length > 0);

    return {
      token: application.token,
      alreadySubmitted,
      unit: {
        unit_number: application.unit.unit_number,
        rent_amount: Number(application.unit.rent_amount),
        currency: application.unit.currency,
        bedrooms: application.unit.bedrooms,
        bathrooms: application.unit.bathrooms,
        property: application.unit.property,
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
      },
    });

    return { success: true, applicationId: updated.id };
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
    if (existing.status === 'approved') throw new Error('Cannot delete an approved application — it has already created a tenant record.');
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
        ...(data.notes !== undefined && { additional_notes: data.notes }),
      },
    });
  }
}

export const applicationsService = new ApplicationsService();
