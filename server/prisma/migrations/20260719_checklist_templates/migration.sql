-- Reusable inspection checklist templates (property manager builds their
-- own list once, e.g. mirroring a standard move-in/move-out form organized
-- by room), used to populate an inspection's checklist instead of typing
-- items fresh every time. Also adds a "section" grouping to inspection
-- items themselves, so an inspection populated from a template keeps the
-- same room-by-room grouping when the manager ticks items off.

ALTER TABLE "inspection_items" ADD COLUMN "section" TEXT;

CREATE TABLE "checklist_templates" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id"  UUID NOT NULL REFERENCES "accounts"("id"),
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "checklist_template_items" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_id" UUID NOT NULL REFERENCES "checklist_templates"("id"),
  "section"     TEXT,
  "label"       TEXT NOT NULL,
  "sort_order"  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX "checklist_template_items_template_id_idx" ON "checklist_template_items"("template_id");
