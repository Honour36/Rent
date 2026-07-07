import { supabase } from '../db/client';
import { BUCKETS } from '../db/storage';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function setup() {
  console.log('Setting up Supabase Storage buckets...');
  for (const bucket of Object.values(BUCKETS)) {
    const { data, error } = await supabase.storage.getBucket(bucket);
    const err = error as any;
    if ((err && (err.message?.includes('not found') || err.message?.includes('The resource was not found'))) || !data) {
      console.log(`Creating bucket: ${bucket}...`);
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
      });
      const cErr = createError as any;
      if (cErr) {
        console.error(`Failed to create bucket ${bucket}:`, cErr.message || cErr);
      } else {
        console.log(`Bucket ${bucket} created.`);
      }
    } else if (data) {
      console.log(`Bucket ${bucket} already exists.`);
    } else {
      console.error(`Error checking bucket ${bucket}:`, err?.message || err);
    }
  }
}

setup().catch(console.error);
