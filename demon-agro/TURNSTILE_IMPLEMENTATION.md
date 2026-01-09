# 🛡️ Cloudflare Turnstile - Implementace dokončena

**Datum:** 9. ledna 2026  
**Status:** ✅ Kompletně implementováno  
**Ochrana:** Tripletní (Turnstile + Rate Limiting + Server-side validace)

---

## ✅ CO BYLO IMPLEMENTOVÁNO

### 1. **Turnstile Widget Komponenta**
📄 `components/TurnstileWidget.tsx`

- ✅ React komponenta pro Turnstile CAPTCHA
- ✅ Automatické vypršení a obnovení tokenu
- ✅ Error handling
- ✅ Fallback zobrazení při chybějící konfiguraci

### 2. **Integrace do formulářů**

**Kalkulačka vápnění** (`app/(public)/kalkulacka/page.tsx`):
- ✅ Turnstile widget v kroku 3 (kontaktní údaje)
- ✅ Validace tokenu před odesláním
- ✅ Reset tokenu při nové kalkulaci

**Kontaktní formulář** (`app/(public)/kontakt/page.tsx`):
- ✅ Turnstile widget před submit button
- ✅ Validace tokenu před odesláním
- ✅ Reset tokenu po úspěšném odeslání

### 3. **Server-side ochrana**

**API Endpoint** (`app/api/verify-turnstile/route.ts`):
- ✅ Server-side validace Turnstile tokenu
- ✅ Komunikace s Cloudflare API
- ✅ Error handling a logging

**Rate Limiter** (`lib/utils/rate-limiter.ts`):
- ✅ In-memory rate limiting
- ✅ IP-based tracking
- ✅ Automatické čištění starých záznamů
- ✅ Flexibilní konfigurace limitů

**Contact API** (`app/api/submit-contact/route.ts`):
- ✅ Rate limiting (3 formuláře/hodinu z jedné IP)
- ✅ Turnstile token validace
- ✅ Informativní error hlášky

---

## 🔧 POTŘEBNÁ KONFIGURACE

### Krok 1: Získejte Cloudflare Turnstile credentials

Postupujte podle: **`TURNSTILE_SETUP.md`**

Nebo rychle:
1. Registrace: https://dash.cloudflare.com/sign-up
2. Přejít na: **Turnstile** → **Add Site**
3. Vyplnit:
   - Site name: `Démon Agro`
   - Domain: `demonagro.cz` + `localhost`
   - Widget Mode: **Managed**
4. Zkopírovat **Site Key** a **Secret Key**

### Krok 2: Přidejte do `.env.local`

```bash
# ===== CLOUDFLARE TURNSTILE (OCHRANA PROTI BOTŮM) =====
# Site Key (veřejný - jde do front-endu)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAa1b2c3d4e5f6g7h8

# Secret Key (TAJNÝ - pouze pro server-side validaci)
TURNSTILE_SECRET_KEY=0x4AAAAAAAa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```

⚠️ **DŮLEŽITÉ:**
- `NEXT_PUBLIC_*` = viditelné v prohlížeči (Site Key) ✅
- Bez `NEXT_PUBLIC_` = pouze server (Secret Key) 🔒

### Krok 3: Test Keys (pro development bez účtu)

Pokud chcete **testovat bez registrace**, použijte:

```bash
# Test keys - VŽDY vrací success (pro development)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

⚠️ **NIKDY nepoužívejte test keys na production!**

---

## 🧪 TESTOVÁNÍ

### Příprava

```bash
# 1. Ujistěte se, že máte keys v .env.local
# 2. Restartujte dev server
cd demon-agro
npm run dev
```

### Test 1: Kalkulačka vápnění

1. Otevřete: http://localhost:3000/kalkulacka
2. Vyplňte kroky 1 a 2 (typ půdy, rozbor)
3. V kroku 3 (kontakt):
   - Vyplňte kontaktní údaje
   - **Počkejte na zobrazení Turnstile widgetu** (šedý box s checkboxem)
   - Widget by se měl automaticky ověřit
4. Klikněte "Vypočítat"
5. ✅ **Očekávaný výsledek:** Email odeslán, výsledky zobrazeny

**Pokud neuvidíte Turnstile widget:**
- ⚠️ Zkontrolujte console - měla by být chyba s chybějícím Site Key
- ⚠️ Ověřte `.env.local` - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` musí být nastavený
- ⚠️ Restartujte dev server

