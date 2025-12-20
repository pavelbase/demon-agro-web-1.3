# Démon Agro - Uživatelský Portál 🌱

Moderní webová aplikace pro management pH půdy, plánování hnojení a správu pozemků pro zemědělce.

## 📋 Obsah

- [O Projektu](#o-projektu)
- [Funkce](#funkce)
- [Technologie](#technologie)
- [Instalace](#instalace)
- [Konfigurace](#konfigurace)
- [Vývoj](#vývoj)
- [Nasazení](#nasazení)
- [Dokumentace](#dokumentace)

---

## 🎯 O Projektu

**Démon Agro Portal** je komplexní řešení pro zemědělce v severních a západních Čechách, které nabízí:

- 📊 **Správa pozemků** - Evidence pozemků s rozlohou a kulturami
- 🧪 **AI Extrakce rozborů** - Automatické načítání dat z PDF rozborů pomocí Claude AI
- 🌾 **Plány hnojení** - 3 typy plánů (jednoduchý, detailní, pokročilý s predikcí)
- ⚗️ **Plány vápnění** - Výpočty potřeby vápna podle půdního typu
- 🛒 **Poptávkový systém** - Košík a správa poptávek na vápnění
- 📄 **Export** - PDF a Excel exporty plánů
- 📧 **Email notifikace** - Automatické emaily (welcome, reset, notifikace)
- 🔐 **Admin panel** - Kompletní správa uživatelů, produktů a poptávek

---

## ✨ Funkce

### Pro Uživatele

#### 1. Správa Pozemků
- ✅ CRUD operace (create, read, update, delete)
- ✅ Rozdělení a sloučení pozemků
- ✅ Archivace/obnovení
- ✅ Health card s pH a živinami
- ✅ Export do Excel

#### 2. Upload & AI Extrakce
- ✅ Drag & drop PDF upload
- ✅ AI extrakce pomocí Claude (14 polí)
- ✅ Validační stránka s editací
- ✅ Automatická kategorizace živin
- ✅ Denní limit 10 extrakcí/user

#### 3. Plány Hnojení
- ✅ Typ A: Jednoduchý (pouze rozbor)
- ✅ Typ B: Detailní (+ osevní postup)
- ✅ Typ C: Pokročilý (+ historie + 4letá predikce)
- ✅ Export do PDF a Excel
- ✅ Asistent rozhodování

#### 4. Plány Vápnění
- ✅ Výpočet potřeby CaO
- ✅ Doporučení typu vápna (vápenatý/dolomitický)
- ✅ 6 produktů Démon Agro v DB
- ✅ Kalkulace množství pro každý produkt

#### 5. Poptávky Vápnění
- ✅ Košík s localStorage persistence
- ✅ Floating cart button
- ✅ Formulář s kontakty
- ✅ Email notifikace na base@demonagro.cz
- ✅ Seznam poptávek (5 statusů)
- ✅ Detail modal

### Pro Adminy

#### 1. Dashboard
- ✅ 6 statistických karet
- ✅ Graf registrací (30 dní)
- ✅ Poslední poptávky (5)
- ✅ Poslední registrace (5)

#### 2. Správa Uživatelů
- ✅ Seznam (9 sloupců, filtry, export)
- ✅ CRUD operace
- ✅ Detail uživatele (5 tabů, READ-ONLY)
- ✅ Supabase Auth Admin API
- ✅ Welcome email s heslem

#### 3. Správa Produktů
- ✅ Hnojiva (CRUD + 6 seed produktů)
- ✅ Vápnění (CRUD + 6 seed produktů)
- ✅ Composition fields (JSONB)
- ✅ Active/Inactive toggle

#### 4. Správa Poptávek
- ✅ Seznam (filtry, NEW badge)
- ✅ Detail modal
- ✅ Admin akce (status, notes, price)
- ✅ Export Excel

#### 5. Správa Obrázků
- ✅ Upload (Supabase Storage)
- ✅ Drag & drop
- ✅ Reorder (šipky)
- ✅ CRUD operace

#### 6. Audit Log
- ✅ Všechny admin akce
- ✅ GDPR compliance
- ✅ Export Excel
- ✅ Pagination (50/page)

---

## 🛠 Technologie

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Excel:** SheetJS (xlsx)
- **PDF:** jsPDF + jspdf-autotable

### Backend
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **AI:** Anthropic Claude API
- **Email:** EmailJS

### Dev Tools
- **Package Manager:** npm
- **Linter:** ESLint
- **Type Checking:** TypeScript
- **Git:** Git + GitHub

---

## 📦 Instalace

### Požadavky

- **Node.js** 18+ 
- **npm** 9+
- **Supabase** account
- **Anthropic API** key
- **EmailJS** account

### Postup

```bash
# 1. Clone repository
git clone https://github.com/pavelbase/demon-agro.git
cd demon-agro

# 2. Install dependencies
npm install

# 3. Nastavit environment variables
cp .env.local.example .env.local
# Vyplnit všechny proměnné v .env.local

# 4. Spustit vývojový server
npm run dev

# 5. Otevřít v prohlížeči
# http://localhost:3000
```

---

## ⚙️ Konfigurace

### 1. Supabase Setup

1. Vytvořit projekt na [supabase.com](https://supabase.com)
2. Spustit SQL migrace z `lib/supabase/sql/`
3. Vytvořit Storage buckety:
   - `soil-documents` (private)
   - `portal-images` (public)
4. Nastavit RLS policies (viz SQL soubory)

### 2. Anthropic API

1. Získat API key na [anthropic.com](https://anthropic.com)
2. Přidat do `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxx
```

### 3. EmailJS

1. Zaregistrovat na [emailjs.com](https://emailjs.com)
2. Vytvořit 3 email templates (viz `EMAILJS_TEMPLATES_SETUP.md`)
3. Přidat credentials do `.env.local`

### 4. ENV Variables

Viz `.env.local.example` pro kompletní seznam.

**Kritické proměnné:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Anthropic
ANTHROPIC_API_KEY=your_api_key

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_key
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_id
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_id
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=template_id
```

---

## 🚀 Vývoj

### Příkazy

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Struktura Projektu

```
demon-agro/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Public homepage
│   ├── portal/              # Protected portal
│   │   ├── dashboard/       # User dashboard
│   │   ├── pozemky/         # Parcels management
│   │   ├── upload/          # PDF upload & AI
│   │   ├── poptavky/        # Liming requests
│   │   └── admin/           # Admin panel
│   └── api/                 # API routes
├── components/              # React components
│   ├── portal/              # Portal components
│   ├── admin/               # Admin components
│   └── ui/                  # UI primitives
├── lib/                     # Utilities
│   ├── supabase/            # Supabase client
│   ├── actions/             # Server actions
│   ├── utils/               # Utility functions
│   ├── contexts/            # React contexts
│   └── types/               # TypeScript types
├── public/                  # Static files
└── [docs]/                  # Documentation files
```

###  Důležité Konvence

- **Server Components** - Default (fetch data)
- **Client Components** - 'use client' (interactivity)
- **Server Actions** - 'use server' (mutations)
- **TypeScript** - Strict mode
- **Czech** - All UI texts in Czech

---

## 🌐 Nasazení

### Vercel (Doporučeno)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Nastavit ENV variables v Vercel dashboard
# 4. Připojit custom doménu
```

### Požadavky pro Production

- [x] Všechny ENV variables nastaveny
- [x] Supabase v produkčním režimu
- [x] EmailJS templates vytvořeny
- [x] Anthropic API key aktivní
- [x] Custom doména (optional)

---

## 📚 Dokumentace

### Setup Guides
- `SUPABASE_SETUP.md` - Supabase konfigurace
- `EMAILJS_TEMPLATES_SETUP.md` - Email templates
- `OBRAZKY_NAVOD.md` - Správa obrázků

### Phase Summaries
- `PHASE_1_6_SUMMARY.md` až `PHASE_7_COMPLETE.md`
- `PHASE_8_1_COMPLETE.md` - PDF Export
- `PHASE_8_2_COMPLETE.md` - Excel Export
- `PHASE_8_3_COMPLETE.md` - EmailJS

### Implementation Docs
- `DASHBOARD_IMPLEMENTATION.md`
- `ONBOARDING_IMPLEMENTATION.md`
- `PARCEL_DETAIL_IMPLEMENTATION.md`
- `MIDDLEWARE_IMPLEMENTATION.md`

---

## 🧪 Testování

### Testovací účty

```sql
-- Vytvořit admin účet
-- Viz: lib/supabase/sql/create_admin_user.sql

-- Vytvořit test uživatele
-- Viz: lib/supabase/sql/create_onboarding_test_users.sql
```

### Quick Test

1. **Registrace** → Login → Onboarding
2. **Pozemek** → Přidat → Upload rozbor
3. **Plán hnojení** → Generovat → Export PDF
4. **Plán vápnění** → Vybrat produkt → Košík
5. **Poptávka** → Odeslat → Email na admin

---

## 🤝 Contributing

Pro development kontaktujte:
- **Email:** base@demonagro.cz
- **Telefon:** +420 731 734 907

---

## 📄 License

© 2025 Démon Agro. Všechna práva vyhrazena.

---

## 🆘 Troubleshooting

### Časté problémy

**1. Supabase connection failed**
```
✓ Zkontrolovat URL a keys v .env.local
✓ Restartovat dev server
```

**2. AI extrakce nefunguje**
```
✓ Ověřit ANTHROPIC_API_KEY
✓ Zkontrolovat API credit
✓ Zkontrolovat denní limit (10/user)
```

**3. Emaily se neposílají**
```
✓ Ověřit EmailJS credentials
✓ Vytvořit templates v EmailJS dashboardu
✓ Zkontrolovat spam folder
```

**4. Build errors**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 Stats

- **Lines of Code:** ~21,000+
- **Components:** 100+
- **Database Tables:** 11
- **API Routes:** 18
- **Features:** 50+
- **Languages:** TypeScript, SQL, CSS

---

**Built with ❤️ for Czech farmers** 🌾🇨🇿

**Last Updated:** December 20, 2025
