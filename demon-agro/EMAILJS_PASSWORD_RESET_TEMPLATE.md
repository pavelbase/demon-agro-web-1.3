# 🔐 EmailJS Template - Password Reset (Reset hesla)

**Template ID:** Nastavíte v EmailJS (např. `template_password_reset`)  
**Service ID:** `service_xrx301a` (stejný jako u ostatních)  
**Účel:** Zasílání nového hesla při resetování přístupu

---

## 🎯 Návod na vytvoření template v EmailJS

### Krok 1: Přihlášení
1. Otevřít [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Přihlásit se do účtu (stejného jako pro kalkulačku)

### Krok 2: Vytvoření Template
1. V levém menu kliknout na **Email Templates**
2. Kliknout **Create New Template**

### Krok 3: Nastavení základních údajů

**Template Name:** `Démon agro - Password Reset (Portál)`

**From Name:** `Démon agro - Portál`

**From Email:** `base@demonagro.cz`

**Subject:** `Reset hesla - Portál Démon agro`

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
    .greeting-text {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .intro-text {
      margin-bottom: 25px;
      color: #555;
    }
    .alert-box {
      background-color: #FFF3E0;
      border-left: 4px solid #FF9800;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .alert-title {
      font-weight: bold;
      color: #E65100;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .alert-text {
      color: #555;
      font-size: 14px;
      margin: 5px 0;
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
      background-color: #FFEBEE;
      border-left: 4px solid #F44336;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .security-notice-title {
      font-weight: bold;
      color: #C62828;
      margin-bottom: 8px;
    }
    .security-notice-text {
      font-size: 14px;
      color: #555;
      margin: 5px 0;
    }
    .info-box {
      background-color: #E8F5E9;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      border-left: 4px solid #4CAF50;
    }
    .info-box-text {
      font-size: 14px;
      color: #2E7D32;
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
      <h1 class="header-title">🔐 Reset hesla</h1>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <p class="greeting-text">Dobrý den, {{to_name}}!</p>
      
      <p class="intro-text">
        Vaše heslo k portálu Démon agro bylo úspěšně resetováno. 
        Níže najdete nové přihlašovací údaje.
      </p>
      
      <!-- Alert Box -->
      <div class="alert-box">
        <div class="alert-title">⚠️ Pokud jste o reset hesla nežádali</div>
        <p class="alert-text">
          Pokud jste reset hesla nevyžadovali, kontaktujte nás okamžitě na 
          <strong>base@demonagro.cz</strong> nebo <strong>+420 731 734 907</strong>.
        </p>
      </div>
      
      <!-- Credentials Box -->
      <div class="credentials-box">
        <div class="credentials-title">🔑 Nové přihlašovací údaje</div>
        
        <div class="credential-row">
          <div class="credential-label">Přihlašovací email:</div>
          <div class="credential-value">{{user_email}}</div>
        </div>
        
        <div class="credential-row">
          <div class="credential-label">Nové heslo:</div>
          <div class="credential-value">{{new_password}}</div>
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
        <div class="security-notice-title">🔒 Bezpečnostní doporučení</div>
        <p class="security-notice-text">
          <strong>Po přihlášení si ihned změňte heslo na vlastní!</strong>
        </p>
        <p class="security-notice-text">
          Změnu hesla najdete v nastavení vašeho účtu. Použijte silné heslo:
        </p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li class="security-notice-text">Minimálně 8 znaků</li>
          <li class="security-notice-text">Kombinace velkých a malých písmen</li>
          <li class="security-notice-text">Alespoň jedna číslice</li>
          <li class="security-notice-text">Alespoň jeden speciální znak (@, #, !, atd.)</li>
        </ul>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <p class="info-box-text">
          ✅ <strong>Platnost:</strong> Toto heslo je platné okamžitě a můžete se s ním ihned přihlásit.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        V případě problémů s přihlášením nebo jakýchkoliv dotazů nás kontaktujte:
      </p>
      <p style="font-size: 14px; color: #666;">
        Email: <a href="mailto:base@demonagro.cz" style="color: #4A7C59;">base@demonagro.cz</a><br>
        Telefon: <a href="tel:+420731734907" style="color: #4A7C59;">+420 731 734 907</a>
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

🔐 RESET HESLA

Dobrý den, {{to_name}}!

Vaše heslo k portálu Démon agro bylo úspěšně resetováno. Níže najdete nové přihlašovací údaje.

-------------------------------------------
⚠️ POKUD JSTE O RESET HESLA NEŽÁDALI
-------------------------------------------

Pokud jste reset hesla nevyžadovali, kontaktujte nás okamžitě:
Email: base@demonagro.cz
Telefon: +420 731 734 907

-------------------------------------------
NOVÉ PŘIHLAŠOVACÍ ÚDAJE
-------------------------------------------

Přihlašovací email: {{user_email}}
Nové heslo: {{new_password}}

Přihlásit se můžete zde:
{{portal_url}}

-------------------------------------------
🔒 BEZPEČNOSTNÍ DOPORUČENÍ
-------------------------------------------

PO PŘIHLÁŠENÍ SI IHNED ZMĚŇTE HESLO NA VLASTNÍ!

Změnu hesla najdete v nastavení vašeho účtu. Použijte silné heslo:

• Minimálně 8 znaků
• Kombinace velkých a malých písmen
• Alespoň jedna číslice
• Alespoň jeden speciální znak (@, #, !, atd.)

-------------------------------------------
✅ PLATNOST
-------------------------------------------

Toto heslo je platné okamžitě a můžete se s ním ihned přihlásit.

-------------------------------------------

V případě problémů s přihlášením nebo jakýchkoliv dotazů nás kontaktujte:

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
| `{{new_password}}` | Nové vygenerované heslo | "NewPass2024!" |
| `{{portal_url}}` | URL pro přihlášení | "https://portal.demonagro.cz/portal/prihlaseni" |

---

## ✅ Checklist pro nastavení

Po vytvoření template:

- [ ] Template vytvořen v EmailJS
- [ ] Template Name: "Démon agro - Password Reset (Portál)"
- [ ] HTML verze zkopírována do **Content**
- [ ] Plain text verze zkopírována do **Plain Text**
- [ ] Všech 4 proměnných je v template
- [ ] From Email nastaven: `base@demonagro.cz`
- [ ] Reply To nastaven: `base@demonagro.cz`
- [ ] Subject: "Reset hesla - Portál Démon agro"
- [ ] Template uložen (Save)
- [ ] **Poznamenat si Template ID** (např. `template_password_reset`)
- [ ] Test email odeslán (Test It button)
- [ ] Test email dorazil a vypadá správně
- [ ] Logo se správně zobrazuje

---

## 🔧 Nastavení v projektu

Po vytvoření template v EmailJS:

1. **Zkopírujte Template ID** z EmailJS dashboardu
2. **Přidejte do environment proměnných** (`.env.local`):

```env
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_password_reset
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
  "new_password": "NewTest1234!",
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
   - Bezpečnostní upozornění je viditelné
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
- **Oranžové upozornění:** `#FFF3E0` s `#FF9800` borderem
- **Červené bezpečnostní:** `#FFEBEE` s `#F44336` borderem
- **Zelené info:** `#E8F5E9` s `#4CAF50` borderem

---

## 📞 Kde se volá v kódu

Funkce `sendPasswordResetEmail()` z `lib/utils/email.ts`:

```typescript
await sendPasswordResetEmail(
  email: string,      // Email uživatele
  fullName: string,   // Celé jméno
  newPassword: string // Nově vygenerované heslo
)
```

Volá se při resetování hesla administrátorem v admin sekci.

---

## 🔒 Bezpečnostní aspekty

- Email obsahuje jasné upozornění, pokud uživatel reset nevyžadoval
- Doporučení pro změnu hesla po přihlášení
- Návod na vytvoření silného hesla
- Kontaktní informace pro nahlášení bezpečnostního problému

---

**Status:** ✅ Template připraven ke zkopírování do EmailJS  
**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Logo:** https://demonagro.cz/logo.png

