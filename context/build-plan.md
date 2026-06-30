<!-- Build plan: features broken into phases with clear done criteria -->

# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases. Backend and frontend are developed in tandem per feature — a feature is not done until both the UI and the API behind it are wired together.

---

## Phase 1 — Foundation

### 01 Project Scaffolding

Set up the monorepo, install dependencies, configure environments.

**UI:**
- Clone and configure next-shadcn-admin-dashboard template as the frontend base
- Replace sidebar items with property management navigation (see sidebar-items.ts plan in ui-registry.md)
- Confirm template renders correctly with no broken imports

**Logic:**
- Initialise Express API with TypeScript, folder structure per architecture.md
- Configure Supabase client (service role, backend only)
- Configure Redis client
- Set up environment variable files (.env.local for frontend, .env for backend)
- Run DB migrations: create all tables per schema in architecture.md

---

### 02 Auth — Register & Login

Custom JWT auth — no third-party provider.

**UI:**
- Register page: account name, user full name, email, password, role (admin only on first register)
- Login page: email + password, error states
- Auth redirects: post-login → /dashboard/overview, unauthenticated → /login

**Logic:**
- `POST /api/auth/register` — creates account + first admin user, returns access + refresh tokens as httpOnly cookies
- `POST /api/auth/login` — verifies credentials, issues tokens
- `POST /api/auth/refresh` — validates refresh token, rotates it, issues new access token
- `POST /api/auth/logout` — revokes refresh token, clears cookies
- auth.middleware.ts — verify access token on every protected route, attach user to req
- role.middleware.ts — RBAC factory for admin / senior_agent / junior_agent
- Frontend: api-client.ts wrapper that auto-retries with refresh on 401

---

## Phase 2 — Property & Tenant Core

### 03 Properties & Units — UI

Full property management UI with mock data.

**UI:**
- /dashboard/properties — property list: address, owner name, total units, vacancy count, status badges
- /dashboard/properties/[id] — property detail: unit grid (each unit shows status, tenant name, rent, next due date)
- Add Property modal: name, address, suburb, city, type, owner selector
- Add Unit modal: unit number, bedrooms, bathrooms, rent amount, currency
- Unit status badges: Occupied (green) / Vacant (amber) / Maintenance (red)

---

### 04 Properties & Units — Logic

Wire property UI to real API.

**Logic:**
- `GET /api/properties` — list all properties for account, include unit counts and vacancy count
- `POST /api/properties` — create property
- `GET /api/properties/:id` — single property with units and current tenancy per unit
- `POST /api/units` — create unit
- `PATCH /api/units/:id` — update unit details or status

---

### 05 Owners — UI + Logic

Owner profiles for property management companies.

**UI:**
- /dashboard/owners — owner list: name, email, property count, bank details status
- /dashboard/owners/[id] — owner detail: properties under management, statements history, bank details
- Add Owner modal: name, email, phone, bank details, diaspora toggle

**Logic:**
- `GET /api/owners`, `POST /api/owners`, `GET /api/owners/:id`, `PATCH /api/owners/:id`
- Owner selector populated in Add Property modal

---

### 06 Tenants — UI + Logic

Tenant profiles and history.

**UI:**
- /dashboard/tenants — tenant list: name, phone, current property/unit, tenancy status, arrears badge
- /dashboard/tenants/[id] — tenant profile: personal details, current lease summary, payment history table, communication log

**Logic:**
- `GET /api/tenants` — list with current tenancy and arrears status joined
- `GET /api/tenants/:id` — full profile with payment history and communication log

---

## Phase 3 — Applications & Onboarding

### 07 Tenant Application Form (Public)

No login required — accessed via shareable link.

**UI:**
- /application/[token] — multi-step form: personal details, employment, rental history, references, document upload
- Success screen after submission
- Mobile-first layout (tenants fill this on their phones)

