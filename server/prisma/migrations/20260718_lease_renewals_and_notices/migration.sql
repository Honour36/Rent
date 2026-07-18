-- Lease renewals: agent chooses the new lease end date (no fixed renewal
-- period) and a lease fee amount, which finally puts a real value into
-- Tenancy.lease_end - previously nothing in the codebase ever set it, so
-- the "expiring leases" report has always been empty.
--
-- Notices to vacate: covers eviction, sale of property, and tenant-
-- initiated early move-out, all with an agent-chosen vacate-by date rather
-- than a fixed notice period.
--
-- (Payment.payment_type also gains a third value, 'lease_fee', going
-- forward - it's a plain TEXT column with no DB-level constraint, so no
-- migration is needed for that part.)

CREATE TABLE "lease_renewals" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"          UUID NOT NULL REFERENCES "accounts"("id"),
  "tenancy_id"          UUID NOT NULL REFERENCES "tenancies"("id"),
  "previous_lease_end"  DATE,
  "new_lease_end"       DATE NOT NULL,
  "lease_fee_amount"    DECIMAL,
  "currency"            TEXT,
  "notes"               TEXT,
  "created_by"          UUID REFERENCES "users"("id"),
  "created_at"          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "lease_renewals_tenancy_id_idx" ON "lease_renewals"("tenancy_id");

CREATE TABLE "notices_to_vacate" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"   UUID NOT NULL REFERENCES "accounts"("id"),
  "tenancy_id"   UUID NOT NULL REFERENCES "tenancies"("id"),
  "reason"       TEXT NOT NULL,
  "notice_date"  DATE NOT NULL,
  "vacate_by"    DATE NOT NULL,
  "notes"        TEXT,
  "status"       TEXT NOT NULL DEFAULT 'active',
  "created_by"   UUID REFERENCES "users"("id"),
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "notices_to_vacate_tenancy_id_idx" ON "notices_to_vacate"("tenancy_id");
CREATE INDEX "notices_to_vacate_account_id_status_idx" ON "notices_to_vacate"("account_id", "status");
