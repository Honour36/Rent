-- Deposits as a tracked entity, per the property management lifecycle:
-- deposits can be paid in full or spread over installments, and need to be
-- resolved (released or forfeited) at move-out, tied to an inspection
-- outcome (inspections are a later phase - resolution is manual for now).
--
-- Payment gets a payment_type so a deposit installment isn't run through
-- the rent-specific "is this late" logic, and doesn't count toward rent
-- arrears.

ALTER TABLE "payments" ADD COLUMN "payment_type" TEXT NOT NULL DEFAULT 'rent';

CREATE TABLE "deposits" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"        UUID NOT NULL REFERENCES "accounts"("id"),
  "tenancy_id"        UUID NOT NULL UNIQUE REFERENCES "tenancies"("id"),
  "required_amount"   DECIMAL NOT NULL,
  "currency"          TEXT NOT NULL,
  "status"            TEXT NOT NULL DEFAULT 'pending',
  "resolved_amount"   DECIMAL,
  "resolution_notes"  TEXT,
  "resolved_at"       TIMESTAMPTZ,
  "created_at"        TIMESTAMPTZ NOT NULL DEFAULT now()
);
