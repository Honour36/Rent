-- ============================================================================
-- September 2026 rent backfill for Sermony Properties
-- ============================================================================
-- Generated from the physical receipt book photos (receipts #6001-#6132).
-- Inserts ONLY the September rent portion of each payment - not deposits,
-- levies, lease fees, council bills, or application fees, since those don't
-- affect the arrears calculation. See September_Payments.xlsx for the full
-- breakdown of every receipt (rent + everything else).
--
-- 111 receipts, totaling $50,916.00 in September rent.
--
-- 4 receipts were left out entirely because I could not find, or could not
-- read clearly enough to trust, a match in the current property/tenant data:
--   #6007 - handwriting on both name and property too unclear to match safely
--   #6013 - Mr J Kambanga, "13 Highlands" - property not found in the system
--   #6028 - Mr Maganawa, "Garnett Close Manresa Park" - Manresa Park Clusters
--           has 3 existing tenants, none named Maganawa - possibly a 4th
--           unit not yet in the system
--   #6072 - "9757 Manyame" - name on receipt unclear, property not found
-- These 4 total $2,270 and are NOT included in the total above.
--
-- HOW TO RUN THIS SAFELY:
-- 1. Run STEP 1 (the SELECT) first and read every row of the result.
--    Each receipt should show exactly ONE matched tenant/property, and it
--    should look right against the receipt number and amount next to it.
--    If any row is missing, or shows more than one match, or the matched
--    tenant/property looks wrong - STOP. Tell me which receipt numbers,
--    and I'll fix that row rather than have it run against the wrong
--    tenancy.
-- 2. Only once Step 1 looks fully correct, run STEP 2. It's wrapped in a
--    transaction and safe to run more than once - it will not create a
--    second September rent payment for a tenancy that already has one.
-- ============================================================================


-- ============================================================================
-- STEP 1 - VERIFY FIRST. Run this and check every row before Step 2.
-- ============================================================================
SELECT
  ( SELECT '6004' AS receipt_no, 100.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Murombedzi%'
      AND p.name ILIKE '%C209 Mupfure%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6008' AS receipt_no, 620.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Manyu%'
      AND p.name ILIKE '%Manresa Park%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6009' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Nyika%'
      AND p.name ILIKE '%7 Forestview%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6012' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Ahuchute/Ncanda%'
      AND p.name ILIKE '%2 Prospect%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6014' AS receipt_no, 550.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Agnesia%'
      AND p.name ILIKE '%19122 Ridgeview%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6015' AS receipt_no, 250.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Sigauke%'
      AND p.name ILIKE '%15 Kay%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6016' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Muganhu%'
      AND p.name ILIKE '%5584 Glen%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6018' AS receipt_no, 490.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chidumburu%'
      AND p.name ILIKE '%D208 Zambezi%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6019' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Sharon%'
      AND p.name ILIKE '%2 Coventry%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6020' AS receipt_no, 1200.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Newman%'
      AND p.name ILIKE '%10 Mandalay%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6021' AS receipt_no, 350.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Manyatela%'
      AND p.name ILIKE '%19 Trocadero%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6022' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Matae%'
      AND p.name ILIKE '%28 Bauhunia%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6023' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Nyashanu%'
      AND p.name ILIKE '%7 Ridgeview%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6024' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Matambanadzo%'
      AND p.name ILIKE '%4 Condegavel%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6025' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chai%'
      AND p.name ILIKE '%43 Greenwood%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6026' AS receipt_no, 590.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mutwiwa%'
      AND p.name ILIKE '%401 Mansions%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6027' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Ndlovu%'
      AND p.name ILIKE '%2 Belvedere%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6029' AS receipt_no, 350.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Marimba%'
      AND p.name ILIKE '%2 Coventry%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6030' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mtande%'
      AND p.name ILIKE '%11 Kennedine%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6032' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Zukuma%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6033' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mudiro%'
      AND p.name ILIKE '%2 Forestview%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6034' AS receipt_no, 1100.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Kawadza%'
      AND p.name ILIKE '%3 Avon%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6035' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Logistics%'
      AND p.name ILIKE '%Ruwa Industrial%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6036' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Hamandawa%'
      AND p.name ILIKE '%2508 Brass%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6037' AS receipt_no, 665.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Anitha%'
      AND p.name ILIKE '%1 Prospect%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6038' AS receipt_no, 700.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Munyaradzi%'
      AND p.name ILIKE '%Alnick Way%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6039' AS receipt_no, 210.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Murimwa%'
      AND p.name ILIKE '%Budiriro Cabs%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6040' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chiginda%'
      AND p.name ILIKE '%4.2 Marlborough%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6041' AS receipt_no, 620.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chidzamoto%'
      AND p.name ILIKE '%Manresa Park%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6042' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Marapira%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6043' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Ndlovu%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6044' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Masukwane%'
      AND p.name ILIKE '%5 Prospect%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6045' AS receipt_no, 450.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Med%'
      AND p.name ILIKE '%Tynwald%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6046' AS receipt_no, 450.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Sithole%'
      AND p.name ILIKE '%3192 Kirkman%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6047' AS receipt_no, 130.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Silivani%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6048' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Nyamweda%'
      AND p.name ILIKE '%Denzes Cotswold%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6050' AS receipt_no, 550.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mutodwa%'
      AND p.name ILIKE '%2626 Mopane%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6051' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mahice%'
      AND p.name ILIKE '%130 Mega%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6052' AS receipt_no, 300.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Coopra%'
      AND p.name ILIKE '%36/35 Warren%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6053' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mubwandarikwa%'
      AND p.name ILIKE '%34D Madokero%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6055' AS receipt_no, 550.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Manenji%'
      AND p.name ILIKE '%831 Cold%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6056' AS receipt_no, 365.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mayo%'
      AND p.name ILIKE '%1A Hamilton%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6057' AS receipt_no, 1200.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mwandanda%'
      AND p.name ILIKE '%Flat Ashwicken%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6058' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mwenyeheli%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6059' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Marima%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6060' AS receipt_no, 570.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Timm%'
      AND p.name ILIKE '%19114 New%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6061' AS receipt_no, 910.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Scarlet%'
      AND p.name ILIKE '%21 Tyran%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6062' AS receipt_no, 350.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Jehmiah%'
      AND p.name ILIKE '%17-21 Street%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6063' AS receipt_no, 350.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Tinomuda%'
      AND p.name ILIKE '%17-21 Warren%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6064' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mayaya%'
      AND p.name ILIKE '%6 Prospect%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6065' AS receipt_no, 700.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chadenga%'
      AND p.name ILIKE '%2 Prospect%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6066' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Makau%'
      AND p.name ILIKE '%6108 Ngezi%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6067' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chindeengerwa%'
      AND p.name ILIKE '%B017 Odzi%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6068' AS receipt_no, 1200.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Hope%'
      AND p.name ILIKE '%29 Pringle%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6069' AS receipt_no, 585.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Shumba%'
      AND p.name ILIKE '%231 Baobab%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6070' AS receipt_no, 190.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mandiwanga%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6071' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mutambanashe%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6073' AS receipt_no, 650.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Munyuku%'
      AND p.name ILIKE '%Flat H%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6074' AS receipt_no, 550.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Bradshaw%'
      AND p.name ILIKE '%11 Azanza%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6075' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chindaunguwa%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6076' AS receipt_no, 800.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Tajadana%'
      AND p.name ILIKE '%6 Winnipeg%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6077' AS receipt_no, 300.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Ukama%'
      AND p.name ILIKE '%71 Second%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6078' AS receipt_no, 700.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chirenga%'
      AND p.name ILIKE '%6 Alnick%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6079' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mwaturura%'
      AND p.name ILIKE '%1458 Kambuzuma%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6080' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chikaka%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6081' AS receipt_no, 340.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mhare%'
      AND p.name ILIKE '%8395 Kuwadzana%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6082' AS receipt_no, 550.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Matambanadzo%'
      AND p.name ILIKE '%12 Marlborough%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6083' AS receipt_no, 100.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Taruvinga%'
      AND p.name ILIKE '%30 Barbour%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6084' AS receipt_no, 650.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Naino%'
      AND p.name ILIKE '%1-84th Ave%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6085' AS receipt_no, 650.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chipeta%'
      AND p.name ILIKE '%4 Ridgeview%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6086' AS receipt_no, 300.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Gadzawa%'
      AND p.name ILIKE '%12 Ruwa%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6087' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Nyamweda%'
      AND p.name ILIKE '%49C Madokero%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6088' AS receipt_no, 300.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Murwa%'
      AND p.name ILIKE '%8400 Unit%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6089' AS receipt_no, 200.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mativenga%'
      AND p.name ILIKE '%131 Block%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6090' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Sunthula%'
      AND p.name ILIKE '%2725 Mainway%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6091' AS receipt_no, 160.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chirimumimba%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6092' AS receipt_no, 300.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Sadziwa%'
      AND p.name ILIKE '%12 Ruwa%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6093' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chiringa%'
      AND p.name ILIKE '%9 Marlborough%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6094' AS receipt_no, 800.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mohammed%'
      AND p.name ILIKE '%9 Belvedere%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6095' AS receipt_no, 550.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Kawanzaruwa%'
      AND p.name ILIKE '%99 Aspire%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6096' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chimundida%'
      AND p.name ILIKE '%4283 Kuwadzana%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6097' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Abdulaziz%'
      AND p.name ILIKE '%C011 Mupfure%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6098' AS receipt_no, 320.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Forbe%'
      AND p.name ILIKE '%91A Willowvale%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6099' AS receipt_no, 250.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Salon-Muparutsa%'
      AND p.name ILIKE '%B3 Phoenix%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6100' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mesa%'
      AND p.name ILIKE '%2 Vendon%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6101' AS receipt_no, 590.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Nyambo%'
      AND p.name ILIKE '%C012 Zambezi%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6102' AS receipt_no, 150.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Kanenungo%'
      AND p.name ILIKE '%544 Joshua%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6103' AS receipt_no, 150.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Nyamiso%'
      AND p.name ILIKE '%2 Ruwa%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6104' AS receipt_no, 620.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mudyiwa%'
      AND p.name ILIKE '%2725 Mainway%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6105' AS receipt_no, 120.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mukarutete%'
      AND p.name ILIKE '%28 Bauhunia%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6106' AS receipt_no, 150.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Teka%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6107' AS receipt_no, 600.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Munyuku%'
      AND p.name ILIKE '%1424 Mainway%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6108' AS receipt_no, 450.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Dudu%'
      AND p.name ILIKE '%12 Hamilton%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6109' AS receipt_no, 650.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mepasa%'
      AND p.name ILIKE '%1361 Njiva%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6111' AS receipt_no, 106.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Ukama%'
      AND p.name ILIKE '%71 Second%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6113' AS receipt_no, 140.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Karimo%'
      AND p.name ILIKE '%21568 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6114' AS receipt_no, 265.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Simba%'
      AND p.name ILIKE '%1b Mutandiri%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6115' AS receipt_no, 150.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Marima%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6116' AS receipt_no, 300.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chaga%'
      AND p.name ILIKE '%50 Willowvale%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6117' AS receipt_no, 230.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Tirivi%'
      AND p.name ILIKE '%Glen Norah%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6118' AS receipt_no, 650.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Kudzo%'
      AND p.name ILIKE '%Msasa Park%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6119' AS receipt_no, 190.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mudamombe%'
      AND p.name ILIKE '%696 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6120' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Kadangwandi%'
      AND p.name ILIKE '%5331 Nkwisi%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6124' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Mudenge%'
      AND p.name ILIKE '%3567 Mainway%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6125' AS receipt_no, 900.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Silundu%'
      AND p.name ILIKE '%2 Ridgeview%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6126' AS receipt_no, 250.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Karanga%'
      AND p.name ILIKE '%21568 Budiriro%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6127' AS receipt_no, 500.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Ludzer%'
      AND p.name ILIKE '%1 Marlborough%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6128' AS receipt_no, 400.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Muzambwa%'
      AND p.name ILIKE '%C209 Mupfure%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6130' AS receipt_no, 1200.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Africa%'
      AND p.name ILIKE '%61 Chirenka%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6131' AS receipt_no, 1000.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Incorporated%'
      AND p.name ILIKE '%73 Ruwa%'
    LIMIT 5 )
UNION ALL
  ( SELECT '6132' AS receipt_no, 280.00::numeric AS expected_amount,
           te.full_name AS matched_tenant, p.name AS matched_property, t.id AS tenancy_id, t.status AS tenancy_status,
           (SELECT count(*) FROM payments px WHERE px.tenancy_id = t.id AND px.period_month=9 AND px.period_year=2026 AND px.payment_type='rent') AS already_has_sept_rent
    FROM tenancies t
    JOIN tenants te ON t.tenant_id = te.id
    JOIN units u ON t.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    JOIN accounts a ON t.account_id = a.id
    WHERE a.email = 'sermonyproperty@gmail.com'
      AND te.full_name ILIKE '%Chibanda%'
      AND p.name ILIKE '%1424 Mainway%'
    LIMIT 5 );


-- ============================================================================
-- STEP 2 - ACTUAL INSERT. Only run after Step 1 looks correct.
-- Review the row count Supabase reports after running this, then run
-- COMMIT; or ROLLBACK; as its own next query.
-- ============================================================================
BEGIN;

-- Receipt #6004 - Mr Murombedzi / C209 Mupfure Court - $100.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       100.00, 'USD', 'cash', '6004',
       CASE WHEN 100.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-18', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Murombedzi%'
  AND p.name ILIKE '%C209 Mupfure%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6008 - Mr Manyu / Manresa Park Clusters - $620.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       620.00, 'USD', 'cash', '6008',
       CASE WHEN 620.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-26', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Manyu%'
  AND p.name ILIKE '%Manresa Park%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6009 - Ms N Nyika / Flat 7 Forestview Gardens - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6009',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-27', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Nyika%'
  AND p.name ILIKE '%7 Forestview%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6012 - Ahuchute/Ncanda(unclear) / Flat 2 Prospect - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6012',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-28', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Ahuchute/Ncanda%'
  AND p.name ILIKE '%2 Prospect%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6014 - Agnesia / 19122 Ridgeview Cottage - $550.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       550.00, 'USD', 'cash', '6014',
       CASE WHEN 550.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-28', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Agnesia%'
  AND p.name ILIKE '%19122 Ridgeview%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6015 - Mr Sigauke / 15 Kay Eddie Msasa Park - $250.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       250.00, 'USD', 'cash', '6015',
       CASE WHEN 250.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-28', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Sigauke%'
  AND p.name ILIKE '%15 Kay%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6016 - Mr Muganhu / 5584 Glen Norah B - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6016',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Muganhu%'
  AND p.name ILIKE '%5584 Glen%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6018 - Mr Chidumburu / D208 Zambezi Eastview Gardens - $490.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       490.00, 'USD', 'cash', '6018',
       CASE WHEN 490.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chidumburu%'
  AND p.name ILIKE '%D208 Zambezi%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6019 - Ms Sharon / Flat 2 Coventry Mews - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6019',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Sharon%'
  AND p.name ILIKE '%2 Coventry%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6020 - Simangaliso Newman / Plot 10 Mandalay Ruwa - $1200.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       1200.00, 'USD', 'cash', '6020',
       CASE WHEN 1200.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Newman%'
  AND p.name ILIKE '%10 Mandalay%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6021 - Mr A Manyatela / Flat 19 Trocadero Court - $350.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       350.00, 'USD', 'cash', '6021',
       CASE WHEN 350.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Manyatela%'
  AND p.name ILIKE '%19 Trocadero%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6022 - Mr Matae / 28 Bauhunia Msasa Park - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6022',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Matae%'
  AND p.name ILIKE '%28 Bauhunia%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6023 - Mrs Nyashanu / Flat 7 Ridgeview Belvedere - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6023',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-29', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Nyashanu%'
  AND p.name ILIKE '%7 Ridgeview%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6024 - Ms Matambanadzo / Flat 4 Condegavel(unclear) - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6024',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Matambanadzo%'
  AND p.name ILIKE '%4 Condegavel%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6025 - Mr Ndzvidzwe Chai(unclear) / 43 Greenwood Heights - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6025',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chai%'
  AND p.name ILIKE '%43 Greenwood%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6026 - Mr T Mutwiwa(unclear) / 401 Mansions - $590.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       590.00, 'USD', 'cash', '6026',
       CASE WHEN 590.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mutwiwa%'
  AND p.name ILIKE '%401 Mansions%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6027 - Ms N Ndlovu / Flat 2 Belvedere - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6027',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Ndlovu%'
  AND p.name ILIKE '%2 Belvedere%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6029 - Ms Tagadzwa Marimba(unclear) / Flat 2 Coventry Court - $350.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       350.00, 'USD', 'cash', '6029',
       CASE WHEN 350.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Marimba%'
  AND p.name ILIKE '%2 Coventry%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6030 - Rufaro Mtande / Flat 11 Kennedine Court - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6030',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mtande%'
  AND p.name ILIKE '%11 Kennedine%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6032 - Mercy Zukuma / 696 Budiriro Shopping Complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6032',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Zukuma%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6033 - Mr Mudiro / Flat 2 Forestview Gardens - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6033',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mudiro%'
  AND p.name ILIKE '%2 Forestview%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6034 - Ms Leona Kawadza / Flat 3 Avon Mews - $1100.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       1100.00, 'USD', 'cash', '6034',
       CASE WHEN 1100.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Kawadza%'
  AND p.name ILIKE '%3 Avon%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6035 - Petroleum Logistics / Ruwa Industrial Stand - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6035',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Logistics%'
  AND p.name ILIKE '%Ruwa Industrial%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6036 - Mr Hamandawa / 2508 Brass Crescent Aspindale - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6036',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Hamandawa%'
  AND p.name ILIKE '%2508 Brass%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6037 - Anitha / Flat 1 Prospect Clusters - $665.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       665.00, 'USD', 'cash', '6037',
       CASE WHEN 665.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Anitha%'
  AND p.name ILIKE '%1 Prospect%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6038 - Mrs Munyaradzi(unclear) / Alnick Way Marlborough - $700.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       700.00, 'USD', 'cash', '6038',
       CASE WHEN 700.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Munyaradzi%'
  AND p.name ILIKE '%Alnick Way%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6039 - Mr T Murimwa / Budiriro Cabs - $210.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       210.00, 'USD', 'cash', '6039',
       CASE WHEN 210.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Murimwa%'
  AND p.name ILIKE '%Budiriro Cabs%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6040 - Mr S Chiginda / Flat 4.2 Marlborough Oaks - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6040',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chiginda%'
  AND p.name ILIKE '%4.2 Marlborough%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6041 - Mr Chidzamoto / Manresa Park - $620.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       620.00, 'USD', 'cash', '6041',
       CASE WHEN 620.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chidzamoto%'
  AND p.name ILIKE '%Manresa Park%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6042 - S Marapira / 696 Budiriro Shopping Complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6042',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-08-31', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Marapira%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6043 - Mr Ndlovu / 696 Budiriro Shopping complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6043',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Ndlovu%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6044 - T Masukwane / Flat 5 Prospect - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6044',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Masukwane%'
  AND p.name ILIKE '%5 Prospect%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6045 - C Med(unclear) / Tynwald - $450.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       450.00, 'USD', 'cash', '6045',
       CASE WHEN 450.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Med%'
  AND p.name ILIKE '%Tynwald%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6046 - Ms Sithole / 3192 Kirkman Tynwald - $450.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       450.00, 'USD', 'cash', '6046',
       CASE WHEN 450.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Sithole%'
  AND p.name ILIKE '%3192 Kirkman%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6047 - E Silivani / 696 Budiriro - $130.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       130.00, 'USD', 'cash', '6047',
       CASE WHEN 130.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Silivani%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6048 - Ms Nyamweda / Denzes Cotswold - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6048',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-02', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Nyamweda%'
  AND p.name ILIKE '%Denzes Cotswold%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6050 - Mrs Mutodwa / 2626 Mopane - $550.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       550.00, 'USD', 'cash', '6050',
       CASE WHEN 550.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mutodwa%'
  AND p.name ILIKE '%2626 Mopane%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6051 - N Mahice / 130 Mega Watt - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6051',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-02', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mahice%'
  AND p.name ILIKE '%130 Mega%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6052 - Mr Coopra(unclear) / 36/35 Warren Park - $300.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       300.00, 'USD', 'cash', '6052',
       CASE WHEN 300.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Coopra%'
  AND p.name ILIKE '%36/35 Warren%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6053 - Ms Mubwandarikwa / 34D Madokero Mews - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6053',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mubwandarikwa%'
  AND p.name ILIKE '%34D Madokero%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6055 - Dr Manenji / 831 Cold(unclear) - $550.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       550.00, 'USD', 'cash', '6055',
       CASE WHEN 550.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-02', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Manenji%'
  AND p.name ILIKE '%831 Cold%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6056 - Mr Mayo / Flat 1A Hamilton Avenues - $365.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       365.00, 'USD', 'cash', '6056',
       CASE WHEN 365.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mayo%'
  AND p.name ILIKE '%1A Hamilton%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6057 - Mr Mwandanda / Flat Ashwicken - $1200.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       1200.00, 'USD', 'cash', '6057',
       CASE WHEN 1200.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mwandanda%'
  AND p.name ILIKE '%Flat Ashwicken%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6058 - Ms Mwenyeheli / 696 Budiriro Shopping complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6058',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-02', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mwenyeheli%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6059 - A Marima / 696 Budiriro complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6059',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Marima%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6060 - Mr Timm / 19114 New Ridgeview Cottage - $570.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       570.00, 'USD', 'cash', '6060',
       CASE WHEN 570.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Timm%'
  AND p.name ILIKE '%19114 New%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6061 - Scarlet / 21 Tyran Mews - $910.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       910.00, 'USD', 'cash', '6061',
       CASE WHEN 910.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Scarlet%'
  AND p.name ILIKE '%21 Tyran%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6062 - Jehmiah(unclear) / 17-21 Street Warren Park - $350.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       350.00, 'USD', 'cash', '6062',
       CASE WHEN 350.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Jehmiah%'
  AND p.name ILIKE '%17-21 Street%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6063 - Tinomuda(unclear) / 17-21 Warren Park - $350.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       350.00, 'USD', 'cash', '6063',
       CASE WHEN 350.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Tinomuda%'
  AND p.name ILIKE '%17-21 Warren%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6064 - Ms F Mayaya / Flat 6 Prospect - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6064',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mayaya%'
  AND p.name ILIKE '%6 Prospect%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6065 - Tatenda Chadenga / Flat 2 Prospect - $700.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       700.00, 'USD', 'cash', '6065',
       CASE WHEN 700.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chadenga%'
  AND p.name ILIKE '%2 Prospect%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6066 - Mr Makau / 6108 Ngezi Court - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6066',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Makau%'
  AND p.name ILIKE '%6108 Ngezi%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6067 - M Chindeengerwa / B017 Odzi Court Eastlea Gardens - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6067',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chindeengerwa%'
  AND p.name ILIKE '%B017 Odzi%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6068 - Mandipa Hope / 29 Pringle Mandara - $1200.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       1200.00, 'USD', 'cash', '6068',
       CASE WHEN 1200.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Hope%'
  AND p.name ILIKE '%29 Pringle%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6069 - Mrs Shumba / 231 Baobab Aspire Heights - $585.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       585.00, 'USD', 'cash', '6069',
       CASE WHEN 585.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Shumba%'
  AND p.name ILIKE '%231 Baobab%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6070 - Mandiwanga / 696 Budiriro 1 - $190.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       190.00, 'USD', 'cash', '6070',
       CASE WHEN 190.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mandiwanga%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6071 - Josephus Mutambanashe / 696 Budiriro complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6071',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mutambanashe%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6073 - Ms Munyuku / Flat H Ridgeview Belvedere - $650.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       650.00, 'USD', 'cash', '6073',
       CASE WHEN 650.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Munyuku%'
  AND p.name ILIKE '%Flat H%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6074 - Mrs Bradshaw / 11 Azanza Msasa - $550.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       550.00, 'USD', 'cash', '6074',
       CASE WHEN 550.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Bradshaw%'
  AND p.name ILIKE '%11 Azanza%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6075 - Mr Chindaunguwa(unclear) / 696 Budiriro complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6075',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chindaunguwa%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6076 - Ms Tajadana / 6 Winnipeg Braeside - $800.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       800.00, 'USD', 'cash', '6076',
       CASE WHEN 800.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Tajadana%'
  AND p.name ILIKE '%6 Winnipeg%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6077 - Ms Diana Ukama / 71 Second Street - $300.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       300.00, 'USD', 'cash', '6077',
       CASE WHEN 300.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Ukama%'
  AND p.name ILIKE '%71 Second%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6078 - Dr Chirenga / 6 Alnick Way Cluster 2 - $700.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       700.00, 'USD', 'cash', '6078',
       CASE WHEN 700.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chirenga%'
  AND p.name ILIKE '%6 Alnick%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6079 - Mr Mwaturura / 1458 Kambuzuma - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6079',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mwaturura%'
  AND p.name ILIKE '%1458 Kambuzuma%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6080 - Mr Chikaka / 696 Budiriro Shopping Complex - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6080',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chikaka%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6081 - Ms Mhare / 8395 Kuwadzana - $340.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       340.00, 'USD', 'cash', '6081',
       CASE WHEN 340.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mhare%'
  AND p.name ILIKE '%8395 Kuwadzana%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6082 - Mr Matambanadzo / Flat 12 Marlborough - $550.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       550.00, 'USD', 'cash', '6082',
       CASE WHEN 550.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Matambanadzo%'
  AND p.name ILIKE '%12 Marlborough%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6083 - Ms Taruvinga / 30 Barbour - $100.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       100.00, 'USD', 'cash', '6083',
       CASE WHEN 100.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Taruvinga%'
  AND p.name ILIKE '%30 Barbour%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6084 - Mr & Mrs Naino / 1-84th Ave - $650.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       650.00, 'USD', 'cash', '6084',
       CASE WHEN 650.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-05', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Naino%'
  AND p.name ILIKE '%1-84th Ave%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6085 - Mr Chipeta / Flat 4 Ridgeview - $650.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       650.00, 'USD', 'cash', '6085',
       CASE WHEN 650.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-05', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chipeta%'
  AND p.name ILIKE '%4 Ridgeview%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6086 - Mr Gadzawa / Flat 12 Ruwa Gardens - $300.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       300.00, 'USD', 'cash', '6086',
       CASE WHEN 300.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-05', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Gadzawa%'
  AND p.name ILIKE '%12 Ruwa%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6087 - Mrs Nyamweda / 49C Madokero Mews - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6087',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-05', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Nyamweda%'
  AND p.name ILIKE '%49C Madokero%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6088 - Mrs Murwa / 8400 Unit S Chitungwiza - $300.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       300.00, 'USD', 'cash', '6088',
       CASE WHEN 300.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-05', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Murwa%'
  AND p.name ILIKE '%8400 Unit%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6089 - Mr Alex Mativenga / Flat 131 Block 17 Mukonono Flats - $200.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       200.00, 'USD', 'cash', '6089',
       CASE WHEN 200.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mativenga%'
  AND p.name ILIKE '%131 Block%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6090 - Amanda Sunthula / 2725 Mainway Meadows - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6090',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Sunthula%'
  AND p.name ILIKE '%2725 Mainway%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6091 - T Chirimumimba / 696 Budiriro Shopping complex - $160.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       160.00, 'USD', 'cash', '6091',
       CASE WHEN 160.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chirimumimba%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6092 - Rumbidzai Sadziwa / Flat 12 Ruwa Gardens - $300.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       300.00, 'USD', 'cash', '6092',
       CASE WHEN 300.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Sadziwa%'
  AND p.name ILIKE '%12 Ruwa%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6093 - Mr Chiringa / Flat 9 Marlborough - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6093',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chiringa%'
  AND p.name ILIKE '%9 Marlborough%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6094 - Mr Mohammed / 9 Belvedere Road - $800.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       800.00, 'USD', 'cash', '6094',
       CASE WHEN 800.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-03', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mohammed%'
  AND p.name ILIKE '%9 Belvedere%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6095 - D Kawanzaruwa / Flat 99 Aspire Heights - $550.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       550.00, 'USD', 'cash', '6095',
       CASE WHEN 550.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-04', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Kawanzaruwa%'
  AND p.name ILIKE '%99 Aspire%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6096 - S Chimundida / 4283 Kuwadzana - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6096',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chimundida%'
  AND p.name ILIKE '%4283 Kuwadzana%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6097 - Abdulaziz / C011 Mupfure Court - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6097',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Abdulaziz%'
  AND p.name ILIKE '%C011 Mupfure%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6098 - Mrs Forbe / 91A Willowvale Flats - $320.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       320.00, 'USD', 'cash', '6098',
       CASE WHEN 320.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Forbe%'
  AND p.name ILIKE '%91A Willowvale%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6099 - Sherril Hair Salon-Mr Muparutsa / Shop B3 Phoenix Mall - $250.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       250.00, 'USD', 'cash', '6099',
       CASE WHEN 250.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Salon-Muparutsa%'
  AND p.name ILIKE '%B3 Phoenix%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6100 - Mr Mesa / 2 Vendon Oaks - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6100',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mesa%'
  AND p.name ILIKE '%2 Vendon%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6101 - Mrs Nyambo / C012 Zambezi Court - $590.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       590.00, 'USD', 'cash', '6101',
       CASE WHEN 590.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Nyambo%'
  AND p.name ILIKE '%C012 Zambezi%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6102 - Mrs Kanenungo / 544 Joshua Nkomo Aspindale - $150.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       150.00, 'USD', 'cash', '6102',
       CASE WHEN 150.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Kanenungo%'
  AND p.name ILIKE '%544 Joshua%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6103 - Mr Nyamiso(unclear) / Flat 2 Ruwa Gardens - $150.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       150.00, 'USD', 'cash', '6103',
       CASE WHEN 150.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Nyamiso%'
  AND p.name ILIKE '%2 Ruwa%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6104 - Mr Mudyiwa(unclear) / 2725 Mainway Meadows - $620.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       620.00, 'USD', 'cash', '6104',
       CASE WHEN 620.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mudyiwa%'
  AND p.name ILIKE '%2725 Mainway%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6105 - Mr Mukarutete / 28 Bauhunia Msasa Park - $120.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       120.00, 'USD', 'cash', '6105',
       CASE WHEN 120.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mukarutete%'
  AND p.name ILIKE '%28 Bauhunia%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6106 - E Teka / 696 Budiriro Shopping Complex - $150.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       150.00, 'USD', 'cash', '6106',
       CASE WHEN 150.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Teka%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6107 - Mr Munyuku / 1424 Mainway - $600.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       600.00, 'USD', 'cash', '6107',
       CASE WHEN 600.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Munyuku%'
  AND p.name ILIKE '%1424 Mainway%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6108 - Dusabe Dudu / Flat 12 Hamilton Heights - $450.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       450.00, 'USD', 'cash', '6108',
       CASE WHEN 450.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Dudu%'
  AND p.name ILIKE '%12 Hamilton%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6109 - Mr Mepasa / 1361 Njiva - $650.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       650.00, 'USD', 'cash', '6109',
       CASE WHEN 650.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-07', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mepasa%'
  AND p.name ILIKE '%1361 Njiva%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6111 - Mrs Diana Ukama / 71 Second Warren Park - $106.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       106.00, 'USD', 'cash', '6111',
       CASE WHEN 106.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Ukama%'
  AND p.name ILIKE '%71 Second%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6113 - Tendai Karimo / 21568 Budiriro - $140.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       140.00, 'USD', 'cash', '6113',
       CASE WHEN 140.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Karimo%'
  AND p.name ILIKE '%21568 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6114 - Mr Simba / 1b Mutandiri Nyakage - $265.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       265.00, 'USD', 'cash', '6114',
       CASE WHEN 265.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Simba%'
  AND p.name ILIKE '%1b Mutandiri%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6115 - Ms Bridget Marima / 696 Budiriro Shopping complex - $150.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       150.00, 'USD', 'cash', '6115',
       CASE WHEN 150.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Marima%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6116 - Ms Manish Chaga / Flat 50 Willowvale Flats - $300.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       300.00, 'USD', 'cash', '6116',
       CASE WHEN 300.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chaga%'
  AND p.name ILIKE '%50 Willowvale%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6117 - Ms Patience Tirivi / Glen Norah - $230.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       230.00, 'USD', 'cash', '6117',
       CASE WHEN 230.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Tirivi%'
  AND p.name ILIKE '%Glen Norah%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6118 - Ms Kudzo / Msasa Park - $650.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       650.00, 'USD', 'cash', '6118',
       CASE WHEN 650.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Kudzo%'
  AND p.name ILIKE '%Msasa Park%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6119 - Tafirenyika Mudamombe / 696 Budiriro complex - $190.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       190.00, 'USD', 'cash', '6119',
       CASE WHEN 190.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mudamombe%'
  AND p.name ILIKE '%696 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6120 - Mr Kadangwandi / 5331 Nkwisi Gardens - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6120',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Kadangwandi%'
  AND p.name ILIKE '%5331 Nkwisi%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6124 - Mr Mudenge / 3567 Mainway Meadows - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6124',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-01', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Mudenge%'
  AND p.name ILIKE '%3567 Mainway%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6125 - Mr Rodney Silundu / Unit 2 Ridgeview Belvedere - $900.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       900.00, 'USD', 'cash', '6125',
       CASE WHEN 900.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-08', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Silundu%'
  AND p.name ILIKE '%2 Ridgeview%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6126 - Mr Caspar Karanga / 21568 Budiriro - $250.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       250.00, 'USD', 'cash', '6126',
       CASE WHEN 250.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-10', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Karanga%'
  AND p.name ILIKE '%21568 Budiriro%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6127 - Mr Ludzer / Flat 1 Marlborough Pridgeview Belvedere - $500.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       500.00, 'USD', 'cash', '6127',
       CASE WHEN 500.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-11', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Ludzer%'
  AND p.name ILIKE '%1 Marlborough%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6128 - Mr Muzambwa / C209 Mupfure Court - $400.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       400.00, 'USD', 'cash', '6128',
       CASE WHEN 400.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-14', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Muzambwa%'
  AND p.name ILIKE '%C209 Mupfure%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6130 - Decade Africa / 61 Chirenka Road Cranborne - $1200.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       1200.00, 'USD', 'cash', '6130',
       CASE WHEN 1200.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-14', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Africa%'
  AND p.name ILIKE '%61 Chirenka%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6131 - Sovereign Incorporated / 73 Ruwa Waterfalls - $1000.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       1000.00, 'USD', 'cash', '6131',
       CASE WHEN 1000.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-14', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Incorporated%'
  AND p.name ILIKE '%73 Ruwa%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- Receipt #6132 - Mr T Chibanda / 1424 Mainway Cottage - $280.00
INSERT INTO payments (id, account_id, tenancy_id, payment_type, period_month, period_year,
                       amount_paid, currency, method, reference, status, recorded_by, payment_date, created_at)
SELECT gen_random_uuid(), t.account_id, t.id, 'rent', 9, 2026,
       280.00, 'USD', 'cash', '6132',
       CASE WHEN 280.00 >= t.rent_amount THEN 'paid' ELSE 'partial' END,
       (SELECT u2.id FROM users u2 WHERE u2.account_id = t.account_id AND u2.role = 'admin' ORDER BY u2.created_at LIMIT 1),
       '2026-09-14', now()
FROM tenancies t
JOIN tenants te ON t.tenant_id = te.id
JOIN units u ON t.unit_id = u.id
JOIN properties p ON u.property_id = p.id
JOIN accounts a ON t.account_id = a.id
WHERE a.email = 'sermonyproperty@gmail.com'
  AND te.full_name ILIKE '%Chibanda%'
  AND p.name ILIKE '%1424 Mainway%'
  AND NOT EXISTS (
    SELECT 1 FROM payments p2
    WHERE p2.tenancy_id = t.id AND p2.period_month = 9 AND p2.period_year = 2026 AND p2.payment_type = 'rent'
  )
LIMIT 1;

-- After reviewing the row count above, run:
-- COMMIT;
-- (or ROLLBACK; if anything looked wrong)
