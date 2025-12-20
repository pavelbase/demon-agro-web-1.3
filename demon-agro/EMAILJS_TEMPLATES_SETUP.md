# EmailJS Templates Setup Guide - Démon Agro Portal

**Datum:** 20. prosince 2025  
**Phase:** 8.3 - EmailJS Notifikace

---

## 📧 Přehled

Tento návod popisuje, jak nastavit EmailJS templates pro automatické notifikace v Démon Agro portálu.

**3 typy emailů:**
1. ✉️ **Welcome Email** - Uvítací email s přihlašovacími údaji
2. 🔑 **Password Reset** - Reset hesla s novým heslem
3. 📋 **New Liming Request** - Notifikace pro admin o nové poptávce

---

## 🚀 Rychlý start

### 1. Registrace na EmailJS

1. Navštivte [https://www.emailjs.com/](https://www.emailjs.com/)
2. Zaregistrujte se (Free tier: 200 emailů/měsíc)
3. Vytvořte nový **Email Service** (Gmail/Outlook/SMTP)

### 2. Získání credentials

V EmailJS dashboardu:
- **Service ID:** Zkopírujte z Email Services
- **Public Key:** Najdete v Account → API Keys
- **Template IDs:** Vytvoříte v kroku 3

### 3. Nastavení ENV variables

Zkopírujte do `.env.local`:

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx

# Template IDs (vytvoříte v kroku 4)
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_welcome
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_password_reset
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=template_liming_request

# Email recipients
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

---

## 📝 Template 1: Welcome Email

### Nastavení v EmailJS

**Template Name:** `demon_agro_welcome`  
**Subject:** `Vítejte v portálu Démon Agro`  
**To Email:** `{{to_email}}`  
**From Name:** `Démon Agro`  
**Reply To:** `base@demonagro.cz`

### Template Content (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4A7C59; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .credentials { background: white; border-left: 4px solid #4A7C59; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #4A7C59; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vítejte v portálu Démon Agro</h1>
    </div>
    
    <div class="content">
      <p>Dobrý den <strong>{{to_name}}</strong>,</p>
      
      <p>Váš účet v portálu Démon Agro byl úspěšně vytvořen!</p>
      
      <div class="credentials">
        <h3>Přihlašovací údaje:</h3>
        <p><strong>Email:</strong> {{user_email}}</p>
        <p><strong>Dočasné heslo:</strong> {{temporary_password}}</p>
      </div>
      
      <p><strong>⚠️ Důležité:</strong> Po prvním přihlášení budete vyzváni ke změně hesla.</p>
      
      <a href="{{portal_url}}" class="button">Přihlásit se do portálu</a>
      
      <h3>Co můžete v portálu dělat?</h3>
      <ul>
        <li>✅ Spravovat své pozemky</li>
        <li>✅ Nahrávat rozbory půdy (AI extrakce)</li>
        <li>✅ Generovat plány hnojení</li>
        <li>✅ Vytvářet poptávky na vápnění</li>
        <li>✅ Exportovat plány do PDF/Excel</li>
      </ul>
      
      <p>Pokud máte jakékoliv dotazy, neváhejte nás kontaktovat.</p>
      
      <p>S pozdravem,<br><strong>Tým Démon Agro</strong></p>
    </div>
    
    <div class="footer">
      <p>Démon Agro | base@demonagro.cz | +420 731 734 907</p>
      <p>Severní a západní Čechy</p>
    </div>
  </div>
</body>
</html>
```

### Template Variables

- `{{to_email}}` - Příjemce (user email)
- `{{to_name}}` - Jméno uživatele
- `{{user_email}}` - Email pro přihlášení
- `{{temporary_password}}` - Dočasné heslo
- `{{portal_url}}` - Link na přihlášení

---

## 🔑 Template 2: Password Reset

### Nastavení v EmailJS

**Template Name:** `demon_agro_password_reset`  
**Subject:** `Reset hesla - Démon Agro`  
**To Email:** `{{to_email}}`  
**From Name:** `Démon Agro`  
**Reply To:** `base@demonagro.cz`

### Template Content (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4A7C59; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .credentials { background: white; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #4A7C59; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔑 Reset hesla</h1>
    </div>
    
    <div class="content">
      <p>Dobrý den <strong>{{to_name}}</strong>,</p>
      
      <p>Vaše heslo do portálu Démon Agro bylo resetováno.</p>
      
      <div class="credentials">
        <h3>Nové přihlašovací údaje:</h3>
        <p><strong>Email:</strong> {{user_email}}</p>
        <p><strong>Nové heslo:</strong> {{new_password}}</p>
      </div>
      
      <div class="warning">
        <p><strong>⚠️ Z bezpečnostních důvodů:</strong></p>
        <ul>
          <li>Po přihlášení si heslo změňte na vlastní</li>
          <li>Nepoužívejte toto heslo nikde jinde</li>
          <li>Tento email smažte po změně hesla</li>
        </ul>
      </div>
      
      <a href="{{portal_url}}" class="button">Přihlásit se do portálu</a>
      
      <p><small>Pokud jste o reset hesla nežádali, kontaktujte nás ihned na base@demonagro.cz</small></p>
      
      <p>S pozdravem,<br><strong>Tým Démon Agro</strong></p>
    </div>
    
    <div class="footer">
      <p>Démon Agro | base@demonagro.cz | +420 731 734 907</p>
      <p>Severní a západní Čechy</p>
    </div>
  </div>
</body>
</html>
```

### Template Variables

- `{{to_email}}` - Příjemce
- `{{to_name}}` - Jméno uživatele
- `{{user_email}}` - Email pro přihlášení
- `{{new_password}}` - Nové heslo
- `{{portal_url}}` - Link na přihlášení

---

## 📋 Template 3: New Liming Request Notification

### Nastavení v EmailJS

**Template Name:** `demon_agro_new_liming_request`  
**Subject:** `🆕 Nová poptávka vápnění #{{request_id}}`  
**To Email:** `{{to_email}}` (admin email)  
**From Name:** `Démon Agro Portal`  
**Reply To:** `{{contact_email}}`

### Template Content (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .info-box { background: white; border-left: 4px solid #3B82F6; padding: 15px; margin: 15px 0; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
    .stat-label { font-size: 12px; color: #666; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
    td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🆕 Nová poptávka vápnění</h1>
      <p>Poptávka #{{request_id}}</p>
    </div>
    
    <div class="content">
      <h2>Informace o zákazníkovi</h2>
      
      <div class="info-box">
        <table>
          <tr>
            <td>Firma:</td>
            <td>{{company_name}}</td>
          </tr>
          <tr>
            <td>Kontaktní osoba:</td>
            <td>{{contact_name}}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td><a href="mailto:{{contact_email}}">{{contact_email}}</a></td>
          </tr>
          <tr>
            <td>Telefon:</td>
            <td><a href="tel:{{contact_phone}}">{{contact_phone}}</a></td>
          </tr>
          <tr>
            <td>Okres:</td>
            <td>{{district}}</td>
          </tr>
        </table>
      </div>
      
      <h2>Souhrn poptávky</h2>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">{{parcel_count}}</div>
          <div class="stat-label">Pozemků</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{total_area}} ha</div>
          <div class="stat-label">Celková výměra</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{total_quantity}} t</div>
          <div class="stat-label">Celkové množství</div>
        </div>
      </div>
      
      <div class="info-box">
        <table>
          <tr>
            <td>Preferovaný termín:</td>
            <td>{{delivery_period}}</td>
          </tr>
          <tr>
            <td>Poznámka:</td>
            <td>{{notes}}</td>
          </tr>
        </table>
      </div>
      
      <a href="{{admin_url}}" class="button">📊 Otevřít v admin panelu</a>
      
      <p><strong>Co dělat dál?</strong></p>
      <ol>
        <li>Zkontrolovat detail poptávky v admin panelu</li>
        <li>Exportovat do Excel pro kalkulaci</li>
        <li>Připravit cenovou nabídku</li>
        <li>Kontaktovat zákazníka</li>
      </ol>
      
      <p><small>Tento email byl automaticky vygenerován portálem Démon Agro.</small></p>
    </div>
    
    <div class="footer">
      <p>Démon Agro Admin Panel</p>
      <p><a href="{{admin_url}}">Přihlásit se do administrace</a></p>
    </div>
  </div>
