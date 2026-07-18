-- Levies: configured per property since terms and amounts vary a lot
-- (municipal levy, HOA/body corporate levy, etc.), each with its own
-- frequency. Payment.payment_type gains a fourth value, 'levy' (plain TEXT
-- column, no migration needed for that part - same as lease_fee before it).

CREATE TABLE "levy_charges" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"  UUID NOT NULL REFERENCES "accounts"("id"),
  "property_id" UUID NOT NULL REFERENCES "properties"("id"),
  "name"        TEXT NOT NULL,
  "amount"      DECIMAL NOT NULL,
  "currency"    TEXT NOT NULL,
  "frequency"   TEXT NOT NULL,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "notes"       TEXT,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "levy_charges_property_id_idx" ON "levy_charges"("property_id");
