# Middleware - Route Protection

Middleware v `middleware.ts` zajišťuje ochranu portálových rout a správu autentizace.

## 🔒 Ochrana rout

### Veřejné routy (bez přihlášení)
- ✅ `/portal` - Landing page portálu
- ✅ `/portal/prihlaseni` - Přihlašovací stránka
- ✅ `/portal/reset-hesla` - Reset hesla

### Chráněné routy (vyžadují přihlášení)
- 🔐 `/portal/dashboard` - Dashboard
- 🔐 `/portal/pozemky/*` - Správa pozemků
- 🔐 `/portal/upload` - Upload rozborů
- 🔐 `/portal/historie-hnojeni` - Historie hnojení
- 🔐 `/portal/osevni-postup` - Osevní postup
- 🔐 `/portal/poptavky/*` - Poptávky
- 🔐 `/portal/nastaveni` - Nastavení

### Admin routy (vyžadují admin roli)
- 👑 `/portal/admin/*` - Všechny admin stránky
  - `/portal/admin` - Admin dashboard
  - `/portal/admin/uzivatele/*` - Správa uživatelů
  - `/portal/admin/produkty` - Správa produktů
  - `/portal/admin/produkty-vapneni` - Produkty vápnění
  - `/portal/admin/poptavky` - Správa poptávek
  - `/portal/admin/obrazky-portalu` - Správa obrázků
  - `/portal/admin/audit-log` - Audit log
  - `/portal/admin/statistiky` - Statistiky

## 🔄 Logika middleware

```typescript
┌─────────────────────────────────────────┐
│ Request na /portal/:path                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Refresh Supabase session                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Je to veřejná routa?                    │
│ (/portal, /portal/prihlaseni)           │
└──────┬──────────────────────────────────┘
       │                                   
  ANO  │  NE                              
       ▼                                   ▼
┌──────────────┐            ┌──────────────────────┐
│ Přihlášen?   │            │ Přihlášen?           │
└──┬───────────┘            └──┬───────────────────┘
   │                           │                    
ANO│  NE                    ANO│  NE               
   ▼                           ▼                    ▼
┌─────────────┐         ┌──────────┐    ┌──────────────────┐
│ → Dashboard │         │ Pokračuj │    │ → /prihlaseni    │
└─────────────┘         └────┬─────┘    │ ?redirect=...    │
                             │          └──────────────────┘
                             ▼
                  ┌──────────────────────┐
                  │ Admin routa?         │
                  │ (/portal/admin/*)    │
                  └──┬───────────────────┘
                     │                    
                ANO  │  NE               
                     ▼                    ▼
          ┌──────────────────┐    ┌──────────┐
          │ Je admin?        │    │ Pokračuj │
          │ (role='admin')   │    └──────────┘
          └──┬───────────────┘
             │                    
        ANO  │  NE               
             ▼                    ▼
      ┌──────────┐    ┌─────────────────┐
      │ Pokračuj │    │ → /dashboard    │
      └──────────┘    └─────────────────┘
```

## 🎯 Příklady chování

### Scénář 1: Nepřihlášený uživatel
```
Vstup:  GET /portal/pozemky
Výstup: 302 Redirect → /portal/prihlaseni?redirect=/portal/pozemky
```

### Scénář 2: Přihlášený uživatel na login page
```
Vstup:  GET /portal/prihlaseni
Auth:   ✅ Přihlášen jako user@example.com
Výstup: 302 Redirect → /portal/dashboard
```

### Scénář 3: Běžný uživatel na admin route
```
Vstup:  GET /portal/admin/uzivatele
Auth:   ✅ Přihlášen jako user@example.com (role: user)
Výstup: 302 Redirect → /portal/dashboard
```

### Scénář 4: Admin na admin route
```
Vstup:  GET /portal/admin/uzivatele
Auth:   ✅ Přihlášen jako admin@demonagro.cz (role: admin)
Výstup: 200 OK - zobrazí stránku
```

