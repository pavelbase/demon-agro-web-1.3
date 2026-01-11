# 🚀 Cloudflare Turnstile - RYCHLÝ START

**5 minut do plné ochrany proti botům!**

---

## ⚡ RYCHLÝ POSTUP

### 1️⃣ Získejte Turnstile credentials (5 min)

**Možnost A: Test keys (okamžitě, pro testování)**
```bash
# Přidejte do .env.local:
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**Možnost B: Production keys (doporučeno)**
1. Registrace: https://dash.cloudflare.com/sign-up
2. **Turnstile** → **Add Site**
3. Vyplnit:
   - Domain: `demonagro.cz` + `localhost`
   - Widget Mode: **Managed**
4. Zkopírovat Site Key a Secret Key
5. Přidat do `.env.local` (viz níže)

### 2️⃣ Upravte `.env.local`

Otevřete `demon-agro/.env.local` a přidejte:

```bash
# ===== CLOUDFLARE TURNSTILE =====
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### 3️⃣ Restartujte server

```bash
# Stiskněte Ctrl+C, pak:
cd demon-agro
npm run dev
```

### 4️⃣ Otestujte

- http://localhost:3000/kalkulacka - vyplňte a odešlete
- http://localhost:3000/kontakt - vyplňte a odešlete

✅ **Měli byste vidět:** Šedý Turnstile widget (checkbox) před tlačítkem odeslat

---

## 🎯 CO SE IMPLEMENTOVALO?

✅ **Turnstile CAPTCHA** - neviditelná ochrana  
✅ **Server-side validace** - nemůže být obejita  
✅ **Rate limiting** - max 3 odeslaná za hodinu z jedné IP  
✅ **Kalkulačka** - chráněna  
✅ **Kontaktní formulář** - chráněn

---

## 📚 DETAILNÍ DOKUMENTACE

**Mám problém / chci vědět víc:**

- 📖 **`TURNSTILE_SETUP.md`** - Detailní setup guide
- 🔧 **`TURNSTILE_IMPLEMENTATION.md`** - Kompletní dokumentace
- 🐛 **Troubleshooting** - Řešení problémů (v IMPLEMENTATION.md)

---

## ⚠️ NEJČASTĚJŠÍ PROBLÉMY

### Widget se nezobrazuje?
1. Zkontrolujte `.env.local` - je tam `NEXT_PUBLIC_TURNSTILE_SITE_KEY`?
2. Restartovali jste server po změně .env?
3. Zkuste test key: `1x00000000000000000000AA`

### "Verification failed"?
1. `TURNSTILE_SECRET_KEY` je v `.env.local`?
2. Site Key a Secret Key jsou z **stejného site** v Cloudflare?
3. `localhost` je přidán v Cloudflare Turnstile domains?

### Formulář nejde odeslat?
1. Počkejte 1-2 sekundy na automatické ověření Turnstile
2. Zkontrolujte browser console - jsou tam chyby?
3. Zkuste refresh stránky

---

## 🚀 PRODUCTION DEPLOYMENT

1. Vytvořte **production keys** v Cloudflare (ne test keys!)
2. V hostingu (Vercel/Netlify) nastavte ENV variables:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY = production_site_key
   TURNSTILE_SECRET_KEY = production_secret_key
   ```
3. V Cloudflare přidejte production doménu (`demonagro.cz`)
4. Nasaďte a testujte

---

## ✅ HOTOVO!

Turnstile je implementován a připraven k použití! 🎉

**Další kroky:**
1. ✅ Otestujte na localhost
2. ✅ Vytvořte production keys
3. ✅ Nasaďte na production
4. ✅ Profit! 🛡️

Pro více informací: `TURNSTILE_IMPLEMENTATION.md`


