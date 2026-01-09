# 🛡️ Cloudflare Turnstile - Setup Guide

**Datum:** 9. ledna 2026  
**Účel:** Ochrana proti botům na veřejných formulářích

---

## 📋 CO JE TURNSTILE?

Cloudflare Turnstile je **moderní, GDPR-compliant alternativa** k Google reCAPTCHA:

- ✅ **Zdarma** bez omezení
- ✅ **Neviditelná** - žádné otravné klikání na obrázky
- ✅ **Privacy-friendly** - žádný Google tracking
- ✅ **Rychlá** - minimální dopad na výkon
- ✅ **Účinná** - moderní bot detekce

---

## 🚀 KROK 1: Registrace Cloudflare účtu

### 1.1 Vytvořte účet (pokud nemáte)

1. Navštivte: https://dash.cloudflare.com/sign-up
2. Zaregistrujte se (email + heslo)
3. Ověřte email

### 1.2 Přejděte do Turnstile

1. Přihlaste se: https://dash.cloudflare.com/
2. V levém menu klikněte: **Turnstile**
3. Klikněte: **Add Site**

---

## 🔑 KROK 2: Vytvoření Turnstile Site

### 2.1 Vyplňte formulář

**Site Name:**
```
Démon Agro - Production
```

**Domain:**
```
demonagro.cz
```
*(Pro development přidáte později `localhost`)*

**Widget Mode:**
- ✅ **Managed** (doporučeno) - automatická detekce
- ⬜ Invisible
- ⬜ Non-interactive

**Pre-Clearance:**
- ⬜ Nechte vypnuté (není potřeba)

### 2.2 Klikněte "Create"

Po vytvoření uvidíte:
- 🔑 **Site Key** - veřejný klíč (jde do front-endu)
- 🔐 **Secret Key** - tajný klíč (NIKDY nedávat do front-endu!)

---

## 📝 KROK 3: Zkopírujte credentials

### 3.1 Site Key (veřejný)
```
Příklad: 0x4AAAAAAAa1b2c3d4e5f6g7h8
```
Tento klíč je viditelný v prohlížeči - **není tajný**.

### 3.2 Secret Key (tajný)
```
Příklad: 0x4AAAAAAAa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```
Tento klíč **NIKDY nedávat do front-endu** - jen na server!

---

## 🔧 KROK 4: Přidejte do .env.local

Otevřete `demon-agro/.env.local` a přidejte:

```bash
# ===== CLOUDFLARE TURNSTILE =====
# Site Key (veřejný - jde do front-endu)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAa1b2c3d4e5f6g7h8

# Secret Key (TAJNÝ - pouze pro server-side validaci)
TURNSTILE_SECRET_KEY=0x4AAAAAAAa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```

⚠️ **DŮLEŽITÉ:**
- `NEXT_PUBLIC_*` = viditelné v prohlížeči (Site Key)
- Bez `NEXT_PUBLIC_` = pouze server (Secret Key)

---

## 🏗️ KROK 5: Přidání localhost pro development

### 5.1 Vraťte se do Cloudflare Dashboard

1. Otevřete: https://dash.cloudflare.com/
2. Klikněte na **Turnstile**
3. Klikněte na váš site "Démon Agro - Production"
4. Klikněte **Settings**

### 5.2 Přidejte localhost

V sekci **Domains** klikněte **Add a domain** a přidejte:
```
localhost
```

Nyní Turnstile bude fungovat i v developmentu!

---

## 🧪 KROK 6: Test Turnstile

### 6.1 Test Keys (pro development)

Cloudflare poskytuje **test keys**, které vždy vrací success:

**Test Site Key:**
```
1x00000000000000000000AA
```

**Test Secret Key:**
```
1x0000000000000000000000000000000AA
```

Můžete je použít pro testování **před vytvořením účtu**.

### 6.2 Kdy použít test keys?

- ✅ **Development** - když ještě nemáte Cloudflare účet
- ✅ **Unit testy** - automatické testy
- ❌ **Production** - VŽDY použijte skutečné keys!

---

## 📊 PŘEHLED ENV VARIABLES

Váš `.env.local` by měl obsahovat:

```bash
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ===== EMAILJS =====
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5k776hf
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl
NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID=template_grgltnp
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=template_kogwumm

# ===== CLOUDFLARE TURNSTILE (OCHRANA PROTI BOTŮM) =====
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# ===== DALŠÍ =====
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔒 BEZPEČNOST

### ✅ Co MŮŽE být veřejné:
- Site Key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
- EmailJS Service ID
- EmailJS Public Key
- Supabase Anon Key

### ❌ Co NESMÍ být veřejné:
- **Secret Key** (`TURNSTILE_SECRET_KEY`) - ⚠️ **NIKDY do front-endu!**
- Database passwords
- API secret keys
- JWT secrets

---

## 🚀 DEPLOYMENT (Production)

### Vercel

1. Dashboard → Settings → Environment Variables
2. Přidejte:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY = vaše_site_key
   TURNSTILE_SECRET_KEY = vaše_secret_key
   ```
3. Restartujte deployment

### Netlify

1. Site settings → Environment variables
2. Přidejte obě proměnné
3. Trigger new deploy

⚠️ **Nezapomeňte:**
- Použít **production keys** (ne test keys!)
- V Cloudflare přidat production doménu (`demonagro.cz`)

---

## 📚 DALŠÍ KROKY

Po nastavení credentials:
1. ✅ Nainstalovat balíček: `npm install @marsidev/react-turnstile`
2. ✅ Implementovat do formulářů (kalkulačka, kontakt)
3. ✅ Vytvořit API endpoint pro validaci
4. ✅ Testovat na localhost
5. ✅ Nasadit na production

---

## 🔗 ODKAZY

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Turnstile Docs:** https://developers.cloudflare.com/turnstile/
- **React Turnstile:** https://github.com/marsidev/react-turnstile

---

## ✅ CHECKLIST

- [ ] Vytvořil(a) jsem Cloudflare účet
- [ ] Vytvořil(a) jsem Turnstile site
- [ ] Zkopíroval(a) jsem Site Key a Secret Key
- [ ] Přidal(a) jsem keys do `.env.local`
- [ ] Přidal(a) jsem `localhost` do Cloudflare Turnstile domains
- [ ] Keys jsou správně nastaveny (Site Key má `NEXT_PUBLIC_`, Secret Key ne)

**Po splnění checklistu pokračujte instalací balíčku!** 🚀

