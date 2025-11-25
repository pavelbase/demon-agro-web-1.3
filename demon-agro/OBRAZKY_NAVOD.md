# 📸 Návod na nahrávání vlastních obrázků

## Metoda 1: Upload v Admin panelu (Doporučeno) ⭐

### Krok za krokem:

1. **Otevřete admin panel:**
   ```
   http://localhost:3000/admin
   Heslo: demonagro2024
   ```

2. **Přejděte na záložku "Správa obrázků"**

3. **Klikněte na "Změnit URL" u obrázku, který chcete nahradit**

4. **Nahrajte soubor:**
   - **Přetáhněte** obrázek do vyznačené oblasti
   - **nebo klikněte** na "Vybrat soubor" a vyberte z počítače

5. **Obrázek se automaticky nahraje a uloží!** ✅

### Podporované formáty:
- JPG / JPEG
- PNG
- WebP
- GIF

### Maximální velikost: 5 MB

### Kam se ukládají:
Obrázky se ukládají do: `/public/images/uploads/`

---

## Metoda 2: Manuální nahrání (Rychlé)

### Pro jednotlivé obrázky:

1. **Zkopírujte své fotky do složky:**
   ```
   demon-agro/public/images/
   ```

2. **Struktura složek:**
   ```
   public/
   └── images/
       ├── home-hero.jpg           ← hero obrázek domů
       ├── ph-hero.jpg             ← hero pH stránka
       ├── pole-traktor.jpg        ← vlastní fotka
       ├── zemedelec.jpg           ← vlastní fotka
       └── products/
           ├── vapenec.jpg         ← produkt
           ├── dolomit.jpg         ← produkt
           └── ...
   ```

3. **V admin panelu zadejte cestu:**
   - Pro obrázky v `/public/images/`: `/images/nazev.jpg`
   - Pro produkty: `/images/products/nazev.jpg`

### Příklady cest:
```
/images/home-hero.jpg
/images/pole-traktor.jpg
/images/products/vapenec.jpg
```

---

## Tipy pro optimální výsledky

### ✅ Doporučené rozměry:

**Hero obrázky (pozadí sekce):**
- Rozměr: 1920×1080 px (Full HD)
- Poměr: 16:9
- Formát: JPG (komprimované)
- Kvalita: 80-90%

**Sekční obrázky:**
- Rozměr: 800×600 px
- Poměr: 4:3 nebo 16:9
- Formát: JPG nebo PNG

**Produktové fotky:**
- Rozměr: 800×800 px (čtverec)
- Poměr: 1:1 nebo 4:3
- Formát: JPG nebo PNG
- Bílé pozadí ideální

**Logo:**
- Rozměr: 200×200 px minimum
- Formát: PNG (průhledné pozadí)
- Vyšší rozlišení lepší

### 🎨 Optimalizace obrázků

