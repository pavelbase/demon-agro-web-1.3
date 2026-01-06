-- =====================================================
-- RESET HESLA PRO base@demonagro.cz
-- =====================================================
-- Tento skript resetuje heslo pro admin účet
-- 
-- NOVÉ DOČASNÉ HESLO: DemonAgro2026!
-- 
-- DŮLEŽITÉ: Po přihlášení si heslo IHNED změň!
-- =====================================================

-- Krok 1: Zkontroluj, zda existuje extension pro kryptografii
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Krok 2: Reset hesla pro base@demonagro.cz
-- Nové heslo: DemonAgro2026!
UPDATE auth.users
SET 
  encrypted_password = crypt('DemonAgro2026!', gen_salt('bf')),
  updated_at = now(),
  confirmation_token = NULL,
  recovery_token = NULL,
  email_change_token_new = NULL,
  email_change = NULL
WHERE email = 'base@demonagro.cz';

-- Krok 3: Ujisti se, že účet je potvrzený a ne zabokovaný
-- Poznámka: confirmed_at je generovaný sloupec, nelze ho updatovat
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  banned_until = NULL
WHERE email = 'base@demonagro.cz';

-- Krok 4: Výpis informací o účtu
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  updated_at,
  banned_until,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✓ Heslo nastaveno'
    ELSE '✗ Heslo NENÍ nastaveno'
  END as password_status
FROM auth.users
WHERE email = 'base@demonagro.cz';

-- =====================================================
-- VÝSLEDEK:
-- Pokud query vrátil 1 řádek, heslo bylo úspěšně resetováno
-- 
-- NOVÉ PŘIHLAŠOVACÍ ÚDAJE:
-- Email: base@demonagro.cz
-- Heslo: DemonAgro2026!
-- 
-- ⚠️ BEZPEČNOST: Po přihlášení si heslo IHNED změň!
-- =====================================================

