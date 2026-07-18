-- Notifications (per context/notifications.md, Phase 1: in-app) and the
-- rent-collection scheduling flow: after a payment is recorded, the owner is
-- linked to a one-time page to choose when they'll collect the rent; once
-- they submit, the link is spent and the agent is notified in-app.

CREATE TABLE "notifications" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"  UUID NOT NULL REFERENCES "accounts"("id"),
  "user_id"     UUID REFERENCES "users"("id"),
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "body"        TEXT NOT NULL,
  "entity_type" TEXT,
  "entity_id"   UUID,
  "is_read"     BOOLEAN NOT NULL DEFAULT false,
  "read_at"     TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "notifications_account_id_is_read_idx" ON "notifications"("account_id", "is_read");
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

CREATE TABLE "rent_collection_requests" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"    UUID NOT NULL REFERENCES "accounts"("id"),
  "payment_id"    UUID NOT NULL UNIQUE REFERENCES "payments"("id"),
  "owner_id"      UUID NOT NULL REFERENCES "owners"("id"),
  "token"         TEXT NOT NULL UNIQUE,
  "status"        TEXT NOT NULL DEFAULT 'pending',
  "scheduled_for" TIMESTAMPTZ,
  "notes"         TEXT,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "responded_at"  TIMESTAMPTZ
);
