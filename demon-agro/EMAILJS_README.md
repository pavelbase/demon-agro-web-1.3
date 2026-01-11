# 📧 EmailJS - Dokumentace projektu Démon agro

**Rychlá navigace v EmailJS dokumentaci projektu**

---

## 🚀 Začínám s nastavením portálových emailů

👉 **Otevřete:** [`EMAILJS_PORTAL_SETUP_MASTER.md`](EMAILJS_PORTAL_SETUP_MASTER.md)

Tento dokument obsahuje:
- ✅ Kompletní checklist pro nastavení
- ✅ Krok za krokem návod
- ✅ Odkazy na všechny potřebné templates
- ✅ Testovací data
- ✅ Řešení problémů

**Doba nastavení:** 30-40 minut

---

## 📚 Dokumenty podle účelu

### 🎯 **Chci nastavit portálové emaily** (Welcome, Reset, Notifikace)
→ [`EMAILJS_PORTAL_SETUP_MASTER.md`](EMAILJS_PORTAL_SETUP_MASTER.md)

### 🗺️ **Chci vidět, kde všude se EmailJS používá**
→ [`EMAILJS_IMPLEMENTATION_MAP.md`](EMAILJS_IMPLEMENTATION_MAP.md)

### 🎉 **Chci vytvořit Welcome Email template**
→ [`EMAILJS_WELCOME_TEMPLATE.md`](EMAILJS_WELCOME_TEMPLATE.md)

### 🔐 **Chci vytvořit Password Reset template**
→ [`EMAILJS_PASSWORD_RESET_TEMPLATE.md`](EMAILJS_PASSWORD_RESET_TEMPLATE.md)

### 📬 **Chci vytvořit Notifikaci o poptávce**
→ [`EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`](EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md)

### 🧮 **Chci upravit kalkulačku (již hotovo)**
→ [`EMAILJS_TEMPLATE.md`](EMAILJS_TEMPLATE.md)

### 🐛 **Mám chybu 412**
→ [`EMAILJS_412_FIX.md`](EMAILJS_412_FIX.md)

---

## 📋 Stručný přehled

### ✅ Již funkční (veřejná část):
- 🧮 **Kalkulačka vápnění** (`/kalkulacka`) - Template: `template_grgltnp`
- 📧 **Kontaktní formulář** (`/kontakt`) - Template: `template_kogwumm`

### 🆕 Připraveno k nastavení (portál):
- 🎉 **Welcome Email** - Registrace nového uživatele
- 🔐 **Password Reset** - Reset hesla
- 📬 **Notifikace o poptávce** - Nová poptávka vápnění (pro admina)

---

## ⚡ Rychlé odkazy

| Co potřebuji | Dokument |
|-------------|----------|
| **Kompletní setup od začátku** | [`EMAILJS_PORTAL_SETUP_MASTER.md`](EMAILJS_PORTAL_SETUP_MASTER.md) |
| **Mapa všech implementací** | [`EMAILJS_IMPLEMENTATION_MAP.md`](EMAILJS_IMPLEMENTATION_MAP.md) |
| **Template pro Welcome email** | [`EMAILJS_WELCOME_TEMPLATE.md`](EMAILJS_WELCOME_TEMPLATE.md) |
| **Template pro Password reset** | [`EMAILJS_PASSWORD_RESET_TEMPLATE.md`](EMAILJS_PASSWORD_RESET_TEMPLATE.md) |
| **Template pro Notifikace** | [`EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`](EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md) |
| **Řešení chyby 412** | [`EMAILJS_412_FIX.md`](EMAILJS_412_FIX.md) |
| **Kalkulačka (hotovo)** | [`EMAILJS_TEMPLATE.md`](EMAILJS_TEMPLATE.md) |
| **Starší obecná dokumentace** | [`EMAILJS_TEMPLATES_SETUP.md`](EMAILJS_TEMPLATES_SETUP.md) |

---

## 🎨 Co jsou v templates

### Welcome Email (Registrace)
```
├─ Logo Démon agro
├─ Uvítací zpráva
├─ Přihlašovací email
├─ Dočasné heslo
├─ Tlačítko pro přihlášení
├─ Bezpečnostní upozornění
└─ Kontaktní informace
```

### Password Reset
```
├─ Logo Démon agro
├─ Upozornění na reset
├─ Přihlašovací email
├─ Nové heslo
├─ Tlačítko pro přihlášení
├─ Bezpečnostní doporučení
└─ Kontaktní informace
```

