# 🧪 Testovací Checklist - Supabase Storage

## ⚡ Rychlý test (5 minut)

### 1️⃣ Vytvoření bucketu
- [ ] Otevřít Supabase Dashboard → SQL Editor
- [ ] Spustit: `lib/supabase/sql/create_public_images_bucket.sql`
- [ ] Ověřit: Storage → bucket `public-images` existuje
- [ ] Ověřit: Bucket je **Public** (✅)

### 2️⃣ Test upload
- [ ] Otevřít: `http://localhost:3000/admin`
- [ ] Přihlásit se: heslo `demonagro2024`
- [ ] Záložka: **Správa obrázků**
- [ ] Vybrat libovolný obrázek → **Změnit URL**
- [ ] Nahrát testovací obrázek (JPG/PNG, < 5 MB)
- [ ] ✅ Upload úspěšný
- [ ] ✅ URL začíná: `https://...supabase.co/storage/v1/object/public/public-images/...`
- [ ] ✅ Obrázek se zobrazí v admin panelu

### 3️⃣ Test zobrazení uživatelům
- [ ] Otevřít web v **inkognito režimu** (nebo jiném prohlížeči)
- [ ] Přejít na stránku s nahraným obrázkem
- [ ] ✅ Obrázek se zobrazí správně (žádná 404 chyba)

### 4️⃣ Test na produkci (po deploy)
- [ ] Deploy na Vercel/Netlify
- [ ] Nahrát obrázek na produkci
- [ ] Redeploy aplikace
- [ ] ✅ **Obrázek stále existuje** (nejdůležitější test!)

---

## 🔬 Detailní test (15 minut)

### Admin panel - Upload

#### Test různých formátů:
- [ ] JPG - úspěšně nahráno
- [ ] PNG - úspěšně nahráno
- [ ] WebP - úspěšně nahráno
- [ ] GIF - úspěšně nahráno
- [ ] PDF - chybová hláška (není povoleno)
- [ ] TXT - chybová hláška (není povoleno)

#### Test velikostních limitů:
- [ ] Soubor < 1 MB - OK
- [ ] Soubor ~4.5 MB - OK
- [ ] Soubor > 5 MB - chybová hláška

#### Test produktových obrázků:
- [ ] Přidat nový produkt
- [ ] Nahrát obrázek produktu
- [ ] Uložit produkt
- [ ] Produkt se zobrazí na příslušné stránce (pH, Síra, K, Mg, Analýza)
- [ ] Obrázek produktu se zobrazí správně

### Veřejný web - Zobrazení

#### Test na různých stránkách:
- [ ] Homepage (`/`) - hero obrázek, CTA obrázky
- [ ] pH stránka (`/ph-pudy`) - hero, problem image, impact background
- [ ] Síra (`/sira`) - hero, problem image
- [ ] Draslík (`/k`) - hero, problem image
- [ ] Hořčík (`/mg`) - hero, problem image
- [ ] Analýza (`/analyza`) - hero, problem image
- [ ] O nás (`/o-nas`) - hero, who we are image

#### Test produktových karet:
- [ ] pH produkty - obrázky se zobrazují
- [ ] Síra produkty - obrázky se zobrazují
- [ ] Draslík produkty - obrázky se zobrazují
- [ ] Hořčík produkty - obrázky se zobrazují
- [ ] Analýza produkty - obrázky se zobrazují

### Supabase Dashboard

#### Kontrola bucketu:
- [ ] Storage → `public-images` existuje
- [ ] Bucket je Public (✅)
- [ ] Nahrané soubory jsou viditelné
- [ ] Kliknutí na soubor → Copy URL funguje
- [ ] URL otevřená v prohlížeči zobrazí obrázek

#### Kontrola policies:
- [ ] Policy: "Public images are publicly readable" existuje
- [ ] Policy: "Authenticated users can upload" existuje
- [ ] Policy: "Authenticated users can delete" existuje
- [ ] Policy: "Authenticated users can update" existuje

### Browser Developer Tools

#### Network tab:
- [ ] F12 → Network tab
- [ ] Reload stránky
- [ ] Obrázky se načítají z `supabase.co/storage/...`
- [ ] Status 200 (ne 404, ne 403)
- [ ] Content-Type: `image/jpeg`, `image/png`, etc.

#### Console tab:
- [ ] Žádné chyby související s obrázky
- [ ] Žádné CORS warnings

---

## 🚀 Produkční test

### Před nasazením:
- [ ] Všechny testy v lokálním prostředí prošly ✅
- [ ] Environment variables nastaveny na Vercel/Netlify:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Build prošel bez chyb

### Po nasazení:
- [ ] Otevřít produkční URL
- [ ] Zkontrolovat všechny stránky
- [ ] Obrázky se zobrazují správně
- [ ] Přihlásit se do admin panelu
- [ ] Nahrát nový obrázek
- [ ] Obrázek se zobrazí správně

### Kritický test - Persistence:
- [ ] Nahrát testovací obrázek na produkci
- [ ] Zapamatovat si URL obrázku
- [ ] Redeploy aplikace (push + redeploy)
- [ ] ✅ **Obrázek stále existuje na stejné URL**
- [ ] ✅ **Obrázek se stále zobrazuje uživatelům**

---

## 🐛 Řešení problémů

### ❌ Upload selže - "Bucket not found"
**→ Vytvořte bucket ručně v Supabase Dashboard**

### ❌ Upload funguje, obrázek se nezobrazí (404)
**→ Zkontrolujte, zda je bucket Public (✅)**

### ❌ Funguje lokálně, ne na produkci
**→ Zkontrolujte environment variables na Vercel/Netlify**

### ❌ CORS errors
**→ Bucket musí být Public, policies správně nastaveny**

---

## ✅ Všechny testy prošly?

### Gratulujeme! 🎉

Vaše implementace Supabase Storage je funkční:
- ✅ Upload funguje
- ✅ Obrázky se zobrazují uživatelům
- ✅ Perzistentní úložiště (nepřijdete o obrázky)
- ✅ Oddělené správy zachovány

### Další kroky:
1. Můžete migrovat existující obrázky: `npx tsx scripts/migrate-images-to-supabase.ts`
2. Můžete smazat `/public/images/uploads/` (už není potřeba)
3. Aktualizujte URL v admin panelu pro produkty (pokud je to potřeba)

---

**📋 Checklist dokončen: ______ / ______**

**🚀 Připraveno k nasazení!**

