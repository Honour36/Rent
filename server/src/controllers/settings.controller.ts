import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { settingsService, UpdateAccountSchema, TemplateSchema } from '../services/settings.service';

export class SettingsController {
  async getAccount(req: AuthRequest, res: Response) {
    try {
      const data = await settingsService.getAccount(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async updateAccount(req: AuthRequest, res: Response) {
    try {
      const body = UpdateAccountSchema.parse(req.body);
      const data = await settingsService.updateAccount(body, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Invalid request' });
    }
  }

  async getTemplates(req: AuthRequest, res: Response) {
    try {
      const data = await settingsService.getTemplates(req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async createTemplate(req: AuthRequest, res: Response) {
    try {
      const body = TemplateSchema.parse(req.body);
      const data = await settingsService.createTemplate(body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Invalid request' });
    }
  }

  async updateTemplate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const body = TemplateSchema.parse(req.body);
      const data = await settingsService.updateTemplate(id, body, req.user!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, error: error.message || 'Invalid request' });
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await settingsService.deleteTemplate(id, req.user!);
      res.json({ success: true });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, error: error.message || 'Invalid request' });
    }
  }
}

export const settingsController = new SettingsController();
