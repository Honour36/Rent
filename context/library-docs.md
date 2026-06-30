<!-- Library docs: key usage patterns for the libraries in this project -->

# Library Docs

Project-specific usage patterns for every third-party library in this project. Read the relevant section before implementing any feature that touches these libraries.

---

## Order of Authority

```
This file (project rules) → General training knowledge
```

The libraries below are well-known — general knowledge is reliable. However, follow the project-specific rules in this file where they differ.

---

## Supabase (PostgreSQL + Storage)

Used as the primary database and file storage backend. Accessed exclusively from the Express backend via the service role key. Never initialise the Supabase client in the Next.js frontend.

### Client Initialisation

```typescript
// backend/src/db/client.ts — server only
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role — full access, never expose
);
```

### Query Pattern

```typescript
// Always scope to account_id — no exceptions
const { data, error } = await supabase
  .from('payments')
  .select('*, tenancies(*, units(*, properties(*)))')
  .eq('account_id', user.accountId)
  .order('created_at', { ascending: false });

if (error) throw new AppError(`[PaymentService/list] ${error.message}`, 500);
```

### Insert Pattern

```typescript
const { data, error } = await supabase
  .from('payments')
  .insert({ ...paymentData, account_id: user.accountId, recorded_by: user.sub })
  .select()
  .single();

if (error) throw new AppError(`[PaymentService/create] ${error.message}`, 500);
return data;
```

### Storage Upload

```typescript
// backend/src/integrations/storage.ts
const { error } = await supabase.storage
  .from('receipts')
  .upload(`${accountId}/${receiptNumber}.pdf`, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true, // overwrite if re-generating
  });

// Get a signed URL (valid 1 hour) for sending to tenant
const { data: urlData } = await supabase.storage
  .from('receipts')
  .createSignedUrl(`${accountId}/${receiptNumber}.pdf`, 3600);
```

**Rules:**
- Never use the Supabase client in Next.js pages, components, or API routes
- Always check the `error` field — never assume success
- Always include `.eq('account_id', user.accountId)` on every query
- Use `.single()` when expecting exactly one row — it throws if 0 or 2+ rows returned
- Use `upsert: true` for file uploads that may be regenerated
- Never write files to disk — always upload Buffer directly to Storage

---

## Redis (ioredis)

Used for caching frequently-read data, scheduled job locking, and rate limiting.

### Client Initialisation

```typescript
// backend/src/db/redis.ts
import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL!);
```

### Cache Pattern

```typescript
// Cache-aside: check Redis, fall back to DB, populate cache
async getOverview(accountId: string) {
  const cacheKey = `overview:${accountId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await this.computeOverview(accountId); // DB query
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
  return data;
}

// Invalidate on mutation
await redis.del(`overview:${accountId}`);
```

### Job Lock Pattern

```typescript
// Prevent duplicate cron runs
const lockKey = `lock:rent-charges:${year}-${month}`;
const acquired = await redis.set(lockKey, '1', 'EX', 3600, 'NX'); // 1 hour, only if not exists
if (!acquired) return; // already running
try {
  await this.generateCharges();
} finally {
  await redis.del(lockKey);
}
```

**Rules:**
- TTL on every `setex` call — never cache without expiry
- Invalidate related cache keys on any write operation
- Always use `NX` flag for job locks
- Never store sensitive data (tokens, passwords) in Redis

---

## jsonwebtoken + bcryptjs (Auth)

Used for custom JWT auth. Access token in httpOnly cookie. Refresh token hashed in DB.

### Token Signing

```typescript
// Access token — 15 minutes
const accessToken = jwt.sign(
  { sub: user.id, accountId: user.account_id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '15m' }
);

// Refresh token — 30 days
const refreshToken = jwt.sign(
  { sub: user.id },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: '30d' }
);
```

### Cookie Setting

```typescript
// Both tokens set as httpOnly cookies
res.cookie('access_token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/api/auth/refresh', // only sent on refresh endpoint
});
```

### Verification Middleware

```typescript
// backend/src/middleware/auth.middleware.ts
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorised' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token expired or invalid' });
  }
};
```

### Password Hashing

```typescript
// Hash on register
const hash = await bcrypt.hash(password, 12); // cost factor 12

// Verify on login
const valid = await bcrypt.compare(plaintext, storedHash);
```

**Rules:**
- Never return `password_hash` in any API response — strip in service layer before returning
- Never sign tokens with anything other than the environment variable secrets
- Refresh token stored as bcrypt hash in DB — store the plaintext only in the cookie
- On refresh: verify old refresh token, revoke it, issue new pair (rotation)

---

## Resend (Email)

Used for all outbound emails: receipts, reminders, owner statements, agent invites.

### Client Initialisation

```typescript
// backend/src/integrations/resend.ts
import { Resend } from 'resend';
export const resend = new Resend(process.env.RESEND_API_KEY!);
```

### Send Pattern

```typescript
// Always from a configured domain address
const { error } = await resend.emails.send({
  from: 'PropManager <no-reply@yourdomain.co.zw>',
  to: [tenantEmail],
  subject: `Payment Receipt — ${receiptNumber}`,
  html: receiptHtmlTemplate,
  attachments: [
    {
      filename: `${receiptNumber}.pdf`,
      content: pdfBuffer.toString('base64'),
    },
  ],
});

