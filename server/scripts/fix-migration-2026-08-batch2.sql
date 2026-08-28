-- ============================================================================
-- BATCH 2 - additional confirmed receipts (2026-08 migration cleanup)
-- Run AFTER fix-migration-2026-08.sql. Same rules: wrapped in one
-- transaction, every insert guarded so it's safe to re-run.
-- ============================================================================

BEGIN;

-- Helper macro pattern used throughout: find the tenancy by property address
-- (+ tenant name where a property has more than one active tenancy), insert
-- the payment only if it's not already there (guarded by a unique reference).

-- --- #5870: 28 Bauhunia Msasa Park / Mukarakate - rent $500, lease fee $75
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 500, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5870 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '28 Bauhunia Msasa Park' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5870 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 75, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5870 - lease fee', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '28 Bauhunia Msasa Park' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5870 - lease fee');

-- --- #5878: Flat 2 Coventry Mews / Ms Sharon - rent $350, deposit balance $175
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 350, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5878 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Coventry Mews' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5878 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 175, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5878 - deposit balance', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Coventry Mews' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5878 - deposit balance');

-- --- #5895: Budiriro Shop 3 / Marapira - rent $140, deposit $40
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 140, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5895 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%3%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5895 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 40, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5895 - deposit', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%3%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5895 - deposit');

-- --- #5897: 43 Greenwood Heights / N. Chindove - rent $400, lease fee $60
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 400, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5897 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '43 Greenwood Heights' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5897 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 60, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5897 - lease fee', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '43 Greenwood Heights' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5897 - lease fee');

-- --- #5901: Flat 2 Ridgeview Belvedere / Ms N. Ndlovu - rent $600, lease renewal $90
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 600, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5901 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Ridgeview Belvedere' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5901 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 90, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5901 - lease renewal', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Ridgeview Belvedere' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5901 - lease renewal');

-- --- #5902: 5584 Glen Norah B, Unit 1 / Mr Muganhu(FRONT) - rent $140
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 140, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5902 - August rent', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Mr Muganhu%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5902 - August rent');

-- --- #5905: 11 Kennedine Court / Ms Patrah - prorated rent $180, rates(levy) $25
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 180, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5905 - prorated rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '11 Kennedine Court' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5905 - prorated rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'levy', 8, 2026, 25, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5905 - rates', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '11 Kennedine Court' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5905 - rates');

-- --- #5913: Flat 7 Forestview Avondale / Nyaradzai Nyika - rent $500, levy $60
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 500, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5913 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 7 Forestview Avondale' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5913 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'levy', 8, 2026, 60, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5913 - levy', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 7 Forestview Avondale' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5913 - levy');

-- --- #5917: Flat 9 Forestview / D Banwa - rent $600, lease renewal $90
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 600, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5917 - August rent', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'D Banwa' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5917 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 90, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5917 - lease renewal', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'D Banwa' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5917 - lease renewal');

-- --- #5919: Budiriro Shop 8 / Mandiwafa - rent $190, deposit $10
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 190, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5919 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%8%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5919 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 10, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5919 - deposit', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%8%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5919 - deposit');

-- --- #5922: Budiriro Shop 7 / Chirimumimba - rent $140, deposit $20
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 140, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5922 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%7%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5922 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 20, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5922 - deposit', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%7%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5922 - deposit');

-- --- #5929: Budiriro Shop 6 / Silivani - rent $130, deposit $30
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 130, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5929 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%6%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5929 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 30, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5929 - deposit', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '%Budiriro%Shop%6%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5929 - deposit');

-- --- #5933: Flat 5 Prospect / Masukume - rent+levies $665 (combined), lease renewal $70
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 665, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5933 - August rent + levies (combined)', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 5 Prospect' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5933 - August rent + levies (combined)');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 70, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5933 - lease renewal', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 5 Prospect' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5933 - lease renewal');

-- --- #5935: Flat 2 Ruwa Gardens / Mr B Nyambo - rent $300, deposit top-up $20
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 300, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5935 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Ruwa Gardens' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5935 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 20, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5935 - deposit top-up', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Ruwa Gardens' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5935 - deposit top-up');

-- --- #5955: 544 Joshua Kambuzuma / Kanenungo - rent $150, deposit $10
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 150, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-06', 'Receipt #5955 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '544 Joshua Kambuzuma' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5955 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 10, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-06', 'Receipt #5955 - deposit', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '544 Joshua Kambuzuma' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5955 - deposit');

-- --- #5984: Flat 1 Ridgeview Belvedere - NEW TENANT Edith Mafuno, $800 rent, $800 deposit, $120 lease
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Flat 1 Ridgeview Belvedere' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Edith Mafuno', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Edith Mafuno')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Edith Mafuno'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-08-01', 800, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 800, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-11', 'Receipt #5984 - August rent (new tenant)', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Edith Mafuno' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5984 - August rent (new tenant)');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 800, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-11', 'Receipt #5984 - deposit', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Edith Mafuno' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5984 - deposit');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 120, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-11', 'Receipt #5984 - lease fee', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Edith Mafuno' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5984 - lease fee');

