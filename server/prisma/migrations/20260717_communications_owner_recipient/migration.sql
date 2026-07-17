-- Communications can now be sent to an owner as well as a tenant.
-- tenant_id becomes optional; owner_id is added as an alternative recipient.
ALTER TABLE "communications"
  ALTER COLUMN "tenant_id" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "owner_id" UUID REFERENCES "owners"("id");

-- Exactly one recipient (tenant or owner) must be set.
ALTER TABLE "communications"
  ADD CONSTRAINT IF NOT EXISTS "communications_one_recipient_chk"
  CHECK (
    ("tenant_id" IS NOT NULL AND "owner_id" IS NULL) OR
    ("tenant_id" IS NULL AND "owner_id" IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS "communications_owner_id_idx" ON "communications"("owner_id");
