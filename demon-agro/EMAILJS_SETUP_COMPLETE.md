# ✅ EmailJS Templates - Nastavení dokončeno!

**Datum:** 6. ledna 2026  
**Status:** ✅ Templates vytvořeny v EmailJS, zbývá propojit s projektem

---

## 🎉 Vaše Template IDs z EmailJS

Všechny 3 templates byly úspěšně vytvořeny v EmailJS Dashboard:

| Template | Template ID | Status |
|----------|------------|--------|
| 🎉 **Welcome Email** | `template_3vy2y7c` | ✅ Vytvořeno |
| 🔐 **Password Reset** | `template_g029xe7` | ✅ Vytvořeno |
| 📬 **Liming Request (Admin)** | `template_b022lkj` | ✅ Vytvořeno |

---

## 🔧 Krok 1: Aktualizovat `.env.local`

### Otevřete soubor `.env.local` v kořenovém adresáři projektu:

```bash
# Cesta k souboru
demon-agro/.env.local
```

### Přidejte nebo aktualizujte tyto řádky:

```env
# ===================================================
# EMAILJS - PORTÁLOVÉ TEMPLATES (Přidáno 6.1.2026)
# ===================================================

# Welcome Email (registrace nového uživatele)
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_3vy2y7c

# Password Reset (reset hesla uživatele)
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_g029xe7

# Liming Request Notification (notifikace adminovi o poptávce)
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=template_b022lkj

# ===================================================
# EMAILJS - ZÁKLADNÍ NASTAVENÍ (již existující)
# ===================================================

NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl

# ===================================================
# ADMIN NASTAVENÍ
# ===================================================

NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

---

## 🔄 Krok 2: Restart vývojového serveru

Po úpravě `.env.local` je **nutné** restartovat Next.js server:

```bash
# V terminálu:
# 1. Zastavit server (Ctrl+C nebo Cmd+C)

# 2. Spustit znovu
npm run dev
```

---

## 🧪 Krok 3: Testování

### Test 1: Welcome Email ✉️

1. Přihlaste se do admin panelu: `/portal/admin`
2. Přejděte na **Správa uživatelů**
3. Klikněte na **Přidat nového uživatele**
4. Vyplňte formulář:
   ```
   Celé jméno: Test Uživatel
   Email: vas-testovaci@email.cz
   Firma: Testovací firma
   Okres: Testovací
   Telefon: +420123456789
   ```
5. Klikněte **Vytvořit uživatele**
6. ✅ **Zkontrolujte email** - měl by dorazit welcome email s přihlašovacími údaji

**Co kontrolovat:**
- [ ] Email dorazil
- [ ] Logo Démon agro se zobrazuje
- [ ] Přihlašovací údaje jsou správné
- [ ] Tlačítko "Přihlásit se" funguje
- [ ] Design vypadá profesionálně

---

### Test 2: Password Reset 🔐

1. V admin panelu otevřete **Správa uživatelů**
2. Najděte testovacího uživatele
3. Klikněte na **Resetovat heslo**
4. Potvrďte akci
5. ✅ **Zkontrolujte email** - měl by dorazit email s novým heslem

**Co kontrolovat:**
- [ ] Email dorazil
- [ ] Logo se zobrazuje
- [ ] Nové heslo je zobrazeno
- [ ] Bezpečnostní upozornění je viditelné
- [ ] Tlačítko "Přihlásit se" funguje

---

### Test 3: Liming Request Notification 📬

1. Odhlaste se z admin účtu
2. Přihlaste se jako **běžný uživatel** (testovací účet)
3. Přejděte na **Plán vápnění**
4. Vytvořte plán vápnění pro nějaký pozemek
5. Přidejte položky do košíku
6. Odešlete poptávku
7. ✅ **Zkontrolujte admin email** (`base@demonagro.cz`) - měla by dorazit notifikace

**Co kontrolovat:**
- [ ] Email dorazil na `base@demonagro.cz`
- [ ] Logo se zobrazuje
- [ ] Statistiky (pozemky, ha, tuny) jsou správné
- [ ] Kontaktní údaje zákazníka jsou správné
- [ ] Tlačítko "Zobrazit v admin panelu" funguje
- [ ] **Zkuste odpovědět na email** - mělo by odpovídat přímo zákazníkovi (Reply-To)

---

## 🎯 Kontrolní checklist

Po dokončení všech testů:

### Environment proměnné
- [ ] Template IDs přidány do `.env.local`
- [ ] Server byl restartován

### Welcome Email
- [ ] Email se odesílá při vytvoření uživatele
- [ ] Obsahuje správné přihlašovací údaje
- [ ] Logo se zobrazuje
- [ ] Design je responzivní (zkusit na mobilu)

### Password Reset
- [ ] Email se odesílá při resetování hesla
- [ ] Obsahuje nové heslo
- [ ] Logo se zobrazuje
- [ ] Bezpečnostní upozornění je přítomno

### Liming Request Notification
- [ ] Email se odesílá při odeslání poptávky
- [ ] Dorazí adminovi (`base@demonagro.cz`)
- [ ] Obsahuje správné statistiky
- [ ] Reply-To funguje (odpověď jde zákazníkovi)
- [ ] Tlačítko do admin panelu funguje

---

## 🐛 Řešení problémů

### Email se neposílá

**1. Zkontrolujte console**
```bash
# V prohlížeči otevřete DevTools (F12)
# Podívejte se do záložky Console
# Hledejte chyby týkající se EmailJS
```

**2. Zkontrolujte environment proměnné v kódu**

Otevřete soubor a přidejte dočasný console.log:

```typescript
// demon-agro/lib/utils/email.ts (řádek 60)