if (error) throw new AppError(`[ResendIntegration/send] ${error.message}`, 500);
```

**Rules:**
- Always `from` a verified domain address — never a Gmail or personal address
- Log every sent email as a `communications` record after successful send
- Never send emails synchronously in a request handler — queue or fire-and-forget with error logging
- All email HTML is generated from templates — never build HTML inline in service code

---

## PDFKit (Receipts & Statements)

Used to generate receipt PDFs and owner statement PDFs programmatically.

### Receipt Generation Pattern

```typescript
// backend/src/integrations/pdf.ts
import PDFDocument from 'pdfkit';

export async function generateReceipt(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(data.accountName, { align: 'left' });
    doc.fontSize(12).text('PAYMENT RECEIPT', { align: 'right' });
    doc.text(`Receipt #: ${data.receiptNumber}`);
    doc.text(`Date: ${format(data.paymentDate, 'dd MMM yyyy')}`);

    // Body — tenant, property, amount, method
    // ... build layout

    doc.end();
  });
}
```

**Rules:**
- Always return `Buffer` — never write to disk
- Upload returned Buffer directly to Supabase Storage
- Receipt layout must include: account name/logo, receipt number, date, tenant name, property/unit, period, amount, currency, method, reference, agent name

---

## pdf-lib (Lease Agreements)

Used for populating a lease PDF template with tenancy-specific data.

### Template Population Pattern

```typescript
import { PDFDocument } from 'pdf-lib';

export async function generateLease(templateBuffer: Buffer, data: LeaseData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const form = pdfDoc.getForm();

  // Fill form fields (lease template must have PDF form fields)
  form.getTextField('tenant_name').setText(data.tenantName);
  form.getTextField('property_address').setText(data.propertyAddress);
  form.getTextField('rent_amount').setText(formatCurrency(data.rentAmount, data.currency));
  form.getTextField('lease_start').setText(format(data.leaseStart, 'dd MMM yyyy'));
  form.getTextField('lease_end').setText(format(data.leaseEnd, 'dd MMM yyyy'));

  form.flatten(); // lock fields after population
  return Buffer.from(await pdfDoc.save());
}
```

**Rules:**
- Lease template PDF must be stored in Supabase Storage under `branding/{account_id}/lease-template.pdf`
- Always call `form.flatten()` before saving — prevents editing after generation
- Always return Buffer — never write to disk

---

## next-pwa (Workbox)

Used to enable PWA capabilities — offline support for payment recording.

### Configuration

```javascript
// next.config.mjs
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // disable in dev to avoid caching issues
})({ /* next config */ });
```

### Offline Queue (IndexedDB)

```typescript
// frontend/src/lib/offline-queue.ts
import { openDB } from 'idb';

const db = await openDB('prop-mgmt', 1, {
  upgrade(db) {
    db.createObjectStore('payment-queue', { keyPath: 'id', autoIncrement: true });
  },
});

// Queue a payment when offline
export async function queuePayment(payload: CreatePaymentDto) {
  await db.add('payment-queue', { ...payload, queuedAt: Date.now() });
}

// Process queue when back online
export async function processQueue() {
  const all = await db.getAll('payment-queue');
  for (const item of all) {
    await apiClient.post('/payments', item);
    await db.delete('payment-queue', item.id);
  }
}
```

**Rules:**
- PWA is disabled in development — always test offline behaviour in production build
- Only payment recording is queued offline — all other write actions require connection
- Queue processes automatically on `online` event — no manual trigger needed
- If a queued payment fails to sync, keep it in queue and retry — never silently discard

---

## node-cron (Scheduled Jobs)

Used for rent charge generation and automated reminder sending.

### Job Registration

```typescript
// backend/src/jobs/index.ts
import cron from 'node-cron';
import { rentChargeJob } from './rent-charge.job';
import { reminderJob } from './reminder.job';

// Run at 00:01 every day
cron.schedule('1 0 * * *', rentChargeJob);

// Run at 07:00 every day
cron.schedule('0 7 * * *', reminderJob);
```

**Rules:**
- Every job must acquire a Redis lock before running — release in finally block
- Jobs call service layer only — no direct DB access in job files
- Log job start, completion, and any errors with `[JobName]` prefix
- Test jobs with a manual trigger endpoint (admin only, not exposed in production)

---

## Zod (Validation)

Used on the backend to validate all request bodies before processing.

### Schema Pattern

```typescript
// Define schemas co-located with the route/controller
const CreatePaymentSchema = z.object({
  tenancyId: z.string().uuid(),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2020).max(2100),
  amountPaid: z.number().positive(),
  currency: z.enum(['ZiG', 'USD']),
  zigUsdRate: z.number().positive().optional(), // required if currency is ZiG
  method: z.enum(['cash', 'ecocash', 'bank_transfer', 'rtgs', 'other']),
  reference: z.string().optional(),
  paymentDate: z.string().date(), // ISO date string
});

// In controller
const body = CreatePaymentSchema.parse(req.body); // throws ZodError if invalid
```

### Global Error Handler for Zod

```typescript
// Return 400 with field-level errors on ZodError
if (err instanceof ZodError) {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    fields: err.flatten().fieldErrors,
  });
}
```

**Rules:**
- Every POST and PATCH route must have a Zod schema — no unvalidated inputs ever reach the service
- Use `.parse()` not `.safeParse()` in controllers — let the global error handler catch ZodErrors
- Frontend forms use React Hook Form with Zod resolver for matching client-side validation