-- --- #5873: 8 Mukonono Mufakose / Mrs Kairiza - 3 months rent @ $220 (Aug/Sep/Oct)
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', m.month, 2026, 220, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5873 - ' || m.label || ' rent (of 3-month payment)', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id,
     (VALUES (8,'August'), (9,'September'), (10,'October')) AS m(month, label)
WHERE p.address ILIKE '8 Mukonono Mufakose' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5873 - ' || m.label || ' rent (of 3-month payment)');

-- --- #5884 (you wrote "5584" - treating as a typo for 5884, the only unresolved receipt this matches): G191A Willowvale / L K.Fombe - rent $320, levy $48
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 320, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5884 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'G191A Willowvale' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5884 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'levy', 8, 2026, 48, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5884 - levy', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'G191A Willowvale' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5884 - levy');

-- --- #5885 (you wrote "5585" - treating as a typo for 5885): Flat 3 Prospect / Mr Chiduke - rent $650, levy $15
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 650, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5885 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 3 Prospect' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5885 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'levy', 8, 2026, 15, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5885 - levy', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 3 Prospect' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5885 - levy');

-- --- #5904: C209 Mupfure Court / Jacqueline Murombedzi - rent $500 (July)
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 7, 2026, 500, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-01', 'Receipt #5904 - July rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'C209 Mupfure Court' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5904 - July rent');

-- --- #5942: Flat 2 Prospect / Mr T Chadenga - rent $650, levy $15
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 650, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-05', 'Receipt #5942 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Prospect%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5942 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'levy', 8, 2026, 15, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-05', 'Receipt #5942 - levy', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat 2 Prospect%' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5942 - levy');

-- --- #5981: 51 Belvedere Road / Mahommad - rent $800, lease fee $120 (15% of rent)
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 800, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-10', 'Receipt #5981 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '51 Belvedere Road' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5981 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 120, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-10', 'Receipt #5981 - lease fee (15% of rent)', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '51 Belvedere Road' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5981 - lease fee (15% of rent)');

-- --- #5993: 73 Ruwa Waterfalls / Li Jingzhong - rent $800, lease fee $200
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 800, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-13', 'Receipt #5993 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '73 Ruwa Waterfalls' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5993 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 200, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-13', 'Receipt #5993 - lease fee', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '73 Ruwa Waterfalls' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5993 - lease fee');

-- --- #5932: Flat 12 Ruwa Gardens - Mrs Nelson's tenancy ENDS, Rumbidzai Sadziwa (new tenant) starts
-- ASSUMPTION: Nelson's tenancy end date set to the day before Sadziwa's first
-- payment (2026-08-03), since no explicit end date was given - confirm/adjust
-- this date if you have the real one.
UPDATE tenancies SET status = 'ended', lease_end = DATE '2026-08-03'
WHERE id IN (
  SELECT t.id FROM tenancies t
  JOIN tenants te ON te.id = t.tenant_id
  JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Flat 12 Ruwa Gardens' AND te.full_name ILIKE 'Mrs Nelson' AND t.status = 'active'
);

WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Flat 12 Ruwa Gardens' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Rumbidzai Sadziwa', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Rumbidzai Sadziwa')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Rumbidzai Sadziwa'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-08-04', 300, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 300, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5932 - August rent (new tenant)', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Rumbidzai Sadziwa' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5932 - August rent (new tenant)');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 8, 2026, 100, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5932 - deposit', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Rumbidzai Sadziwa' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5932 - deposit');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 45, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5932 - lease fee', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Rumbidzai Sadziwa' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5932 - lease fee');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'application_fee', 8, 2026, 10, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-04', 'Receipt #5932 - application fee', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Rumbidzai Sadziwa' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5932 - application fee');

COMMIT;

-- ============================================================================
-- SKIPPED IN THIS BATCH (see reconciliation spreadsheet for why):
--   #5914 - deposit, amount still missing
--   #5920 - September levy, amount still missing
--   #5975 - property doesn't match either Zambezi Court unit on file - blocked
--   #5987 - explicitly held back per your request
--   #5998 - July rent, amount not restated
--   #5944 - amount known ($350 of $400, $50 owing) but property identity
--           ("17 Second Street Warren Park" vs "36/35 Warren Park") unconfirmed
--   #5996 - September rent, new tenant, name/amount/address still unconfirmed
--   #5900 - $188 gap between itemized total and stated total; tenant name
--           (Mr Banwa vs Dominic Pariwa) unconfirmed
--   New properties (Karonga, Matambanadzo/Theosar Trust, Pagiwa, 13 highrise
--   Westgate, 6400 Unit J Chitungwiza, Ms Kagulula) - still need an Owner.
-- ============================================================================
