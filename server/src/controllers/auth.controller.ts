import { Request, Response } from 'express';
import { authService, RegisterSchema, LoginSchema, VerifyEmailSchema, ForgotPasswordSchema, ResetPasswordSchema, AcceptInviteSchema } from '../services/auth.service';

function ok(res: Response, data: object, status = 200) { res.status(status).json({ success: true, ...data }); }
function fail(res: Response, error: any) {
  const status = error.statusCode || 500;
  const msg = error.message || 'An unexpected error occurred.';
  if (msg === 'EMAIL_NOT_VERIFIED') {
    res.status(403).json({ success: false, error: 'Please verify your email before logging in. A new code has been sent.', code: 'EMAIL_NOT_VERIFIED' });
    return;
  }
  res.status(status).json({ success: false, error: msg });
}

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const dto = RegisterSchema.parse(req.body);
      const result = await authService.register(dto);
      ok(res, result, 201);
    } catch (e: any) { fail(res, e); }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = VerifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(email, code);
      // Set cookies
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
      ok(res, result);
    } catch (e: any) { fail(res, e); }
  },

  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification(email);
      ok(res, result);
    } catch (e: any) { fail(res, e); }
  },

  async login(req: Request, res: Response) {
    try {
      const dto = LoginSchema.parse(req.body);
      const result = await authService.login(dto);
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
      ok(res, result);
    } catch (e: any) { fail(res, e); }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = ForgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);
      ok(res, result);
    } catch (e: any) { fail(res, e); }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, password } = ResetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(email, code, password);
      ok(res, result);
    } catch (e: any) { fail(res, e); }
  },

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refresh_token || req.body?.refreshToken;
      if (!token) { res.status(401).json({ success: false, error: 'Refresh token required.' }); return; }
      const result = await authService.refresh(token);
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      ok(res, result);
    } catch (e: any) { fail(res, e); }
  },

  async logout(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user?.sub) await authService.logout(user.sub);
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      ok(res, { message: 'Logged out.' });
    } catch (e: any) { fail(res, e); }
  },

  async acceptInvite(req: Request, res: Response) {
    try {
      const data = AcceptInviteSchema.parse(req.body);
      const result = await authService.acceptInvite(data);
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth/refresh', maxAge: 30 * 24 * 60 * 60 * 1000 });
      ok(res, result, 201);
    } catch (e: any) { fail(res, e); }
  },

  async me(req: any, res: Response) {
    try {
      const { prisma } = await import('../db/prisma');
      const user = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { id: true, email: true, full_name: true, role: true, account_id: true },
      });
      if (!user) { res.status(404).json({ success: false, error: 'User not found.' }); return; }
      ok(res, { data: { id: user.id, email: user.email, name: user.full_name, role: user.role, accountId: user.account_id } });
    } catch (e: any) { fail(res, e); }
  },
};
