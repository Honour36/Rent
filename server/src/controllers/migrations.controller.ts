import { Response } from 'express';
import Busboy from 'busboy';
import * as XLSX from 'xlsx';
import { AuthRequest } from '../middleware/auth.middleware';
import { migrationsService } from '../services/migrations.service';
import { MIGRATION_FIELDS, TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW } from '../config/migration-fields';

export const migrationsController = {
  fields(_req: AuthRequest, res: Response) {
    res.json({ success: true, data: MIGRATION_FIELDS });
  },

  template(_req: AuthRequest, res: Response) {
    const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE_ROW]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Properties');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="rental-migration-template.xlsx"');
    res.send(buffer);
  },

  preview(req: AuthRequest, res: Response) {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: 15 * 1024 * 1024 } });
    let fileBuffer: Buffer | null = null;
    let filename = '';
    let tooLarge = false;

    bb.on('file', (_field, stream, info) => {
      filename = info.filename;
      const chunks: Buffer[] = [];
      stream.on('data', (d: Buffer) => chunks.push(d));
      stream.on('limit', () => { tooLarge = true; });
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('finish', () => {
      if (tooLarge) {
        res.status(413).json({ success: false, error: 'File is too large (max 15MB).' });
        return;
      }
      if (!fileBuffer) {
        res.status(400).json({ success: false, error: 'No file received.' });
        return;
      }
      try {
        const preview = migrationsService.parseFile(fileBuffer, filename);
        res.json({ success: true, data: preview });
      } catch (err: any) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Could not process the file.' });
      }
    });

    req.pipe(bb);
  },

  async commit(req: AuthRequest, res: Response) {
    try {
      const { rows, mapping } = req.body ?? {};
      if (!Array.isArray(rows) || typeof mapping !== 'object') {
        res.status(422).json({ success: false, error: 'Missing rows or column mapping.' });
        return;
      }
      const summary = await migrationsService.commitImport(rows, mapping, req.user!);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Could not complete the import.' });
    }
  },
};
