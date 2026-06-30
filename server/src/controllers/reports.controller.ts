import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { reportsService, GenerateStatementSchema } from '../services/reports.service';

export class ReportsController {
  async generate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const body = GenerateStatementSchema.parse(req.body);
      const result = await reportsService.generateStatement(body, req.user!);
      res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      if (err instanceof Error && err.constructor.name === 'ZodError') {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to generate statement' });
    }
  }

  async pdf(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const buffer = await reportsService.generateStatementPdf(id, req.user!);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="statement-${id}.pdf"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to generate PDF' });
    }
  }

  async approve(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await reportsService.approveStatement(id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to approve statement' });
    }
  }

  async dispatch(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await reportsService.dispatchStatement(id, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to dispatch statement' });
    }
  }

  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
      const result = await reportsService.listStatements(ownerId, req.user!);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to list statements' });
    }
  }

  async getArrearsReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await reportsService.getArrearsReport(req.user!.accountId);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to get arrears report' });
    }
  }

  async getVacancyReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await reportsService.getVacancyReport(req.user!.accountId);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to get vacancy report' });
    }
  }

  async getLeaseExpiryReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const days = parseInt((req.query.days as string) || '30', 10);
      const result = await reportsService.getLeaseExpiryReport(req.user!.accountId, days);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to get lease expiry report' });
    }
  }

  async getCollectionRateReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const propertyId = req.query.propertyId as string | undefined;
      const result = await reportsService.getCollectionRateReport(req.user!.accountId, propertyId);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to get collection rate report' });
    }
  }

  async getMaintenanceReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await reportsService.getMaintenanceReport(req.user!.accountId);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to get maintenance report' });
    }
  }

  async getTrustLedgerReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.query.ownerId as string | undefined;
      const result = await reportsService.getTrustLedgerReport(req.user!.accountId, ownerId);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      const anyErr = err as any;
      res.status(anyErr?.statusCode ?? 500).json({ success: false, error: anyErr?.message ?? 'Failed to get trust ledger report' });
    }
  }
}

export const reportsController = new ReportsController();
