-- A property can be saved before its rent amount is confirmed (e.g. new
-- listing, owner still deciding), and that amount should then be editable
-- from Edit Property. Previously rent_amount was NOT NULL, so a property
-- couldn't be saved at all without it, and once a unit existed without one,
-- nothing could patch it in - allow it to be filled in later.
ALTER TABLE "units" ALTER COLUMN "rent_amount" DROP NOT NULL;
