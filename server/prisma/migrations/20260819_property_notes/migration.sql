-- Free-text notes on a property. Introduced so the migration importer has
-- somewhere real to put a spreadsheet's COMM (commission) column, which
-- previously had nowhere to live and was silently dropped.
ALTER TABLE "properties" ADD COLUMN "notes" TEXT;
