ALTER TABLE "tenancies" ADD COLUMN "arrears_tracking_start" DATE;

-- One-time backfill: every currently-active tenancy in this account was
-- created by the rental_2026.xlsx migration (this is the account's first
-- real data), so its automatic arrears calculation is currently counting
-- from each tenant's real historical lease_start with incomplete payment
-- history behind it - producing a false balance. Reset the counting
-- baseline to today for all of them; any genuine back-rent gets applied
-- afterwards via the existing "Add to arrears" action on the Arrears page.
--
-- This blanket backfill is safe ONLY because this account has no
-- tenancies from any other source yet. If you ever re-run a migration
-- into an account that also has organically-created tenancies with real
-- accruing arrears, do NOT re-run a blanket UPDATE like this - it would
-- incorrectly zero those out too.
UPDATE "tenancies" SET "arrears_tracking_start" = CURRENT_DATE
WHERE "status" = 'active' AND "arrears_tracking_start" IS NULL;
