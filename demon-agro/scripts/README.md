# Scripts

Pomocné skripty pro správu projektu.

## 📦 Migrace obrázků do Supabase

### `migrate-images-to-supabase.ts`

Migruje existující obrázky z `/public/images/` do Supabase Storage.

**Před spuštěním:**
1. Vytvořte bucket v Supabase pomocí SQL skriptu:
   ```bash
   # Spusťte v Supabase SQL Editor
   lib/supabase/sql/create_public_images_bucket.sql
   ```

2. Ujistěte se, že máte v `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

**Spuštění:**
```bash
npx tsx scripts/migrate-images-to-supabase.ts
```

**Co skript dělá:**
- Najde všechny obrázky v `/public/images/`, `/public/images/products/`, `/public/images/uploads/`
- Nahraje je do Supabase Storage bucket `public-images`
- Vytvoří soubor `url-mapping.json` s mapováním starých URL → nových URL
- Zobrazí statistiky migrace

**Po migraci:**
1. Zkontrolujte nahrané obrázky v Supabase Dashboard → Storage → public-images
2. Otestujte upload nových obrázků přes `/admin`
3. Ověřte, že se obrázky zobrazují všem uživatelům
4. Můžete smazat `/public/images/uploads/` (už není potřeba)

---

## 📝 Instalace závislostí pro skripty

Pokud potřebujete `tsx` pro spuštění TypeScript skriptů:

```bash
npm install -D tsx
```

Nebo spusťte přímo:

```bash
npx tsx scripts/migrate-images-to-supabase.ts
```


