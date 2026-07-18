-- Inspections: move-in (baseline condition), periodic (occasional check-ins),
-- and move-out (determines deposit release vs forfeit). Completing a
-- move_out inspection is what closes the loop - deposit gets resolved and
-- the tenancy ends, freeing the unit back to vacant (see
-- tenancies.service.ts endTenancy, called from inspections.service.ts).

CREATE TABLE "inspections" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"    UUID NOT NULL REFERENCES "accounts"("id"),
  "tenancy_id"    UUID NOT NULL REFERENCES "tenancies"("id"),
  "type"          TEXT NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'scheduled',
  "scheduled_for" TIMESTAMPTZ,
  "completed_at"  TIMESTAMPTZ,
  "outcome"       TEXT,
  "notes"         TEXT,
  "conducted_by"  UUID REFERENCES "users"("id"),
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "inspections_tenancy_id_idx" ON "inspections"("tenancy_id");
CREATE INDEX "inspections_account_id_status_idx" ON "inspections"("account_id", "status");
