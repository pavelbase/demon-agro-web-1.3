# 📬 EmailJS Template - Notifikace o nové poptávce vápnění (pro admina)

**Template ID:** Nastavíte v EmailJS (např. `template_liming_request`)  
**Service ID:** `service_xrx301a` (stejný jako u ostatních)  
**Účel:** Zasílání notifikací adminovi o nových poptávkách z portálu

---

## 🎯 Návod na vytvoření template v EmailJS

### Krok 1: Přihlášení
1. Otevřít [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Přihlásit se do účtu (stejného jako pro kalkulačku)

### Krok 2: Vytvoření Template
1. V levém menu kliknout na **Email Templates**
2. Kliknout **Create New Template**

### Krok 3: Nastavení základních údajů

**Template Name:** `Démon agro - Nová poptávka vápnění (Admin)`

**From Name:** `Portál Démon agro`

**From Email:** `base@demonagro.cz`

**Subject:** `🆕 Nová poptávka vápnění - {{company_name}}`

**Reply To:** `{{contact_email}}`  
*(Důležité! Díky tomu můžete hned odpovědět klientovi)*

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
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #4A7C59 0%, #3d6449 100%);
      padding: 30px 20px;
      text-align: center;
      position: relative;
    }
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    .header-badge {
      display: inline-block;
      background-color: #FFC107;
      color: #333;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .header-title {
      color: white;
      font-size: 26px;
      font-weight: bold;
      margin: 10px 0;
    }
    .header-subtitle {
      color: rgba(255,255,255,0.9);
      font-size: 14px;
      margin: 5px 0 0 0;
    }
    .content {
      padding: 35px 30px;
    }
    .request-id-box {
      background: linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%);
      padding: 15px 20px;
      margin-bottom: 25px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #FBC02D;
    }
    .request-id-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .request-id-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      font-family: 'Courier New', monospace;
    }
    .section {
      background-color: #F5F1E8;
      border-left: 4px solid #4A7C59;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      color: #4A7C59;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .data-row {
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      font-weight: 600;
      color: #555;
      min-width: 140px;
      font-size: 14px;
    }
    .data-value {
      color: #333;
      font-size: 15px;
      text-align: right;
      flex: 1;
    }
    .data-value-highlight {
      background-color: #FFF9C4;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: bold;
      color: #333;
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 25px 0;
    }
    .stat-box {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 2px solid #E8F5E9;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #4A7C59;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .notes-box {
      background-color: #FFF3E0;
      border-left: 4px solid #FF9800;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .notes-title {
      font-weight: bold;
      color: #E65100;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .notes-content {
      color: #555;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .action-button {
      display: inline-block;
      background-color: #4A7C59;
      color: white !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 30px;
      font-weight: bold;
      font-size: 16px;
      margin: 25px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);
      transition: all 0.3s;
    }
    .action-button:hover {
      background-color: #3d6449;
      box-shadow: 0 6px 16px rgba(74, 124, 89, 0.4);
    }
    .contact-quick-box {
      background-color: #E3F2FD;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
      border: 2px solid #2196F3;
    }
    .contact-quick-title {
      font-weight: bold;
      color: #1565C0;
      margin-bottom: 12px;
      font-size: 15px;
    }
    .contact-item {
      margin: 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .contact-icon {
      font-size: 18px;
    }
    .contact-link {
      color: #1565C0;
      text-decoration: none;
      font-weight: 600;
    }
    .contact-link:hover {
      text-decoration: underline;
    }
    .footer {
      background-color: #4A7C59;
      color: white;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
    }
    .footer-text {
      margin: 8px 0;
      opacity: 0.95;
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
      height: 2px;
      background: linear-gradient(to right, transparent, #e0e0e0, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .summary-stats {
        grid-template-columns: 1fr;
      }
      .data-row {
        flex-direction: column;
      }
      .data-label {
        margin-bottom: 5px;
      }
      .data-value {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header with Logo -->
    <div class="header">
      <img src="https://demonagro.cz/logo.png" alt="Démon agro" class="logo">
      <div class="header-badge">🆕 NOVÁ POPTÁVKA</div>
      <h1 class="header-title">Poptávka vápnění</h1>
      <p class="header-subtitle">Zákazník odeslal poptávku z portálu</p>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <!-- Request ID -->
      <div class="request-id-box">
        <div class="request-id-label">ID Poptávky</div>
        <div class="request-id-value">#{{request_id}}</div>
      </div>
      
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-box">
          <div class="stat-value">{{parcel_count}}</div>
          <div class="stat-label">Pozemků</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{total_area}}</div>
          <div class="stat-label">Hektarů</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{total_quantity}}</div>
          <div class="stat-label">Tun vápence</div>
        </div>
      </div>
      
      <!-- Customer Info -->
      <div class="section">
        <div class="section-title">
          <span>👤</span>
          <span>Informace o zákazníkovi</span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Firma:</span>
          <span class="data-value"><strong>{{company_name}}</strong></span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Kontaktní osoba:</span>
          <span class="data-value">{{contact_name}}</span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Okres:</span>
          <span class="data-value">{{district}}</span>
        </div>
      </div>
      
      <!-- Quick Contact Box -->
      <div class="contact-quick-box">
        <div class="contact-quick-title">📞 Rychlý kontakt na zákazníka</div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <a href="mailto:{{contact_email}}" class="contact-link">{{contact_email}}</a>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📱</span>
          <a href="tel:{{contact_phone}}" class="contact-link">{{contact_phone}}</a>
        </div>
      </div>
      
      <!-- Request Details -->
      <div class="section">
        <div class="section-title">
          <span>📋</span>
          <span>Detaily poptávky</span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Počet pozemků:</span>
          <span class="data-value">{{parcel_count}} ks</span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Celková výměra:</span>
          <span class="data-value data-value-highlight">{{total_area}} ha</span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Celkové množství:</span>
          <span class="data-value data-value-highlight">{{total_quantity}} t</span>
        </div>
        
        <div class="data-row">
          <span class="data-label">Preferovaný termín:</span>
          <span class="data-value">{{delivery_period}}</span>
        </div>
      </div>
      
      <!-- Customer Notes -->
      <div class="notes-box">
        <div class="notes-title">💬 Poznámka zákazníka:</div>
        <div class="notes-content">{{notes}}</div>
      </div>
      
      <div class="divider"></div>
      
      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="{{admin_url}}" class="action-button">
          Zobrazit v admin panelu →
        </a>
      </div>
      
      <p style="text-align: center; color: #888; font-size: 13px; margin-top: 20px;">
        Kliknutím na tlačítko se dostanete přímo do seznamu poptávek v admin panelu
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p class="footer-text" style="font-weight: bold; font-size: 15px; margin-bottom: 15px;">
        Portál Démon agro - Admin systém
      </p>
      <p class="footer-text">
        <a href="https://demonagro.cz" class="footer-link">www.demonagro.cz</a> | 
        <a href="mailto:base@demonagro.cz" class="footer-link">base@demonagro.cz</a> | 
        <a href="tel:+420731734907" class="footer-link">+420 731 734 907</a>
      </p>
      <p class="footer-text" style="font-size: 11px; margin-top: 15px; opacity: 0.8;">
        Tato zpráva byla automaticky vygenerována portálovým systémem
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

🆕 NOVÁ POPTÁVKA VÁPNĚNÍ

ID Poptávky: #{{request_id}}

-------------------------------------------
PŘEHLED
-------------------------------------------

Počet pozemků: {{parcel_count}} ks
Celková výměra: {{total_area}} ha
Celkové množství: {{total_quantity}} t vápence

-------------------------------------------
INFORMACE O ZÁKAZNÍKOVI
-------------------------------------------

Firma: {{company_name}}
Kontaktní osoba: {{contact_name}}
Okres: {{district}}

-------------------------------------------
RYCHLÝ KONTAKT NA ZÁKAZNÍKA
-------------------------------------------

Email: {{contact_email}}
Telefon: {{contact_phone}}

-------------------------------------------
DETAILY POPTÁVKY
-------------------------------------------

Počet pozemků: {{parcel_count}} ks
Celková výměra: {{total_area}} ha
Celkové množství: {{total_quantity}} t
Preferovaný termín: {{delivery_period}}

-------------------------------------------
POZNÁMKA ZÁKAZNÍKA
-------------------------------------------

{{notes}}

-------------------------------------------

Zobrazit v admin panelu:
{{admin_url}}

-------------------------------------------

Portál Démon agro - Admin systém
www.demonagro.cz | base@demonagro.cz | +420 731 734 907

Tato zpráva byla automaticky vygenerována portálovým systémem.
```

---

## 🏷️ Proměnné v template

Template používá **přesně těchto 12 proměnných** (které posílá kód):

| Proměnná | Popis | Příklad |
|----------|-------|---------|
| `{{company_name}}` | Název firmy zákazníka | "Farma Novák s.r.o." |
| `{{contact_name}}` | Jméno kontaktní osoby | "Jan Novák" |
| `{{contact_email}}` | Email zákazníka | "jan.novak@farma.cz" |
| `{{contact_phone}}` | Telefon zákazníka | "+420 123 456 789" |
| `{{district}}` | Okres | "Louny" |
| `{{parcel_count}}` | Počet pozemků | "5" |
| `{{total_area}}` | Celková výměra v ha | "42.50" |
| `{{total_quantity}}` | Celkové množství v t | "125.75" |
| `{{delivery_period}}` | Preferovaný termín | "Jaro 2026" |
| `{{notes}}` | Poznámka zákazníka | "Prosím o cenovou nabídku..." |
| `{{admin_url}}` | URL do admin panelu | "https://portal.demonagro.cz/portal/admin/poptavky" |
| `{{request_id}}` | Krátké ID poptávky | "a3f5b7c2" |

---

## ✅ Checklist pro nastavení

Po vytvoření template:

- [ ] Template vytvořen v EmailJS
- [ ] Template Name: "Démon agro - Nová poptávka vápnění (Admin)"
- [ ] HTML verze zkopírována do **Content**
- [ ] Plain text verze zkopírována do **Plain Text**
- [ ] Všech 12 proměnných je v template
- [ ] From Email nastaven: `base@demonagro.cz`
- [ ] **Reply To nastaven:** `{{contact_email}}` *(důležité!)*
- [ ] Subject: `🆕 Nová poptávka vápnění - {{company_name}}`
- [ ] Template uložen (Save)
- [ ] **Poznamenat si Template ID** (např. `template_liming_request`)
- [ ] Test email odeslán (Test It button)
- [ ] Test email dorazil a vypadá správně
- [ ] Logo se správně zobrazuje
- [ ] Reply-To funguje (zkusit odpovědět na testovací email)

---

## 🔧 Nastavení v projektu

Po vytvoření template v EmailJS:

1. **Zkopírujte Template ID** z EmailJS dashboardu
2. **Přidejte do environment proměnných** (`.env.local`):

```env
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=template_liming_request
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
```

3. **Restart vývojového serveru** (pokud běží)

---

## 🧪 Test Template

### V EmailJS Dashboardu:

1. Po uložení template kliknout na **Test It**
2. Vyplnit testovací hodnoty:

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
  "notes": "Prosím o cenovou nabídku na dodávku a aplikaci vápence. Preferuji kvalitní dolomitický vápenec.",
  "admin_url": "https://portal.demonagro.cz/portal/admin/poptavky",
  "request_id": "a3f5b7c2"
}
```

3. Zadat **admin email** do pole **To Email** (např. `base@demonagro.cz`)
4. Kliknout **Send Test Email**
5. ✅ Zkontrolovat:
   - Email dorazil na admin email
   - Logo se zobrazuje
   - Všechny údaje jsou správně
   - Statistiky (3 boxy) se zobrazují správně
   - Tlačítko "Zobrazit v admin panelu" funguje
   - **Reply-To je nastaveno na zákaznický email** (zkusit odpovědět)
   - Design vypadá profesionálně

---

## 📱 Responzivní design

Template je optimalizován pro:
- ✅ Desktop (Outlook, Gmail, Apple Mail)
- ✅ Mobil (iOS Mail, Gmail App, Outlook App) - statistiky pod sebou
- ✅ Webmail (Gmail.com, Outlook.com)

---

## 🎨 Použité barvy (Démon agro)

- **Primární zelená:** `#4A7C59`
- **Tmavší zelená (hover):** `#3d6449`
- **Béžové pozadí:** `#F5F1E8`
- **Žlutý akcent (badge/ID):** `#FFF9C4` s `#FBC02D` borderem
- **Oranžové poznámky:** `#FFF3E0` s `#FF9800` borderem
- **Modré kontakty:** `#E3F2FD` s `#2196F3` borderem
- **Zelené statistiky:** `#E8F5E9` border

---

## 📞 Kde se volá v kódu

Funkce `sendNewLimingRequestNotification()` z `lib/utils/email.ts`:

```typescript
await sendNewLimingRequestNotification(
  request: any,    // LimingRequest objekt
  items: any[],    // Položky poptávky (pozemky)
  user: any        // Profil uživatele
)
```

Volá se automaticky při odeslání poptávky vápnění uživatelem v portálu.

---

## 🔔 Důležité vlastnosti

### Reply-To zákaznický email
Template má **Reply-To nastaveno na `{{contact_email}}`**, což znamená:
- Když admin klikne "Odpovědět", email půjde přímo zákazníkovi
- Není nutné kopírovat email zákazníka
- Rychlejší komunikace

### Subject s názvem firmy
Subject obsahuje `{{company_name}}`, takže v emailové schránce uvidíte rovnou:
```
🆕 Nová poptávka vápnění - Farma Novák s.r.o.
```

### Přehledné statistiky
3 velké boxy s klíčovými čísly pro rychlý přehled:
- Počet pozemků
- Hektary
- Tuny vápence

---

## 🚀 Výhody tohoto designu

1. **Rychlá orientace** - Admin vidí důležité informace na první pohled
2. **Přímý kontakt** - Rychlé odkazy na email a telefon zákazníka
3. **Profesionální vzhled** - Reprezentativní email s logem firmy
4. **Mobilní optimalizace** - Funguje skvěle i na telefonu
5. **Reply-To** - Jednoduchá a rychlá odpověď zákazníkovi

---

**Status:** ✅ Template připraven ke zkopírování do EmailJS  
**Verze:** 1.0  
**Datum:** 6. ledna 2026  
**Logo:** https://demonagro.cz/logo.png  
**Důležité:** Nezapomeňte nastavit Reply-To na `{{contact_email}}`!


