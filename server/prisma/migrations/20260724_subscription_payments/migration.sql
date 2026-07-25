-- Paynow-backed subscription billing. Paynow's public API is
-- redirect-checkout-per-charge (no native recurring billing), so a
-- subscription here means "billed period-by-period with a renewal
-- reminder", tracked one row per charge attempt.

ALTER TABLE "accounts" ADD COLUMN "subscription_paid_until" TIMESTAMPTZ;

CREATE TABLE "subscription_payments" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"       UUID NOT NULL REFERENCES "accounts"("id"),
  "tier"             TEXT NOT NULL,
  "amount"           DECIMAL(10,2) NOT NULL,
  "currency"         TEXT NOT NULL DEFAULT 'USD',
  "reference"        TEXT NOT NULL UNIQUE,
  "paynow_reference" TEXT,
  "poll_url"         TEXT,
  "method"           TEXT NOT NULL DEFAULT 'web',
  "status"           TEXT NOT NULL DEFAULT 'created',
  "period_start"     TIMESTAMPTZ NOT NULL,
  "period_end"       TIMESTAMPTZ NOT NULL,
  "paid_at"          TIMESTAMPTZ,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "subscription_payments_account_id_idx" ON "subscription_payments"("account_id");
