<!-- Code standards: rules the agent must follow when writing code for this project -->

# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

- Think before implementing — understand what is being built and why before writing a single line
- Scope is sacred — only build what the current feature requires; do not add unrequested functionality
- Clean over clever — simple, readable code is always preferred over elegant one-liners
- One thing at a time — complete one feature fully (UI + API wired) before touching the next
- Read architecture.md before any implementation decision — if it is documented there, follow it without debate

---

## Language & Type Safety

- TypeScript strict mode enabled on both frontend and backend — no exceptions
- Never use `any` — use `unknown` and narrow the type, or define a proper interface
- All function parameters and return types must be explicitly typed
- Use `const` by default — only use `let` when reassignment is necessary
- Never use non-null assertion (`!`) unless the value is genuinely guaranteed — add a guard instead
- Zod used for all request body validation on the backend — parse before processing

---

## File and Folder Naming

- Folders: kebab-case
- React component files: PascalCase (e.g. `PaymentForm.tsx`)
- Utility and hook files: camelCase (e.g. `usePayments.ts`, `formatCurrency.ts`)
- Route files follow Next.js App Router convention: `page.tsx`, `layout.tsx`, `loading.tsx`
- One component per file — no barrel files that re-export multiple components
- Backend route files: `[domain].routes.ts`, controller files: `[domain].controller.ts`, service files: `[domain].service.ts`

---

## Component Structure (Frontend)

```typescript
// 1. Imports — React, then third-party, then internal
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePayments } from '@/hooks/usePayments';
import type { Payment } from '@/types';

// 2. Types local to this file
interface PaymentCardProps {
  payment: Payment;
  onAction: (id: string) => void;
}

// 3. Component
export function PaymentCard({ payment, onAction }: PaymentCardProps) {
  // hooks first
  // derived state / handlers
  // return JSX
}

// 4. No default exports for components — named exports only
```

- No inline styles — all styling via Tailwind classes using tokens from ui-tokens.md
- No business logic inside UI components — components render data, call handlers
- No direct API calls in components — always via a hook

---

## API / Backend Conventions

```typescript
// Route file — thin, routes only
router.post('/payments', authenticate, authorize('junior_agent'), paymentController.create);

// Controller — validate, call service, respond
async create(req: AuthRequest, res: Response) {
  const body = CreatePaymentSchema.parse(req.body); // throws if invalid
  const payment = await paymentService.create(body, req.user);
  res.status(201).json({ success: true, data: payment });
}

// Service — all business logic, all DB access
async create(data: CreatePaymentDto, user: TokenPayload): Promise<Payment> {
  // business logic here
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({ ...data, account_id: user.accountId })
    .select()
    .single();
  if (error) throw new AppError('Failed to create payment', 500);
  return payment;
}
```

- Every route requires `authenticate` middleware — no unprotected routes except public auth and application endpoints
- Always return `{ success: true, data }` or `{ success: false, error: string }`
- Never expose raw error messages, stack traces, or DB errors to the client
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request (validation), 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

---

## Database

- Never query the DB directly from a controller — always through a service
- Every query must include `.eq('account_id', user.accountId)` — no exceptions
- Use Supabase transactions (`rpc`) for operations that touch more than one table
- Never soft-delete with a `deleted` flag unless architecture.md specifies it — prefer status fields
- Trust transactions are append-only — never UPDATE or DELETE a `trust_transactions` row
- Receipt numbers are generated via a DB sequence function — never application-level counters

---

## Error Handling

- Never use empty catch blocks — always log or handle the error
- Use a typed `AppError` class with status code and message — throw from services, catch in a global Express error handler
- User-facing error messages must be human readable — "Payment could not be recorded" not "PGRST116"
- Log errors with a context prefix: `[PaymentService/create]`
- Frontend: api-client.ts catches errors and returns `{ success: false, error: string }` — components show a toast, never a raw error

---

## Currency Handling

- All amounts stored as `numeric(12,2)` in the DB — never floats or strings
- All currency display goes through a shared `formatCurrency(amount, currency)` utility — never format inline
- ZiG/USD rate is captured at payment time and stored on the payment record — never recalculate after the fact
- Display currency symbol: ZiG prefix "ZiG ", USD prefix "$"

---

## Environment Variables

| Variable                      | Used In                                    |
| ----------------------------- | ------------------------------------------ |
| `SUPABASE_URL`                | backend/src/db/client.ts                   |
| `SUPABASE_SERVICE_ROLE_KEY`   | backend/src/db/client.ts (never frontend)  |
| `SUPABASE_ANON_KEY`           | frontend (public — read-only storage URLs) |
| `REDIS_URL`                   | backend/src/db/redis.ts                    |
| `JWT_SECRET`                  | backend/src/middleware/auth.middleware.ts   |
| `JWT_REFRESH_SECRET`          | backend/src/services/auth.service.ts       |
| `RESEND_API_KEY`              | backend/src/integrations/resend.ts         |
| `NEXT_PUBLIC_API_URL`         | frontend/src/lib/api-client.ts             |
| `NEXT_PUBLIC_APP_URL`         | frontend — for generating application links|

---

## Comments

- No comments explaining what the code does — code must be self-explanatory through naming
- Comments only for why — explaining a non-obvious business rule or constraint
- Example of acceptable comment: `// ZiG rate is locked at payment time — never recalculate after recording`
- Example of unacceptable comment: `// Loop through payments and add to total`

---

## Dependencies

Approved dependencies — frontend:

- `next` — framework
- `react`, `react-dom` — UI
- `tailwindcss` — styling
- `shadcn/ui` primitives — component library (via components.json)
- `next-pwa` — PWA / service worker
- `zustand` — UI state management
- `zod` — form validation (frontend)
- `idb` — IndexedDB wrapper for offline queue

Approved dependencies — backend:

- `express` — HTTP server
- `@supabase/supabase-js` — DB and storage client
- `ioredis` — Redis client
- `jsonwebtoken` — JWT signing and verification
- `bcryptjs` — password hashing
- `zod` — request body validation
- `resend` — email sending
- `pdfkit` — PDF generation (receipts, statements)
- `pdf-lib` — PDF generation (lease agreements from template)
- `node-cron` — scheduled jobs

Do not install any other packages without adding them to this list first and confirming with the developer.
