import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadFile, getPublicUrl, BUCKETS } from '../db/storage';
import Busboy from 'busboy';
import { Readable } from 'stream';

const router = Router();

/**
 * POST /api/storage/upload
 * Multipart file upload → Supabase Storage.
 * Body fields: file (binary), bucket (string), path (string)
 */
router.post('/upload', authenticate, (req: Request, res: Response) => {
  const bb = Busboy({ headers: req.headers });
  const fields: Record<string, string> = {};
  let fileBuffer: Buffer | null = null;
  let originalName = '';
  let mimeType = 'application/octet-stream';

  bb.on('field', (name, val) => { fields[name] = val; });

  bb.on('file', (_fieldname, stream, info) => {
    originalName = info.filename;
    mimeType = info.mimeType;
    const chunks: Buffer[] = [];
    stream.on('data', (d: Buffer) => chunks.push(d));
    stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
  });

  bb.on('finish', async () => {
    if (!fileBuffer) { res.status(400).json({ success: false, error: 'No file received' }); return; }
    const bucket = (fields.bucket as keyof typeof BUCKETS) || 'documents';
    const path = fields.path || `uploads/${Date.now()}-${originalName}`;
    try {
      const resolvedBucket = BUCKETS[bucket] ?? BUCKETS.documents;
      const storedPath = await uploadFile(resolvedBucket, path, fileBuffer, mimeType);
      const publicUrl = getPublicUrl(resolvedBucket, storedPath);
      res.json({ success: true, data: { path: storedPath, publicUrl } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  req.pipe(bb);
});

export default router;
