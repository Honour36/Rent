import { Request, Response } from 'express';
import { authService, RegisterSchema, LoginSchema, AcceptInviteSchema } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const data = RegisterSchema.parse(req.body);
      const result = await authService.register(data);
      
      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/api/auth/refresh' });
      
      res.status(201).json({ success: true, data: { user: result.user } });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const data = LoginSchema.parse(req.body);
      const result = await authService.login(data);

      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/api/auth/refresh' });
      
      res.status(200).json({ success: true, data: { user: result.user } });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Login failed' });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'No refresh token provided' });
      }

      const result = await authService.refresh(refreshToken);

      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/api/auth/refresh' });
      
      res.status(200).json({ success: true, data: null });
    } catch (error: any) {
      const status = error.statusCode || 401;
      res.status(status).json({ success: false, error: error.message || 'Refresh failed' });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('access_token');
      res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
      res.status(200).json({ success: true, data: null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Logout failed' });
    }
  },

  async acceptInvite(req: Request, res: Response) {
    try {
      const data = AcceptInviteSchema.parse(req.body);
      const result = await authService.acceptInvite(data);

      res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/api/auth/refresh' });

      res.status(201).json({ success: true, data: { user: result.user } });
    } catch (error: any) {
      const status = error.statusCode || 400;
      res.status(status).json({ success: false, error: error.message || 'Failed to accept invite' });
    }
  }
};
