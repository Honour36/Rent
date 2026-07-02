<!-- Progress tracker: live build status — update this after every session -->

# Progress Tracker

**Last updated:** 2026-07-02
**Current phase:** Phase 9 — Post-Sprint Hardening
**Overall status:** ✅ All 20 Features Complete + Sprint 21 Hardening Applied

---

## In Progress
_(none)_

## Blocked
_(none)_

---

## Completed
- [x] Architecture documented (architecture.md)
- [x] Build plan defined (build-plan.md)
- [x] Code standards defined (code-standards.md)
- [x] UI rules defined (ui-rules.md)
- [x] UI tokens documented (ui-tokens.md)
- [x] Library docs written (library-docs.md)
- [x] Tech stack confirmed: Next.js + Express + Supabase + Redis + Resend + PDFKit
- [x] Phase 1 / Feature 01 — Project Scaffolding
- [x] Phase 1 / Feature 02 — Auth (Register + Login)
- [x] Phase 2 / Feature 03 — Properties & Units UI
- [x] Phase 2 / Feature 04 — Properties & Units Logic
- [x] Phase 2 / Feature 05 — Owners UI + Logic
- [x] Phase 2 / Feature 06 — Tenants UI + Logic
- [x] Phase 3 / Feature 07 — Tenant Application Form (Public)
- [x] Phase 3 / Feature 08 — Application Vetting & Workflow
- [x] Phase 3 / Feature 09 — Lease & Move-In Activation
- [x] Phase 4 / Feature 10 — Payment Recording — UI + Logic
- [x] Phase 5 / Feature 13 — Communication Centre
- [x] Phase 5 / Feature 14 — Maintenance Requests
- [x] Phase 6 / Feature 15 — Owner Statement Generation
- [x] Phase 7 / Feature 17 — Overview Dashboard
- [x] Phase 7 / Feature 18 — ~~PWA Offline~~ → **Removed** (online-only)
- [x] Phase 8 / Feature 19 — Agent Management
- [x] Phase 8 / Feature 20 — Settings
- [x] Sprint 21 — Hardening (see session notes)

---

## Known Issues
_(none outstanding)_

---

## Decisions Made

- **2026-06-27** — Auth handled manually with jsonwebtoken + bcryptjs. No third-party provider.
- **2026-06-27** — Access token stored in httpOnly cookie. Refresh token rotation enabled.
- **2026-06-27** — WhatsApp via `wa.me` URL links only — no API.
- **2026-06-27** — Email via Resend.
- **2026-06-27** — PDF generation: PDFKit for receipts/statements, pdf-lib for leases.
- **2026-06-27** — ZiG/USD exchange rate entered manually by agent.
- **2026-06-27** — Frontend based on next-shadcn-admin-dashboard template.
- **2026-06-27** — Tenants do not log in — system is agent-facing only.
- **2026-07-02** — **PWA / offline mode removed.** System is online-only. next-pwa, idb, offline-queue.ts, and OFFLINE_QUEUED logic all stripped.
- **2026-07-02** — All generated PDFs (receipts, leases, owner statements) now uploaded to Supabase Storage and served via 1-hour signed URLs.
- **2026-07-02** — Subscription tiers: Free / Starter / Growth / Professional. Tier limits enforced server-side on POST /properties, POST /owners, POST /agents/invite.

---

## Session Notes

**2026-06-27**
- Context documents fully populated. Ready to begin Phase 1.

**2026-06-27 (Sprint 6)**
- Feature 06 completed: Tenants UI + Logic

**2026-06-29 (Sprint 7)**
- Feature 07 completed: Tenant Application Form (Public)
- Feature 08 completed: Application Vetting & Workflow
- Feature 09 completed: Lease & Move-In Activation

**2026-06-29 (Sprint 8)**
- Feature 10 completed: Payment Recording — UI + Logic

**2026-06-29 (Sprint 9)**
- Feature 11 completed: Receipt Generation & Dispatch

**2026-06-29 (Sprint 12)**
- Feature 12 completed: Automated Rent Reminders

**2026-06-29 (Sprint 13)**
- Feature 13 completed: Communication Centre

**2026-06-29 (Sprint 14)**
- Feature 14 completed: Maintenance Requests

**2026-06-29 (Sprint 15)**
- Feature 15 completed: Owner Statement Generation

**2026-06-29 (Sprint 16)**
- Feature 16 completed: Reports Hub (arrears, vacancy, lease-expiry, collection-rate, maintenance, trust-ledger)

**2026-06-29 (Sprint 17 & 18)**
- Features 17 & 18 completed: Overview Dashboard & (original) PWA Offline

**2026-06-30 (Sprint 19 & 20 — Phase 8 Final)**
- Feature 19 completed: Agent Management (invite flow + accept-invite endpoint)
- Feature 20 completed: Settings (account, templates, branding, subscription view)

**2026-07-02 (Sprint 21 — Hardening)**

