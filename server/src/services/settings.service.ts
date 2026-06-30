import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export const UpdateAccountSchema = z.object({
  name: z.string().min(2).optional(),
  logo_url: z.string().url().optional(),
  subscription_tier: z.string().optional(),
  management_fee_pct: z.number().min(0).max(100).optional(),
});

export const TemplateSchema = z.object({
  name: z.string().min(1),
  channel: z.enum(['email', 'whatsapp']),
  subject: z.string().optional(),
  body: z.string().min(1)
});

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
    return account;
  }

  async updateAccount(data: UpdateAccountDto, user: TokenPayload) {
    const account = await prisma.account.update({
      where: { id: user.accountId },
      data: {
        name: data.name,
        logo_url: data.logo_url,
        subscription_tier: data.subscription_tier,
        management_fee_pct: data.management_fee_pct
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