</body>
</html>
```

### Template Variables

- `{{to_email}}` - Admin email (base@demonagro.cz)
- `{{company_name}}` - Název firmy zákazníka
- `{{contact_name}}` - Jméno kontaktní osoby
- `{{contact_email}}` - Email zákazníka
- `{{contact_phone}}` - Telefon zákazníka
- `{{district}}` - Okres
- `{{parcel_count}}` - Počet pozemků
- `{{total_area}}` - Celková výměra (ha)
- `{{total_quantity}}` - Celkové množství (t)
- `{{delivery_period}}` - Preferovaný termín dodání
- `{{notes}}` - Poznámky zákazníka
- `{{admin_url}}` - Link do admin panelu
- `{{request_id}}` - ID poptávky (zkrácené)

---

## 🧪 Testování

### Test Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/utils/email'

const result = await sendWelcomeEmail(
  'test@example.com',
  'Jan Novák',
  'TempPass123!'
)

console.log(result) // { success: true }
```

### Test Password Reset

```typescript
import { sendPasswordResetEmail } from '@/lib/utils/email'

const result = await sendPasswordResetEmail(
  'test@example.com',
  'Jan Novák',
  'NewPass456!'
)
```

### Test Liming Request Notification

```typescript
import { sendNewLimingRequestNotification } from '@/lib/utils/email'

const result = await sendNewLimingRequestNotification(
  request,
  items,
  user
)
```

