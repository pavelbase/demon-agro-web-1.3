# 🚀 Rychlé vytvoření testovacího uživatele

Pokud nefunguje přihlášení s testovacími účty, vytvořte si vlastní účet:

## Metoda 1: Přes Supabase Dashboard (NEJRYCHLEJŠÍ)

1. **Otevřít Supabase Dashboard:**
   - Jít na: https://supabase.com/dashboard
   - Přihlásit se
   - Vybrat projekt "demon-agro" (nebo jak se projekt jmenuje)

2. **Vytvořit uživatele:**
   - V menu zleva kliknout na **"Authentication"**
   - Kliknout na **"Users"**
   - Kliknout na **"Add User"** (nebo "Invite user")
   - Vyplnit:
     ```
     Email: vas@email.cz (použijte svůj email)
     Password: Vaše_Heslo123
     Auto Confirm User: ✅ ZA ŠKRTNUTO
     ```
   - Kliknout **"Create user"**

3. **Nastavit profil a roli:**
   - V menu zleva kliknout na **"SQL Editor"**
   - Vložit tento SQL:

```sql
-- Najít ID právě vytvořeného uživatele
SELECT id, email FROM auth.users WHERE email = 'vas@email.cz';

-- Nastavit profil (zkopírujte ID z předchozího dotazu)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  company_name,
  phone,
  role,
  is_active,
  must_change_password,
  onboarding_completed
) VALUES (
  'VLOŽTE-SEM-ID-Z-PŘEDCHOZÍHO-DOTAZU',
  'vas@email.cz',
  'Testovací Uživatel',
  'Testovací Firma',
  '+420 123 456 789',
  'user',  -- nebo 'admin' pro admin přístup
  true,
  false,
  true
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = true,
  must_change_password = false,
  onboarding_completed = true;

-- Ověřit
SELECT * FROM profiles WHERE email = 'vas@email.cz';
```

4. **Přihlásit se:**
   - Jít na: http://localhost:3001/portal/prihlaseni
   - Email: vas@email.cz
   - Heslo: Vaše_Heslo123

---

## Metoda 2: Přes SQL skript (pokud máte přístup)

V Supabase SQL Editoru spusťte:

```sql
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test@local.cz',
    crypt('test123456', gen_salt('bf')),
    now(),
    '{"full_name": "Local Test", "role": "user"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    company_name,
    phone,
    role,
    is_active,
    must_change_password,
    onboarding_completed
  ) VALUES (
    user_id,
    'test@local.cz',
    'Local Test User',
    'Test Company',
    '+420 999 999 999',
    'user',
    true,
    false,
    true
  );

  RAISE NOTICE 'Created user: test@local.cz / test123456';
END $$;
```

Pak se přihlaste:
- Email: test@local.cz
- Heslo: test123456

---

## Metoda 3: Kontaktovat base@demonagro.cz

Pokud žádná metoda nefunguje, kontaktujte správce projektu na `base@demonagro.cz` a požádejte o vytvoření testovacího účtu.

---

## Diagnostika problému

Pokud přihlášení stále nefunguje, zkontrolujte:

### 1. Supabase konfigurace
Otevřete terminál a spusťte:
```bash
cd demon-agro
cat .env.local | grep SUPABASE
```

Měli byste vidět:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Pokud **NE**, vytvoříte `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Dev server běží?
```bash
npm run dev
```

### 3. Konzole prohlížeče
- Stiskněte **F12**
- Zkuste se přihlásit
- Podívejte se na červené chyby v konzoli
- Pošlete mi screenshot nebo text chyby




