# 🚀 Rychlý Start - Supabase Synchronizace

## ⚡ 3 KROKY K PLNÉ FUNKČNOSTI

### 1️⃣ Spustit SQL Setup (2 minuty)

**V Supabase SQL Editoru:**

```sql
-- Zkopírovat a spustit celý soubor:
lib/supabase/sql/SETUP_PUBLIC_SYNC.sql
```

**Nebo jednotlivě:**
1. `lib/supabase/sql/create_public_products_table.sql`
2. `lib/supabase/sql/create_public_articles_table.sql`
3. `lib/supabase/sql/create_public_content_table.sql`

---

### 2️⃣ Spustit Aplikaci

```bash
npm run dev
```

Otevřít: `http://localhost:3000`

---

### 3️⃣ Automatická Migrace

**Varianta A: Automaticky**
- Navštivte jakoukoliv stránku webu
- Data se automaticky migrují z localStorage do Supabase

**Varianta B: Přes Admin Panel**
- Přejděte na: `http://localhost:3000/admin`
- Heslo: `demonagro2024`
- Data se synchronizují při přihlášení

---

## ✅ Ověření

**V Supabase SQL Editoru:**

```sql
-- Spustit test:
\i lib/supabase/sql/TEST_PUBLIC_SYNC.sql

-- Nebo rychlý check:
SELECT 
  (SELECT COUNT(*) FROM public_products) as products,
  (SELECT COUNT(*) FROM public_articles) as articles,
  (SELECT COUNT(*) FROM public_content) as pages;
```

**Očekávaný výsledek:**
- Products: 15-20
- Articles: 5-10
- Pages: 9

---

## 🎉 Hotovo!

Nyní:
- ✅ Produkty sdílené mezi všemi uživateli
- ✅ Články perzistentní v databázi
- ✅ Obsah centrálně spravovaný
- ✅ Automatická synchronizace

---

## 🐛 Řešení problémů

### Data nejsou v Supabase?
```bash
# 1. Otevřít console v prohlížeči (F12)
# 2. Měli byste vidět:
#    "✅ Products synced from Supabase: X"
#    "✅ Articles synced from Supabase: X"
#    "✅ Content synced from Supabase: X pages"

# 3. Pokud ne, zkontrolovat:
#    - Supabase URL a API klíče v .env.local
#    - SQL skripty byly spuštěny
#    - Tabulky existují
```

### API endpointy nefungují?
```bash
# Test endpointu:
curl http://localhost:3000/api/public-products
curl http://localhost:3000/api/public-articles
curl http://localhost:3000/api/public-content

# Mělo by vrátit JSON s daty
```

### Migrace selhala?
```sql
-- Smazat vše a zkusit znovu:
DELETE FROM public_products;
DELETE FROM public_articles;
DELETE FROM public_content;

-- Pak obnovit stránku a počkat
```

---

## 📚 Další informace

Detailní dokumentace: `IMPLEMENTACE_SUPABASE_SYNC.md`

