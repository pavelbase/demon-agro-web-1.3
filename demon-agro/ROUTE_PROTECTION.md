# Route Protection - Quick Reference

Rychlý přehled ochrany rout v portálu.

## 🎯 Přehled

```
┌─────────────────────────────────────────────────┐
│  /portal                                        │
│  └── Veřejné (landing page)                    │
│                                                 │
│  /portal/prihlaseni                             │
│  └── Veřejné (login)                            │
│                                                 │
│  /portal/reset-hesla                            │
│  └── Veřejné (reset password)                   │
│                                                 │
│  /portal/dashboard                              │
│  └── 🔒 Chráněné (vyžaduje přihlášení)         │
│                                                 │
│  /portal/pozemky/*                              │
│  └── 🔒 Chráněné (vyžaduje přihlášení)         │
│                                                 │
│  /portal/admin/*                                │
│  └── 👑 Admin (vyžaduje role=admin)            │
└─────────────────────────────────────────────────┘
```

## 🔐 Použití v kódu

### Ochrana stránky (Page level)

```tsx
// app/portal/dashboard/page.tsx
import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function DashboardPage() {
  const user = await requireAuth()
  
  return (
    <div>
      <h1>Dashboard pro {user.email}</h1>
    </div>
  )
}
```

### Ochrana admin stránky

```tsx
// app/portal/admin/page.tsx
import { requireAdmin } from '@/lib/supabase/auth-helpers'

export default async function AdminPage() {
  const user = await requireAdmin()
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  )
}
```

### Podmíněné zobrazení obsahu

```tsx
// app/portal/dashboard/page.tsx
import { getCurrentUserWithMetadata } from '@/lib/supabase/auth-helpers'

export default async function DashboardPage() {
  const userMeta = await getCurrentUserWithMetadata()
  
  return (
    <div>
      <h1>Vítejte, {userMeta?.displayName}</h1>
      
      {userMeta?.isAdmin && (
        <a href="/portal/admin">Admin panel</a>
      )}
    </div>
  )
}
```

### Kontrola role v Client Component

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { getUserRole, isAdmin } from '@/lib/utils/roles'
import { useEffect, useState } from 'react'

export function UserMenu() {
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsUserAdmin(isAdmin(user))
    }
    checkRole()
  }, [])

  return (
    <nav>
      <a href="/portal/dashboard">Dashboard</a>
      {isUserAdmin && (
        <a href="/portal/admin">Admin</a>
      )}
    </nav>
  )
}
```

## 🛠️ Helper funkce

### Server-side (Server Components, Server Actions)

```typescript
import {
  getCurrentUser,
  requireAuth,
  isAdmin,
  requireAdmin,
  getUserRoleServer,
  getCurrentUserWithMetadata
} from '@/lib/supabase/auth-helpers'

// Získat aktuálního uživatele (může být null)
const user = await getCurrentUser()

// Vyžadovat přihlášení (redirect pokud ne)
const user = await requireAuth()

// Zkontrolovat admin role
const isUserAdmin = await isAdmin()

// Vyžadovat admin roli (redirect pokud ne)
const user = await requireAdmin()

// Získat roli
const role = await getUserRoleServer() // 'user' | 'admin'

// Získat uživatele s metadaty
const userMeta = await getCurrentUserWithMetadata()
// { user, role, isAdmin, displayName }
```

### Client-side (Client Components)

```typescript
import { getUserRole, isAdmin, getUserDisplayName } from '@/lib/utils/roles'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

// Získat roli
const role = getUserRole(user) // 'user' | 'admin'

// Zkontrolovat admin
const isUserAdmin = isAdmin(user) // boolean

// Získat display name
const name = getUserDisplayName(user) // string
```

## 📝 Nastavení rolí

### SQL v Supabase Dashboard

```sql
-- Nastavit uživatele jako admina
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@demonagro.cz';

-- Zkontrolovat role
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users;
```

### Programově (Admin Client)

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

const supabase = createAdminClient()

// Vytvořit admin uživatele
await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'secure-password',
  email_confirm: true,
  user_metadata: {
    role: 'admin',
    full_name: 'Admin Name'
  }
})

// Aktualizovat existujícího uživatele
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: {
    role: 'admin'
  }
})
```

## 🎬 Běžné use cases

### 1. Chráněná stránka s načtením dat

```tsx
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'

export default async function PozemkyPage() {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data: pozemky } = await supabase
    .from('fields')
    .select('*')
    .eq('user_id', user.id)
  
  return <div>{/* Zobrazit pozemky */}</div>
}
```

### 2. Admin stránka s přehledem všech dat

```tsx
import { requireAdmin } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPozemkyPage() {
  await requireAdmin() // Pouze admin může vidět
  const supabase = await createClient()
  
  const { data: allPozemky } = await supabase
    .from('fields')
    .select('*, profiles(full_name)')
  
  return <div>{/* Zobrazit všechny pozemky všech uživatelů */}</div>
}
```

### 3. Server Action s kontrolou role

```tsx
'use server'

import { requireAuth, isAdmin } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'

export async function deletePozemek(id: string) {
  const user = await requireAuth()
  const supabase = await createClient()
  
  // Zkontrolovat že pozemek patří uživateli nebo je admin
  const { data: pozemek } = await supabase
    .from('fields')
    .select('user_id')
    .eq('id', id)
    .single()
  
  const userIsAdmin = await isAdmin()
  
  if (pozemek.user_id !== user.id && !userIsAdmin) {
    throw new Error('Unauthorized')
  }
  
  await supabase.from('fields').delete().eq('id', id)
}
```

### 4. Podmíněné navigační menu

```tsx
// components/Navigation.tsx
import { getCurrentUserWithMetadata } from '@/lib/supabase/auth-helpers'

export async function Navigation() {
  const userMeta = await getCurrentUserWithMetadata()
  
  if (!userMeta) return null
  
  return (
    <nav>
      <a href="/portal/dashboard">Dashboard</a>
      <a href="/portal/pozemky">Pozemky</a>
      <a href="/portal/poptavky">Poptávky</a>
      
      {userMeta.isAdmin && (
        <a href="/portal/admin">Admin</a>
      )}
    </nav>
  )
}
```

## 🔄 Redirect flow

```
Nepřihlášený → /portal/pozemky
    ↓
Middleware zachytí
    ↓
Redirect → /portal/prihlaseni?redirect=/portal/pozemky
    ↓
Uživatel se přihlásí
    ↓
Po přihlášení → /portal/pozemky (původní URL)
```

## 🚨 Řešení problémů

### Uživatel není přesměrován na login
```bash
# Zkontroluj middleware config
cat middleware.ts | grep matcher
# Mělo by být: matcher: ['/portal/:path*']
```

### Role není rozpoznána
```sql
-- V Supabase SQL Editor
SELECT 
  email, 
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'your@email.com';
```

### Middleware redirect loop
```typescript
// Zkontroluj že login je v public routes
const publicRoutes = [
  '/portal',
  '/portal/prihlaseni',
  '/portal/reset-hesla'
]
```

## 📚 Další zdroje

- [MIDDLEWARE.md](./MIDDLEWARE.md) - Detailní dokumentace middleware
- [lib/supabase/examples/middleware-test.md](./lib/supabase/examples/middleware-test.md) - Test scénáře
- [lib/supabase/sql/setup_roles.sql](./lib/supabase/sql/setup_roles.sql) - SQL setup

---

**Quick tip**: Pro rychlé testování různých rolí, otevři dvě incognito okna - jedno pro běžného uživatele, druhé pro admina.