### 1. Offline Mode — Removed
- Stripped `@ducanh2912/next-pwa`, `idb` from `package.json`
- Deleted `client/src/lib/offline-queue.ts`
- Removed service-worker config from `next.config.mjs`
- Removed `OFFLINE_QUEUED` / `syncOfflineQueue` / `navigator.onLine` logic from `api-client.ts`
- Updated landing page marketing copy — "Real-Time Sync" replaces "PWA Offline Support"
- Updated `app-config.ts` description

### 2. `fullName` Validation Bug — Fixed
- **Root cause:** `apiClient()` only set `Content-Type: application/json` when the
  `data:` option was used. Many callers passed `body: JSON.stringify(...)` directly,
  so Express's body-parser never parsed the request body → every field arrived as
  `undefined` → Zod threw `Required` on `fullName`, `phone`, etc.
- **Fix:** `api-client.ts` now resolves body from either `data` or raw `body`,
  always sets `Content-Type: application/json` on non-GET requests that have a body.
  Affects all form POSTs: add tenant, add owner, add property, update operations.

### 3. Route Group Fixes — Pages at Wrong URLs
- The following real implementations were stranded in `app/(dashboard)/X/` (resolving
  to `/X`) instead of `app/(dashboard)/dashboard/X/` (resolving to `/dashboard/X`):
  - `/communications` → `/dashboard/communications` ✅
  - `/payments` → `/dashboard/payments` ✅
  - `/payments/new` → `/dashboard/payments/new` ✅ (also fixed double-dashboard links)
  - `/agents` → `/dashboard/agents` ✅ (more complete version with invite handling)
  - `/settings` duplicate removed (identical to dashboard version)
- Fixed `PaymentListTable` import path (`@/components/payments/PaymentListTable`)

### 4. Properties — owner/tenant relationship wired end-to-end
- `properties.service.list()` now includes `owner.{id, full_name, email}` and each
  unit's active tenancy with `tenant.{id, full_name}` via Prisma relation includes
- `properties.service.getById()` includes same, plus `tenant.{email, phone}`
- `useProperties.ts`: added `ActiveTenancy` interface; `Unit` now carries `tenancies[]`
- `properties/page.tsx`: reads `prop.owner` (singular — correct Prisma name)
- `unit-card.tsx`: shows real tenant `full_name` and `lease_start` date from active
  tenancy; removed "Tenant (ID)" and "1st of Next Month" placeholders

### 5. Supabase Storage — all documents stored in buckets, printable
- `server/src/db/storage.ts`: `uploadFile`, `getSignedUrl`, `downloadFile`, `deleteFile`
- Bucket constants: `documents`, `leases`, `receipts`, `statements`, `branding`
- `tenancies.service.ts`: lease PDF uploaded to `leases/{accountId}/{tenancyId}.pdf`
- `receipts.service.ts`: `persistReceiptPdf()`, `getReceiptSignedUrl()` — uploads and
  returns 1-hour signed URL; updates `receipt.pdf_url` with storage path
- `reports.service.ts`: statement PDF uploaded on dispatch to
  `statements/{accountId}/{ownerId}/{year}-{month}.pdf`; `getStatementSignedUrl()`
  generates or fetches signed URL
- `GET /api/receipts/:paymentId/signed-url` — new endpoint
- `GET /api/reports/owner-statement/:id/signed-url` — new endpoint
- Receipt page rewritten: fetches signed URL on load, "Print / Download" opens PDF
  in new browser tab (direct from Supabase Storage), WhatsApp + email buttons retained

### 6. Reports — dropdown navigation in sidebar
- `sidebar-items.ts`: Reports entry converted from flat link to expandable group
- 8 sub-items with correct `/dashboard/reports/*` paths:
  All Reports, Owner Statements, Arrears, Vacancy, Lease Expiry,
  Collection Rate, Maintenance, Trust Ledger

### 7. Sidebar — real logged-in user (no more hardcoded rootUser)
- `hooks/useCurrentUser.ts`: reads `access_token` cookie, base64-decodes JWT payload
  client-side, extracts `fullName`, `email`, `role`. Falls back gracefully if no token.
  Generates DiceBear initials avatar URL from real name.
- `AppSidebar`: imports `useCurrentUser`, passes real `{name, email, avatar}` to `NavUser`
- `data/users.ts` (hardcoded) still exists but no longer imported by any dashboard component

### 8. Subscription Tiers — 4 tiers
- `config/subscription-tiers.ts`: Free ($0) / Starter ($15) / Growth ($35) / Professional ($75)
  Each has: `priceUsd`, `tagline`, `limits` (properties/units/agents/owners/storageGb), `features[]`
- Settings → Subscription tab: pricing card grid (4 cards), feature lists with checkmarks,
  "Most Popular" badge on Growth, "Active" badge on current plan, limit comparison table,
  upgrade CTA (mailto: support link)
- `settings.service.ts`: `subscription_tier` validated as `z.enum(['free','starter','growth','professional'])`
- `server/src/middleware/tier.middleware.ts`: `enforceTierLimit(resource)` middleware
  — queries account tier, counts current resources, returns 403 with upgrade message if at limit
- Applied to: `POST /api/properties`, `POST /api/owners`, `POST /api/agents/invite`
