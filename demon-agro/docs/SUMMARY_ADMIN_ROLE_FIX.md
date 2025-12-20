# Souhrn oprav - Admin role v Sidebaru

## ✅ Provedené změny

### 1. **app/portal/layout.tsx** - Server Component
**Změny:**
- ✅ Přidán `error: profileError` do destructuringu při načítání profilu
- ✅ Přidány debugging console.log výpisy:
  - User ID, Email
  - User metadata (user_metadata, app_metadata)
  - Profile data, error, role
  - Výsledný isAdmin status
- ✅ Implementován **4-úrovňový fallback mechanismus** pro detekci admina:
  1. `profile?.role === 'admin'` (primární - z DB)
  2. `user.app_metadata?.role === 'admin'` (Supabase auth metadata)
  3. `user.user_metadata?.role === 'admin'` (custom user metadata)
  4. `user.email === 'base@demonagro.cz'` (dočasný testovací fallback)

**Výhody:**
- I když profil z DB selže, admin bude detekován z auth metadata
- Email fallback zajistí, že uživatel `base@demonagro.cz` vždy uvidí admin sekci
- Debugging výpisy pomohou identifikovat, kde přesně nastává problém

### 2. **components/portal/Sidebar.tsx** - Client Component
**Změny:**
- ✅ Přidány debugging console.log výpisy:
  - isAdmin prop (ověření, že se správně předává)
  - pathname (současná cesta)
- ✅ Přidán DEBUG komentář v JSX před admin sekcí

**Výhody:**
- Vizuální potvrzení v kódu, že admin sekce je podmíněná
- Snadná verifikace, že prop se správně předává z parent komponenty

### 3. **lib/supabase/sql/fix_base_admin_role.sql** - Nový SQL skript
**Obsah:**
- ✅ Zobrazení současného stavu uživatele
- ✅ UPDATE pro nastavení role v `profiles` tabulce
- ✅ UPDATE pro nastavení role v `auth.users.raw_user_meta_data`
- ✅ Ověření změn

**Použití:**
```sql
-- Spusťte v Supabase SQL Editoru:
-- 1. Zkontrolujte současný stav
SELECT u.email, p.role, u.raw_user_meta_data->>'role'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';

-- 2. Nastavte admin roli
UPDATE public.profiles SET role = 'admin' WHERE email = 'base@demonagro.cz';
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'base@demonagro.cz';

-- 3. Ověřte změnu
SELECT u.email, p.role, u.raw_user_meta_data->>'role'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'base@demonagro.cz';
```

### 4. **docs/FIX_ADMIN_ROLE.md** - Kompletní dokumentace
**Obsah:**
- ✅ Popis problému a příčin
- ✅ Návod na debugging (server + client logs)
- ✅ SQL dotazy pro kontrolu a opravu
- ✅ Architektura detekce role (diagram)
- ✅ Testovací checklist
- ✅ Řešení častých problémů
- ✅ Produkční checklist

## 🔍 Jak ověřit, že opravy fungují

### Krok 1: Spusťte aplikaci
```bash
cd /workspace/demon-agro
npm install  # pokud ještě není nainstalováno
npm run dev
```

### Krok 2: Sledujte server logs
Po přihlášení uživatele byste měli v terminálu vidět:
```
=== PORTAL LAYOUT DEBUG ===
User ID: abc-def-ghi
User Email: base@demonagro.cz
User metadata: {}
User app_metadata: { role: 'admin' }
Profile data: { id: '...', email: 'base@demonagro.cz', role: 'admin', ... }
Profile error: null
Profile role: admin
Is Admin: true
=========================
```

### Krok 3: Sledujte browser console
Otevřete DevTools (F12) a v Console záložce byste měli vidět:
```
=== SIDEBAR DEBUG ===
isAdmin prop: true
pathname: /portal/dashboard
====================
```

### Krok 4: Vizuální kontrola sidebaru
V sidebaru by se měla zobrazit:
- ✅ Hlavní navigace (Dashboard, Pozemky, Upload, ...)
- ✅ **Oddělovací čára** (silnější, šedá)
- ✅ **"Admin Zóna"** heading (červená barva s ikonou štítu)
- ✅ Admin odkazy:
  - Přehled
  - Uživatelé
  - Produkty hnojení
  - Produkty vápnění
  - Poptávky
  - Obrázky portálu
  - Audit log
  - Statistiky

## 🛠️ Co dělat, pokud admin sekce stále není vidět

### Scénář 1: V logu je "Profile data: null"
**Příčina:** Uživatel nemá záznam v `profiles` tabulce.