**Logic:**
- `GET /api/applications/public/:token` — return unit info to pre-fill form header (no auth)
- `POST /api/applications/public/:token` — accept form submission, upload docs to Supabase Storage
- `POST /api/applications/generate-link` — generate unique token for a unit, return shareable URL (authenticated — agent only)

---

### 08 Application Vetting & Workflow

Agents review and action incoming applications.

**UI:**
- /dashboard/applications — application queue: applicant name, property/unit, submitted date, status badge
- /dashboard/applications/[id] — vetting view: form data, document downloads, vetting checklist, action buttons (Approve / Reject / Request More Info), notes field

**Logic:**
- `GET /api/applications` — list for account with status filter
- `GET /api/applications/:id` — full application detail
- `PATCH /api/applications/:id/status` — update status, record reviewer and timestamp
- On Approve: create tenant record from application data, create tenancy record with status 'pending_deposit'

---

### 09 Lease & Move-In Activation

Complete the onboarding after approval.

**UI:**
- Lease details form (rent amount, deposit, start date, due day) — appears after approval
- Upload signed lease button
- Move-in activation button — confirms tenancy goes active

**Logic:**
- pdf-lib generates lease PDF from template populated with tenancy data
- `POST /api/tenancies` — create tenancy, upload generated lease to Supabase Storage
- `PATCH /api/tenancies/:id/activate` — sets status to 'active', sets unit status to 'occupied'
- Trust transaction created for deposit received

---

## Phase 4 — Payments & Receipts

### 10 Payment Recording — UI + Logic

Core daily workflow for agents.

**UI:**
- /dashboard/payments — payment list with period, tenant, property, amount, method, status filters
- /dashboard/payments/new — payment recording form: tenancy selector (search by tenant name or property), period (month/year), amount, currency, ZiG/USD rate field (if ZiG), method, reference, date

**Logic:**
- `GET /api/payments` — list with filters (period, status, property, tenant)
- `POST /api/payments` — record payment, auto-assign status (paid / partial / late / unpaid based on amount vs rent due and date vs due date)
- Auto-generate receipt record + sequential receipt number on every payment POST

---

### 11 Receipt Generation & Dispatch

**UI:**
- /dashboard/receipts/[id] — receipt preview (matches PDF layout)
- WhatsApp button — opens `wa.me/[tenant_phone]?text=[encoded message with receipt link]`
- Email button — triggers receipt email via Resend, logs communication

**Logic:**
- PDFKit generates receipt PDF on payment record creation
- PDF uploaded to Supabase Storage, signed URL stored on receipt record
- `POST /api/receipts/:id/send` — accepts channel (whatsapp / email), logs communication entry
- Resend email with receipt PDF attached

---

### 12 Automated Rent Reminders

**Logic:**
- Scheduled job: runs daily at 07:00
- Finds all active tenancies with a charge due in 5 days — sends reminder email via Resend
- Finds all active tenancies with a charge due tomorrow — sends final reminder
- Communication log entries created for each reminder sent
- Redis lock prevents duplicate sends if job runs more than once

---

## Phase 5 — Communications & Maintenance

### 13 Communication Centre

Compose and log all tenant communications from one place.

**UI:**
- /dashboard/communications — full communication log: tenant, channel, message preview, date, sent by
- Compose panel (drawer or modal): tenant selector, channel toggle (WhatsApp / Email), subject (email only), message body with template variable insertion, template selector
- WhatsApp compose — generates wa.me link, opens in new tab
- Email compose — sends via Resend, logs immediately

**Logic:**
- `GET /api/communications` — log for account with tenant and channel filters
- `POST /api/communications` — log entry (called on every send)
- `GET /api/templates` — message templates for account
- `PATCH /api/templates/:id` — update template content

---

### 14 Maintenance Requests

**UI:**
- /dashboard/maintenance — request list: property/unit, title, priority badge, status badge, logged date
- /dashboard/maintenance/[id] — request detail: description, priority, status controls, cost field (for owner statement deduction), activity log
- Log Request button — quick form from any unit detail page

