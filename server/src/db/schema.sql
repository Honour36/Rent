-- Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    subscription_tier TEXT,
    management_fee_pct NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owners
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bank_name TEXT,
    bank_account TEXT,
    is_diaspora BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    owner_id UUID REFERENCES owners(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    suburb TEXT,
    city TEXT,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) NOT NULL,
    account_id UUID NOT NULL,
    unit_number TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    status TEXT DEFAULT 'vacant',
    rent_amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    id_number TEXT,
    employer TEXT,
    employment_status TEXT,
    monthly_income NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    unit_id UUID REFERENCES units(id) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    applicant_name TEXT NOT NULL,
    applicant_email TEXT,
    applicant_phone TEXT,
    form_data JSONB,
    vetting_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id)
);

-- Tenancies
CREATE TABLE tenancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    unit_id UUID REFERENCES units(id) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    lease_start DATE NOT NULL,
    lease_end DATE NOT NULL,
    rent_amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL,
    deposit_amount NUMERIC(12,2),
    rent_due_day INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    lease_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    tenancy_id UUID REFERENCES tenancies(id) NOT NULL,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    amount_paid NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL,
    zig_usd_rate NUMERIC(12,4),
    method TEXT,
    reference TEXT,
    status TEXT NOT NULL,
    recorded_by UUID REFERENCES users(id),
    payment_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    payment_id UUID REFERENCES payments(id) NOT NULL,
    receipt_number TEXT NOT NULL,
    pdf_url TEXT,
    sent_via TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust Transactions
CREATE TABLE trust_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    tenancy_id UUID REFERENCES tenancies(id) NOT NULL,
    owner_id UUID REFERENCES owners(id) NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    unit_id UUID REFERENCES units(id) NOT NULL,
    tenancy_id UUID REFERENCES tenancies(id),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    cost NUMERIC(12,2),
    logged_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communications
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    channel TEXT NOT NULL,
    direction TEXT DEFAULT 'outbound',
    subject TEXT,
    body TEXT NOT NULL,
    sent_by UUID REFERENCES users(id),
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner Statements
CREATE TABLE owner_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) NOT NULL,
    owner_id UUID REFERENCES owners(id) NOT NULL,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    pdf_url TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
