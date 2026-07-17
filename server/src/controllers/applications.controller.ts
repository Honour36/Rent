import { Request, Response } from 'express';
import {
  applicationsService,
  GenerateLinkSchema,
  ApplicationSubmitSchema,
  UpdateApplicationStatusSchema,
} from '../services/applications.service';
import { AuthRequest } from '../middleware/auth.middleware';

class ApplicationsController {
  /**
   * POST /api/applications/generate-link
   * Authenticated - agent generates shareable link for a unit.
   */
  generateLink = async (req: AuthRequest, res: Response) => {
    const parsed = GenerateLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const result = await applicationsService.generateLink(parsed.data, req.user!);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/applications/public/:token
   * No auth - returns unit info for form header pre-fill.
   */
  getPublic = async (req: Request, res: Response) => {
    try {
      const data = await applicationsService.getPublicByToken(req.params.token);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/applications/public/:token
   * No auth - tenant submits application form.
   */
  submitPublic = async (req: Request, res: Response) => {
    const parsed = ApplicationSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const result = await applicationsService.submitPublic(req.params.token, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/applications
   * Authenticated - list all applications for account with optional status filter.
   */
  list = async (req: AuthRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const applications = await applicationsService.list(req.user!, status);
      res.json({ success: true, data: applications });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/applications/:id
   * Authenticated - full application detail for vetting view.
   */
  getById = async (req: AuthRequest, res: Response) => {
    try {
      const application = await applicationsService.getById(req.params.id, req.user!);
      res.json({ success: true, data: application });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  /**
   * PATCH /api/applications/:id/status
   * Authenticated - update status + vetting notes.
   */
  updateStatus = async (req: AuthRequest, res: Response) => {
    const parsed = UpdateApplicationStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const updated = await applicationsService.updateStatus(req.params.id, parsed.data, req.user!);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await applicationsService.delete(req.params.id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const status = err.message?.includes('approved') ? 400 : 404;
      res.status(status).json({ success: false, error: err.message || 'Could not delete application.' });
    }
  };
}

export const applicationsController = new ApplicationsController();