### Scénář 5: Přihlášený uživatel na chráněnou routu
```
Vstup:  GET /portal/pozemky
Auth:   ✅ Přihlášen jako user@example.com
Výstup: 200 OK - zobrazí stránku
```

## 🛠️ Implementace

### Middleware soubor (`middleware.ts`)

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Vytvoření Supabase klienta s cookie handling
  // 2. Refresh session
  // 3. Získání aktuálního uživatele
  // 4. Kontrola veřejných rout
  // 5. Kontrola autentizace
  // 6. Kontrola admin role
  // 7. Redirect nebo pokračování
}

export const config = {
  matcher: ['/portal/:path*']
}
```

### Role utilities (`lib/utils/roles.ts`)

Pomocné funkce pro práci s rolemi:

```typescript
import { getUserRole, isAdmin } from '@/lib/utils/roles'

// V Server Component nebo Server Action
const user = await getCurrentUser()
const userRole = getUserRole(user)
const isUserAdmin = isAdmin(user)
```

## 🔐 Nastavení uživatelských rolí

### V Supabase Dashboard

1. **Při registraci nového uživatele** (manual):
   ```sql
   -- V Supabase SQL Editor
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'admin@demonagro.cz';
   ```

2. **Při registraci přes Admin Client** (automaticky):
   ```typescript
   import { createAdminClient } from '@/lib/supabase/admin'
   
   const supabase = createAdminClient()
   await supabase.auth.admin.createUser({
     email: 'user@example.com',
     password: 'secure-password',
     user_metadata: {
       role: 'admin', // nebo 'user'
       full_name: 'Jan Novák'
     }
   })
   ```

3. **Pomocí Database Trigger** (doporučeno):
   ```sql
   -- Automaticky nastavit role='user' pro nové uživatele
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, role)
     VALUES (
       new.id,
       new.email,
       COALESCE(new.raw_user_meta_data->>'role', 'user')
     );
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

## 🧪 Testování

### Test 1: Veřejná routa
```bash
curl -I http://localhost:3000/portal
# Očekávaný výsledek: 200 OK
```

### Test 2: Chráněná routa bez auth
```bash
curl -I http://localhost:3000/portal/pozemky
# Očekávaný výsledek: 307 Redirect → /portal/prihlaseni
```

### Test 3: Admin routa s user role
```bash
# Přihlásit se jako běžný uživatel, pak:
curl -I http://localhost:3000/portal/admin
# Očekávaný výsledek: 307 Redirect → /portal/dashboard
```

## 📝 Poznámky

- Middleware běží na **edge runtime** - je velmi rychlý
- Session se automaticky refreshuje při každém requestu
- Redirect URL je uložena v query parametru pro redirect po přihlášení
- Role se kontroluje z `user_metadata` nebo `app_metadata`
- Pro změnu role je potřeba admin práva (Service Role Key)

## 🔄 Redirect po přihlášení

Po úspěšném přihlášení můžete použít redirect parametr:

```typescript
// V přihlašovacím formuláři
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const searchParams = new URLSearchParams(window.location.search)
  const redirectTo = searchParams.get('redirect') || '/portal/dashboard'
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  
  if (!error) {
    redirect(redirectTo)
  }
}
```

## 🚨 Troubleshooting

### Middleware redirect loop
- Zkontroluj že veřejné routy jsou správně definované
- Zkontroluj že matcher nezahrnuje _next/* soubory

### Role není rozpoznána
- Zkontroluj že user má nastavenou roli v `user_metadata` nebo `app_metadata`
- Zkontroluj že role je přesně 'admin' (case-sensitive)

### Session není refreshována
- Zkontroluj že Supabase credentials jsou v `.env.local`
- Restartuj dev server po změně env variables

---

**Status**: ✅ Middleware plně implementován a připraven  
**Matcher**: `/portal/:path*`  
**Auth Provider**: Supabase
