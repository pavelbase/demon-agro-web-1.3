# 📧 Environment Variables pro veřejné formuláře

**Datum:** 9. ledna 2026  
**Změna:** Přechod z hardcoded credentials na environment variables

---

## ⚠️ CO SE ZMĚNILO

Veřejné formuláře (kalkulačka, kontaktní formulář) nyní používají **environment variables** místo hardcoded credentials.

### Důvody změny:
1. ✅ **Konzistence** - stejný přístup jako v portálové části
2. ✅ **Údržba** - změna credentials bez editace kódu  
3. ✅ **Flexibilita** - různé hodnoty pro dev/production

---

## 📋 POTŘEBNÉ ENV VARIABLES

Do `.env.local` přidejte/ověřte:

```bash
# ===== EMAILJS - ZÁKLADNÍ KONFIGURACE =====
# Service ID z EmailJS dashboardu
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5k776hf

# Public Key z EmailJS dashboardu → Account → API Keys
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# ===== EMAILJS - TEMPLATES PRO VEŘEJNOU ČÁST =====
# Template pro kalkulačku vápnění (/kalkulacka)
NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID=template_grgltnp

# Template pro kontaktní formulář (/kontakt)
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_kogwumm

# ===== EMAILJS - TEMPLATES PRO PORTÁL =====
# (Tyto jsou pro portálovou část - welcome emaily, reset hesla, notifikace)
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=your_welcome_template_id
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=your_password_reset_template_id
NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID=your_liming_template_id
```

---

## 🔧 KONTROLA NASTAVENÍ

### 1. Ověřte Service ID v EmailJS
1. Přihlaste se na: https://dashboard.emailjs.com
2. Otevřete **Email Services**
3. Zkopírujte **Service ID** (mělo by být `service_5k776hf`)

### 2. Ověřte Public Key
1. V EmailJS dashboardu klikněte na **Account** → **API Keys**
2. Zkopírujte **Public Key** (mělo by být `xL_Khx5Gcnt-lEvUl`)

### 3. Ověřte Template IDs
1. V EmailJS dashboardu otevřete **Email Templates**
2. Najděte templates a zkopírujte jejich IDs:
   - **Kalkulačka**: `template_grgltnp`
   - **Kontakt**: `template_kogwumm`

---

## 🔒 BEZPEČNOST - FAQ

### ❓ Není nebezpečné mít Service ID v kódu?

**NE** - Service ID a Public Key jsou **záměrně veřejné** credentials.

**Důvody:**
1. 📱 **Front-end nutnost** - EmailJS funguje z prohlížeče, credentials musí být přístupné
2. 👁️ **Viditelné i tak** - i s `NEXT_PUBLIC_*` se zkompilují do JS, který je veřejný
3. 🛡️ **EmailJS ochrana** - rate limiting, domain restrictions, template restrictions
4. 🔐 **Není to secret** - jako API secret key, který by viděný být neměl

### ❓ Jak zabezpečit proti zneužití?

V EmailJS dashboardu nastavte:
1. **Domain restrictions** (Settings → Allowed Origins)
   - Přidejte jen: `localhost`, `demonagro.cz`, `*.demonagro.cz`
2. **Rate limiting** (automaticky aktivní)
3. **Template restrictions** (útočník může používat jen vaše templates)

---

## 🧪 TESTOVÁNÍ

### Před nasazením otestujte:

```bash
# Restartujte dev server
npm run dev
```

Otestujte:
- ✅ `/kalkulacka` - vyplňte a odešlete kalkulačku
- ✅ `/kontakt` - odešlete kontaktní formulář

Měli byste vidět:
- ✅ Úspěšné odeslání
- ✅ Email dorazil na správnou adresu
- ✅ V console nejsou chyby EmailJS

---

## 📂 ZMĚNĚNÉ SOUBORY

### Upraveno:
- `app/(public)/kalkulacka/page.tsx` - používá ENV variables
- `app/(public)/kontakt/page.tsx` - používá ENV variables

### Stejné jako dříve (používají ENV už dlouho):
- `lib/utils/email-client.ts` - portálové emaily (welcome, reset, notifikace)

---

## 🚀 DEPLOYMENT

**Vercel/Netlify:**
Nastavte environment variables v dashboardu:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5k776hf
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl
NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID=template_grgltnp
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_kogwumm
```

⚠️ **Po přidání ENV variables restartujte build!**

---

## 📚 DALŠÍ DOKUMENTACE

- 📄 `EMAILJS_README.md` - Přehled EmailJS v projektu
- 🗺️ `EMAILJS_IMPLEMENTATION_MAP.md` - Mapa všech implementací
- 🔧 `ENV_VARIABLES_COMPLETE.md` - Kompletní ENV setup

---

## ✅ HOTOVO

Po úpravě `.env.local`:
1. ✅ Restartujte dev server (`npm run dev`)
2. ✅ Otestujte kalkulačku a kontaktní formulář
3. ✅ Ověřte, že emaily přicházejí
4. ✅ Nasaďte na production a nastavte ENV variables

Veřejné formuláře nyní fungují stejně jako portálová část! 🎉