function getEmailJSConfig(): EmailJSConfig | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  
  // 🔍 DOČASNÝ DEBUG (odstraňte po testování)
  console.log('EmailJS Config:', {
    serviceId,
    publicKey,
    hasService: !!serviceId,
    hasKey: !!publicKey
  })
  
  if (!serviceId || !publicKey) {
    console.warn('EmailJS not configured - missing environment variables')
    return null
  }
  
  return { serviceId, publicKey }
}
```

**3. Zkontrolujte, že Template ID je správné**

```typescript
// Pro testování Welcome Emailu
// demon-agro/lib/utils/email.ts (řádek 134)

const templateId = process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID

// 🔍 DOČASNÝ DEBUG
console.log('Welcome Template ID:', templateId)

if (!templateId) {
  console.warn('Welcome email template not configured')
  return { success: false, error: 'Template not configured' }
}
```

**4. Zkontrolujte EmailJS Dashboard**
- Přihlaste se na https://dashboard.emailjs.com
- Přejděte na **Usage** - zkontrolujte, že nemáte vyčerpanou kvótu
- Ověřte, že Service ID je aktivní

---

### Logo se nezobrazuje

**Zkontrolujte URL loga:**
```
https://demonagro.cz/logo.png
```

Otevřete tuto URL v prohlížeči - mělo by se zobrazit logo.

**Pokud nefunguje:**
- Ověřte, že soubor `/public/logo.png` existuje v projektu
- Zkontrolujte, že web je online a dostupný
- Pro testování použijte placeholder: `https://via.placeholder.com/200x80/4A7C59/FFFFFF?text=Demon+Agro`

---

### Chyba 412 (Precondition Failed)

Viz detailní návod v souboru: `EMAILJS_412_FIX.md`

**Rychlé řešení:**
1. Zkontrolujte, že všechny proměnné v template jsou správně
2. Ověřte, že Subject obsahuje `{{proměnné}}` správně
3. Zkontrolujte Reply-To u Liming Request (musí být `{{contact_email}}`)

---

## 📊 Kam dál

Po úspěšném testování máte plně funkční emailový systém!

### ✅ Co teď funguje:

1. **Veřejná část:**
   - 🧮 Kalkulačka vápnění - výsledky na email
   - 📧 Kontaktní formulář

2. **Portál:**
   - 🎉 Welcome email při registraci
   - 🔐 Password reset email
   - 📬 Notifikace adminovi o poptávkách

### 🚀 Další kroky:

1. **Odstranit debug console.logy** (pokud jste přidali)
2. **Otestovat na produkci** (po nasazení)
3. **Monitorovat EmailJS Usage** v dashboardu
4. **Zvážit upgrade plánu** (pokud budete mít více než 200 emailů/měsíc)

---

## 📝 Poznámky pro produkci

### Environment proměnné na produkci

Ujistěte se, že tyto proměnné jsou nastavené i na produkčním serveru (např. Vercel, Netlify):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xrx301a
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xL_Khx5Gcnt-lEvUl
NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID=template_3vy2y7c
NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID=template_g029xe7
NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID=template_b022lkj
NEXT_PUBLIC_ADMIN_EMAIL=base@demonagro.cz
NEXT_PUBLIC_APP_URL=https://portal.demonagro.cz
```

### Monitorování

- **EmailJS Dashboard**: Sledujte počet odeslaných emailů
- **Free plán**: 200 emailů/měsíc
- **Při překročení**: Zvažte upgrade na placený plán

---

## 🎉 Gratulujeme!

Úspěšně jste nastavili kompletní EmailJS systém pro portál Démon agro!

Všechny emaily mají:
- ✅ Profesionální design
- ✅ Logo firmy
- ✅ Responzivní layout
- ✅ Bezpečné zasílání přihlašovacích údajů
- ✅ Automatické notifikace

---

**Datum dokončení:** 6. ledna 2026  
**Template IDs:**
- Welcome: `template_3vy2y7c`
- Password Reset: `template_g029xe7`
- Liming Request: `template_b022lkj`

**Status:** ✅ Připraveno k testování



