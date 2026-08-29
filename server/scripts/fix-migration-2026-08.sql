-- ============================================================================
-- ONE-TIME correction script for the rental_2026.xlsx migration.
-- Run this directly against production (psql, Render's DB console, etc.)
--
-- Covers:
--   A) 15 properties wrongly left vacant by the old trailing-blank rule
--   B) Address typo fix (19642 -> 19122) + 2 reactivations with real receipt data
--   C) 2 new tenants moving into already-known units
--   F) An extra payment on an existing tenancy (Mupfure Court C011)
--
-- NOT covered here (needs real Owner records - use the app's Add Property/
-- Add Tenant screens instead, safer than guessing an owner in raw SQL):
--   Mrs Karonga (Budiriro Shop 13), Theosar Trust (Flat H Prospect),
--   Rumbidzai Sadziwa (Flat 12 Ruwa Gardens), Lorencia Pagiwa (Ruwa Gardens),
--   13 highrise Westgate, 6400 Unit J Chitungwiza.
--
-- Every INSERT here is guarded with "WHERE NOT EXISTS" so this is safe to
-- run more than once - it will not create duplicates on a second run.
--
-- POSTMORTEM (2026-08-25): "Assumes a single account" (below) was WRONG -
-- this database has 14 accounts, not 1. `(SELECT id FROM accounts LIMIT 1)`
-- resolved to an unrelated account, silently placing every backfilled
-- tenancy/payment there instead of Sermony Properties. See the same note
-- in fix-migration-2026-08-batch2.sql for the full lesson and the recovery
-- query used to move the data to the right account after the fact.
-- Assumes a single account in this database (true for this project so far).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- A) 15 properties wrongly marked vacant by the old trailing-blank rule.
-- ----------------------------------------------------------------------------

-- --- 131 Aspire Heights -> Mr Banwa, $550, Jan 2026 -------------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '131 Aspire Heights' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr Banwa', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Banwa')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Banwa'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 550, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 1361 Njiva Close Houghton Park -> Mr I Mateyu, $700, Jan 2026 ---------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '1361 Njiva Close Houghton Park' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, phone, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr I Mateyu', '0716165908', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr I Mateyu')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr I Mateyu'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 700, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 1424 Mainway Meadows -> Mr T. Chibanda, $280, Jan 2026 ----------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '1424 Mainway Meadows' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr T. Chibanda', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr T. Chibanda')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr T. Chibanda'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 280, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 21568 Budiriro Cabs 2 -> Mr S. Mputa, $250, Jan 2026 ------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '21568 Budiriro Cabs 2' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr S. Mputa', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr S. Mputa')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr S. Mputa'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 250, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 61 Chiremba Road Cranborne -> Decade Africa, $1200, Jan 2026 ----------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '61 Chiremba Road Cranborne%' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Decade Africa', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Decade Africa')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Decade Africa'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 1200, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 6 Alnick Way, Marlborough cluster 1 -> Mr Mutemi, $700, Jan 2026 ------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '6 Alnick Way, Marlborough cluster 1' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr Mutemi', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Mutemi')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Mutemi'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 700, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 73 Ruwa Waterfalls -> Li Jingzhong, $800, Jan 2026 --------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '73 Ruwa Waterfalls' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Li Jingzhong', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Li Jingzhong')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Li Jingzhong'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 800, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 9147 Unit K Chitungwiza -> P Chitiga, $180, Jan 2026 ------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '9147 Unit K Chitungwiza' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, phone, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'P Chitiga', '772767858', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'P Chitiga')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'P Chitiga'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 180, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- C209 Mupfure Court -> Jacqueline Murombedzi, $500, Jan 2026 ----------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'C209 Mupfure Court' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, phone, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Jacqueline Murombedzi', '788720356', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Jacqueline Murombedzi')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Jacqueline Murombedzi'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 500, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- Flat 6 Ridgeview Belvedere -> Kevin Lunga, $200, Jan 2026 ------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Flat 6 Ridgeview Belvedere' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Kevin Lunga', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Kevin Lunga')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Kevin Lunga'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 200, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- Plot 10 Mandalay Park -> Cadwell, $1100, Jan 2026 ---------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Plot 10 Mandalay Park' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Cadwell', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Cadwell')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Cadwell'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 1100, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 6 Kennedine -> Richard Nhau, $350, Jan 2026 ---------------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '6 Kennedine' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Richard Nhau', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Richard Nhau')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Richard Nhau'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 350, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- Gudza Butchery -> Mr Madziwa, $500, Feb 2026 --------------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Gudza Butchery' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr Madziwa', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Madziwa')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Madziwa'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-02-01', 500, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- --- 11 Kennedine Court -> Ms Patrah, $400, Jan 2026 -----------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '11 Kennedine Court' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Ms Patrah', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Ms Patrah')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Ms Patrah'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-01-01', 400, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

-- Receipt #5865 - $50 deposit balance for this same tenancy (Ms Patrah)
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 7, 2026, 50, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-18', 'Receipt #5865 - deposit balance', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '11 Kennedine Court' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5865 - deposit balance');

-- --- Budiriroshop2 -> Zikumva, $120, Apr 2026 ------------------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Budiriroshop2' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Zikumva', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Zikumva')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Zikumva'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-04-01', 120, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);


-- ----------------------------------------------------------------------------
-- B) Address typo fix + 2 reactivations with real receipt data
-- ----------------------------------------------------------------------------

UPDATE properties
SET address = 'Stand 19122 Ridgeview Belvedere', name = 'Stand 19122 Ridgeview Belvedere'
WHERE address ILIKE '%19642%' AND account_id = (SELECT id FROM accounts LIMIT 1);

