<!-- Project overview: what you're building, why, and who it's for -->

# Project Overview

## About the Project

A web-based property rental management platform built specifically for the Zimbabwean market. It replaces the manual, spreadsheet-driven, and WhatsApp-dependent way most Zimbabwean property companies and self-managing owners currently operate.

---

## The Problem It Solves

Property managers and owners in Zimbabwe track rent on spreadsheets, communicate through personal WhatsApp chats with no record, write receipts by hand, and generate owner statements manually each month. This system gives them one place where everything is recorded, tracked, communicated, and reported — automatically. Before: scattered, manual, undocumented. After: one system, everything logged, nothing lost.

---

## Pages

```
/                          → Marketing / landing page
/login                     → Login page
/register                  → Account registration (company or self-managing owner)
/dashboard                 → Redirects to /dashboard/overview
/dashboard/overview        → Main dashboard — portfolio KPIs, arrears, vacancies, alerts
/dashboard/properties      → Property list — all properties and units with status
/dashboard/properties/[id] → Single property detail — units, tenancy, payments, maintenance
/dashboard/tenants         → Tenant list — all active and past tenants
/dashboard/tenants/[id]    → Single tenant profile — application, lease, payment history, comms
/dashboard/applications    → Incoming applications and vetting queue
/dashboard/applications/[id] → Single application detail and vetting checklist
/dashboard/payments        → Payment recording and receipt management
/dashboard/payments/new    → Record a new payment
/dashboard/receipts/[id]   → View / resend a specific receipt
/dashboard/communications  → Message centre — compose and log WhatsApp / email messages
/dashboard/maintenance     → Maintenance request list and tracker
/dashboard/maintenance/[id] → Single maintenance request detail
/dashboard/reports         → Reports hub — arrears, vacancy, lease expiry, collection rate
/dashboard/reports/owner-statement → Generate and approve monthly owner statements
/dashboard/owners          → Owner profiles (for property management companies)
/dashboard/owners/[id]     → Single owner profile — properties, statements, bank details
/dashboard/agents          → Agent / staff management (admin only)
/dashboard/settings        → Account settings — branding, subscription, templates
/application/[token]       → Public-facing tenant application form (no login required)
```

---

## Navigation

Sidebar navigation with two groups.

**Main**
- Overview
- Properties
- Tenants
- Applications
- Payments
- Communications
- Maintenance
- Reports

**Management**
- Owners
- Agents
- Settings

---

## Core User Flow

### Flow 1 — New Tenant Onboarding
1. Agent generates a shareable application link for a property unit
2. Agent sends link to prospective tenant via WhatsApp or email (external, not in-system)
3. Tenant opens public form at `/application/[token]` — no login required
4. Tenant fills in personal, employment, and rental history details; uploads documents
5. Submission appears in the agent's Applications queue
6. Agent works through the vetting checklist — marks each item Checked or Flagged
7. Agent clicks Approve, Reject, or Request More Information
8. If Approved: system triggers deposit invoice → agent records deposit payment → system generates lease PDF → agent uploads signed lease → agent records move-in date → tenancy activates

### Flow 2 — Monthly Rent Cycle
1. On the configured due date, the system auto-generates a rent charge for every active tenancy
2. Tenant pays via EcoCash, bank transfer, cash, or other method (outside the system)
3. Agent opens payment recording screen, finds the tenancy, records: amount, date, method, reference
4. System assigns status (Paid / Late / Part-paid / Unpaid) automatically
5. Receipt is generated immediately — agent sends to tenant via WhatsApp link or email from within the system
6. Automated reminders go out 5 days and 1 day before due date without agent action

### Flow 3 — Month-End Owner Statement
1. At month end, property manager navigates to Reports → Owner Statements
2. Selects owner and month — system generates statement (rent due, collected, management fee, maintenance deductions, arrears, trust balance)
3. Property manager reviews and clicks Approve
4. System dispatches statement to owner by email
5. Owner receives it — they do not log in

---

## Data Architecture