**Online nástroje (zdarma):**
- [TinyPNG](https://tinypng.com/) - komprese PNG/JPG
- [Squoosh](https://squoosh.app/) - Google tool
- [ImageOptim](https://imageoptim.com/) - Mac aplikace

**Tipy:**
- Komprimujte před nahráním
- Použijte WebP formát pro menší velikost
- Vyhněte se obrázkům > 5 MB
- Ořízněte nepotřebné části

---

## Názvy souborů

### ✅ Doporučené:
```
pole-orba.jpg
traktor-vuno.jpg
vapenec-produkt.jpg
zemedelec-poradenstvi.jpg
```

### ❌ Vyhněte se:
```
DSC_0124.jpg          (nečitelné)
fotka (1).jpg         (mezery)
čištění_půdy.jpg      (diakritika)
```

**Pravidla:**
- Používejte malá písmena
- Bez mezer (použijte pomlčky)
- Bez diakritiky (ě → e, č → c)
- Popisné názvy

---

## Příklady použití

### 1. Změna hero obrázku na domovské stránce:

**Admin panel:**
1. Správa obrázků → najděte "home_hero"
2. Změnit URL → nahrajte obrázek pole při západu slunce
3. Automaticky se změní na webu!

**Manuálně:**
1. Zkopírujte `moje-pole.jpg` do `/public/images/`
2. Admin panel → Správa obrázků → home_hero
3. Změnit URL → zadejte `/images/moje-pole.jpg`
4. Uložit

### 2. Přidání produktové fotky:

**Admin panel:**
1. Produkty → Upravit produkt
2. URL fotky → klikněte na upload
3. Nahrajte fotku produktu
4. Uložit

**Manuálně:**
1. Zkopírujte fotku do `/public/images/products/`
2. Produkt → URL fotky: `/images/products/nazev.jpg`

### 3. Fotka do sekce "O nás":

**Admin panel:**
1. Správa obrázků → onas_kdo_jsme_img
2. Změnit URL → nahrajte týmovou fotku
3. Hotovo!

---

## Řešení problémů

### ❌ Obrázek se nezobrazuje

**Zkontrolujte:**
1. ✅ Je cesta správně: `/images/nazev.jpg` (začíná lomítkem)
2. ✅ Soubor je ve složce `/public/images/`
3. ✅ Název souboru se shoduje (včetně přípony)
4. ✅ Žádné mezery nebo diakritika v názvu

### ❌ Upload nefunguje

**Řešení:**
1. Zkontrolujte velikost (max 5 MB)
2. Zkontrolujte formát (JPG, PNG, WebP, GIF)
3. Restartujte dev server
4. Zkuste manuální metodu

### ❌ Obrázek je rozmazaný

**Řešení:**
1. Použijte vyšší rozlišení
2. Pro hero: minimálně 1920×1080 px
3. Nekomprimujte příliš (kvalita > 80%)

### ❌ Obrázek je příliš velký (MB)

**Řešení:**
1. Komprimujte na [TinyPNG.com](https://tinypng.com/)
2. Zmenšete rozměry
3. Použijte WebP formát
4. Snižte kvalitu na 80-85%

---

## Hromadné nahrání

### Pro více obrázků najednou:

1. **Zkopírujte všechny obrázky:**
   ```
   Váš počítač → demon-agro/public/images/
   ```

2. **Organizujte do složek:**
   ```
   images/
   ├── hero/
   │   ├── home.jpg
   │   ├── ph.jpg
   │   └── ...
   ├── sections/
   │   ├── problem1.jpg
   │   └── ...
   └── products/
       ├── product1.jpg
       └── ...
   ```

3. **V admin panelu aktualizujte cesty:**
   - `/images/hero/home.jpg`
   - `/images/sections/problem1.jpg`
   - `/images/products/product1.jpg`

---

## Git a verzování

### Chcete verzovat obrázky?

**ANO - commitujte všechny obrázky:**
```bash
# V .gitignore zakomentujte tyto řádky:
# /public/images/uploads/*
# !/public/images/uploads/.gitkeep
```

**NE - ignorujte nahrané obrázky:**
```bash
# V .gitignore odkomentujte:
/public/images/uploads/*
!/public/images/uploads/.gitkeep
```

### Doporučení:
- ✅ Verzujte logo a důležité obrázky
- ❌ Ignorujte velké / testovací obrázky
- ✅ Komprimujte před commitem

---

## Produkční nasazení

### Vercel / Netlify

**Statické obrázky (v /public/):**
- ✅ Automaticky se nahrají s projektem
- ✅ Fungují okamžitě

**Nahrané obrázky (přes admin panel):**
- ⚠️ Ztratí se při každém redeploy!
- 💡 Řešení: Použijte cloud storage

### Cloud storage pro produkci:

**Doporučené služby:**

1. **Cloudinary** (nejjednodušší)
   - 25 GB storage zdarma
   - Automatická optimalizace
   - [cloudinary.com](https://cloudinary.com)

2. **AWS S3** (nejpoužívanější)
   - Levné, škálovatelné
   - Potřebuje nastavení
   - [aws.amazon.com/s3](https://aws.amazon.com/s3)

3. **Vercel Blob Storage**
   - Integrované s Vercel
   - [vercel.com/storage](https://vercel.com/storage)

4. **ImageKit.io**
   - 20 GB zdarma
   - CDN + optimalizace
   - [imagekit.io](https://imagekit.io)

### Návod na integraci (později):
- Přidá se v `app/api/upload/route.ts`
- Upload místo do `/public/` půjde do cloudu
- Admin panel zůstane stejný

---

## Checklist před nasazením

### ✅ Příprava obrázků:

- [ ] Všechny obrázky komprimované (< 500 KB ideálně)
- [ ] Hero obrázky 1920×1080 px
- [ ] Produkty mají fotky
- [ ] Logo nahráno a viditelné
- [ ] Žádné obrázky > 5 MB
- [ ] Názvy bez mezer a diakritiky
- [ ] Všechny cesty začínají `/images/`

### ✅ Testování:

- [ ] Všechny stránky načítají obrázky
- [ ] Hero sekce vypadají dobře
- [ ] Produkty mají správné fotky
- [ ] Mobile verze funguje
- [ ] Žádné chybějící obrázky (404)

---

## Kontakt

Potřebujete pomoc?
- 📧 Email: base@demonagro.cz
- 📞 Telefon: +420 731 734 907

---

**Hotovo! Teď můžete používat vlastní fotografie na vašem webu! 🎉**
