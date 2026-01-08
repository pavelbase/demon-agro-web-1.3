# ✅ Implementace Supabase synchronizace pro veřejnou část

## 📋 PŘEHLED ZMĚN

Produkty, články a obsah stránek veřejné části byly přesunuty z lokálního `localStorage` do **Supabase databáze** se zachováním rychlého cache v `localStorage`.

### ✨ Výhody:
- ✅ **Sdílení mezi uživateli** - všichni vidí stejná data
- ✅ **Perzistence** - data přežijí vymazání cache
- ✅ **Rychlý přístup** - localStorage jako cache
- ✅ **Automatická synchronizace** - při načtení stránky
- ✅ **Stejný pattern** jako již fungující obrázky

---

## 🗄️ NOVÉ DATABÁZOVÉ TABULKY

### 1. `public_products`
Produkty zobrazené na veřejné části (pH, síra, draslík, hořčík, analýza)

```sql
- id (uuid)
- product_id (text, unique) - např. "ph-1", "sira-2"
- product_data (jsonb) - kompletní data produktu
- category (text) - kategorie produktu
- is_available (boolean)
- display_order (integer)
- created_at, updated_at
```

### 2. `public_articles`
Vzdělávací články v sekci Vzdělávání

```sql
- id (uuid)
- article_id (text, unique)
- article_data (jsonb) - kompletní data článku
- category (text)
- is_published (boolean)
- slug (text, unique)
- published_date (timestamptz)
- created_at, updated_at
```

### 3. `public_content`
Textový obsah jednotlivých stránek (hero texty, popisy, atd.)

```sql
- id (uuid)
- page_key (text, unique) - např. "home", "ph", "sira"
- content_data (jsonb) - kompletní obsah stránky
- page_title (text)
- created_at, updated_at
```

---

## 🚀 POSTUP NASAZENÍ

### **KROK 1: Spustit SQL skripty v Supabase**

Přejděte do Supabase SQL Editor a spusťte tyto skripty v tomto pořadí:

1. **`lib/supabase/sql/create_public_products_table.sql`**
2. **`lib/supabase/sql/create_public_articles_table.sql`**
3. **`lib/supabase/sql/create_public_content_table.sql`**

```sql
-- Zkontrolujte, že tabulky byly vytvořeny:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('public_products', 'public_articles', 'public_content');
```

---

### **KROK 2: Migrace stávajících dat**

Data z `localStorage` se **automaticky migrují** do Supabase při prvním přístupu.

**Jak to funguje:**
1. Uživatel navštíví web
2. `ImageSyncProvider` se spustí
3. Pokud je Supabase prázdná → migruje data z localStorage
4. Pokud Supabase obsahuje data → načte je do localStorage

**Pro rychlejší migraci můžete:**
- Přihlásit se do `/admin` panelu
- Systém automaticky synchronizuje všechna data

---

### **KROK 3: Ověření migrace**

V Supabase SQL Editoru spusťte:

```sql
-- Zkontrolovat počet produktů
SELECT category, COUNT(*) 
FROM public_products 
GROUP BY category;

-- Zkontrolovat počet článků
SELECT category, COUNT(*), 
  SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published
FROM public_articles 
GROUP BY category;

-- Zkontrolovat počet stránek s obsahem
SELECT COUNT(*) 
FROM public_content;
```

**Očekávané výsledky:**
- `public_products`: cca 15-20 produktů (5 kategorií)
- `public_articles`: cca 5-10 článků
- `public_content`: 9 stránek

---

## 🔧 TECHNICKÉ DETAILY

### **Nové moduly**

#### 1. `lib/products-sync.ts`
```typescript
syncProductsFromSupabase()      // Načte produkty ze Supabase
saveProductWithSync(product)    // Uloží produkt
deleteProductWithSync(id)       // Smaže produkt
saveAllProductsWithSync(array)  // Uloží všechny produkty
```

#### 2. `lib/articles-sync.ts`
```typescript
syncArticlesFromSupabase()      // Načte články ze Supabase
saveArticleWithSync(article)    // Uloží článek
deleteArticleWithSync(id)       // Smaže článek
saveAllArticlesWithSync(array)  // Uloží všechny články
```

#### 3. `lib/content-sync.ts`
```typescript
syncContentFromSupabase()           // Načte obsah ze Supabase
savePageContentWithSync(key, data)  // Uloží obsah stránky
```

### **API Endpointy**

- **`/api/public-products`** - CRUD operace s produkty
- **`/api/public-articles`** - CRUD operace s články
- **`/api/public-content`** - CRUD operace s obsahem

Všechny endpointy podporují:
- `GET` - Načtení dat (všechna nebo jedno podle ID)
- `POST` - Uložení/aktualizace (upsert)
- `DELETE` - Smazání

