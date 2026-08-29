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

-- POSTMORTEM (2026-08-25): this blanket CURRENT_DATE backfill was itself a
-- bug, separate from the account-scoping issue in fix-migration-2026-08*.sql.
-- Many of these tenancies actually had real payment history going back to
-- January 2026 (or earlier - some to 2024), which this migration ignored -
-- it excluded all of that real payment history from the arrears calc
-- (which only counts payments on/after arrears_tracking_start), so
-- tenants who had genuinely been paying showed as newly in arrears the
-- moment this ran. Corrected in production with:
--   UPDATE tenancies t SET arrears_tracking_start = sub.earliest_payment
--   FROM (SELECT tenancy_id, MIN(payment_date) AS earliest_payment
--         FROM payments WHERE payment_type = 'rent' GROUP BY tenancy_id) sub
--   WHERE t.id = sub.tenancy_id AND t.arrears_tracking_start IS NOT NULL
--     AND sub.earliest_payment < t.arrears_tracking_start;
-- LESSON: "reset the counting baseline to today" should have meant "today,
-- unless there's already a real payment on file older than today" - the
-- goal was to stop counting UNKNOWN pre-migration history as owed, not to
-- discard KNOWN payment history that was already correctly imported.
