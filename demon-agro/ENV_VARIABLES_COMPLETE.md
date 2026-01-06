# 🔐 Kompletní přehled ENV proměnných

## 📋 Soubor `.env.local` (vytvořte si ručně)

Vytvořte soubor `demon-agro/.env.local` s tímto obsahem:

```env
# ============================================================================
# SUPABASE - Databáze a autentizace
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ============================================================================
# GOOGLE AI (GEMINI) - Extrakce dat z PDF rozborů půdy
# ============================================================================
GEMINI_API_KEY=your_gemini_api_key_here

# ============================================================================
# EMAILJS - Odesílání emailů
# ============================================================================

# Základní nastavení (společné pro všechny templates)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# --- Templates pro VEŘEJNOU ČÁST (již existující) ---
# Tyto jsou přímo v kódu, NEpotřebují ENV proměnné:
# - Kalkulačka vápnění: template_grgltnp (v app/(public)/kalkulacka/page.tsx)
# - Kontaktní formulář: template_kogwumm (v app/(public)/kontakt/page.tsx)

# --- Templates pro PORTÁL (je třeba vytvořit v EmailJS) ---
# Welcome Email - zasílá se novým uživatelům při registraci
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=your_welcome_template_id

# Password Reset - zasílá se při resetu hesla adminem
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=your_password_reset_template_id

# Liming Request Notification - notifikace admina o nové poptávce vápnění
NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID=your_liming_notification_template_id

# ============================================================================
# APLIKAČNÍ NASTAVENÍ
# ============================================================================
# URL aplikace (používá se v emailech pro odkazy)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin email (pro notifikace)
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
```

---

## 🔍 Aktuální stav klíčů

### ✅ Již máte (zmíněno v dotazu):

| Služba | Typ | ID/Klíč |
|--------|-----|---------|
| EmailJS | Service ID | `service_xrx301a` |
| EmailJS | Public Key | `xL_Khx5Gcnt-lEvUl` |
| EmailJS | Template (Kalkulačka) | `template_grgltnp` |
| EmailJS | Template (Kontakt) | `template_kogwumm` |

### ⚠️ Problém: Google AI klíč je přímo v kódu!

**Soubor:** `demon-agro/app/api/portal/extract-soil-data/route.ts`  
**Řádek 10:**
```typescript
const GEMINI_API_KEY = "AIzaSyB1d6Iktd6p2Tr-o3adDbbjPR828tEW6Gc"
```

**Toto je BEZPEČNOSTNÍ RIZIKO!** Klíč je viditelný v kódu a pushnutý na GitHub.

**✅ OPRAVA:**
1. Přidejte klíč do `.env.local`: `GEMINI_API_KEY=AIzaSyB1d6Iktd6p2Tr-o3adDbbjPR828tEW6Gc`
2. Změňte kód v `extract-soil-data/route.ts`:
```typescript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
```

### ❓ Chybí vám (pro portálové funkce):

**Pro EmailJS portálové templates** - Vytvořte je podle dokumentace:
- 📄 `EMAILJS_WELCOME_TEMPLATE.md` → vytvoří template ID → doplňte do `NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID`
- 📄 `EMAILJS_PASSWORD_RESET_TEMPLATE.md` → vytvoří template ID → doplňte do `NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID`
- 📄 `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md` → vytvoří template ID → doplňte do `NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID`

---

## 📍 Kde se klíče používají

### 1. Google AI / Gemini API
**Soubor:** `demon-agro/app/api/portal/extract-soil-data/route.ts`  
**Používá se pro:** Extrakci dat z PDF rozborů půdy pomocí AI  
**Momentálně:** Hardcodovaný v kódu (⚠️ OPRAVIT!)

### 2. EmailJS - Veřejná část
**Soubory:**
- `demon-agro/app/(public)/kalkulacka/page.tsx` (řádek 184) - použití `template_grgltnp`
- `demon-agro/app/(public)/kontakt/page.tsx` (řádek 60) - použití `template_kogwumm`

**Používají:** Service ID a Public Key (již máte)  
**Template IDs:** Hardcodované v kódu, **není třeba** je dávat do ENV

### 3. EmailJS - Portál
**Soubor:** `demon-agro/lib/utils/email-client.ts`  
**Funkce:**
- `sendWelcomeEmailClient()` - použití `NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID`
- `sendPasswordResetEmailClient()` - použití `NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID`
- `sendNewLimingRequestNotification()` - použití `NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID`

**Stav:** ❌ Chybí template IDs v ENV

---

## 🚀 Jak to nastavit

### Krok 1: Vytvořte `.env.local`
```bash
cd demon-agro
# Vytvořte soubor ručně nebo:
notepad .env.local  # Windows
# nebo
nano .env.local     # Linux/Mac
```

### Krok 2: Zkopírujte obsah
Zkopírujte template výše a vyplňte hodnoty

### Krok 3: Opravte bezpečnostní problém
Upravte `demon-agro/app/api/portal/extract-soil-data/route.ts`:
```typescript
// PŘED:
const GEMINI_API_KEY = "AIzaSyB1d6Iktd6p2Tr-o3adDbbjPR828tEW6Gc"

// PO:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
```

### Krok 4: Vytvořte portálové templates v EmailJS
1. Přihlaste se na https://dashboard.emailjs.com
2. Vytvořte 3 templates podle těchto dokumentů:
   - `EMAILJS_WELCOME_TEMPLATE.md`
   - `EMAILJS_PASSWORD_RESET_TEMPLATE.md`
   - `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`
3. Zkopírujte jejich Template IDs do `.env.local`

### Krok 5: Restart aplikace
```bash
npm run dev
```

### Krok 6: Nastavte na Vercelu
V **Vercel Dashboard → Project Settings → Environment Variables** přidejte všechny proměnné z `.env.local`

---

## ⚠️ DŮLEŽITÉ BEZPEČNOSTNÍ UPOZORNĚNÍ

### 🚨 OKAMŽITĚ:
1. **Změňte Google AI klíč** - ten současný je veřejně na GitHubu!
   - Jděte na https://makersuite.google.com/app/apikey
   - Smažte starý klíč
   - Vygenerujte nový
   - Přidejte do `.env.local`
   - Opravte kód

2. **Nikdy necommitujte `.env.local`** do Gitu
   - Je automaticky v `.gitignore`
   - Používejte jen pro lokální development

3. **Na Vercelu** nastavte ENV proměnné v dashboardu, ne v kódu

---

## 📚 Související dokumentace
- `EMAILJS_PORTAL_SETUP_MASTER.md` - Hlavní návod na nastavení EmailJS
- `EMAILJS_README.md` - Přehled EmailJS v projektu
- `CALCULATOR_SECURITY_README.md` - Bezpečnost kalkulačky

