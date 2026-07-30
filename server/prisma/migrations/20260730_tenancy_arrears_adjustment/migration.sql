-- Manual correction on top of the computed arrears balance. Migrated
-- spreadsheets often carry missing lease-start dates or gaps in payment
-- history, which throws off the computed months-owed calculation - this
-- lets an agent assign an arrear the computation missed, or clear one that
-- was never actually owed, without fabricating a payment record.
ALTER TABLE "tenancies" ADD COLUMN "arrears_adjustment" DECIMAL NOT NULL DEFAULT 0;