**Logic:**
- `GET /api/maintenance` — list with filters (status, priority, property)
- `POST /api/maintenance` — create request
- `PATCH /api/maintenance/:id` — update status, cost, resolution notes

---

## Phase 6 — Reports & Owner Statements

### 15 Owner Statement Generation

**UI:**
- /dashboard/reports/owner-statement — owner selector, month/year picker, generate button
- Statement preview: rent due vs collected, management fee, maintenance deductions, trust balance, net payable
- Approve & Dispatch button

**Logic:**
- `POST /api/reports/owner-statement/generate` — calculates all figures from payments, maintenance costs, management fee; generates PDF via PDFKit; stores in Supabase Storage
- `POST /api/reports/owner-statement/:id/approve` — sets status to approved, records approver
- `POST /api/reports/owner-statement/:id/dispatch` — sends to owner via Resend, sets status to dispatched

---

### 16 Reports Hub

**UI:**
- /dashboard/reports — reports index: Arrears Report, Vacancy Report, Lease Expiry Report, Collection Rate, Maintenance Report, Trust Account Ledger
- Each report: filter controls, data table, Export PDF button

**Logic:**
- `GET /api/reports/arrears` — tenancies with outstanding balances
- `GET /api/reports/vacancy` — vacant units with vacancy duration
- `GET /api/reports/lease-expiry` — tenancies expiring within 30 / 60 / 90 days
- `GET /api/reports/collection-rate` — monthly collection % for account or property
- `GET /api/reports/maintenance` — costs and resolution times
- `GET /api/reports/trust-ledger` — trust transactions by owner

---

## Phase 7 — Overview Dashboard & PWA

### 17 Overview Dashboard

The main landing page after login — portfolio at a glance.

**UI:**
- /dashboard/overview — KPI cards: Total Units, Occupied, Vacant, Arrears (count + amount), Collection Rate (current month)
- Area chart: rent collected vs rent due for last 6 months
- Arrears table: tenants with outstanding balances, days overdue
- Lease expiry alerts: leases ending in 30 days
- Maintenance alerts: open high/emergency requests
- Recent payments list

**Logic:**
- `GET /api/dashboard/overview` — single endpoint aggregating all overview data for account (cached in Redis, 5 min TTL)

---

### 18 PWA — Offline Payment Recording

**Logic:**
- next-pwa (Workbox) configured in next.config.mjs
- Service worker caches app shell and static assets
- offline-queue.ts: IndexedDB-backed queue — payment form POSTs go here when offline
- On reconnect: service worker fires background sync, queue processes via api-client.ts
- UI shows "Offline — payment queued" indicator when recording offline
- Successful sync clears queue and refreshes payment list

---

## Phase 8 — Agents & Settings

### 19 Agent Management

**UI:**
- /dashboard/agents — agent list: name, email, role, status (active/inactive), last login
- Invite Agent button — sends invite email via Resend with one-time setup link
- Edit role / deactivate controls (admin only)

**Logic:**
- `GET /api/agents`, `POST /api/agents/invite`, `PATCH /api/agents/:id`
- Invite flow: generate one-time token, send email, agent sets password on first login

---

### 20 Settings

**UI:**
- /dashboard/settings — tabs: Account (name, logo upload), Subscription (tier, limits), Templates (message templates editor), Branding

**Logic:**
- `GET/PATCH /api/settings` — account-level settings
- Logo upload to Supabase Storage branding bucket
- Template CRUD

---

## Feature Count

| Phase | Name                         | Features |
| ----- | ---------------------------- | -------- |
| 1     | Foundation                   | 2        |
| 2     | Property & Tenant Core       | 4        |
| 3     | Applications & Onboarding    | 3        |
| 4     | Payments & Receipts          | 3        |
| 5     | Communications & Maintenance | 2        |
| 6     | Reports & Owner Statements   | 2        |
| 7     | Overview Dashboard & PWA     | 2        |
| 8     | Agents & Settings            | 2        |
| **Total** |                         | **20**   |
