import { z } from 'zod';
import { prisma } from '../db/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  generateOTP,
} from '../emails/email-service';

export const RegisterSchema = z.object({
  accountName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export const LoginSchema = z.object({ email: z.string().email(), password: z.string() });
export const VerifyEmailSchema = z.object({ email: z.string().email(), code: z.string().length(6) });
export const ForgotPasswordSchema = z.object({ email: z.string().email() });
export const ResetPasswordSchema = z.object({ email: z.string().email(), code: z.string().length(6), password: z.string().min(8) });
export const AcceptInviteSchema = z.object({ token: z.string().min(1), fullName: z.string().min(2), password: z.string().min(8) });

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>;

class AppError extends Error {
  constructor(public message: string, public statusCode: number) { super(message); }
}

function tokenExpiry(minutes = 15): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

export class AuthService {
  private generateTokens(userId: string, accountId: string, role: string, name?: string | null, email?: string | null) {
    const payload = { sub: userId, accountId, role, name: name ?? '', email: email ?? '' };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (existingUser) throw new AppError('An account with this email already exists.', 400);

    const passwordHash = await bcrypt.hash(data.password, 10);
    const verificationCode = generateOTP();
    const expiresAt = tokenExpiry(15);

    const { user, account } = await prisma.$transaction(async (tx) => {
      const account = await tx.account.create({ data: { name: data.accountName } });
      const user = await tx.user.create({
        data: {
          account_id: account.id,
          email: data.email,
          password_hash: passwordHash,
          role: 'admin',
          full_name: data.fullName,
          email_verified: false,
          verification_token: verificationCode,
          token_expires_at: expiresAt,
        },
      });
      return { account, user };
    });

    // Send verification email (non-blocking)
    sendVerificationEmail({ to: data.email, name: data.fullName, code: verificationCode, accountName: data.accountName }).catch(console.error);

    return {
      requiresVerification: true,
      email: data.email,
      message: `A 6-digit verification code has been sent to ${data.email}.`,
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('No account found with this email.', 404);
    if (user.email_verified) throw new AppError('This email is already verified.', 400);
    if (!user.verification_token || user.verification_token !== code) throw new AppError('Invalid verification code.', 400);
    if (user.token_expires_at && new Date() > user.token_expires_at) throw new AppError('Verification code has expired. Please request a new one.', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { email_verified: true, verification_token: null, token_expires_at: null },
    });

    const account = await prisma.account.findUnique({ where: { id: user.account_id }, select: { name: true } });

    // Send welcome email
    sendWelcomeEmail({
      to: user.email,
      name: user.full_name ?? 'there',
      accountName: account?.name ?? 'Hi',
    }).catch(console.error);

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.account_id, user.role, user.full_name ?? '', user.email);
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('No account found with this email.', 404);
    if (user.email_verified) throw new AppError('Email is already verified.', 400);

    const code = generateOTP();
    await prisma.user.update({ where: { id: user.id }, data: { verification_token: code, token_expires_at: tokenExpiry(15) } });
    await sendVerificationEmail({ to: user.email, name: user.full_name ?? '', code });
    return { message: 'A new code has been sent to your email.' };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.is_active) throw new AppError('Invalid email or password.', 401);

    const isValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isValid) throw new AppError('Invalid email or password.', 401);

    if (!user.email_verified) {
      // Resend code silently
      const code = generateOTP();
      await prisma.user.update({ where: { id: user.id }, data: { verification_token: code, token_expires_at: tokenExpiry(15) } });
      sendVerificationEmail({ to: user.email, name: user.full_name ?? '', code }).catch(console.error);
      throw new AppError('EMAIL_NOT_VERIFIED', 403);
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, user.account_id, user.role, user.full_name ?? '', user.email);
    await this.saveRefreshToken(user.id, refreshToken);

    return { user: { id: user.id, email: user.email, name: user.full_name, role: user.role }, accessToken, refreshToken };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success (don't reveal if email exists)
    if (!user) return { message: 'If an account exists, a reset code has been sent.' };

    const code = generateOTP();
    await prisma.user.update({ where: { id: user.id }, data: { password_reset_token: code, reset_expires_at: tokenExpiry(15) } });
    sendPasswordResetEmail({ to: user.email, name: user.full_name ?? '', code }).catch(console.error);
    return { message: 'If an account exists, a reset code has been sent.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_reset_token || user.password_reset_token !== code) {
      throw new AppError('Invalid or expired reset code.', 400);
    }
    if (user.reset_expires_at && new Date() > user.reset_expires_at) {
      throw new AppError('Reset code has expired. Please request a new one.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash: passwordHash, password_reset_token: null, reset_expires_at: null } });
    return { message: 'Password reset successfully. You can now log in.' };
  }

  async refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError('User not found', 401);
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user.id, user.account_id, user.role, user.full_name ?? '', user.email);
    await this.saveRefreshToken(user.id, newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { user_id: userId } });
  }

  async acceptInvite(data: AcceptInviteDto) {
    const invite = await prisma.agentInvite.findUnique({ where: { token: data.token }, include: { account: true } });
    if (!invite || invite.accepted_at || invite.expires_at < new Date()) {
      throw new AppError('Invite is invalid or has expired.', 400);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        account_id: invite.account_id,
        email: invite.email,
        password_hash: passwordHash,
        role: invite.role,
        full_name: data.fullName,
        email_verified: true, // email was already verified via invite
      },
    });
    await prisma.agentInvite.update({ where: { id: invite.id }, data: { accepted_at: new Date() } });
    const { accessToken, refreshToken } = this.generateTokens(user.id, user.account_id, user.role, user.full_name ?? '', user.email);
    await this.saveRefreshToken(user.id, refreshToken);
    return { user: { id: user.id, email: user.email, name: user.full_name, role: user.role }, accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.refreshToken.create({ data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt } });
  }
}

export const authService = new AuthService();