---

## 🔍 Troubleshooting

### Email se neposílají

1. **Zkontroluj ENV variables:**
```bash
# Spusť v konzoli
console.log(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID)
console.log(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
```

2. **Zkontroluj EmailJS dashboard:**
   - Service je aktivní?
   - Templates existují?
   - Limit 200 emailů/měsíc nepřekročen?

3. **Zkontroluj browser console:**
   - Jsou tam chybové hlášky?
   - CORS errors?

### Template se nenašel

```bash
# Ujisti se, že template ID je správné
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_xxxxxx
```

### Rate limit

EmailJS Free tier: **200 emailů/měsíc**

Pokud překročíte limit:
- Upgrade na paid plan ($7/month = 1000 emailů)
- Nebo snížit počet notifikací

---

## 📊 Monitoring

### Check configuration

```typescript
import { isEmailJSConfigured, getMissingEmailJSConfig } from '@/lib/utils/email'

if (!isEmailJSConfigured()) {
  console.log('Missing:', getMissingEmailJSConfig())
}
```

### Log email sends

Všechny emaily logují do console:
```
Welcome email sent to: jan.novak@example.com
Password reset email sent to: jan.novak@example.com
New liming request notification sent to: base@demonagro.cz
```

---

## 🔐 Security

### Best practices

1. **Nikdy neloguj hesla** ✅
2. **Používej HTTPS** ✅
3. **ENV variables ne v git** ✅
4. **Rate limiting** (EmailJS má built-in)
5. **Validate email addresses** ✅

### Credentials storage

- ❌ **NIKDY** hardcode credentials v kódu
- ✅ **VŽDY** používej ENV variables
- ✅ Add `.env.local` do `.gitignore`

---

## 📈 Usage Statistics

### Expected volume

**Welcome emails:**
- ~5-10 nových uživatelů/měsíc
- = 5-10 emailů/měsíc

**Password resets:**
- ~2-5 resetů/měsíc
- = 2-5 emailů/měsíc

**Liming requests:**
- ~20-30 poptávek/měsíc
- = 20-30 emailů/měsíc

**Celkem:** ~30-45 emailů/měsíc
**Limit:** 200 emailů/měsíc (Free tier)

✅ **Dostatečné pro Free tier!**

---

## 🎯 Next Steps

Po nastavení templates:

1. ✅ Vytvořit 3 templates v EmailJS
2. ✅ Zkopírovat template IDs do `.env.local`
3. ✅ Restartovat dev server
4. 🧪 Otestovat každý typ emailu
5. 🚀 Deploy do produkce

---

**Poslední aktualizace:** 20. prosince 2025  
**Implementoval:** AI Assistant (Claude Sonnet 4.5)  
**Phase:** 8.3 - EmailJS Notifikace
