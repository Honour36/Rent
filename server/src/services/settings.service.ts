import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const UpdateAccountSchema = z.object({
  name: z.string().min(2).optional(),
  logo_url: z.string().url().optional(),
  subscription_tier: z.enum(['basic', 'starter', 'growth', 'professional']).optional(),
  management_fee_pct: z.number().min(0).max(100).optional(),
  // Company / receipt details
  address: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  vatNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
});

export const TemplateSchema = z.object({
  name: z.string().min(1),
  channel: z.enum(['email', 'whatsapp']),
  subject: z.string().optional(),
  body: z.string().min(1)
});

// Every account gets a 1-month free trial from signup, then billing starts
// from the second month - see config/subscription-tiers.ts on the client
// for the matching TRIAL_DAYS constant and tier pricing. Trial status is
// computed from `created_at` rather than stored, since there's no billing
// provider wired up yet to actually start/stop a subscription clock.
const TRIAL_DAYS = 30;

export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
export type TemplateDto = z.infer<typeof TemplateSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class SettingsService {
  async getAccount(user: TokenPayload) {
    const account = await prisma.account.findUnique({
      where: { id: user.accountId }
    });
    if (!account) return account;

    const trialEndsAt = new Date(account.created_at);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
    const msLeft = trialEndsAt.getTime() - Date.now();
    const isTrialing = msLeft > 0;
    const trialDaysLeft = isTrialing ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0;

    return { ...account, trial_ends_at: trialEndsAt, is_trialing: isTrialing, trial_days_left: trialDaysLeft };
  }

  async updateAccount(data: UpdateAccountDto, user: TokenPayload) {
    const account = await prisma.account.update({
      where: { id: user.accountId },
      data: {
        name: data.name,
        logo_url: data.logo_url,
        subscription_tier: data.subscription_tier,
        management_fee_pct: data.management_fee_pct,
        address: data.address,
        suburb: data.suburb,
        city: data.city,
        phone: data.phone,
        email: data.email,
        vat_number: data.vatNumber,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
      }
    });
    return account;
  }

  async getTemplates(user: TokenPayload) {
    const templates = await prisma.messageTemplate.findMany({
      where: { account_id: user.accountId },
      orderBy: { name: 'asc' }
    });
    return templates;
  }

  async createTemplate(data: TemplateDto, user: TokenPayload) {
    const template = await prisma.messageTemplate.create({
      data: {
        account_id: user.accountId,
        ...data
      }
    });
    return template;
  }

  async updateTemplate(templateId: string, data: TemplateDto, user: TokenPayload) {
    const existing = await prisma.messageTemplate.findFirst({
      where: { id: templateId, account_id: user.accountId }
    });

    if (!existing) {
      throw new AppError('Template not found', 404);
    }

    const template = await prisma.messageTemplate.update({
      where: { id: templateId },
      data
    });
    return template;
  }

  async deleteTemplate(templateId: string, user: TokenPayload) {
    const existing = await prisma.messageTemplate.findFirst({
      where: { id: templateId, account_id: user.accountId }
    });

    if (!existing) {
      throw new AppError('Template not found', 404);
    }

    await prisma.messageTemplate.delete({
      where: { id: templateId }
    });
    
    return { success: true };
  }
}

export const settingsService = new SettingsService();
