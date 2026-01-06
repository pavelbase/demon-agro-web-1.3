# 📧 EmailJS - Kompletní nastavení pro portál Démon agro

**Datum:** 6. ledna 2026  
**Status:** ✅ Připraveno k implementaci  
**EmailJS účet:** Společný s veřejnou částí webu

---

## 🎯 Přehled emailových notifikací

Portál Démon agro používá **EmailJS** pro 5 typů emailů:

### ✅ Již nastavené (veřejná část):
1. **Kalkulačka vápnění** (`/kalkulacka`) - `template_grgltnp`
2. **Kontaktní formulář** (`/kontakt`) - `template_kogwumm`

### 🆕 Nově připravené (portál):
3. **Welcome email** - Registrace nového uživatele
4. **Password reset** - Reset hesla uživatele
5. **Notifikace o poptávce** - Nová poptávka vápnění (pro admina)

---

## 📋 Checklist - Kompletní nastavení

### Krok 1: Příprava v EmailJS (5-10 minut)

- [ ] Přihlásit se na [EmailJS Dashboard](https://dashboard.emailjs.com)
- [ ] Ověřit, že máte **Service ID:** `service_xrx301a`
- [ ] Ověřit, že máte **Public Key:** `xL_Khx5Gcnt-lEvUl`

### Krok 2: Vytvoření 3 nových templates (20-30 minut)

#### Template 1: Welcome Email
- [ ] Vytvořit nový template: **Email Templates** → **Create New Template**
- [ ] Název: `Démon agro - Welcome Email (Portál)`
- [ ] Subject: `Vítejte v portálu Démon agro - Přihlašovací údaje`
- [ ] From: `base@demonagro.cz`
- [ ] Reply To: `base@demonagro.cz`
- [ ] Zkopírovat HTML z `EMAILJS_WELCOME_TEMPLATE.md`
- [ ] Zkopírovat Plain Text z `EMAILJS_WELCOME_TEMPLATE.md`
- [ ] Uložit a poznamenat **Template ID**
- [ ] Odeslat testovací email

#### Template 2: Password Reset
- [ ] Vytvořit nový template: **Email Templates** → **Create New Template**
- [ ] Název: `Démon agro - Password Reset (Portál)`
- [ ] Subject: `Reset hesla - Portál Démon agro`
- [ ] From: `base@demonagro.cz`
- [ ] Reply To: `base@demonagro.cz`
- [ ] Zkopírovat HTML z `EMAILJS_PASSWORD_RESET_TEMPLATE.md`
- [ ] Zkopírovat Plain Text z `EMAILJS_PASSWORD_RESET_TEMPLATE.md`
- [ ] Uložit a poznamenat **Template ID**
- [ ] Odeslat testovací email

#### Template 3: Liming Request Notification
- [ ] Vytvořit nový template: **Email Templates** → **Create New Template**
- [ ] Název: `Démon agro - Nová poptávka vápnění (Admin)`
- [ ] Subject: `🆕 Nová poptávka vápnění - {{company_name}}`
- [ ] From: `base@demonagro.cz`
- [ ] **Reply To:** `{{contact_email}}` ⚠️ **Důležité!**
- [ ] Zkopírovat HTML z `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`
- [ ] Zkopírovat Plain Text z `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`
- [ ] Uložit a poznamenat **Template ID**
- [ ] Odeslat testovací email

### Krok 3: Nastavení environment proměnných (2 minuty)

Přidat do `.env.local` v projektu:

```env
# EmailJS - Základní nastavení (již existující)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# EmailJS - Nové portálové templates
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=vas_template_id_zde
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=vas_template_id_zde
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=vas_template_id_zde

# Admin nastavení
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

**Nahraďte** `vas_template_id_zde` skutečnými Template ID z EmailJS!

### Krok 4: Restart aplikace (1 minuta)

```bash
# Zastavit vývojový server (Ctrl+C)
# Znovu spustit
npm run dev
```

### Krok 5: Testování (10 minut)

#### Test 1: Welcome Email
- [ ] V admin panelu vytvořit nového testovacího uživatele
- [ ] Ověřit, že email dorazil
- [ ] Zkontrolovat, že logo se zobrazuje
- [ ] Zkontrolovat, že všechny údaje jsou správně
- [ ] Zkusit přihlášení s dočasnýchm heslem

#### Test 2: Password Reset
- [ ] V admin panelu resetovat heslo testovacímu uživateli
- [ ] Ověřit, že email dorazil
- [ ] Zkontrolovat design a údaje
- [ ] Zkusit přihlášení s novým heslem

#### Test 3: Liming Request Notification
- [ ] Přihlásit se jako běžný uživatel (ne admin)
- [ ] Vytvořit poptávku vápnění
- [ ] Ověřit, že email dorazil adminovi (base@demonagro.cz)
- [ ] Zkontrolovat všechny údaje
- [ ] **Zkusit kliknout "Odpovědět"** - mělo by odpovídat zákazníkovi

---

## 📚 Dokumentace pro jednotlivé templates

### 1. Welcome Email (Registrace)
📄 **Dokument:** `EMAILJS_WELCOME_TEMPLATE.md`  
🎯 **Účel:** Zaslání přihlašovacích údajů novým uživatelům  
📧 **Proměnné:** 4 (to_name, user_email, temporary_password, portal_url)  
🔧 **Volá se:** Při vytvoření nového uživatele adminem  
💼 **Funkce:** `sendWelcomeEmail()` v `lib/utils/email.ts`

**Klíčové vlastnosti:**
- Profesionální uvítání s logem
- Bezpečné zobrazení přihlašovacích údajů
- Upozornění na změnu hesla
- Tlačítko pro přímé přihlášení

### 2. Password Reset
📄 **Dokument:** `EMAILJS_PASSWORD_RESET_TEMPLATE.md`  
🎯 **Účel:** Zaslání nového hesla při resetu  
📧 **Proměnné:** 4 (to_name, user_email, new_password, portal_url)  
🔧 **Volá se:** Při resetování hesla adminem  
💼 **Funkce:** `sendPasswordResetEmail()` v `lib/utils/email.ts`

**Klíčové vlastnosti:**
- Bezpečnostní upozornění
- Jasné zobrazení nového hesla
- Doporučení pro vytvoření silného hesla
- Tlačítko pro přihlášení

### 3. Liming Request Notification (Admin)
📄 **Dokument:** `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`  
🎯 **Účel:** Notifikace admina o nové poptávce  
📧 **Proměnné:** 12 (company_name, contact_name, contact_email, atd.)  
🔧 **Volá se:** Při odeslání poptávky vápnění uživatelem  
💼 **Funkce:** `sendNewLimingRequestNotification()` v `lib/utils/email.ts`

**Klíčové vlastnosti:**
- Přehledné statistiky (pozemky, hektary, tuny)
- Rychlé kontakty na zákazníka
- **Reply-To na zákaznický email**
- Tlačítko do admin panelu
- Subject obsahuje název firmy

---

## 🎨 Design systém

Všechny templates používají jednotný design:

### Barvy (Démon agro)
```css
Primární zelená:      #4A7C59
Tmavší zelená:        #3d6449
Béžové pozadí:        #F5F1E8
Žluté upozornění:     #FFF9C4
Oranžové poznámky:    #FFF3E0
Modré info:           #E3F2FD
Červené bezpečnostní: #FFEBEE
```

### Logo
```
URL: https://demonagro.cz/logo.png
Soubor: /public/logo.png
Rozměr v emailu: max-width: 200px
```

### Typografie
```
Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif
Hlavní text: 14-16px
Nadpisy: 18-26px
```

---

## 🔍 Testovací data

### Pro Welcome Email:
```json
{
  "to_name": "Jan Testovací",
  "user_email": "jan.test@example.com",
  "temporary_password": "Test1234!",
  "portal_url": "https://portal.demonagro.cz/portal/prihlaseni"
}
```

### Pro Password Reset:
```json
{
  "to_name": "Jan Testovací",
  "user_email": "jan.test@example.com",
  "new_password": "NewTest1234!",
  "portal_url": "https://portal.demonagro.cz/portal/prihlaseni"
}
```

### Pro Liming Request:
```json
{
  "company_name": "Testovací Farma s.r.o.",
  "contact_name": "Jan Testovací",
  "contact_email": "jan.test@farma.cz",
  "contact_phone": "+420 123 456 789",
  "district": "Louny",
  "parcel_count": 5,
  "total_area": "42.50",
  "total_quantity": "125.75",
  "delivery_period": "Jaro 2026",
  "notes": "Prosím o cenovou nabídku.",
  "admin_url": "https://portal.demonagro.cz/portal/admin/poptavky",
  "request_id": "a3f5b7c2"
}
```

---

## 🚨 Řešení problémů

### Email se neposílá
1. Zkontrolujte environment proměnné v `.env.local`
2. Restartujte vývojový server
3. Zkontrolujte console v prohlížeči (F12)
4. Zkontrolujte EmailJS Dashboard → Usage (kvóta)

### Logo se nezobrazuje
1. Ověřte, že `https://demonagro.cz/logo.png` je dostupné
2. Pro testování můžete použít: `https://via.placeholder.com/200x80/4A7C59/FFFFFF?text=Demon+Agro`

### Template ID není rozpoznáno
1. Zkontrolujte, že Template ID je správně zkopírováno
2. Zkontrolujte, že v `.env.local` není překlep
3. Restartujte server po změně `.env.local`

### Email má chybu 412
- Zkontrolujte, že všechny proměnné v template jsou správně
- Zkontrolujte, že Service ID a Public Key jsou správné
- Viz `EMAILJS_412_FIX.md` pro detailní řešení

---

## 📊 Struktura kódu

### Kde se emaily posílají:

```
lib/utils/email.ts
├── sendWelcomeEmail()              → Welcome Email
├── sendPasswordResetEmail()        → Password Reset
└── sendNewLimingRequestNotification() → Liming Request

Volá se z:
├── app/portal/admin/uzivatele/actions.ts  (Welcome + Reset)
└── lib/actions/liming-requests.ts         (Liming Request)
```

### Environment proměnné v kódu:

```typescript
// Základní konfigurace
process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// Template ID
process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID
process.env.NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID

// Admin nastavení
process.env.NEXT_PUBLIC_ADMIN_EMAIL
process.env.NEXT_PUBLIC_APP_URL
```

---

## ✅ Finální kontrola

Po dokončení nastavení zkontrolujte:

- [ ] Všechny 3 templates jsou vytvořeny v EmailJS
- [ ] Všechny Template ID jsou zkopírovány do `.env.local`
- [ ] Server byl restartován
- [ ] Testovací email pro Welcome byl odeslán a dorazil
- [ ] Testovací email pro Password Reset byl odeslán a dorazil
- [ ] Testovací email pro Liming Request byl odeslán a dorazil
- [ ] Logo se zobrazuje ve všech emailech
- [ ] Reply-To funguje u Liming Request emailu
- [ ] Design vypadá profesionálně na desktop i mobilu

---

## 🎉 Hotovo!

Po dokončení všech kroků budete mít:

✅ **5 typů automatických emailů:**
1. Kalkulačka vápnění (výsledky)
2. Kontaktní formulář
3. Welcome email (registrace)
4. Password reset
5. Notifikace o poptávce

✅ **Profesionální design** s logem firmy  
✅ **Mobilní optimalizace** pro všechny zařízení  
✅ **Bezpečné zasílání** přihlašovacích údajů  
✅ **Rychlá komunikace** díky Reply-To  

---

## 📞 Podpora

**EmailJS dokumentace:** https://www.emailjs.com/docs/  
**EmailJS support:** support@emailjs.com  

**Interní dokumenty:**
- `EMAILJS_TEMPLATE.md` - Kalkulačka (již hotovo)
- `EMAILJS_WELCOME_TEMPLATE.md` - Welcome email
- `EMAILJS_PASSWORD_RESET_TEMPLATE.md` - Password reset
- `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md` - Notifikace
- `EMAILJS_412_FIX.md` - Řešení chyby 412

---

**Status:** ✅ Kompletní dokumentace připravena  
**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Autor:** AI Assistant  
**Projekt:** Démon agro - Portál pro správu pozemků a vápnění