---

## 📝 UPRAVENÉ SOUBORY

### **Veřejná administrace**
- ✅ `app/(public)/admin/page.tsx` - Použití sync funkcí místo přímého localStorage
- ✅ `components/ImageSyncProvider.tsx` - Přidána synchronizace produktů, článků a obsahu

### **Nové soubory**
- ✅ `lib/products-sync.ts`
- ✅ `lib/articles-sync.ts`
- ✅ `lib/content-sync.ts`
- ✅ `app/api/public-products/route.ts`
- ✅ `app/api/public-articles/route.ts`
- ✅ `app/api/public-content/route.ts`
- ✅ `lib/supabase/sql/create_public_products_table.sql`
- ✅ `lib/supabase/sql/create_public_articles_table.sql`
- ✅ `lib/supabase/sql/create_public_content_table.sql`

---

## ⚠️ CO SE NEZMĚNILO

- ✅ **Obrázky** - Zůstávají beze změny (už fungovaly správně)
- ✅ **Portálová administrace** - `/portal/admin` zůstává oddělená
- ✅ **Autentizace** - Veřejná admin stále používá heslo "demonagro2024"
- ✅ **Uživatelské rozhraní** - Admin panel vypadá stejně
- ✅ **localStorage** - Stále se používá jako rychlá cache

---

## 🧪 TESTOVÁNÍ

### **Test 1: Inkognito režim**
1. Otevřít web v **inkognito** okně
2. Ověřit, že produkty se zobrazují na stránkách (pH, síra, atd.)
3. Ověřit, že články se zobrazují ve Vzdělávání
4. ✅ **Výsledek**: Data viditelná i bez localStorage

### **Test 2: Správa v admin panelu**
1. Přihlásit se do `/admin`
2. Upravit produkt → Uložit
3. Otevřít v inkognito → Ověřit změnu
4. ✅ **Výsledek**: Změny viditelné všem uživatelům

### **Test 3: Články**
1. V admin panelu vytvořit nový článek
2. Publikovat ho
3. Zkontrolovat na `/vzdelavani`
4. Otevřít v inkognito → Ověřit viditelnost
5. ✅ **Výsledek**: Článek viditelný všem

### **Test 4: Obsah stránek**
1. V admin panelu změnit text na homepage
2. Načíst homepage v inkognito
3. ✅ **Výsledek**: Nový text viditelný

---

## 🐛 TROUBLESHOOTING

### **Problém: Produkty se nezobrazují**
```bash
# Zkontrolovat API endpoint
curl http://localhost:3000/api/public-products

# Zkontrolovat Supabase tabulku
# V SQL Editoru:
SELECT COUNT(*) FROM public_products;
```

### **Problém: Články se neukládají**
```bash
# Zkontrolovat console v prohlížeči
# Mělo by být: "✅ Article saved to Supabase"

# Zkontrolovat tabulku:
SELECT * FROM public_articles ORDER BY updated_at DESC LIMIT 5;
```

### **Problém: Migrace z localStorage selhala**
```sql
-- Ručně smazat vše a znovu migrovat:
DELETE FROM public_products;
DELETE FROM public_articles;
DELETE FROM public_content;

-- Pak obnovit stránku a počkat na migraci
```

---

## 📊 MONITOROVÁNÍ

### **SQL dotazy pro kontrolu**

```sql
-- Poslední upravené produkty
SELECT product_id, category, updated_at 
FROM public_products 
ORDER BY updated_at DESC 
LIMIT 10;

-- Publikované články
SELECT article_id, 
  article_data->>'nadpis' as title,
  published_date
FROM public_articles 
WHERE is_published = true
ORDER BY published_date DESC;

-- Stránky s obsahem
SELECT page_key, page_title, updated_at 
FROM public_content 
ORDER BY updated_at DESC;
```

---

## ✅ CHECKLIST NASAZENÍ

- [ ] SQL skripty spuštěny v Supabase
- [ ] Tabulky vytvořeny (3x)
- [ ] První návštěva webu → Migrace dat
- [ ] Test v inkognito → Produkty viditelné
- [ ] Test admin panel → Změny se ukládají
- [ ] Test články → Publikace funguje
- [ ] Console čistý, bez chyb
- [ ] Supabase obsahuje data

---

## 🎉 HOTOVO!

Po dokončení všech kroků bude systém plně funkční:
- ✅ Produkty sdílené mezi uživateli
- ✅ Články perzistentní v databázi
- ✅ Obsah stránek centrálně spravovaný
- ✅ Rychlý přístup přes localStorage cache
- ✅ Automatická synchronizace

