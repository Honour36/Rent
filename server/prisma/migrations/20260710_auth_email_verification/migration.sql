-- Email verification & password reset fields for users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "email_verified"       BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "verification_token"   TEXT,
  ADD COLUMN IF NOT EXISTS "token_expires_at"     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "password_reset_token" TEXT,
  ADD COLUMN IF NOT EXISTS "reset_expires_at"     TIMESTAMPTZ;
