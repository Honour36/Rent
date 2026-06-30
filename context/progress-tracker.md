<!-- Progress tracker: live build status — update this after every session -->

# Progress Tracker

**Last updated:** 2026-06-30
**Current phase:** Phase 8 — COMPLETE
**Overall status:** ✅ All 20 Features Complete

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
- [x] Tech stack confirmed: Next.js + Express + Supabase + Redis + Resend + PDFKit + next-pwa
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
- [x] Phase 7 / Feature 18 — PWA - Offline Payment Recording
- [x] Phase 8 / Feature 19 — Agent Management
- [x] Phase 8 / Feature 20 — Settings

## Blocked
_(none)_

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| next-pwa has limited official support for Next.js App Router — may need workaround | Medium | Open |

---

## Decisions Made

- **2026-06-27** — Auth handled manually with jsonwebtoken + bcryptjs. No third-party provider (Clerk, Auth.js, etc.).
- **2026-06-27** — Access token stored in httpOnly cookie (not localStorage). Refresh token rotation enabled, stored hashed in Supabase.
- **2026-06-27** — WhatsApp via `wa.me` URL links only — no API. Agent sends manually from their device.
- **2026-06-27** — Email via Resend.
- **2026-06-27** — PDF generation: PDFKit for receipts and owner statements, pdf-lib for lease agreements.
- **2026-06-27** — ZiG/USD exchange rate entered manually by agent at time of payment recording — no live rate feed.
- **2026-06-27** — Full PWA with service worker (next-pwa / Workbox) and IndexedDB offline queue for payment recording.
- **2026-06-27** — Frontend based on next-shadcn-admin-dashboard template — repurposed (sidebar links + content), not redesigned.
- **2026-06-27** — Tenants do not log in — system is agent-facing only. Tenant application form is public (no auth).

---

## Session Notes

**2026-06-27**
- Context documents fully populated from architecture document and confirmed tech stack
- Template (next-shadcn-admin-dashboard) read and understood — sidebar items and page structure mapped
- Ready to begin Phase 1 scaffolding on next instruction from developer

**2026-06-27 (Sprint 6)**
- Feature 06 completed: Tenants UI + Logic
  - Enhanced tenantsService.list() to join active tenancy (unit + property) and compute hasArrears flag
  - Enhanced tenantsService.getById() to include full payment history (with receipts) and communications
  - Added useTenant(id) single-fetch hook; extended TenantListItem and TenantDetail types
  - tenants/page.tsx: Added Add Tenant dialog, enriched table with Property/Unit, Tenancy badge, Arrears badge columns
  - tenants/[id]/page.tsx: Full profile page — Personal Details, Employment, Current Lease (4-col grid), Payment History table, Communication Log table

**2026-06-29 (Sprint 7)**
- Feature 07 completed: Tenant Application Form (Public)
  - Added /application/[token] public route with 5-step mobile-first form
  - Added backend applications.service.ts with public endpoints for link generation and submission
- Feature 08 completed: Application Vetting & Workflow
  - Added /dashboard/applications for agents to review pending applications
  - Added vetting detail view /dashboard/applications/[id] with approve/reject workflow
- Feature 09 completed: Lease & Move-In Activation
  - Updated application approval logic to create Tenant and Tenancy records in a Prisma transaction
  - Created tenancies service, controller, and routes for activating a lease and generating a PDF with pdf-lib
  - Added MoveInActivationCard component to the application detail page for agent activation

**2026-06-29 (Sprint 8)**
- Feature 10 completed: Payment Recording — UI + Logic
  - Added backend payments.service.ts with list and create logic
  - Mounted /api/payments routes and added PaymentsController
  - Built frontend usePayments hook to handle API integration
  - Added /dashboard/payments for listing payments using PaymentListTable
  - Added /dashboard/payments/new for recording a new payment linked to an active tenancy

**2026-06-29 (Sprint 9)**
- Feature 11 completed: Receipt Generation & Dispatch
  - Implemented receipts.service.ts leveraging pdfkit to dynamically generate payment receipt PDFs
  - Built dispatch actions for email (Resend) and WhatsApp
  - Created a new set of API endpoints (/api/receipts) to stream PDF and trigger dispatch
  - Built frontend receipt preview page (/dashboard/receipts/[id]) to display PDF inline and execute dispatch actions

**2026-06-29 (Sprint 12)**
- Feature 12 completed: Automated Rent Reminders
  - Updated Prisma schema to make `sent_by` optional on `Communications` for automated logs.
  - Implemented `reminders.service.ts` to generate and send reminder emails via Resend and log them.
  - Built `rent-reminders.job.ts` to calculate due dates, check payment status, and lock via Redis.
  - Bootstrapped cron job in Express `index.ts`.

