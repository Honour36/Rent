import { supabase } from './client';

/**
 * Bucket names match architecture.md exactly.
 */
export const BUCKETS = {
  documents: 'documents',
  leases: 'leases',
  receipts: 'receipts',
  statements: 'statements',
  branding: 'branding',
} as const;

export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file buffer to a Supabase Storage bucket.
 * Returns the storage path on success.
 */
export async function uploadFile(
  bucket: Bucket,
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Storage upload failed (${bucket}/${path}): ${error.message}`);
  }

  return path;
}

/**
 * Generate a signed URL valid for `expiresIn` seconds (default 1 hour).
 * Used when serving a PDF to the browser.
 */
export async function getSignedUrl(
  bucket: Bucket,
  path: string,
  expiresIn = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL (${bucket}/${path}): ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Download a file from storage as a Buffer.
 */
export async function downloadFile(bucket: Bucket, path: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(`Storage download failed (${bucket}/${path}): ${error?.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

/**
 * Delete a file from storage (non-throwing - best effort for cleanup).
 */
export async function deleteFile(bucket: Bucket, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}
