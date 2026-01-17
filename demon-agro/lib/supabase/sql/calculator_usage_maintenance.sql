-- ============================================================================
-- CALCULATOR USAGE - Maintenance & Monitoring Queries
-- ============================================================================
-- Užitečné SQL dotazy pro správu a monitoring tabulky calculator_usage
-- Datum: 2026-01-06
-- ============================================================================

-- ----------------------------------------------------------------------------
-- MONITORING QUERIES
-- ----------------------------------------------------------------------------

-- 1. Celkový počet použití kalkulačky
SELECT COUNT(*) as total_usage
FROM calculator_usage;

-- 2. Použití za poslední 24 hodin
SELECT COUNT(*) as usage_last_24h
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 3. Použití za poslední 7 dní (po dnech)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as usage_count,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT ip_address) as unique_ips
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 4. Top 10 nejpoužívanějších IP adres
SELECT 
  ip_address,
  COUNT(*) as usage_count,
  COUNT(DISTINCT email) as unique_emails,
  MIN(created_at) as first_use,
  MAX(created_at) as last_use
FROM calculator_usage
GROUP BY ip_address
ORDER BY usage_count DESC
LIMIT 10;

-- 5. Top 10 nejpoužívanějších emailů (duplicity)
SELECT 
  email,
  COUNT(*) as usage_count,
  COUNT(DISTINCT ip_address) as unique_ips,
  MIN(created_at) as first_use,
  MAX(created_at) as last_use
FROM calculator_usage
GROUP BY email
ORDER BY usage_count DESC
LIMIT 10;

-- 6. Použití podle hodin (pro detekci vzorců)
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as usage_count
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;

-- ----------------------------------------------------------------------------
-- SECURITY & ABUSE DETECTION
-- ----------------------------------------------------------------------------

-- 7. Detekce podezřelých IP adres (více než 5 různých emailů za 24h)
SELECT 
  ip_address,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) as total_attempts,
  ARRAY_AGG(DISTINCT email) as emails_used
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(DISTINCT email) > 5
ORDER BY unique_emails DESC;

-- 8. Detekce rychlých opakovaných pokusů (< 5 minut mezi pokusy)
WITH attempts AS (
  SELECT 
    ip_address,
    email,
    created_at,
    LAG(created_at) OVER (PARTITION BY ip_address ORDER BY created_at) as prev_attempt
  FROM calculator_usage
  WHERE created_at > NOW() - INTERVAL '24 hours'
)
SELECT 
  ip_address,
  email,
  created_at,
  prev_attempt,
  EXTRACT(EPOCH FROM (created_at - prev_attempt)) / 60 as minutes_between
FROM attempts
WHERE prev_attempt IS NOT NULL
  AND created_at - prev_attempt < INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- 9. Detekce botů (stejný user agent, různé emaily)
SELECT 
  user_agent,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) as total_attempts
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND user_agent IS NOT NULL
GROUP BY user_agent
HAVING COUNT(DISTINCT email) > 3
ORDER BY unique_emails DESC;

-- 10. Emaily použité z více IP adres (možné sdílení)
SELECT 
  email,
  COUNT(DISTINCT ip_address) as unique_ips,
  ARRAY_AGG(DISTINCT ip_address) as ips_used
FROM calculator_usage
GROUP BY email
HAVING COUNT(DISTINCT ip_address) > 1
ORDER BY unique_ips DESC;

-- ----------------------------------------------------------------------------
-- MAINTENANCE QUERIES
-- ----------------------------------------------------------------------------

-- 11. Smazání záznamů starších než 90 dní (GDPR compliance)
-- ⚠️ POZOR: Toto smaže data! Spustit pouze pokud je to požadováno.
-- DELETE FROM calculator_usage
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- 12. Smazání testovacích záznamů (emaily obsahující "test")
-- ⚠️ POZOR: Toto smaže data! Použít pouze pro čištění testů.
-- DELETE FROM calculator_usage
-- WHERE email LIKE '%test%@%';

-- 13. Archivace starých záznamů (před smazáním)
-- Vytvořit archivní tabulku
CREATE TABLE IF NOT EXISTS calculator_usage_archive (
  LIKE calculator_usage INCLUDING ALL
);

-- Přesunout staré záznamy do archivu
-- INSERT INTO calculator_usage_archive
-- SELECT * FROM calculator_usage
-- WHERE created_at < NOW() - INTERVAL '90 days';

-- 14. Získání velikosti tabulky
SELECT 
  pg_size_pretty(pg_total_relation_size('calculator_usage')) as total_size,
  pg_size_pretty(pg_relation_size('calculator_usage')) as table_size,
  pg_size_pretty(pg_indexes_size('calculator_usage')) as indexes_size;

-- 15. Počet záznamů podle měsíce
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as usage_count
FROM calculator_usage
GROUP BY month
ORDER BY month DESC;

-- ----------------------------------------------------------------------------
-- MANUAL OVERRIDES (Admin použití)
-- ----------------------------------------------------------------------------

-- 16. Odblokování konkrétního emailu (povolit další výpočet)
-- ⚠️ POZOR: Použít pouze po schválení!
-- DELETE FROM calculator_usage
-- WHERE email = 'user@example.com';