**2026-06-29 (Sprint 13)**
- Feature 13 completed: Communication Centre
  - Implemented `communications.service.ts` with `list()` (paginated, filterable by tenant + channel) and `compose()` (email via Resend, WhatsApp via wa.me link generation)
  - Built `communications.controller.ts` and `communications.routes.ts`; mounted at `/api/communications` in Express
  - Fixed pre-existing type error in `reminders.service.ts` (tenant.email nullability)
  - Created `useCommunications` hook for list and compose API calls
  - Built `CommunicationLogTable` component with channel badges (email/WhatsApp), sender, date
  - Built `ComposeDrawer` (Sheet-based) with tenant selector, channel toggle, subject field (email only), template insertion (3 templates), WhatsApp link display after logging
  - Created `/dashboard/communications/page.tsx` with channel filter, text search, Compose button
  - Sidebar was already configured for `/dashboard/communications`

**2026-06-29 (Sprint 14)**
- Feature 14 completed: Maintenance Requests
  - Implemented `maintenance.service.ts` with list (filterable by status/priority/property/unit), getById, create, update (status/priority/cost/description with auto resolved_at stamping)
  - Built `maintenance.controller.ts` and `maintenance.routes.ts`; mounted at `/api/maintenance` in Express
  - Created `useMaintenance` hook with listRequests, getRequest, createRequest, updateRequest
  - Built `MaintenanceListTable` — filterable by status and priority, text search, clickable rows
  - Built `LogMaintenanceDialog` — property+unit cascade selector, title, priority, description
  - Built `MaintenanceDetailCard` — inline status/priority/cost/description controls, tenant info panel, resolved_at display
  - Wired `/dashboard/maintenance/page.tsx` and `/dashboard/maintenance/[id]/page.tsx`
  - Both backend and frontend TypeScript checks pass clean

**2026-06-29 (Sprint 15)**
- Feature 15 completed: Owner Statement Generation
  - Implemented `reports.service.ts` with logic to calculate rent due, rent collected, management fee, maintenance deductions, and net payable.
  - Built `OwnerStatement` model and logic to persist statements in `draft`, `approved`, and `dispatched` statuses.
  - Implemented PDFKit-based statement generation mimicking receipt generation pattern.
  - Built Resend-based dispatch mechanism to send statements to owners.
  - Built `useReports` hook on the frontend to manage statement lifecycle.
  - Built `OwnerStatementPage` as a client component to handle statement preview, approval, and dispatch workflow.

**2026-06-29 (Sprint 16)**
- Feature 16 completed: Reports Hub
  - Expanded `reports.service.ts` and `reports.controller.ts` with 6 new data points: arrears, vacancy, lease-expiry, collection-rate, maintenance, and trust-ledger.
  - Expanded frontend `useReports` hook to consume all endpoints.
  - Created `/dashboard/reports` index page acting as a hub for the reports.
  - Created individual pages with data tables for Arrears, Vacancy, Lease Expiry, Collection Rate, Maintenance, and Trust Ledger under `/dashboard/reports/*`.

**2026-06-29 (Sprint 17 & 18)**
- Feature 17 & 18 completed: Overview Dashboard & PWA Offline Sync
  - Implemented `dashboard.service.ts` aggregating metrics with a 5-minute Redis cache.
  - Built `OverviewPage` using shadcn Cards and Recharts for a 6-month area chart.
  - Configured `@ducanh2912/next-pwa` for reliable Next.js App Router service worker support.
  - Implemented `offline-queue.ts` via `idb` to queue offline payments.
  - Re-wrote `api-client.ts` to seamlessly intercept failed POSTs to `/api/payments` and auto-sync them once connection is restored.

**2026-06-30 (Sprint 19 & 20 — Phase 8 Final)**
- Feature 19 completed: Agent Management
  - Backend `agents.service.ts`, `agents.controller.ts`, `agents.routes.ts` already built in previous session.
  - Frontend `agents/page.tsx` and `useAgents.ts` already built in previous session.
  - Added invite token acceptance flow: `AcceptInviteSchema` + `acceptInvite()` method in `auth.service.ts`.
  - Wired `acceptInvite` handler into `auth.controller.ts` and exposed `POST /api/auth/accept-invite`.
  - Updated `/register` page to detect `?token=` in URL — shows simplified agent setup form (name + password only) and calls accept-invite endpoint, consuming the one-time token and creating the agent under the correct account.
- Feature 20 completed: Settings
  - Backend `settings.service.ts`, `settings.controller.ts`, `settings.routes.ts` already built in previous session.
  - Frontend `settings/page.tsx` and `useSettings.ts` already built in previous session.
  - Full CRUD for message templates, account name/fee update, subscription view, and branding tab.
- Both backend and frontend TypeScript checks pass clean.