### Notifikace o poptávce (Admin)
```
├─ Logo Démon agro
├─ Badge "NOVÁ POPTÁVKA"
├─ ID poptávky
├─ Statistiky (pozemky, ha, tuny)
├─ Info o zákazníkovi
├─ Rychlé kontakty (email, telefon)
├─ Detaily poptávky
├─ Poznámka zákazníka
├─ Tlačítko do admin panelu
└─ Reply-To na zákaznický email ⭐
```

---

## 🔧 Potřebné údaje

### EmailJS účet (společný):
```
Service ID:  service_xrx301a
Public Key:  xL_Khx5Gcnt-lEvUl
Dashboard:   https://dashboard.emailjs.com
```

### Template IDs (vytvoříte):
```
Welcome Email:              NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
Password Reset:             NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID
Liming Request Notification: NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID
```

### Admin nastavení:
```
Admin Email: base@demonagro.cz
Portal URL:  https://portal.demonagro.cz
Logo URL:    https://demonagro.cz/logo.png
```

---

## 🎯 Pracovní postup

```
1. Přečíst EMAILJS_PORTAL_SETUP_MASTER.md         (5 min)
                    ↓
2. Přihlásit se do EmailJS Dashboard              (1 min)
                    ↓
3. Vytvořit 3 templates podle dokumentů           (20 min)
   ├─ EMAILJS_WELCOME_TEMPLATE.md
   ├─ EMAILJS_PASSWORD_RESET_TEMPLATE.md
   └─ EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md
                    ↓
4. Poznamenat si Template IDs                     (1 min)
                    ↓
5. Přidat Template IDs do .env.local              (2 min)
                    ↓
6. Restartovat vývojový server                    (1 min)
                    ↓
7. Testovat všechny 3 emaily                      (10 min)
                    ↓
8. ✅ HOTOVO!
```

---

## 💡 Tipy

### ✅ Dobrá praxe:
- Testujte každý template po vytvoření
- Kontrolujte, že logo se zobrazuje
- Zkontrolujte responzivitu (desktop + mobil)
- U Liming Request ověřte Reply-To funkci

### ⚠️ Časté chyby:
- Zapomenuté restart serveru po změně `.env.local`
- Špatně zkopírované Template ID
- Chybějící Reply-To u notifikací
- Nesprávný Subject (zapomenuté `{{proměnné}}`)

### 🐛 Debugging:
- Zkontrolujte console v prohlížeči (F12)
- Zkontrolujte EmailJS Dashboard → Usage
- Ověřte environment proměnné v kódu

---

## 📊 Statistiky projektu

```
Celkem emailových funkcí:     5
├─ Veřejná část:             2 (hotovo)
└─ Portál:                   3 (připraveno)

Celkem templates v EmailJS:  5
├─ Již vytvořené:            2
└─ K vytvoření:              3

Celkem dokumentačních MD:    9
└─ Tento přehled:            1
```

---

## 🎓 Pro vývojáře

### Kde jsou implementace:
```typescript
// Veřejná část (hardcoded)
app/(public)/kalkulacka/page.tsx        // Řádky 183-206
app/(public)/kontakt/page.tsx           // Řádky 58-72

// Portál (centralizované)
lib/utils/email.ts                      // Hlavní modul
  ├─ sendWelcomeEmail()                 // Řádky 128-162
  ├─ sendPasswordResetEmail()           // Řádky 184-218
  └─ sendNewLimingRequestNotification() // Řádky 248-300
```

### Kde se volají:
```typescript
// Welcome + Reset
app/portal/admin/uzivatele/actions.ts

// Notifikace
lib/actions/liming-requests.ts          // Řádky 176-210
```

---

## 🆘 Pomoc

### EmailJS podpora:
- 📧 Email: support@emailjs.com
- 📚 Docs: https://www.emailjs.com/docs/
- 💬 GitHub: https://github.com/emailjs

### Interní:
- Projekt: Démon agro - Portál
- Web: https://demonagro.cz
- Email: base@demonagro.cz
- Telefon: +420 731 734 907

---

## 🎉 Po dokončení nastavení

Budete mít plně funkční emailový systém:

✅ Automatické odesílání výsledků kalkulace  
✅ Zpracování kontaktních formulářů  
✅ Welcome emaily pro nové uživatele  
✅ Bezpečné resetování hesel  
✅ Okamžité notifikace o poptávkách  

Vše s profesionálním designem a logem Démon agro! 🌱

---

**Vytvořeno:** 6. ledna 2026  
**Verze:** 1.0  
**Projekt:** Démon agro - Portál pro správu pozemků a vápnění  

**👉 Další krok:** Otevřete [`EMAILJS_PORTAL_SETUP_MASTER.md`](EMAILJS_PORTAL_SETUP_MASTER.md) a začněte! 🚀