### Account (Company or Self-Managing Owner)
- Lives in `accounts` table in Supabase
- Created on registration
- Holds branding (logo, name), subscription tier, default management fee percentage
- All other records are scoped to an account_id — never queried without it

### Property & Unit
- Properties live in `properties` table; units in `units` table (a standalone house has one unit)
- Each unit tracks its own tenancy status, current tenant, and lease
- Vacancy counter is derived: calculated from the date the last tenancy ended

### Tenancy
- Lives in `tenancies` table — links a unit to a tenant with lease dates, rent amount, deposit amount
- One active tenancy per unit at any time
- Historical tenancies are retained — never deleted

### Payment & Receipt
- Payments live in `payments` table — linked to a tenancy and a monthly charge
- Each payment auto-generates a receipt record
- Receipts are numbered sequentially per account

### Trust Account
- Deposits are tracked separately in `trust_transactions` — never mixed with rent income
- Total trust liability for an owner is always calculable from this table

---

## Features In Scope

- Multi-role auth: Admin, Senior Agent, Junior Agent (manual JWT, no third-party provider)
- Property and unit management with status tracking and vacancy counter
- Tenant application form (public, no login) with document upload
- Vetting checklist workflow
- Onboarding sequence: deposit invoice → lease generation (PDFKit) → move-in activation
- Rent charge auto-generation on due date (scheduled job)
- Payment recording with ZiG/USD dual-currency support
- Automated receipt generation and WhatsApp/email dispatch
- Automated rent reminders (pre-due date, configurable intervals)
- Communication centre: compose WhatsApp (`wa.me` link) and email (Resend) from within system, logged against tenant
- Message templates: editable by admin, pre-populated with tenant/property data
- Maintenance request logging and status tracking
- Monthly owner statement generation, approval workflow, email dispatch (Resend)
- Reports: Arrears, Vacancy, Lease Expiry, Collection Rate, Maintenance, Trust Account Ledger
- PDF export for all reports and receipts (PDFKit / pdf-lib)
- Owner profiles with bank details and diaspora flag
- Subscription tier management (Starter / Growth / Professional / Enterprise)
- PWA with service worker — offline payment recording syncs when back online (Workbox via next-pwa)
- EACZ trust account compliance tracking

## Features Out of Scope

- Tenant portal / login — tenants never log in; all communication is outbound
- Online rent payment gateway — payments are recorded manually after the tenant pays externally
- Automated WhatsApp sending — WhatsApp opens in browser via `wa.me` link; agent sends manually
- Mobile app (iOS / Android) — web-based only, desktop/laptop browser focus
- Multi-country tax compliance — Zimbabwe only for now
- Live ZiG/USD exchange rate feed — agent enters rate manually at time of payment

---

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui — based on next-shadcn-admin-dashboard template
- **Backend:** Node.js / Express (separate API server)
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage buckets
- **Cache:** Redis
- **Auth:** Custom JWT — jsonwebtoken + bcryptjs, httpOnly cookies, refresh token rotation stored in Supabase
- **Email:** Resend
- **PDF:** PDFKit (receipts, statements) + pdf-lib (lease agreements)
- **WhatsApp:** `wa.me/[phone]?text=...` URL links (manual send by agent)
- **PWA:** next-pwa (Workbox) — offline support for payment recording

---

## Analytics Events

Not in scope for initial build.

---

## Target User

Property managers and agents at Zimbabwean property management companies, and individual self-managing owners. They are managing 10–150+ rental properties, currently doing everything in WhatsApp, Excel, and Word. They want to stop losing track of payments, stop writing receipts by hand, and stop building owner statements from scratch every month.

---

## Success Criteria

- An agent can record a payment and send a receipt to a tenant in under 60 seconds
- A property manager can generate, approve, and dispatch a monthly owner statement without leaving the system
- All rent statuses (Paid, Late, Part-paid, Unpaid) update automatically — no manual assignment
- A prospective tenant can complete and submit a rental application from a phone without logging in
- The system remains usable for payment recording during load-shedding (offline PWA)
