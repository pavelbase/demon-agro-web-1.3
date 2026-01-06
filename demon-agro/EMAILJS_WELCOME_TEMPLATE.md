# 📧 EmailJS Template - Welcome Email (Registrace nového uživatele)

**Template ID:** Nastavíte v EmailJS (např. `template_welcome_user`)  
**Service ID:** `service_xrx301a` (stejný jako u ostatních)  
**Účel:** Zasílání přihlašovacích údajů novým uživatelům portálu

---

## 🎯 Návod na vytvoření template v EmailJS

### Krok 1: Přihlášení
1. Otevřít [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Přihlásit se do účtu (stejného jako pro kalkulačku)

### Krok 2: Vytvoření Template
1. V levém menu kliknout na **Email Templates**
2. Kliknout **Create New Template**

### Krok 3: Nastavení základních údajů

**Template Name:** `Démon agro - Welcome Email (Portál)`

**From Name:** `Démon agro - Portál`

**From Email:** `base@demonagro.cz`

**Subject:** `Vítejte v portálu Démon agro - Přihlašovací údaje`

**Reply To:** `base@demonagro.cz`

---

## 📝 Template Content (HTML)

Zkopírujte tento kód do pole **Content** (HTML format):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #4A7C59;
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 10px;
    }
    .header-title {
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0 0 0;
    }
    .content {
      padding: 40px 30px;
    }
    .welcome-text {
      font-size: 18px;
      color: #4A7C59;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .intro-text {
      margin-bottom: 30px;
      color: #555;
    }
    .credentials-box {
      background-color: #F5F1E8;
      border-left: 4px solid #4A7C59;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .credentials-title {
      font-weight: bold;
      font-size: 16px;
      color: #4A7C59;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .credential-row {
      margin: 12px 0;
      padding: 10px;
      background-color: white;
      border-radius: 4px;
    }
    .credential-label {
      font-weight: bold;
      color: #555;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .credential-value {
      font-size: 16px;
      color: #333;
      font-family: 'Courier New', monospace;
      margin-top: 5px;
      padding: 8px;
      background-color: #f9f9f9;
      border-radius: 3px;
      word-break: break-all;
    }
    .login-button {
      display: inline-block;
      background-color: #4A7C59;
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .login-button:hover {
      background-color: #3d6449;
    }
    .security-notice {
      background-color: #FFF9C4;
      border-left: 4px solid #FBC02D;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .security-notice-title {
      font-weight: bold;
      color: #F57C00;
      margin-bottom: 8px;
    }
    .security-notice-text {
      font-size: 14px;
      color: #555;
      margin: 5px 0;
    }
    .info-box {
      background-color: #E3F2FD;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      border-left: 4px solid #2196F3;
    }
    .info-box-text {
      font-size: 14px;
      color: #1565C0;
      margin: 5px 0;
    }
    .footer {
      background-color: #4A7C59;
      color: white;
      padding: 25px 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-text {
      margin: 8px 0;
    }
    .footer-link {
      color: white;
      text-decoration: none;
      font-weight: bold;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header with Logo -->
    <div class="header">
      <img src="https://demonagro.cz/logo.png" alt="Démon agro" class="logo">
      <h1 class="header-title">Vítejte v portálu!</h1>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <p class="welcome-text">Dobrý den, {{to_name}}!</p>
      
      <p class="intro-text">
        Váš účet v portálu Démon agro byl úspěšně vytvořen. Portál vám umožní spravovat pozemky, 
        sledovat rozbory půdy, plánovat vápnění a odesílat poptávky.
      </p>
      
      <!-- Credentials Box -->
      <div class="credentials-box">
        <div class="credentials-title">🔑 Vaše přihlašovací údaje</div>
        
        <div class="credential-row">
          <div class="credential-label">Přihlašovací email:</div>
          <div class="credential-value">{{user_email}}</div>
        </div>
        
        <div class="credential-row">
          <div class="credential-label">Dočasné heslo:</div>
          <div class="credential-value">{{temporary_password}}</div>
        </div>
      </div>
      
      <!-- Login Button -->
      <div style="text-align: center;">
        <a href="{{portal_url}}" class="login-button">
          Přihlásit se do portálu →
        </a>
      </div>
      
      <!-- Security Notice -->
      <div class="security-notice">
        <div class="security-notice-title">⚠️ Důležité bezpečnostní upozornění</div>
        <p class="security-notice-text">
          <strong>Po prvním přihlášení si prosím změňte heslo!</strong>
        </p>
        <p class="security-notice-text">
          Změnu hesla najdete v nastavení vašeho účtu. Doporučujeme použít silné heslo 
          (minimálně 8 znaků, kombinace velkých a malých písmen, číslic a symbolů).
        </p>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <p class="info-box-text">
          💡 <strong>Tip:</strong> Portál nabízí pokročilé nástroje pro plánování vápnění, 
          správu pozemků a evidenci rozborů půdy. Veškerá data máte pod kontrolou a kdykoliv dostupná.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        V případě jakýchkoliv dotazů nás neváhejte kontaktovat na email 
        <a href="mailto:base@demonagro.cz" style="color: #4A7C59;">base@demonagro.cz</a> 
        nebo telefonicky na 
        <a href="tel:+420731734907" style="color: #4A7C59;">+420 731 734 907</a>.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">S pozdravem,</p>
      <p class="footer-text" style="font-weight: bold; font-size: 16px;">Tým Démon agro</p>
      <p class="footer-text" style="margin-top: 15px;">
        <a href="https://demonagro.cz" class="footer-link">www.demonagro.cz</a> | 
        <a href="mailto:base@demonagro.cz" class="footer-link">base@demonagro.cz</a> | 
        <a href="tel:+420731734907" class="footer-link">+420 731 734 907</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 📝 Template Content (Plain Text - záložní verze)

Zkopírujte tento kód do pole **Plain Text** (fallback pro emaily bez HTML):

```
DÉMON AGRO - PORTÁL
===========================================

Vítejte v portálu!

Dobrý den, {{to_name}}!

Váš účet v portálu Démon agro byl úspěšně vytvořen. Portál vám umožní spravovat pozemky, sledovat rozbory půdy, plánovat vápnění a odesílat poptávky.

-------------------------------------------
VAŠE PŘIHLAŠOVACÍ ÚDAJE
-------------------------------------------

Přihlašovací email: {{user_email}}
Dočasné heslo: {{temporary_password}}

Přihlásit se můžete zde:
{{portal_url}}

-------------------------------------------
⚠️ DŮLEŽITÉ BEZPEČNOSTNÍ UPOZORNĚNÍ
-------------------------------------------

PO PRVNÍM PŘIHLÁŠENÍ SI PROSÍM ZMĚŇTE HESLO!

Změnu hesla najdete v nastavení vašeho účtu. Doporučujeme použít silné heslo (minimálně 8 znaků, kombinace velkých a malých písmen, číslic a symbolů).

-------------------------------------------
💡 TIP
-------------------------------------------

Portál nabízí pokročilé nástroje pro plánování vápnění, správu pozemků a evidenci rozborů půdy. Veškerá data máte pod kontrolou a kdykoliv dostupná.

-------------------------------------------

V případě jakýchkoliv dotazů nás neváhejte kontaktovat:

Email: base@demonagro.cz
Telefon: +420 731 734 907
Web: https://demonagro.cz

-------------------------------------------

S pozdravem,
Tým Démon agro

www.demonagro.cz | base@demonagro.cz | +420 731 734 907
```

---

## 🏷️ Proměnné v template

Template používá **přesně těchto 4 proměnných** (které posílá kód):

| Proměnná | Popis | Příklad |
|----------|-------|---------|
| `{{to_name}}` | Celé jméno uživatele | "Jan Novák" |
| `{{user_email}}` | Přihlašovací email | "jan.novak@example.com" |
| `{{temporary_password}}` | Dočasné heslo | "Temp2024!" |
| `{{portal_url}}` | URL pro přihlášení | "https://portal.demonagro.cz/portal/prihlaseni" |

---

## ✅ Checklist pro nastavení

Po vytvoření template:

- [ ] Template vytvořen v EmailJS
- [ ] Template Name: "Démon agro - Welcome Email (Portál)"
- [ ] HTML verze zkopírována do **Content**
- [ ] Plain text verze zkopírována do **Plain Text**
- [ ] Všech 4 proměnných je v template
- [ ] From Email nastaven: `base@demonagro.cz`
- [ ] Reply To nastaven: `base@demonagro.cz`
- [ ] Subject: "Vítejte v portálu Démon agro - Přihlašovací údaje"
- [ ] Template uložen (Save)
- [ ] **Poznamenat si Template ID** (např. `template_welcome_user`)
- [ ] Test email odeslán (Test It button)
- [ ] Test email dorazil a vypadá správně
- [ ] Logo se správně zobrazuje

---

## 🔧 Nastavení v projektu

Po vytvoření template v EmailJS:

1. **Zkopírujte Template ID** z EmailJS dashboardu
2. **Přidejte do environment proměnných** (`.env.local`):

```env
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_welcome_user
```

3. **Restart vývojového serveru** (pokud běží)

---

## 🧪 Test Template

### V EmailJS Dashboardu:

1. Po uložení template kliknout na **Test It**
2. Vyplnit testovací hodnoty:

```json
{
  "to_name": "Jan Testovací",
  "user_email": "jan.test@example.com",
  "temporary_password": "Test1234!",
  "portal_url": "https://portal.demonagro.cz/portal/prihlaseni"
}
```

3. Zadat svůj testovací email do pole **To Email**
4. Kliknout **Send Test Email**
5. ✅ Zkontrolovat schránku a ověřit:
   - Email dorazil
   - Logo se zobrazuje
   - Všechny údaje jsou správně
   - Tlačítko "Přihlásit se" funguje
   - Design vypadá profesionálně

---

## 📱 Responzivní design

Template je optimalizován pro:
- ✅ Desktop (Outlook, Gmail, Apple Mail)
- ✅ Mobil (iOS Mail, Gmail App, Outlook App)
- ✅ Webmail (Gmail.com, Outlook.com)

---

## 🎨 Použité barvy (Démon agro)

- **Primární zelená:** `#4A7C59`
- **Tmavší zelená (hover):** `#3d6449`
- **Béžové pozadí:** `#F5F1E8`
- **Žluté upozornění:** `#FFF9C4` s `#FBC02D` borderem
- **Modré info:** `#E3F2FD` s `#2196F3` borderem

---

## 📞 Kde se volá v kódu

Funkce `sendWelcomeEmail()` z `lib/utils/email.ts`:

```typescript
await sendWelcomeEmail(
  email: string,           // Email nového uživatele
  fullName: string,        // Celé jméno
  temporaryPassword: string // Vygenerované dočasné heslo
)
```

Volá se při vytvoření nového uživatele v admin sekci.

---

**Status:** ✅ Template připraven ke zkopírování do EmailJS  
**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Logo:** https://demonagro.cz/logo.png

