# Fix Admin Role - Debugging Guide

## Problém
Uživatel má v databázi roli `admin`, ale v sidebaru se admin sekce nezobrazuje.

## Příčiny
1. Role není nastavena v `profiles` tabulce
2. Role není synchronizována mezi `profiles` a `auth.users` metadata
3. Profil se nenačte správně z databáze
4. Layout komponenta nepředává `isAdmin` prop správně

## Řešení

### 1. Debugging

Po implementaci oprav se do konzole (server i browser) budou vypisovat informace:

**Server-side logs (terminál):**
```
=== PORTAL LAYOUT DEBUG ===
User ID: xxx-xxx-xxx
User Email: base@demonagro.cz
User metadata: { ... }
User app_metadata: { role: 'admin' }
Profile data: { id: '...', email: '...', role: 'admin', ... }
Profile error: null
Profile role: admin
Is Admin: true
=========================
```

**Client-side logs (browser console):**
```
=== SIDEBAR DEBUG ===
isAdmin prop: true
pathname: /portal/dashboard
====================
```

### 2. Kontrola databáze

Spusťte tento SQL dotaz v Supabase SQL Editoru:

```sql
SELECT 
  u.id,
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role,
  p.full_name,
  p.is_active,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';
```

**Očekávaný výsledek:**
- `profile_role`: `admin`
- `auth_meta_role`: `admin`

### 3. Nastavení admin role

Pokud role není správně nastavena, spusťte:

```sql
-- Nastavit v profiles tabulce
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'base@demonagro.cz';

-- Nastavit v auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'base@demonagro.cz';
```

Nebo použijte připravený skript:
```bash
# Spusťte v Supabase SQL Editoru
cat lib/supabase/sql/fix_base_admin_role.sql
```

### 4. Fallback mechanismus

V `app/portal/layout.tsx` je nyní implementován fallback mechanismus:

```typescript
const isAdmin = 
  profile?.role === 'admin' ||                    // 1. Primární: role v DB
  user.app_metadata?.role === 'admin' ||          // 2. Fallback: auth metadata
  user.user_metadata?.role === 'admin' ||         // 3. Fallback: user metadata
  user.email === 'base@demonagro.cz'              // 4. Testovací fallback
```

**Poznámka:** Řádek 4 je dočasný fallback pro testování. V produkci by měl být odstraněn.

### 5. Ověření

Po nastavení role:

1. **Odhlaste se** z aplikace
2. **Přihlaste se znovu**
3. **Zkontrolujte console logs** (server + browser)
4. **Zkontrolujte sidebar** - měla by se zobrazit "Admin Zóna" sekce

## Architektura role detection

```
┌─────────────────────────────────────────────────────────────┐
│ app/portal/layout.tsx (Server Component)                    │
│                                                              │
│ 1. Načte user z auth.getUser()                              │
│ 2. Načte profile z DB (profiles table)                      │
│ 3. Zkontroluje:                                             │
│    - profile?.role === 'admin' (primární)                   │
│    - user.app_metadata?.role === 'admin' (fallback)        │
│    - user.user_metadata?.role === 'admin' (fallback)       │
│    - user.email === 'base@demonagro.cz' (test fallback)    │
│ 4. Předá isAdmin={boolean} do PortalLayoutClient            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ components/portal/PortalLayoutClient.tsx (Client Component) │
│                                                              │
│ - Přijme isAdmin prop                                       │
│ - Předá ho do Sidebar komponenty                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ components/portal/Sidebar.tsx (Client Component)            │
│                                                              │
│ - Přijme isAdmin prop                                       │
│ - Podmínečně renderuje Admin Zónu:                          │
│   {isAdmin && <AdminSection />}                             │
└─────────────────────────────────────────────────────────────┘
```

## Změny v kódu

### 1. `app/portal/layout.tsx`
- ✅ Přidány console.log pro debugging
- ✅ Implementován fallback mechanismus s 4 úrovněmi
- ✅ Zachycení profile error

### 2. `components/portal/Sidebar.tsx`
- ✅ Přidány console.log pro debugging
- ✅ Přidán DEBUG komentář v JSX

### 3. `lib/supabase/sql/fix_base_admin_role.sql`
- ✅ Nový SQL skript pro nastavení admin role

## Testování

### Test 1: Kontrola logů
```bash
# V terminálu (Next.js dev server):
npm run dev

# Přihlaste se a sledujte server logs
# Měli byste vidět "=== PORTAL LAYOUT DEBUG ==="
```

### Test 2: Kontrola browser console
```
1. Otevřete DevTools (F12)
2. Přejděte na záložku Console
3. Přihlaste se do aplikace
4. Měli byste vidět "=== SIDEBAR DEBUG ==="
```

### Test 3: Vizuální kontrola
```
1. Přihlaste se jako admin
2. V sidebaru by se měla zobrazit:
   - Hlavní navigace
   - Oddělovací čára (silnější)
   - "Admin Zóna" sekce s červenou ikonou štítu
   - Admin odkazy (Přehled, Uživatelé, Produkty, ...)
```

## Časté problémy

### Problém: "Profile data: null"
**Řešení:** Uživatel nemá záznam v `profiles` tabulce.
```sql
-- Zkontrolujte existenci profilu
SELECT * FROM profiles WHERE email = 'base@demonagro.cz';

-- Pokud neexistuje, vytvořte ho
INSERT INTO profiles (id, email, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users
WHERE email = 'base@demonagro.cz'
ON CONFLICT (id) DO NOTHING;
```

### Problém: "Profile role: undefined" nebo "Profile role: user"
**Řešení:** Role není správně nastavena.
```sql
-- Nastavte admin roli
UPDATE profiles SET role = 'admin' WHERE email = 'base@demonagro.cz';
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'base@demonagro.cz';
```

### Problém: Admin sekce se stále nezobrazuje
**Řešení:**
1. Vymažte cache: `rm -rf .next`
2. Restartujte dev server: `npm run dev`
3. Odhlaste se a přihlaste se znovu
4. Vymažte browser cookies pro localhost:3000

## Produkční checklist

Před nasazením do produkce:

- [ ] Odstraňte debug console.log výpisy
- [ ] Odstraňte testovací fallback `user.email === 'base@demonagro.cz'`
- [ ] Ověřte, že všichni admin uživatelé mají roli v OBOU místech (profiles + auth.users)
- [ ] Otestujte, že běžní uživatelé NEVIDÍ Admin Zónu
- [ ] Otestujte, že admin uživatelé VIDÍ Admin Zónu

## Užitečné SQL dotazy

```sql
-- Zobrazit všechny adminy
SELECT email, role, full_name 
FROM profiles 
WHERE role = 'admin';

-- Synchronizovat role mezi profiles a auth.users
UPDATE auth.users u
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', p.role)
FROM profiles p
WHERE u.id = p.id AND p.role IS NOT NULL;

-- Najít nesynchronizované role
SELECT 
  u.email,
  p.role as profile_role,
  u.raw_user_meta_data->>'role' as auth_meta_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role != u.raw_user_meta_data->>'role' OR u.raw_user_meta_data->>'role' IS NULL;
```

## Kontakt

Pokud problém přetrvává, zkontrolujte:
1. Server logs (terminál s `npm run dev`)
2. Browser console logs (F12)
3. Network tab v DevTools (zkontrolujte API volání)
4. Supabase Database (SQL Editor)
