# 🔧 Oprava kategorií článků - Rychlý návod

## 🔍 PROBLÉM

Console ukazuje:
```
✅ Products synced from Supabase: 13
✅ Images synced from Supabase: 15
❌ Articles synced from Supabase: 1    ← POUZE 1 článek!
✅ Content synced from Supabase: 8 pages
```

**Důvod:** SQL constraint v tabulce `public_articles` má jiné kategorie než UI aplikace.

---

## ⚡ RYCHLÁ OPRAVA (3 kroky)

### **1️⃣ Spustit SQL opravu v Supabase**

Otevřít **Supabase SQL Editor** a spustit:

```sql
-- Zkopírovat celý soubor:
lib/supabase/sql/fix_public_articles_categories.sql
```

**Nebo přímo:**

```sql
-- Odstranit starý constraint
ALTER TABLE public.public_articles 
DROP CONSTRAINT IF EXISTS public_articles_category_check;

-- Přidat nový constraint
ALTER TABLE public.public_articles
ADD CONSTRAINT public_articles_category_check 
CHECK (category IN ('ph', 'vapneni', 'ziviny', 'vyzkumy', 'tipy'));
```

**Očekávaný výsledek:**
```
✅ Constraint úspěšně aktualizován!
   Povolené kategorie: ph, vapneni, ziviny, vyzkumy, tipy
```

---

### **2️⃣ Smazat stávající článek (volitelné, ale doporučené)**

V **Supabase SQL Editoru**:

```sql
DELETE FROM public.public_articles;
```

Proč? Protože v tabulce je pouze 1 článek a chceš nově migrovat všechny.

---

### **3️⃣ Obnovit stránku v prohlížeči**

1. Otevřít web: `http://localhost:3000`
2. Stisknout **F5** (obnovit)
3. Otevřít Console (F12)
4. Mělo by být:

```
✅ Articles synced from Supabase: X  ← Všechny články!
```

---

## ✅ OVĚŘENÍ

### **Test 1: Zkontrolovat Console**
```
✅ Products synced from Supabase: 13
✅ Images synced from Supabase: 15
✅ Articles synced from Supabase: 5+   ← VŠECHNY články!
✅ Content synced from Supabase: 8 pages
```

### **Test 2: Zkontrolovat v Supabase**
```sql
SELECT category, COUNT(*) 
FROM public.public_articles 
GROUP BY category;
```

**Očekávaný výsledek:**
```
category  | count
----------|------
ph        | X
vapneni   | X
ziviny    | X
vyzkumy   | X
tipy      | X
```

### **Test 3: Inkognito režim**
1. Otevřít **Inkognito okno**
2. Přejít na: `http://localhost:3000/vzdelavani`
3. **Všechny články** by měly být viditelné ✅

---

## 📊 CO SE ZMĚNILO

### ❌ PŘED (Starý constraint):
```sql
CHECK (category IN (
  'ziviny',       -- ✅ Funguje
  'metodiky',     -- ❌ Nepoužívá se v UI
  'technologie',  -- ❌ Nepoužívá se v UI
  'ekonomika',    -- ❌ Nepoužívá se v UI
  'legislativa'   -- ❌ Nepoužívá se v UI
))
```

**Důsledek:**
- Články s kategorií "ph", "vapneni", "vyzkumy", "tipy" → **ODMÍTNUTY**
- Pouze články s kategorií "ziviny" → **ULOŽENY**

### ✅ PO (Nový constraint):
```sql
CHECK (category IN (
  'ph',           -- ✅ Povoleno
  'vapneni',      -- ✅ Povoleno
  'ziviny',       -- ✅ Povoleno
  'vyzkumy',      -- ✅ Povoleno
  'tipy'          -- ✅ Povoleno
))
```

**Výsledek:**
- **VŠECHNY** kategorie jsou povoleny ✅
- **VŠECHNY** články se uloží do Supabase ✅
- **VŠECHNY** články viditelné v inkognito ✅

---

## 🐛 TROUBLESHOOTING

### **Problém: Stále jen 1 článek**
```sql
-- Zkontrolovat constraint:
SELECT 
  conname,
  pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'public_articles_category_check';

-- Mělo by být:
-- CHECK (category = ANY (ARRAY['ph'::text, 'vapneni'::text, 'ziviny'::text, 'vyzkumy'::text, 'tipy'::text]))
```

### **Problém: Console chyby**
Zkontrolovat v Console (F12), jestli nejsou chyby typu:
```
Error saving article: constraint violation
```

Pokud ano → Constraint nebyl správně aktualizován, opakovat krok 1.

### **Problém: Články zmizely**
```sql
-- Obnovit defaultní článek:
-- V prohlížeči obnovit stránku (F5)
-- Automaticky se vytvoří z defaultArticles
```

---

## 📝 ALTERNATIVNÍ ŘEŠENÍ

Pokud nechceš smazat stávající článek:

```sql
-- 1. Aktualizovat constraint (stejně jako výše)
ALTER TABLE public.public_articles 
DROP CONSTRAINT IF EXISTS public_articles_category_check;

ALTER TABLE public.public_articles
ADD CONSTRAINT public_articles_category_check 
CHECK (category IN ('ph', 'vapneni', 'ziviny', 'vyzkumy', 'tipy'));

-- 2. Přihlásit se do /admin
-- 3. Ručně přidat nové články
-- Nyní se budou ukládat správně
```

---

## ✅ HOTOVO!

Po provedení těchto kroků:
- ✅ Všechny kategorie článků fungují
- ✅ Články se ukládají do Supabase
- ✅ Články viditelné v inkognito režimu
- ✅ Synchronizace funguje správně

---

**Datum opravy:** 2025-01-08  
**Vytvořené soubory:**
- `lib/supabase/sql/fix_public_articles_categories.sql` (Migrace)
- `lib/supabase/sql/create_public_articles_table_v2.sql` (Opravená verze)
- `FIX_ARTICLES_CATEGORIES.md` (Tento návod)