### Test 2: Kontaktní formulář

1. Otevřete: http://localhost:3000/kontakt
2. Vyplňte formulář (jméno, email, telefon, zpráva)
3. **Počkejte na zobrazení Turnstile widgetu**
4. Widget by se měl automaticky ověřit
5. Klikněte "Odeslat poptávku"
6. ✅ **Očekávaný výsledek:** Success hláškaí "Děkujeme! Vaše poptávka byla odeslána"

### Test 3: Rate Limiting

1. Odešlete kontaktní formulář 3× za sebou
2. Při 4. pokusu byste měli dostat chybu:
   ```
   "Překročen limit odeslaných formulářů. Zkuste to prosím za XX minut."
   ```
3. ✅ **Očekávaný výsledek:** Rate limit funguje

### Test 4: Bot Protection

**Bez Turnstile tokenu:**
1. Otevřete DevTools → Console
2. Smažte Turnstile token (nastavte `turnstileToken` na `null`)
3. Zkuste odeslat formulář
4. ✅ **Očekávaný výsledek:** Chyba "Prosím ověřte, že nejste robot"

---

## 🔒 BEZPEČNOSTNÍ VRSTVY

Implementovali jsme **3 vrstvy ochrany**:

### 1️⃣ **Turnstile CAPTCHA** (Front-end)
- Neviditelná CAPTCHA od Cloudflare
- Automatická detekce botů
- Moderní, GDPR-compliant

### 2️⃣ **Server-side Validace** (API)
- Turnstile token se validuje na serveru
- Nemůže být obejita úpravou front-endu
- Komunikace s Cloudflare API

### 3️⃣ **Rate Limiting** (Backup)
- Omezení počtu requestů z jedné IP
- 3 formuláře za hodinu (kalkulačka/kontakt)
- In-memory tracking
- Automatické čištění

---

## 📊 NASTAVENÍ LIMITŮ

Můžete upravit rate limity v `app/api/submit-contact/route.ts`:

```typescript
// Současné nastavení: 3 formuláře za hodinu
const rateLimit = checkRateLimit(`contact:${clientIp}`, 3, 60 * 60 * 1000);

// Příklady jiných nastavení:
checkRateLimit(`contact:${clientIp}`, 5, 60 * 60 * 1000);      // 5 za hodinu
checkRateLimit(`contact:${clientIp}`, 10, 24 * 60 * 60 * 1000); // 10 za den
checkRateLimit(`contact:${clientIp}`, 1, 5 * 60 * 1000);        // 1 za 5 minut
```

---

## 🚀 DEPLOYMENT (Production)

### Vercel

1. Dashboard → Settings → Environment Variables
2. Přidejte:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY = production_site_key
   TURNSTILE_SECRET_KEY = production_secret_key
   ```
3. Redeploy aplikace

### Netlify

1. Site settings → Environment variables
2. Přidejte obě proměnné
3. Trigger new deploy

### ⚠️ Nezapomeňte

- ✅ Použít **production keys** (ne test keys!)
- ✅ V Cloudflare Turnstile přidat production doménu (`demonagro.cz`)
- ✅ Nastavit **Domain restrictions** v Cloudflare (jen povolené domény)

---

## 🐛 TROUBLESHOOTING

### Turnstile widget se nezobrazuje

**Příčina:** Chybějící nebo neplatný Site Key

**Řešení:**
1. Zkontrolujte `.env.local` - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` je nastavený?
2. Restartujte dev server (`Ctrl+C` → `npm run dev`)
3. Zkontrolujte browser console - měla by být varovná hláška
4. Zkuste použít test key: `1x00000000000000000000AA`

