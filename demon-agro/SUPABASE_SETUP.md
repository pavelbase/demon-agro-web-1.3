# Supabase Setup - Dokončeno ✅

## Přehled implementace

Supabase klienty pro Next.js 14 App Router jsou plně nakonfigurovány a připraveny k použití.

## Vytvořené soubory

### 1. Supabase Klienty (`lib/supabase/`)

#### ✅ `client.ts` - Browser Client
- Pro Client Components (`'use client'`)
- Používá `createBrowserClient` z `@supabase/ssr`
- Automatická správa session v prohlížeči

#### ✅ `server.ts` - Server Client  
- Pro Server Components a Server Actions
- Používá `createServerClient` z `@supabase/ssr`
- Správná konfigurace cookies pro Next.js 14
- Automatické obnovování session

#### ✅ `middleware.ts` - Auth Middleware
- Export funkce `updateSession`
- Automatické obnovování session při každém requestu
- Správa auth cookies

#### ✅ `admin.ts` - Admin Client (Service Role)
- Pro privilegované operace na serveru
- Používá SUPABASE_SERVICE_ROLE_KEY
- ⚠️ NIKDY nepoužívat na klientovi!

#### ✅ `auth-helpers.ts` - Auth Helper Funkce
- `getCurrentUser()` - získání aktuálního uživatele
- `requireAuth()` - ochrana stránek (redirect pokud není přihlášen)
- `isAdmin()` - kontrola admin role
- `requireAdmin()` - ochrana admin stránek
- `getSession()` - získání session

#### ✅ `README.md` - Dokumentace
- Kompletní příklady použití
- Best practices
- Real-time subscriptions
- Security guidelines

### 2. Root Middleware (`middleware.ts`)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

- Automaticky volán pro všechny requesty
- Obnovuje Supabase session
- Správný matcher pro Next.js static files

### 3. Database Types (`lib/types/database.ts`)

- TypeScript typy pro Supabase databázi
- Placeholder struktura pro profily
- Helper types: `Tables<T>` a `Enums<T>`
- Připraveno pro generování typů: 
  ```bash
  npx supabase gen types typescript --project-id your-project-id
  ```

### 4. Environment Variables (`.env.local.example`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic AI (for PDF extraction)
ANTHROPIC_API_KEY=your_anthropic_api_key

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Email recipients
NEXT_PUBLIC_CONTACT_EMAIL=base@demonagro.cz
NEXT_PUBLIC_ADMIN_EMAIL=admin@demonagro.cz
```

## Následující kroky

### 1. Nastavení Supabase Projektu

1. Vytvoř projekt na [supabase.com](https://supabase.com)
2. Zkopíruj Project URL a API keys
3. Vytvoř `.env.local` a vlož credentials:

```bash
cp .env.local.example .env.local
# Edituj .env.local a doplň skutečné hodnoty
```

### 2. Database Schema

Po vytvoření databázového schématu v Supabase:

```bash
# Vygeneruj TypeScript typy
npx supabase gen types typescript --project-id your-project-id > lib/types/database.ts
```

### 3. Auth Setup v Supabase Dashboard

1. **Email Authentication**
   - Settings → Authentication → Providers
   - Povolit Email provider
   - Nastavit email templates

2. **URL Configuration**
   - Site URL: `http://localhost:3000` (dev) / `https://your-domain.com` (prod)
   - Redirect URLs: 
     - `http://localhost:3000/portal/dashboard`
     - `https://your-domain.com/portal/dashboard`

3. **Row Level Security (RLS)**
   - Zapnout RLS na všech tabulkách
   - Vytvořit policies pro čtení/zápis

## Použití

### Client Component
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()
  // ... use supabase
}
```

### Server Component
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  // ... render data
}
```

### Protected Page
```tsx
import { requireAuth } from '@/lib/supabase/auth-helpers'

export default async function ProtectedPage() {
  const user = await requireAuth()
  return <div>Přihlášen jako: {user.email}</div>
}
```

### Admin Page
```tsx
import { requireAdmin } from '@/lib/supabase/auth-helpers'

export default async function AdminPage() {
  await requireAdmin()
  return <div>Admin panel</div>
}
```

## Security Best Practices

✅ **ANO:**
- Používej `createClient()` pro browser operace
- Používej `await createClient()` pro server operace
- Používej `createAdminClient()` POUZE na serveru
- Zapni RLS na všech tabulkách
- Validuj všechny inputs

❌ **NE:**
- NIKDY nepoužívej Service Role Key na klientovi
- NIKDY neposílej citlivá data v URL
- Nevěř client-side validaci (validuj i na serveru)

## Testování

```bash
# Spusť dev server
npm run dev

# Otevři http://localhost:3000
# Zkontroluj že middleware funguje (žádné console errory)
```

## Troubleshooting

### "Missing Supabase environment variables"
- Zkontroluj že `.env.local` existuje a obsahuje všechny hodnoty
- Restartuj dev server po změně env variables

### Middleware nefunguje
- Zkontroluj že `middleware.ts` je v root složce
- Zkontroluj matcher v middleware config

### Auth redirect loop
- Zkontroluj Redirect URLs v Supabase Dashboard
- Zkontroluj že middleware správně obnovuje session

## Další dokumentace

- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status**: ✅ Plně implementováno a připraveno k použití  
**Datum**: 19.12.2025  
**Framework**: Next.js 14 App Router  
**Auth Provider**: Supabase
