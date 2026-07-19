import { Response } from 'express';
import { checklistTemplatesService, CreateChecklistTemplateSchema } from '../services/checklist-templates.service';
import { AuthRequest } from '../middleware/auth.middleware';

class ChecklistTemplatesController {
  list = async (req: AuthRequest, res: Response) => {
    try {
      const data = await checklistTemplatesService.list(req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Could not load checklist templates.' });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const data = await checklistTemplatesService.getById(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = CreateChecklistTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await checklistTemplatesService.create(parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    const parsed = CreateChecklistTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
      return;
    }
    try {
      const data = await checklistTemplatesService.update(req.params.id, parsed.data, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const data = await checklistTemplatesService.delete(req.params.id, req.user!);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getPdf = async (req: AuthRequest, res: Response) => {
    try {
      const pdfBuffer = await checklistTemplatesService.generatePdf(req.params.id, req.user!);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="checklist-${req.params.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const checklistTemplatesController = new ChecklistTemplatesController();
