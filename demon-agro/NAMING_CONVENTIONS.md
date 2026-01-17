# 📐 NAMING CONVENTIONS - Demon Agro

**Verze:** 1.0  
**Datum:** 2026-01-03  
**Status:** ✅ DEFINITIVNÍ

---

## 🎯 Účel

Tento dokument definuje **jednotné pojmenování** všech entit v projektu Demon Agro.  
Dodržování těchto konvencí je **POVINNÉ** pro všechny nové soubory a změny.

---

## 📊 Databázové tabulky

### ✅ SPRÁVNÉ pojmenování

| Tabulka | Správný název | Poznámka |
|---------|---------------|----------|
| **Produkty vápnění** | `liming_products` | ❌ NE `lime_products` |
| **Plány vápnění** | `liming_plans` | ✓ |
| **Aplikace vápnění** | `liming_applications` | ✓ |
| **Poptávky vápnění** | `liming_requests` | ✓ |
| **Položky poptávek** | `liming_request_items` | ✓ |

### ❌ ZASTARALÉ názvy (NEPOUŽÍVAT!)

- `lime_products` → změnit na `liming_products`
- `lime_plans` → změnit na `liming_plans`

---

## 🗂️ Názvy sloupců

### Primary keys a foreign keys

```sql
-- ✅ SPRÁVNĚ
CREATE TABLE liming_applications (
  id UUID PRIMARY KEY,
  liming_plan_id UUID REFERENCES liming_plans(id),
  lime_product_id UUID REFERENCES liming_products(id)  -- Sloupec může mít kratší název
);
```

**Pravidlo:**
- **Tabulka:** vždy `liming_*` (s "-ing")
- **Sloupec FK:** může být `lime_product_id` (bez "-ing") pro stručnost
- **Reference:** vždy na správný název tabulky `liming_products`

---

## 📁 SQL soubory

### Správná struktura názvů

```
lib/supabase/sql/
├── create_liming_products_complete.sql    ✅
├── create_liming_plans.sql                ✅
├── insert_liming_products.sql             ✅ (OPRAVENO z insert_lime_products.sql)
├── add_moisture_particles_to_liming_products.sql  ✅
└── fix_liming_applications_constraint.sql  ✅
```

### ❌ Zastaralé soubory

- `insert_lime_products.sql` → přejmenovat nebo opravit na `liming_products`
- `create_lime_products_table.sql` → NEPOUŽÍVAT, místo toho `create_liming_products_complete.sql`

---

## 💻 TypeScript / JavaScript

### Type definitions

```typescript
// ✅ SPRÁVNĚ - database.ts
export interface LimingProduct {
  id: string
  name: string
  cao_content: number
  mgo_content: number
  // ...
}

export interface LimingPlan {
  id: string
  parcel_id: string
  lime_product_id: string  // FK sloupec
  // ...
}
```

### Queries

```typescript
// ✅ SPRÁVNĚ
const { data: products } = await supabase
  .from('liming_products')  // Vždy "liming_products"
  .select('*')

// ❌ ŠPATNĚ
const { data: products } = await supabase
  .from('lime_products')  // NE!
  .select('*')
```

---

## 📋 Checklist pro nový kód

Před commitem **VŽDY** zkontroluj:

- [ ] Používám `liming_products` (ne `lime_products`)
- [ ] Všechny SQL soubory odkazují na správné tabulky
- [ ] Foreign key constrainty odkazují na `liming_products(id)`
- [ ] TypeScript typy používají `LimingProduct` (ne `LimeProduct`)
- [ ] API endpointy používají `.from('liming_products')`

---

## 🔧 Jak opravit existující kód

### 1. SQL soubory

```bash
# Najít všechny výskyty
grep -r "lime_products" lib/supabase/sql/

# Nahradit v konkrétním souboru
sed -i 's/lime_products/liming_products/g' file.sql
```

### 2. TypeScript soubory

```bash
# Najít v TS souborech (pozor na sloupce!)
grep -r "from('lime_products')" --include="*.ts" --include="*.tsx"
```

### 3. Databázové constrainty

```sql
-- Opravit foreign key
ALTER TABLE liming_applications 
DROP CONSTRAINT IF EXISTS liming_applications_lime_product_id_fkey;

ALTER TABLE liming_applications
ADD CONSTRAINT liming_applications_liming_product_id_fkey
FOREIGN KEY (lime_product_id) 
REFERENCES liming_products(id) 
ON DELETE SET NULL;
```

---

## 🚨 Časté chyby

### Chyba 1: Foreign key constraint violation

```
ERROR: insert or update on table "liming_applications" 
violates foreign key constraint "liming_applications_lime_product_id_fkey"
DETAIL: Key is not present in table "lime_products".
```

**Příčina:** Constraint odkazuje na neexistující tabulku `lime_products`  
**Řešení:** Spustit `fix_liming_applications_constraint.sql`

### Chyba 2: Table does not exist

```
ERROR: relation "lime_products" does not exist
```

**Příčina:** Používá se zastaralý název `lime_products`  
**Řešení:** Změnit na `liming_products`

---

## ✅ Aplikováno

- [x] `insert_lime_products.sql` → opraveno na `liming_products`
- [x] `fix_liming_applications_constraint.sql` → vytvořen
- [x] Všechny TypeScript soubory používají správné názvy
- [x] API endpointy používají `liming_products`

---

## 📚 Reference

- PostgreSQL Foreign Keys: https://www.postgresql.org/docs/current/ddl-constraints.html
- Supabase Naming Conventions: https://supabase.com/docs/guides/database/tables#naming-conventions

---

**Udržujte tento dokument aktuální!**  
Pokud přidáte novou tabulku nebo entitu, přidejte ji sem.




