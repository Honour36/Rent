import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import { Resend } from 'resend';
import crypto from 'crypto';

export const InviteAgentSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'senior_agent', 'junior_agent'])
});

export const UpdateAgentSchema = z.object({
  role: z.enum(['admin', 'senior_agent', 'junior_agent']).optional(),
  is_active: z.boolean().optional()
});

export type InviteAgentDto = z.infer<typeof InviteAgentSchema>;
export type UpdateAgentDto = z.infer<typeof UpdateAgentSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class AgentsService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_mock');
  }

  async list(user: TokenPayload) {
    const agents = await prisma.user.findMany({
      where: { account_id: user.accountId },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        is_active: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    const invites = await prisma.agentInvite.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' }
    });

    return { agents, invites };
  }

  async invite(data: InviteAgentDto, user: TokenPayload) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.agentInvite.create({
      data: {
        account_id: user.accountId,
        email: data.email,
        role: data.role,
        token,
        expires_at: expiresAt
      }
    });

    const setupLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?token=${token}`;

    const result = await this.resend.emails.send({
      from: 'Rental <onboarding@resend.dev>',
      to: data.email,
      subject: 'You have been invited to join Rental',
      html: `<p>You have been invited to join as an agent.</p><p><a href="${setupLink}">Click here to set up your account</a></p>`
    });
    if (result.error) {
      // Resend resolves with an `error` field instead of throwing.
      throw new AppError(`Failed to send invite email: ${result.error.message}`, 500);
    }

    return invite;
  }

  async update(agentId: string, data: UpdateAgentDto, user: TokenPayload) {
    const agent = await prisma.user.findFirst({
      where: { id: agentId, account_id: user.accountId }
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    if (data.is_active === false && agent.role === 'admin') {
      const activeAdmins = await prisma.user.count({
        where: { account_id: user.accountId, role: 'admin', is_active: true }
      });
      if (activeAdmins <= 1) {
        throw new AppError('Cannot deactivate the last active admin', 400);
      }
    }

    const updated = await prisma.user.update({
      where: { id: agentId },
      data: {
        role: data.role,
        is_active: data.is_active
      },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        is_active: true,
        created_at: true
      }
    });

    return updated;
  }
}

export const agentsService = new AgentsService();
