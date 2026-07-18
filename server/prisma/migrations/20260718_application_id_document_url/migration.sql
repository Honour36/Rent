-- The applicant's ID document was previously being uploaded (when it
-- succeeded at all) and its storage path smuggled into form_data as a plain
-- text line inside additionalNotes ("ID document uploaded: <path>"), so
-- there was no reliable way to fetch and display it on the vetting page or
-- exclude it from a clean applicant-facing PDF. Give it a real column.
ALTER TABLE "applications" ADD COLUMN "id_document_url" TEXT;