**Řešení:**
```sql
-- Vytvořte profil
INSERT INTO profiles (id, email, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users
WHERE email = 'base@demonagro.cz'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Scénář 2: V logu je "Profile role: user" nebo "Profile role: undefined"
**Příčina:** Role není správně nastavena v databázi.

**Řešení:**
```sql
-- Nastavte admin roli
UPDATE profiles SET role = 'admin' WHERE email = 'base@demonagro.cz';
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'base@demonagro.cz';
```

Pak:
1. Odhlaste se
2. Přihlaste se znovu

### Scénář 3: V logu je "Profile role: admin" ale "Is Admin: false"
**Příčina:** Logický problém v kódu (nemělo by nastat s novým fallback mechanismem).

**Řešení:**
- Zkontrolujte, že v `app/portal/layout.tsx` je správný kód s fallback mechanismem
- Restartujte dev server: Ctrl+C a znovu `npm run dev`
- Vymažte `.next` cache: `rm -rf .next`

### Scénář 4: V browser console je "isAdmin prop: false"
**Příčina:** Layout komponenta nepředává správný prop.

**Řešení:**
- Zkontrolujte server logs - mělo by tam být "Is Admin: true"
- Pokud ne, viz Scénář 1 nebo 2
- Zkontrolujte, že `PortalLayoutClient` správně předává prop do `Sidebar`

## 🎯 Fallback mechanismus

Díky fallback mechanismu bude admin sekce zobrazena, pokud je splněna **ALESPOŇ JEDNA** z těchto podmínek:

1. ✅ `profile?.role === 'admin'` (role v DB tabulce profiles)
2. ✅ `user.app_metadata?.role === 'admin'` (role v Supabase auth metadata)
3. ✅ `user.user_metadata?.role === 'admin'` (role v custom user metadata)
4. ✅ `user.email === 'base@demonagro.cz'` (testovací fallback pro konkrétní email)

**Poznámka:** Podmínka 4 je dočasná pro testování. V produkci byste měli:
```typescript
// Odstraňte testovací fallback:
const isAdmin = 
  profile?.role === 'admin' ||
  user.app_metadata?.role === 'admin' ||
  user.user_metadata?.role === 'admin'
  // user.email === 'base@demonagro.cz'  // <-- Zakomentujte nebo odstraňte
```

## 📊 Kontrolní checklist

- [x] Přidány debugging výpisy do `app/portal/layout.tsx`
- [x] Přidány debugging výpisy do `components/portal/Sidebar.tsx`
- [x] Implementován 4-úrovňový fallback mechanismus
- [x] Vytvořen SQL skript pro nastavení admin role (`fix_base_admin_role.sql`)
- [x] Vytvořena kompletní dokumentace (`FIX_ADMIN_ROLE.md`)
- [x] Zachycen profile error v layout
- [x] Přidán email fallback pro testování

## 🚀 Další kroky

1. **Testování:**
   - Přihlaste se jako `base@demonagro.cz`
   - Ověřte, že vidíte Admin Zónu
   - Zkontrolujte console logs

2. **Produkce:**
   - Odstraňte debugging console.log výpisy
   - Odstraňte testovací email fallback
   - Ověřte, že role jsou správně nastaveny pro všechny admin uživatele

3. **Monitoring:**
   - Sledujte, zda se problém opakuje u jiných uživatelů
   - Pokud ano, použijte SQL skript z `admin_role_setup.sql` pro synchronizaci všech rolí

## 📝 Relevantní soubory

```
demon-agro/
├── app/portal/layout.tsx                        # ✅ UPRAVENO
├── components/portal/Sidebar.tsx                # ✅ UPRAVENO
├── components/portal/PortalLayoutClient.tsx     # Beze změny
├── lib/
│   ├── supabase/
│   │   └── sql/
│   │       ├── admin_role_setup.sql             # Existující (reference)
│   │       └── fix_base_admin_role.sql          # ✅ NOVÝ
│   ├── types/database.ts                        # Beze změny (reference)
│   └── utils/roles.ts                           # Beze změny (reference)
└── docs/
    └── FIX_ADMIN_ROLE.md                        # ✅ NOVÝ
```

## 💡 Klíčové poznatky

1. **Role musí být synchronizována** na dvou místech:
   - `public.profiles.role` (pro aplikační logiku)
   - `auth.users.raw_user_meta_data.role` (pro middleware/auth)

2. **Fallback mechanismus** zajišťuje robustnost:
   - I když profil z DB není dostupný, admin bude detekován
   - Testovací email fallback umožňuje vývoj bez DB změn

3. **Debugging je klíčový**:
   - Server logs odhalí problém na úrovni načítání dat
   - Client logs ověří, že prop se správně předává do komponenty

4. **Po změně role je nutné:**
   - Odhlásit se a znovu přihlásit
   - Případně vymazat browser cookies
   - Případně restartovat dev server

---

**Autor:** AI Assistant (Cursor)  
**Datum:** 2025-12-20  
**Verze:** 1.0
