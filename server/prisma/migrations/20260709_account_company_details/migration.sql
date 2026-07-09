-- AddCompanyDetailsToAccount
ALTER TABLE "accounts"
  ADD COLUMN IF NOT EXISTS "address"      TEXT,
  ADD COLUMN IF NOT EXISTS "suburb"       TEXT,
  ADD COLUMN IF NOT EXISTS "city"         TEXT,
  ADD COLUMN IF NOT EXISTS "phone"        TEXT,
  ADD COLUMN IF NOT EXISTS "email"        TEXT,
  ADD COLUMN IF NOT EXISTS "vat_number"   TEXT,
  ADD COLUMN IF NOT EXISTS "bank_name"    TEXT,
  ADD COLUMN IF NOT EXISTS "bank_account" TEXT;
