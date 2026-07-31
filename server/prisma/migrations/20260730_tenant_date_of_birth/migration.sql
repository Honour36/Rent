-- Add optional date_of_birth to tenants. Needed to fill the D.O.B. field
-- on the generated lease agreement (see lease-pdf.helper.ts). Nullable -
-- existing tenants and any tenant created without it just leave that
-- field blank on the printed lease, same as the paper template does.
ALTER TABLE "tenants" ADD COLUMN "date_of_birth" DATE;