-- --- Stand 19122 Ridgeview Belvedere -> Gunda, $560, Jul 2026 --------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Stand 19122 Ridgeview Belvedere' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Gunda', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Gunda')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Gunda'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-07-01', 560, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 7, 2026, 280, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5899 - deposit balance', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Stand 19122 Ridgeview Belvedere' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5899 - deposit balance');

-- --- 21126 Unit A Chitungwiza -> Mr Chanakira, $350, Jun 2026 --------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '21126 Unit A Chitungwiza' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Mr Chanakira', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Chanakira')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Mr Chanakira'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-06-01', 350, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 350, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5925 - August rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '21126 Unit A Chitungwiza' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5925 - August rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 8, 2026, 53, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5925 - lease fee', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE '21126 Unit A Chitungwiza' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5925 - lease fee');


-- ----------------------------------------------------------------------------
-- C) New tenants moving into already-known units
-- ----------------------------------------------------------------------------

-- --- Flat No.9 Ruwa Gardens -> L Padiwa, $300, Jul 2026 --------------------
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE 'Flat No.9 Ruwa Gardens' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'L Padiwa', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'L Padiwa')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'L Padiwa'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-07-01', 300, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 7, 2026, 300, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-25', 'Receipt #5871 - rent (new tenant)', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat No.9 Ruwa Gardens' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5871 - rent (new tenant)');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 7, 2026, 50, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-25', 'Receipt #5871 - deposit', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'Flat No.9 Ruwa Gardens' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5871 - deposit');

-- --- 5584 Glen Norah B, 2nd unit (the $220 one, no existing tenant) --------
-- Name below (Ms Patience Tizen) is my best read from receipt #5887 -
-- VERIFY against the physical receipt and correct in-app if wrong.
WITH target_unit AS (
  SELECT u.id AS unit_id FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE p.address ILIKE '5584 Glen Norah B' AND p.account_id = (SELECT id FROM accounts LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'active')
  LIMIT 1
),
new_tenant AS (
  INSERT INTO tenants (id, account_id, full_name, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), 'Ms Patience Tizen', now()
  WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Ms Patience Tizen')
  AND EXISTS (SELECT 1 FROM target_unit)
  RETURNING id
),
tenant_id AS (
  SELECT id FROM new_tenant
  UNION ALL
  SELECT id FROM tenants WHERE account_id = (SELECT id FROM accounts LIMIT 1) AND full_name ILIKE 'Ms Patience Tizen'
  LIMIT 1
),
new_tenancy AS (
  INSERT INTO tenancies (id, account_id, unit_id, tenant_id, lease_start, rent_amount, currency, status, arrears_tracking_start, created_at)
  SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), target_unit.unit_id, tenant_id.id, DATE '2026-07-01', 220, 'USD', 'active', CURRENT_DATE, now()
  FROM target_unit, tenant_id
  RETURNING unit_id
)
UPDATE units SET status = 'occupied' WHERE id IN (SELECT unit_id FROM new_tenancy);

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'application_fee', 7, 2026, 10, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5887 - application fee', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Ms Patience Tizen' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5887 - application fee');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'lease_fee', 7, 2026, 35, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5887 - lease fee', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Ms Patience Tizen' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5887 - lease fee');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'deposit', 7, 2026, 30, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5887 - part deposit', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Ms Patience Tizen' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5887 - part deposit');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 7, 2026, 125, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-07-31', 'Receipt #5887 - part July rent', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Ms Patience Tizen' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5887 - part July rent');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 105, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5952 - balance of August rent', now()
FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
WHERE te.full_name ILIKE 'Ms Patience Tizen' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5952 - balance of August rent');


-- ----------------------------------------------------------------------------
-- F) C011 Mupfure Court - extra payment on Mrs Nyambo's EXISTING tenancy
-- Assumption: Abdulaziz Moffat (receipt #5918) paid on her behalf - she is
-- independently confirmed still active via receipt #5975 three days later.
-- If that assumption is wrong, delete these two payments and handle by hand.
-- ----------------------------------------------------------------------------

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 8, 2026, 350, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5918 - August rent (paid by Abdulaziz Moffat on Mrs Nyambo behalf)', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'C011 Mupfure Court' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference LIKE 'Receipt #5918%');

INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year, amount_paid, currency, method, status, recorded_by, payment_date, reference, created_at)
SELECT gen_random_uuid(), (SELECT id FROM accounts LIMIT 1), t.id, 'rent', 7, 2026, 160, 'USD', 'other', 'paid',
       (SELECT id FROM users WHERE account_id = (SELECT id FROM accounts LIMIT 1) LIMIT 1), DATE '2026-08-03', 'Receipt #5918 - balance of July rent', now()
FROM tenancies t JOIN units u ON u.id = t.unit_id JOIN properties p ON p.id = u.property_id
WHERE p.address ILIKE 'C011 Mupfure Court' AND t.status = 'active'
AND NOT EXISTS (SELECT 1 FROM payments WHERE tenancy_id = t.id AND reference = 'Receipt #5918 - balance of July rent');

COMMIT;

-- ============================================================================
-- After running, verify with:
--   SELECT p.address, t.full_name, tc.rent_amount, tc.status
--   FROM tenancies tc
--   JOIN tenants t ON t.id = tc.tenant_id
--   JOIN units u ON u.id = tc.unit_id
--   JOIN properties p ON p.id = u.property_id
--   WHERE tc.created_at > now() - interval '1 hour'
--   ORDER BY p.address;
-- ============================================================================
