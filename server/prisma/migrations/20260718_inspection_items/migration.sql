-- Inspection checklist: a list of property components (doors, lights,
-- windows, gate, plugs, etc.) that gets ticked at move-in and re-checked
-- against the same list at move-out. The manager can add/remove items,
-- tick them, or mark one "disputed" to flag disagreement about its
-- condition (e.g. found broken at move-out when it was fine at move-in).

CREATE TABLE "inspection_items" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspection_id" UUID NOT NULL REFERENCES "inspections"("id"),
  "label"         TEXT NOT NULL,
  "checked"       BOOLEAN NOT NULL DEFAULT false,
  "disputed"      BOOLEAN NOT NULL DEFAULT false,
  "notes"         TEXT,
  "sort_order"    INTEGER NOT NULL DEFAULT 0,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "inspection_items_inspection_id_idx" ON "inspection_items"("inspection_id");
