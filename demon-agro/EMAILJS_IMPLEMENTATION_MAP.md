# 🗺️ EmailJS - Mapa implementace v projektu

**Datum:** 6. ledna 2026  
**Účel:** Rychlý přehled všech míst, kde se používá EmailJS

---

## 📧 Přehled všech emailových cest

```
┌─────────────────────────────────────────────────────────────┐
│                    DÉMON AGRO - EmailJS                     │
│                   Service: service_xrx301a                  │
│                  Public Key: xL_Khx5Gcnt-lEvUl              │
└─────────────────────────────────────────────────────────────┘

┌──────────────── VEŘEJNÁ ČÁST WEBU ────────────────┐
│                                                    │
│  1. 🧮 Kalkulačka vápnění (/kalkulacka)          │
│     ├─ Soubor: app/(public)/kalkulacka/page.tsx  │
│     ├─ Template: template_grgltnp                 │
│     ├─ Účel: Výsledky kalkulace na email         │
│     └─ Status: ✅ Hotovo a funkční               │
│                                                    │
│  2. 📧 Kontaktní formulář (/kontakt)              │
│     ├─ Soubor: app/(public)/kontakt/page.tsx     │
│     ├─ Template: template_kogwumm                 │
│     ├─ Účel: Poptávky z kontaktního formuláře    │
│     └─ Status: ✅ Hotovo a funkční               │
│                                                    │
└────────────────────────────────────────────────────┘

┌──────────────── PORTÁLOVÁ ČÁST ───────────────────┐
│                                                    │
│  3. 🎉 Welcome Email (registrace)                 │
│     ├─ Funkce: lib/utils/email.ts                │
│     │   └─ sendWelcomeEmail()                     │
│     ├─ Template: NEXT_PUBLIC_EMAILJS_             │
│     │            WELCOME_TEMPLATE_ID              │
│     ├─ Volá se z: Vytvoření nového uživatele     │
│     ├─ Dokumentace: EMAILJS_WELCOME_TEMPLATE.md  │
│     └─ Status: 🆕 Připraveno k nastavení         │
│                                                    │
│  4. 🔐 Password Reset                             │
│     ├─ Funkce: lib/utils/email.ts                │
│     │   └─ sendPasswordResetEmail()              │
│     ├─ Template: NEXT_PUBLIC_EMAILJS_             │
│     │            PASSWORD_RESET_TEMPLATE_ID       │
│     ├─ Volá se z: Reset hesla adminem            │
│     ├─ Dokumentace:                               │
│     │   EMAILJS_PASSWORD_RESET_TEMPLATE.md       │
│     └─ Status: 🆕 Připraveno k nastavení         │
│                                                    │
│  5. 📬 Notifikace o poptávce (admin)              │
│     ├─ Funkce: lib/utils/email.ts                │
│     │   └─ sendNewLimingRequestNotification()    │
│     ├─ Template: NEXT_PUBLIC_EMAILJS_             │
│     │            LIMING_REQUEST_TEMPLATE_ID       │
│     ├─ Volá se z: Odeslání poptávky vápnění      │
│     ├─ Dokumentace: EMAILJS_LIMING_REQUEST_       │
│     │               NOTIFICATION_TEMPLATE.md      │
│     └─ Status: 🆕 Připraveno k nastavení         │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 📂 Soubory v projektu

### Implementační soubory:

```
demon-agro/
│
├─ app/(public)/
│  ├─ kalkulacka/page.tsx          ← 🧮 Kalkulačka (řádky 8, 183-206)
│  └─ kontakt/page.tsx              ← 📧 Kontakt (řádky 6, 58-72)
│
├─ lib/
│  ├─ utils/
│  │  └─ email.ts                   ← 🎯 Hlavní EmailJS modul
│  │     ├─ sendWelcomeEmail()               (řádky 128-162)
│  │     ├─ sendPasswordResetEmail()         (řádky 184-218)
│  │     └─ sendNewLimingRequestNotification() (řádky 248-300)
│  │
│  └─ actions/
│     └─ liming-requests.ts        ← Volá email při poptávce (řádky 176-210)
│
└─ package.json                    ← Závislost: "@emailjs/browser": "^3.11.0"
```

### Dokumentační soubory:

```
demon-agro/
│
├─ EMAILJS_PORTAL_SETUP_MASTER.md  ← 📚 HLAVNÍ NÁVOD (start zde!)
│
├─ EMAILJS_WELCOME_TEMPLATE.md                ← 🎉 Template 1
├─ EMAILJS_PASSWORD_RESET_TEMPLATE.md         ← 🔐 Template 2
├─ EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md  ← 📬 Template 3
│
├─ EMAILJS_TEMPLATE.md             ← Kalkulačka (již hotovo)
├─ EMAILJS_TEMPLATES_SETUP.md      ← Starší obecná dokumentace
├─ EMAILJS_412_FIX.md              ← Řešení chyby 412
│
└─ EMAILJS_IMPLEMENTATION_MAP.md   ← 🗺️ Tento soubor
```

---

## 🔑 Environment proměnné

### Soubor: `.env.local`

```env
# ===== EMAILJS - ZÁKLADNÍ NASTAVENÍ =====
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# ===== EMAILJS - PORTÁLOVÉ TEMPLATES =====
# 🎉 Welcome Email
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=

# 🔐 Password Reset
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=

# 📬 Notifikace o poptávce
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=

# ===== ADMIN NASTAVENÍ =====
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

**⚠️ Poznámka:** Prázdné Template ID vyplňte po vytvoření templates v EmailJS!

---

## 🎯 Jak to funguje

### 1. Veřejná část (Hardcoded)

**Kalkulačka** a **Kontaktní formulář** mají credentials přímo v kódu:

```typescript
// app/(public)/kalkulacka/page.tsx (řádek 183)
const serviceId = "service_xrx301a";
const templateId = "template_grgltnp";
const publicKey = "xL_Khx5Gcnt-lEvUl";

await emailjs.send(serviceId, templateId, templateParams, publicKey);
```

**Výhoda:** Jednodušší, bez závislosti na env variables  
**Použití:** Veřejně dostupné funkce

---

### 2. Portálová část (Environment Variables)

**Welcome**, **Password Reset**, **Notifikace** používají centrální modul:

```typescript
// lib/utils/email.ts (řádek 60)
function getEmailJSConfig(): EmailJSConfig | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  
  if (!serviceId || !publicKey) {
    console.warn('EmailJS not configured')
    return null
  }
  
  return { serviceId, publicKey }
}

// Každá funkce používá své Template ID
const templateId = process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
```

**Výhoda:** Centralizované, bezpečnější, flexibilnější  
**Použití:** Interní portálové funkce

---

## 📊 Flow diagram - Welcome Email

```
┌─────────────────────────────────────────────────────────┐
│  1. Admin vytvoří nového uživatele v admin panelu       │
│     /portal/admin/uzivatele                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. Volá se funkce pro vytvoření uživatele              │
│     app/portal/admin/uzivatele/actions.ts               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. Zavolá sendWelcomeEmail()                           │
│     lib/utils/email.ts                                  │
│     ├─ Načte env variables (Service ID, Public Key)    │
│     ├─ Načte Template ID                                │
│     ├─ Připraví data (jméno, email, heslo, URL)        │
│     └─ Zavolá EmailJS API                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. EmailJS zpracuje požadavek                          │
│     ├─ Ověří Service ID a Public Key                   │
│     ├─ Najde Template podle ID                          │
│     ├─ Nahradí proměnné v template                      │
│     └─ Odešle email                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  5. Email dorazí uživateli                              │
│     ✅ S logem Démon agro                               │
│     ✅ S přihlašovacími údaji                           │
│     ✅ S tlačítkem pro přihlášení                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Flow diagram - Notifikace o poptávce

```
┌─────────────────────────────────────────────────────────┐
│  1. Uživatel vytvoří poptávku vápnění v portálu         │
│     /portal/plan-vapneni/kosik                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. Odešle poptávku na server                           │
│     lib/actions/liming-requests.ts                      │
│     └─ createLimingRequest()                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. Zavolá sendNewLimingRequestNotification()           │
│     lib/utils/email.ts                                  │
│     ├─ Načte admin email z env                          │
│     ├─ Spočítá statistiky (pozemky, ha, tuny)          │
│     ├─ Připraví všechna data                            │
│     └─ Zavolá EmailJS API                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. EmailJS odešle email adminovi                       │
│     ├─ Reply-To: email zákazníka                        │
│     ├─ Subject: "Nová poptávka - Firma X"               │
│     └─ Obsah: Přehled poptávky                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  5. Admin dostane notifikaci                            │
│     ✅ Vidí statistiky na první pohled                  │
│     ✅ Může rychle kontaktovat zákazníka                │
│     ✅ Má odkaz do admin panelu                         │
│     ✅ Reply jde přímo zákazníkovi                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Jak najít konkrétní implementaci

### Potřebuji změnit kalkulačku:
```bash
# Otevřít soubor:
demon-agro/app/(public)/kalkulacka/page.tsx

# Hledat řádky 183-206 (funkce handleVypocet)
# Template dokumentace: EMAILJS_TEMPLATE.md
```

### Potřebuji změnit welcome email:
```bash
# Kód:
demon-agro/lib/utils/email.ts (řádky 128-162)

# Template v EmailJS:
EMAILJS_WELCOME_TEMPLATE.md

# Env variable:
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
```

### Potřebuji změnit notifikace:
```bash
# Kód:
demon-agro/lib/utils/email.ts (řádky 248-300)

# Volá se z:
demon-agro/lib/actions/liming-requests.ts

# Template v EmailJS:
EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md

# Env variable:
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID
```

---

## 🚀 Quick Start

### Pro nastavení nových portálových emailů:

```bash
# 1. Otevřít hlavní návod
open demon-agro/EMAILJS_PORTAL_SETUP_MASTER.md

# 2. Následovat checklist v dokumentu
#    - Vytvořit 3 templates v EmailJS
#    - Zkopírovat Template IDs
#    - Přidat do .env.local
#    - Restartovat server

# 3. Testovat
npm run dev
# Zkusit vytvořit uživatele, resetovat heslo, odeslat poptávku
```

---

## 📞 Kontakty a podpora

### EmailJS
- Dashboard: https://dashboard.emailjs.com
- Dokumentace: https://www.emailjs.com/docs/
- Support: support@emailjs.com

### Interní
- Projekt: Démon agro - Portál
- Email admin: base@demonagro.cz
- Web: https://demonagro.cz

---

## ✅ Checklist po implementaci

Po dokončení nastavení by mělo fungovat:

- [ ] Kalkulačka posílá výsledky na email ✅ (již funguje)
- [ ] Kontaktní formulář posílá zprávy ✅ (již funguje)
- [ ] Welcome email při registraci 🆕
- [ ] Password reset email 🆕
- [ ] Notifikace o poptávkách adminovi 🆕
- [ ] Všechna loga se zobrazují správně
- [ ] Reply-To funguje u notifikací
- [ ] Mobil + desktop design funguje

---

**Status:** 📋 Kompletní dokumentace + mapa implementace  
**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Další krok:** 👉 Otevřít `EMAILJS_PORTAL_SETUP_MASTER.md`