### "Verification failed" chyba

**Příčina:** Neplatný Secret Key nebo chybná konfigurace

**Řešení:**
1. Zkontrolujte `.env.local` - `TURNSTILE_SECRET_KEY` je správný?
2. Ověřte, že Site Key a Secret Key jsou z **stejného Turnstile site**
3. V Cloudflare Turnstile zkontrolujte, že `localhost` je v allowed domains
4. Zkuste test keys pro ověření, že kód funguje

### Rate limit chyba na developmentu

**Příčina:** Příliš mnoho testů z jedné IP

**Řešení:**
1. Počkejte hodinu
2. Nebo restartujte dev server (vymaže in-memory cache)
3. Nebo dočasně zvyšte limit v kódu pro testing

### Widget se zobrazuje, ale formulář nejde odeslat

**Příčina:** Token není nastaven nebo expiroval

**Řešení:**
1. Počkejte na automatické ověření (1-2 sekundy)
2. Zkontrolujte console - jsou tam chyby?
3. Zkuste refresh stránky
4. Zkontrolujte, že token se uloží po `onSuccess` callbacku

---

## 📚 SOUBORY

### Komponenty
- `components/TurnstileWidget.tsx` - React komponenta

### Formuláře
- `app/(public)/kalkulacka/page.tsx` - Kalkulačka s Turnstile
- `app/(public)/kontakt/page.tsx` - Kontaktní formulář s Turnstile

### API Endpoints
- `app/api/verify-turnstile/route.ts` - Server-side validace tokenu
- `app/api/submit-contact/route.ts` - Protected endpoint s rate limitingem

### Utility
- `lib/utils/rate-limiter.ts` - Rate limiting logika

### Dokumentace
- `TURNSTILE_SETUP.md` - Setup guide pro Cloudflare
- `TURNSTILE_IMPLEMENTATION.md` - Tento soubor (implementace)

---

## 🎓 DALŠÍ INFORMACE

### Cloudflare Turnstile Docs
- Dokumentace: https://developers.cloudflare.com/turnstile/
- Dashboard: https://dash.cloudflare.com/

### React Turnstile Package
- GitHub: https://github.com/marsidev/react-turnstile
- NPM: https://www.npmjs.com/package/@marsidev/react-turnstile

---

## ✅ CHECKLIST

### Development
- [ ] Nainstalován balíček `@marsidev/react-turnstile`
- [ ] Site Key a Secret Key v `.env.local`
- [ ] Dev server restartován
- [ ] Turnstile widget viditelný na formulářích
- [ ] Kalkulačka testována - ✅ funguje
- [ ] Kontaktní formulář testován - ✅ funguje
- [ ] Rate limiting testován - ✅ funguje

### Production
- [ ] Production keys vytvořeny v Cloudflare
- [ ] ENV variables nastaveny na hostingu
- [ ] Domain restrictions nastaveny v Cloudflare
- [ ] Production doména přidána do Turnstile
- [ ] Deployment proveden
- [ ] Production testováno

---

## 🎉 HOTOVO!

Cloudflare Turnstile je **plně implementován** a **připraven k použití**!

**Ochrana zahrnuje:**
- ✅ Neviditelná CAPTCHA (Turnstile)
- ✅ Server-side validace
- ✅ Rate limiting (3/hodinu)
- ✅ IP tracking
- ✅ Error handling

Vaše formuláře jsou nyní **chráněné proti botům** a **spam útokům**! 🛡️

Pokud máte dotazy, konzultujte:
- `TURNSTILE_SETUP.md` - Setup guide
- Cloudflare Dashboard - analytics a nastavení