-- 17. Odblokování konkrétní IP adresy
-- ⚠️ POZOR: Použít pouze po schválení!
-- DELETE FROM calculator_usage
-- WHERE ip_address = '123.456.789.012';

-- 18. Resetování rate limitu pro všechny (nový den)
-- ⚠️ POZOR: Toto resetuje všechny limity!
-- DELETE FROM calculator_usage
-- WHERE created_at < NOW() - INTERVAL '24 hours';

-- 19. Whitelist - Povolit neomezený přístup pro konkrétní email
-- (Vyžaduje vytvoření whitelist tabulky - volitelné rozšíření)
/*
CREATE TABLE IF NOT EXISTS calculator_whitelist (
  email TEXT PRIMARY KEY,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Přidat email na whitelist
INSERT INTO calculator_whitelist (email, reason, created_by)
VALUES ('vip@example.com', 'VIP zákazník', 'admin@demonagro.cz');

-- Upravit check funkci pro kontrolu whitelistu
CREATE OR REPLACE FUNCTION check_calculator_email_usage(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Kontrola whitelistu
  IF EXISTS (SELECT 1 FROM calculator_whitelist WHERE email = LOWER(user_email)) THEN
    RETURN FALSE; -- Není použitý (whitelist)
  END IF;
  
  -- Normální kontrola
  RETURN EXISTS (
    SELECT 1 FROM calculator_usage
    WHERE LOWER(email) = LOWER(user_email)
      AND created_at > NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- 20. Blacklist - Zablokovat konkrétní email/IP
-- (Vyžaduje vytvoření blacklist tabulky - volitelné rozšíření)
/*
CREATE TABLE IF NOT EXISTS calculator_blacklist (
  identifier TEXT PRIMARY KEY, -- email nebo IP
  type TEXT CHECK (type IN ('email', 'ip')),
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Přidat na blacklist
INSERT INTO calculator_blacklist (identifier, type, reason, created_by)
VALUES ('spam@example.com', 'email', 'Spam/Abuse', 'admin@demonagro.cz');
*/

-- ----------------------------------------------------------------------------
-- ANALYTICS QUERIES
-- ----------------------------------------------------------------------------

-- 21. Konverzní rate (kolik % emailů je z domén .cz vs .com)
SELECT 
  CASE 
    WHEN email LIKE '%.cz' THEN '.cz'
    WHEN email LIKE '%.com' THEN '.com'
    WHEN email LIKE '%.sk' THEN '.sk'
    ELSE 'other'
  END as domain_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM calculator_usage
GROUP BY domain_type
ORDER BY count DESC;

-- 22. Průměrný počet použití na den
SELECT 
  ROUND(COUNT(*) / GREATEST(EXTRACT(DAY FROM (MAX(created_at) - MIN(created_at))), 1), 2) as avg_per_day
FROM calculator_usage;

-- 23. Peak hours (nejvytíženější hodiny)
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as usage_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM calculator_usage
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY usage_count DESC
LIMIT 5;

-- 24. Retention - kolik uživatelů se vrací (více použití)
SELECT 
  'Single use' as category,
  COUNT(*) as count
FROM (
  SELECT email FROM calculator_usage GROUP BY email HAVING COUNT(*) = 1
) single_use
UNION ALL
SELECT 
  'Multiple use' as category,
  COUNT(*) as count
FROM (
  SELECT email FROM calculator_usage GROUP BY email HAVING COUNT(*) > 1
) multiple_use;

-- 25. Geografická distribuce (pokud máme IP geolokaci)
-- Poznámka: Vyžaduje IP geolokační službu nebo rozšíření
/*
SELECT 
  -- Placeholder pro geolokaci
  SUBSTRING(ip_address, 1, POSITION('.' IN ip_address)-1) as ip_prefix,
  COUNT(*) as usage_count
FROM calculator_usage
GROUP BY ip_prefix
ORDER BY usage_count DESC
LIMIT 10;
*/

-- ----------------------------------------------------------------------------
-- PERFORMANCE OPTIMIZATION
-- ----------------------------------------------------------------------------

-- 26. Analýza indexů
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'calculator_usage';

-- 27. Statistiky tabulky
SELECT 
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'calculator_usage';

-- 28. Vacuum a analyze (údržba)
-- VACUUM ANALYZE calculator_usage;

-- 29. Reindex (pokud jsou indexy fragmentované)
-- REINDEX TABLE calculator_usage;

-- ----------------------------------------------------------------------------
-- BACKUP & RESTORE
-- ----------------------------------------------------------------------------

-- 30. Export dat do CSV (pro backup)
-- \copy (SELECT * FROM calculator_usage) TO '/path/to/calculator_usage_backup.csv' CSV HEADER;

-- 31. Import dat z CSV
-- \copy calculator_usage FROM '/path/to/calculator_usage_backup.csv' CSV HEADER;

-- ----------------------------------------------------------------------------
-- NOTES
-- ----------------------------------------------------------------------------
-- 
-- Doporučená údržba:
-- 1. Denně: Kontrolovat monitoring queries (1-6)
-- 2. Týdně: Kontrolovat security queries (7-10)
-- 3. Měsíčně: Archivovat/mazat staré záznamy (11-13)
-- 4. Dle potřeby: Manual overrides (16-20)
--
-- Kontakt pro podporu: admin@demonagro.cz
-- ============================================================================



