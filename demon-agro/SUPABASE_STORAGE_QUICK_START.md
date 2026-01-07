# 🚀 Quick Start - Supabase Storage pro veřejné obrázky

## ⚡ 3 kroky k funkčnímu řešení

### KROK 1: Vytvoření bucketu (2 minuty)

**V Supabase Dashboard:**

1. Otevřete: **SQL Editor**
2. Zkopírujte a spusťte SQL skript:
   ```
   demon-agro/lib/supabase/sql/create_public_images_bucket.sql
   ```
3. Ověřte: **Storage** → bucket `public-images` existuje ✅

**Nebo ručně:**
- Storage → New bucket
- Name: `public-images`
- Public bucket: ✅ YES
- File size limit: 5 MB

---

### KROK 2: Test uploadu (2 minuty)

1. **Spusťte aplikaci:**
   ```bash
   npm run dev
   ```

2. **Otevřete admin panel:**
   - URL: `http://localhost:3000/admin`
   - Heslo: `demonagro2024`

3. **Nahrajte testovací obrázek:**
   - Záložka: **Správa obrázků**
   - Vyberte libovolný obrázek → **Změnit URL**
   - Nahrajte testovací JPG/PNG (< 5 MB)

4. **Ověřte:**
   - ✅ Upload úspěšný
   - ✅ URL začíná: `https://...supabase.co/storage/...`
   - ✅ Obrázek se zobrazí v náhledu

---

### KROK 3: Test zobrazení uživatelům (1 minuta)

1. **Otevřete web v inkognito režimu**
2. **Přejděte na stránku s nahraným obrázkem**
3. **Ověřte:** Obrázek se zobrazí správně ✅

---

## ✅ Hotovo!

Vaše obrázky jsou nyní:
- ✅ **Perzistentní** - nepřijdete o ně při redeploy
- ✅ **Veřejně přístupné** - zobrazí se všem uživatelům
- ✅ **V cloudu** - Supabase Storage
- ✅ **Bezplatné** - Free Tier (1 GB)

---

## 📚 Další dokumentace

- **Detailní návod:** `SUPABASE_STORAGE_IMPLEMENTATION.md`
- **Testovací checklist:** `TESTING_CHECKLIST_SUPABASE_STORAGE.md`
- **Migrace existujících obrázků:** `scripts/README.md`
- **Uživatelský návod:** `OBRAZKY_NAVOD.md` (aktualizováno)

---

## 🐛 Problém?

### Upload selže - "Bucket not found"
→ Vytvořte bucket ručně v Supabase Dashboard → Storage

### Obrázek se nezobrazí (404)
→ Zkontrolujte, zda je bucket **Public** (✅ YES)

### Funguje lokálně, ne na produkci
→ Zkontrolujte environment variables na Vercel/Netlify:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔄 Migrace existujících obrázků

Pokud máte obrázky v `/public/images/uploads/`:

```bash
npx tsx scripts/migrate-images-to-supabase.ts
```

---

## 📞 Potřebujete pomoc?

- 📧 Email: base@demonagro.cz
- 📞 Telefon: +420 731 734 907

---

**🎉 Připraveno k použití!**

