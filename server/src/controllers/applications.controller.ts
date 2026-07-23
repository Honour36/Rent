import { Request, Response } from 'express';
import Busboy from 'busboy';
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
   * POST /api/applications/public/:token/id-document
   * No auth (applicant isn't logged in) - but scoped to a single,
   * not-yet-submitted application token, unlike the generic authenticated
   * /storage/upload endpoint this used to (silently, since it required a
   * login the applicant never has) fail against.
   */
  uploadPublicIdDocument = (req: Request, res: Response) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });
    let fileBuffer: Buffer | null = null;
    let filename = 'id-document';
    let mimeType = 'application/octet-stream';

    bb.on('file', (_field, stream, info) => {
      filename = info.filename;
      mimeType = info.mimeType;
      const chunks: Buffer[] = [];
      stream.on('data', (d: Buffer) => chunks.push(d));
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('finish', async () => {
      if (!fileBuffer) {
        res.status(400).json({ success: false, error: 'No file received' });
        return;
      }
      try {
        const path = await applicationsService.uploadPublicIdDocument(req.params.token, fileBuffer, filename, mimeType);
        res.json({ success: true, data: { path } });
      } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
      }
    });

    req.pipe(bb);
  };

  /**
   * GET /api/applications/:id/id-document
   * Authenticated - signed URL for the vetting page to display the
   * applicant's uploaded ID photo/document.
   */
  getIdDocumentUrl = async (req: AuthRequest, res: Response) => {
    try {
      const url = await applicationsService.getIdDocumentSignedUrl(req.params.id, req.user!);
      res.json({ success: true, data: { url } });
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
   * GET /api/applications/:id/pdf
   * Authenticated - downloadable PDF of the full application for record-keeping.
   */
  getPdf = async (req: AuthRequest, res: Response) => {
    try {
      const pdfBuffer = await applicationsService.generatePdf(req.params.id, req.user!);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="application-${req.params.id}.pdf"`);
      res.send(pdfBuffer);
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

  /**
   * POST /api/applications/:id/request-more-info
   * Authenticated - moves the application to "more_info" and messages the
   * applicant using the contact details on their own submission.
   */
  requestMoreInfo = async (req: AuthRequest, res: Response) => {
    try {
      const notes = typeof req.body?.notes === 'string' ? req.body.notes : undefined;
      const result = await applicationsService.requestMoreInfo(req.params.id, notes, req.user!);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}

export const applicationsController = new ApplicationsController();
