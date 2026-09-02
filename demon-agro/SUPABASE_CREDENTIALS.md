# Supabase Credentials - Nakonfigurováno ✅

## Stav připojení

✅ **Supabase úspěšně nakonfigurován a připojen!**

- **Project ID**: `ppsldvsodvcbxecxjssf`
- **Project URL**: `https://ppsldvsodvcbxecxjssf.supabase.co`
- **Status**: Připojení ověřeno a funkční

## Environment Variables

Soubor `.env.local` byl vytvořen s následující konfigurací:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-key>
```

> Skutečné hodnoty patří výhradně do `.env.local` a do nastavení Vercelu, nikdy
> do repozitáře. Klíče najdete v dashboardu pod Settings → API Keys.

### Zbývající konfigurace

Následující environment variables čekají na doplnění:

```env
# Anthropic AI (for PDF extraction)
ANTHROPIC_API_KEY=your_anthropic_api_key

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

## Supabase Dashboard

🔗 **Dashboard URL**: https://supabase.com/dashboard/project/ppsldvsodvcbxecxjssf

### Následující kroky v Supabase Dashboard:

1. **Authentication Setup**
   - Settings → Authentication → Providers
   - Povolit Email provider
   - Nastavit email templates
   - Konfigurace URL redirects:
     - Site URL: `http://localhost:3000` (dev)
     - Redirect URLs: `http://localhost:3000/portal/dashboard`

2. **Database Schema**
   - Vytvořit tabulky pro:
     - `profiles` (uživatelské profily)
     - `fields` (pozemky)
     - `soil_analyses` (rozbory půdy)
     - `fertilization_plans` (plány hnojení)
     - `liming_plans` (plány vápnění)
     - `products` (produkty)
     - `quotes` (poptávky)
     - `audit_logs` (audit záznamy)

3. **Row Level Security (RLS)**
   - Zapnout RLS na všech tabulkách
   - Vytvořit policies pro:
     - Uživatelé vidí jen svá data
     - Admini vidí všechna data
     - Public read pro produkty

4. **Storage Buckets**
   - Vytvořit bucket `soil-analyses` pro PDF rozbory
   - Vytvořit bucket `portal-images` pro obrázky portálu
   - Nastavit RLS policies pro soubory

## Testování připojení

Připojení bylo úspěšně otestováno:

```bash
cd /workspace/demon-agro
# Výsledek:
✅ Successfully connected to Supabase!
✅ Auth system is working
   Project: ppsldvsodvcbxecxjssf
```

### Manuální test v kódu

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.getSession()
console.log('Connected!', data)
```

## Security Notes

⚠️ **DŮLEŽITÉ**:
- `.env.local` je v `.gitignore` - nebude commitnut
- NIKDY nesdílej Service Role Key veřejně
- Service Role Key používej POUZE na serveru
- Anon Key může být veřejný (použit v browser klientu)

## Dostupné klienty

Po nastavení `.env.local` jsou připraveny tyto klienty:

| Klient | Soubor | Použití |
|--------|--------|---------|
| Browser Client | `lib/supabase/client.ts` | Client Components |
| Server Client | `lib/supabase/server.ts` | Server Components, Server Actions |
| Admin Client | `lib/supabase/admin.ts` | Privilegované operace (server-only) |
| Auth Helpers | `lib/supabase/auth-helpers.ts` | Auth guards, user fetching |

## Rychlý start

1. ✅ Supabase credentials nakonfigurovány
2. ⏳ Vytvořit databázové schéma v Supabase Dashboard
3. ⏳ Vygenerovat TypeScript typy:
   ```bash
   npx supabase gen types typescript --project-id ppsldvsodvcbxecxjssf > lib/types/database.ts
   ```
4. ⏳ Povolit Email authentication
5. ⏳ Vytvořit první test user
6. ✅ Začít vyvíjet auth flow

## Další dokumentace

- 📖 [lib/supabase/README.md](lib/supabase/README.md) - Příklady použití
- 📖 [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Kompletní setup guide
- 🔗 [Supabase Documentation](https://supabase.com/docs)

---

**Status**: ✅ Připojeno a připraveno  
**Datum**: 19.12.2025  
**Project**: ppsldvsodvcbxecxjssf
