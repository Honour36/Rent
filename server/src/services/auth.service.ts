import { z } from 'zod';
import { prisma } from '../db/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const RegisterSchema = z.object({
  accountName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
  fullName: z.string().min(2),
  password: z.string().min(8)
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export class AuthService {
  private generateTokens(userId: string, accountId: string, role: string, name?: string, email?: string) {
    const payload = { sub: userId, accountId, role, name: name ?? '', email: email ?? '' };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create Account and User in a transaction
    const { user, account } = await prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: { name: data.accountName },
      });

      const user = await tx.user.create({
        data: {
          account_id: account.id,
          email: data.email,
          password_hash: passwordHash,
          role: 'admin',
          full_name: data.fullName,
        },
      });

      return { account, user };
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id, account.id, user.role, user.full_name, user.email);

    // Save refresh token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.is_active) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.account_id, user.role, user.full_name, user.email);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string };
    } catch (e) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Fetch all active tokens for this user and find the matching one
    const tokens = await prisma.refreshToken.findMany({
      where: { user_id: payload.sub, revoked: false },
    });

    let validTokenRecord = null;
    for (const t of tokens) {
      if (await bcrypt.compare(refreshToken, t.token_hash)) {
        validTokenRecord = t;
        break;
      }
    }

    if (!validTokenRecord) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (new Date(validTokenRecord.expires_at) < new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    // Revoke old token and get user in a transaction
    const user = await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: validTokenRecord!.id },
        data: { revoked: true },
      });

      const user = await tx.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.is_active) {
        throw new AppError('User not found or inactive', 401);
      }
      return user;
    });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      user.id,
      user.account_id,
      user.role
    );

    const tokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const tokens = await prisma.refreshToken.findMany({
      where: { revoked: false },
    });

    for (const t of tokens) {
      if (await bcrypt.compare(refreshToken, t.token_hash)) {
        await prisma.refreshToken.update({
          where: { id: t.id },
          data: { revoked: true },
        });
        break;
      }
    }
  }

  async acceptInvite(data: AcceptInviteDto) {
    const invite = await prisma.agentInvite.findUnique({
      where: { token: data.token }
    });

    if (!invite) {
      throw new AppError('Invite not found or already used', 400);
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new AppError('Invite link has expired', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email }
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          account_id: invite.account_id,
          email: invite.email,
          password_hash: passwordHash,
          role: invite.role,
          full_name: data.fullName,
          is_active: true
        }
      });

      // Consume the invite token — one-time use only
      await tx.agentInvite.delete({ where: { id: invite.id } });

      return newUser;
    });

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.account_id, user.role);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt }
    });

    return {
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
      accessToken,
      refreshToken
    };
  }
}

export const authService = new AuthService();
