# ✅ TODO: Nastavení ENV proměnných

## 🚨 KRITICKÉ - Udělat IHNED

### 1. ⚠️ BEZPEČNOSTNÍ PROBLÉM: Google AI klíč na GitHubu

**Problém:** Váš Google AI klíč je nyní veřejně viditelný na GitHubu (byl pushnutý v předchozím commitu)

**IHNED udělat:**

1. **Zrušit kompromitovaný klíč:**
   - Jít na: https://makersuite.google.com/app/apikey
   - Najít klíč: `<revoked-google-ai-key>`
   - **SMAZAT ho** (už je kompromitovaný)

2. **Vygenerovat nový klíč:**
   - Na stejné stránce kliknout "Create API Key"
   - Zkopírovat nový klíč

3. **Přidat do `.env.local`:**
   ```env
   GEMINI_API_KEY=váš_nový_klíč_zde
   ```

**✅ Opraveno v kódu:** Klíč už není hardcodovaný, načítá se z ENV (`demon-agro/app/api/portal/extract-soil-data/route.ts`)

---

## 📝 HLAVNÍ ÚKOLY

### 2. Vytvořit soubor `.env.local`

**Kde:** `demon-agro/.env.local` (v kořenu složky demon-agro)

**Jak:**
```bash
cd demon-agro
notepad .env.local  # Windows
```

**Obsah:** Viz soubor `ENV_VARIABLES_COMPLETE.md` (sekce "Soubor .env.local")

---

### 3. Vyplnit základní ENV proměnné

V souboru `.env.local` vyplňte:

```env
# ✅ Už máte - jen přepište:
NEXT_PUBLIC_SUPABASE_URL=...  # z vašeho Supabase projektu
NEXT_PUBLIC_SUPABASE_ANON_KEY=...  # z vašeho Supabase projektu

# ✅ Už máte EmailJS základní nastavení:
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# 🆕 NOVÝ klíč (vygenerujte nový podle bodu 1):
GEMINI_API_KEY=váš_nový_klíč_zde

# ⚙️ Aplikační nastavení:
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
```

---

### 4. Vytvořit 3 nové EmailJS templates (pro portál)

**Důležité:** Templates `template_grgltnp` a `template_kogwumm` už máte a fungují. Tyto nové jsou PRO PORTÁLOVOU ČÁST.

#### 📧 Template 1: Welcome Email
1. Jít na: https://dashboard.emailjs.com/admin/templates
2. Kliknout "Create New Template"
3. Otevřít dokument: `EMAILJS_WELCOME_TEMPLATE.md`
4. Zkopírovat HTML a Plain Text z dokumentu
5. Uložit template a zkopírovat jeho ID
6. Přidat do `.env.local`:
   ```env
   NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=nové_id_zde
   ```

#### 🔐 Template 2: Password Reset
1. Znovu "Create New Template"
2. Otevřít: `EMAILJS_PASSWORD_RESET_TEMPLATE.md`
3. Zkopírovat obsah
4. Uložit a zkopírovat ID
5. Přidat do `.env.local`:
   ```env
   NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=nové_id_zde
   ```

#### 📬 Template 3: Liming Request Notification
1. Znovu "Create New Template"
2. Otevřít: `EMAILJS_LIMING_REQUEST_NOTIFICATION_TEMPLATE.md`
3. Zkopírovat obsah
4. Uložit a zkopírovat ID
5. Přidat do `.env.local`:
   ```env
   NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID=nové_id_zde
   ```

---

### 5. Nastavit ENV proměnné na Vercelu (PRODUKCE)

**Po lokálním testování:**

1. Jít na: https://vercel.com/dashboard
2. Vybrat váš projekt
3. Project Settings → Environment Variables
4. Přidat VŠECHNY proměnné z `.env.local` (kromě `NEXT_PUBLIC_APP_URL`, tam dát produkční URL)
5. **DŮLEŽITÉ:** Pro `NEXT_PUBLIC_APP_URL` použít: `https://portal.demonagro.cz` (nebo vaši produkční doménu)

---

### 6. Otestovat lokálně

```bash
cd demon-agro
npm run dev
```

**Testovat:**
- ✅ Extrakce PDF rozborů (zkontroluje GEMINI_API_KEY)
- ✅ Vytvoření nového uživatele (Welcome Email)
- ✅ Reset hesla (Password Reset Email)
- ✅ Vytvoření poptávky vápnění (Liming Request Notification)

---

### 7. Commitnout opravu a pushnout na GitHub

Nyní můžete commitnout opravu bezpečnostního problému:

```bash
git add -A
git commit -m "Security fix: Move Google AI API key to environment variables"
git push origin main
```

Vercel automaticky deployne novou verzi.

---

## 📚 Dokumentace

**Přečíst:**
- ✅ `ENV_VARIABLES_COMPLETE.md` - Kompletní přehled všech ENV proměnných
- 📧 `EMAILJS_PORTAL_SETUP_MASTER.md` - Hlavní návod na nastavení EmailJS
- 🗺️ `EMAILJS_IMPLEMENTATION_MAP.md` - Mapa implementace EmailJS v projektu

---

## ✅ Checklist

- [ ] Smazat starý Google AI klíč (kompromitovaný)
- [ ] Vygenerovat nový Google AI klíč
- [ ] Vytvořit `.env.local` soubor
- [ ] Vyplnit GEMINI_API_KEY v `.env.local`
- [ ] Vyplnit Supabase credentials v `.env.local`
- [ ] Vyplnit EmailJS basic config v `.env.local`
- [ ] Vytvořit Welcome Email template v EmailJS
- [ ] Vytvořit Password Reset template v EmailJS
- [ ] Vytvořit Liming Request Notification template v EmailJS
- [ ] Přidat všechny 3 nové template IDs do `.env.local`
- [ ] Otestovat lokálně (`npm run dev`)
- [ ] Nastavit všechny ENV proměnné na Vercelu
- [ ] Commitnout a pushnout opravu na GitHub
- [ ] Ověřit, že Vercel deploy proběhl úspěšně

---

## 🆘 Potřebujete pomoc?

**EmailJS:**
- Dashboard: https://dashboard.emailjs.com
- Dokumentace: https://www.emailjs.com/docs/
- Support: support@emailjs.com

**Google AI:**
- API Keys: https://makersuite.google.com/app/apikey
- Dokumentace: https://ai.google.dev/docs

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Project Settings → API → Najdete URL a anon key

