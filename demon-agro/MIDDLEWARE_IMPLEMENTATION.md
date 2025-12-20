# Middleware Implementation - Kompletní přehled ✅

## 🎉 Co bylo implementováno

Kompletní systém ochrany portálových rout pomocí Next.js 14 middleware a Supabase autentizace.

## 📁 Vytvořené soubory

### 1. Core Middleware
- ✅ **`middleware.ts`** (3.1 KB) - Hlavní middleware pro ochranu rout
  - Ochrana /portal/* rout
  - Kontrola autentizace
  - Kontrola admin role
  - Automatický refresh Supabase session

### 2. Auth & Role Utilities
- ✅ **`lib/supabase/auth-helpers.ts`** (1.9 KB) - Server-side auth helpers
  - `getCurrentUser()` - získání uživatele
  - `requireAuth()` - vyžadovat přihlášení
  - `isAdmin()` - kontrola admin role
  - `requireAdmin()` - vyžadovat admin roli
  - `getCurrentUserWithMetadata()` - uživatel s metadaty

- ✅ **`lib/utils/roles.ts`** (1.0 KB) - Role management utilities
  - `getUserRole()` - získání role z user objektu
  - `isAdmin()` - kontrola admin role
  - `isAuthenticated()` - kontrola přihlášení
  - `getUserDisplayName()` - display name uživatele

### 3. SQL Scripts
- ✅ **`lib/supabase/sql/setup_roles.sql`** (3.3 KB)
  - Vytvoření profiles tabulky
  - Row Level Security policies
  - Trigger pro nové uživatele
  - Synchronizace existujících uživatelů

- ✅ **`lib/supabase/sql/create_admin_user.sql`** (1.1 KB)
  - SQL pro nastavení admin role
  - Příklady vytvoření admin uživatele

### 4. Documentation
- ✅ **`MIDDLEWARE.md`** (9.5 KB) - Detailní dokumentace middleware
  - Logika ochrany rout
  - Flow diagramy
  - Příklady scénářů
  - Setup a konfigurace
  - Troubleshooting

- ✅ **`ROUTE_PROTECTION.md`** (8.6 KB) - Quick reference guide
  - Rychlé příklady použití
  - Code snippets pro běžné use cases
  - Helper funkce přehled
  - Common patterns

- ✅ **`lib/supabase/examples/middleware-test.md`** - Test scénáře
  - Manuální test cases
  - Expected behavior tabulka
  - Browser console testing
  - Troubleshooting tips

## 🔒 Implementovaná logika

### Veřejné routy (přístupné bez přihlášení)
```
✅ /portal                  - Landing page
✅ /portal/prihlaseni      - Login
✅ /portal/reset-hesla     - Reset hesla
```

### Chráněné routy (vyžadují přihlášení)
```
🔐 /portal/dashboard
🔐 /portal/pozemky/*
🔐 /portal/upload
🔐 /portal/historie-hnojeni
🔐 /portal/osevni-postup
🔐 /portal/poptavky/*
🔐 /portal/nastaveni
🔐 /portal/onboarding
```

### Admin routy (vyžadují role='admin')
```
👑 /portal/admin/*
   - /portal/admin
   - /portal/admin/uzivatele/*
   - /portal/admin/produkty
   - /portal/admin/produkty-vapneni
   - /portal/admin/poptavky
   - /portal/admin/obrazky-portalu
   - /portal/admin/audit-log
   - /portal/admin/statistiky
```

## 🔄 Redirect Flow

```typescript
// Scénář 1: Nepřihlášený na chráněné
User → /portal/pozemky
     ↓
Middleware: No auth
     ↓
Redirect → /portal/prihlaseni?redirect=/portal/pozemky

// Scénář 2: Přihlášený uživatel na admin
User (role: user) → /portal/admin
     ↓
Middleware: Auth OK, but not admin
     ↓
Redirect → /portal/dashboard

// Scénář 3: Admin na admin
Admin (role: admin) → /portal/admin
     ↓
Middleware: Auth OK, is admin
     ↓
Allow → Show page
```

## 💻 Příklady použití

### Server Component - Chráněná stránka
```tsx
import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function DashboardPage() {
  const user = await requireAuth()
  return <h1>Dashboard pro {user.email}</h1>
}
```

### Server Component - Admin stránka
```tsx
import { requireAdmin } from '@/lib/supabase/auth-helpers'

export default async function AdminPage() {
  const user = await requireAdmin()
  return <h1>Admin panel</h1>
}
```

### Server Component - Podmíněný obsah
```tsx
import { getCurrentUserWithMetadata } from '@/lib/supabase/auth-helpers'

export default async function Page() {
  const userMeta = await getCurrentUserWithMetadata()
  
  return (
    <div>
      <h1>Vítejte, {userMeta?.displayName}</h1>
      {userMeta?.isAdmin && <AdminPanel />}
    </div>
  )
}
```

### Client Component - Role check
```tsx
'use client'
import { getUserRole, isAdmin } from '@/lib/utils/roles'
import { useEffect, useState } from 'react'

export function UserMenu() {
  const [role, setRole] = useState<'user' | 'admin'>('user')
  
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setRole(getUserRole(user))
    }
    checkRole()
  }, [])
  
  return (
    <nav>
      <Link href="/portal/dashboard">Dashboard</Link>
      {role === 'admin' && <Link href="/portal/admin">Admin</Link>}
    </nav>
  )
}
```

## 🛠️ Setup kroky

### 1. Supabase SQL Setup

Spusť v Supabase SQL Editor:

```bash
# V Supabase Dashboard → SQL Editor
# Zkopíruj a spusť obsah souboru:
lib/supabase/sql/setup_roles.sql
```

To vytvoří:
- ✅ `profiles` tabulku
- ✅ RLS policies
- ✅ Triggers pro automatickou synchronizaci
- ✅ Funkce pro správu rolí

### 2. Vytvoření admin uživatele

**Metoda A - SQL:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@demonagro.cz';
```

**Metoda B - Admin Client:**
```typescript
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()
await supabase.auth.admin.createUser({
  email: 'admin@demonagro.cz',
  password: 'secure-password',
  email_confirm: true,
  user_metadata: {
    role: 'admin',
    full_name: 'Admin'
  }
})
```

### 3. Test middleware

```bash
# Spusť dev server
npm run dev

# Otevři browser
# Test 1: http://localhost:3000/portal (mělo by fungovat)
# Test 2: http://localhost:3000/portal/dashboard (mělo by redirectnout)
# Test 3: Přihlaš se a zkus znovu (mělo by fungovat)
```

## 🧪 Testování

### Quick Test Checklist

- [ ] Veřejná routa `/portal` funguje bez přihlášení
- [ ] Login stránka `/portal/prihlaseni` je přístupná
- [ ] Chráněná routa `/portal/dashboard` redirectuje na login
- [ ] Po přihlášení lze přistupovat na `/portal/dashboard`
- [ ] Běžný uživatel nemůže přistupovat na `/portal/admin`
- [ ] Admin může přistupovat na `/portal/admin`
- [ ] Přihlášený uživatel na `/portal/prihlaseni` redirectuje na dashboard

### Test Users

Vytvoř test uživatele:

```typescript
// Regular user
{
  email: 'user@test.com',
  password: 'testuser123',
  role: 'user'
}

// Admin user
{
  email: 'admin@demonagro.cz',
  password: 'admin123',
  role: 'admin'
}
```

## 📊 Behavior Matrix

| Route | No Auth | User Auth | Admin Auth |
|-------|---------|-----------|------------|
| `/portal` | ✅ Show | ✅ Show | ✅ Show |
| `/portal/prihlaseni` | ✅ Show | → Dashboard | → Dashboard |
| `/portal/reset-hesla` | ✅ Show | ✅ Show | ✅ Show |
| `/portal/dashboard` | → Login | ✅ Show | ✅ Show |
| `/portal/pozemky` | → Login | ✅ Show | ✅ Show |
| `/portal/admin` | → Login | → Dashboard | ✅ Show |
| `/portal/admin/*` | → Login | → Dashboard | ✅ Show |

## 🔐 Security Features

- ✅ Automatický refresh Supabase session
- ✅ Cookie-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Redirect preservation (return to original URL after login)
- ✅ Protected admin routes
- ✅ Server-side auth checks
- ✅ Type-safe role management

## 📚 Dokumentace

| Soubor | Účel |
|--------|------|
| `MIDDLEWARE.md` | Detailní dokumentace middleware |
| `ROUTE_PROTECTION.md` | Quick reference guide |
| `lib/supabase/examples/middleware-test.md` | Test scénáře |
| `lib/supabase/README.md` | Supabase client usage |
| `SUPABASE_SETUP.md` | Supabase setup guide |

## 🚨 Troubleshooting

### Middleware nefunguje
```bash
# Zkontroluj že middleware.ts je v root
ls -la middleware.ts

# Zkontroluj matcher
grep "matcher" middleware.ts
# Mělo by být: matcher: ['/portal/:path*']

# Restartuj server
npm run dev
```

### Role není rozpoznána
```sql
-- Zkontroluj roli v Supabase
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users;
```

### Redirect loop
```typescript
// Zkontroluj public routes v middleware.ts
const publicRoutes = [
  '/portal',
  '/portal/prihlaseni',
  '/portal/reset-hesla'
]
```

## ✅ Status

**Middleware**: ✅ Plně implementován  
**Auth Helpers**: ✅ Připraveny  
**Role Management**: ✅ Funkční  
**SQL Scripts**: ✅ Připraveny  
**Documentation**: ✅ Kompletní  
**Testing**: ⏳ Připraveno k testování  

## 🎯 Další kroky

1. ⏳ Spustit SQL skripty v Supabase
2. ⏳ Vytvořit test uživatele
3. ⏳ Otestovat všechny scénáře
4. ⏳ Implementovat login flow (další prompt)
5. ⏳ Implementovat registraci (další prompt)

---

**Implementováno**: 19.12.2025  
**Framework**: Next.js 14 App Router  
**Auth**: Supabase  
**Status**: ✅ Ready for testing
