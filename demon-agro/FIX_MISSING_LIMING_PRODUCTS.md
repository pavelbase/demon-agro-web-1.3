# 🚨 ŘEŠENÍ: Chybějící produkty v liming_products

## Aktuální chyba

```
ERROR: insert or update on table "liming_applications" violates foreign key constraint
Key (lime_product_id)=(5e85bd74-cf2b-4ff7-84a5-3a301151a5f9) is not present in table "liming_products".
```

## Příčina

Tabulka `liming_products` je buď:
1. **Prázdná** (0 produktů)
2. **Nebo** neobsahuje konkrétní produkt, který se pokouší aplikace použít

## ✅ ŘEŠENÍ (2 kroky)

### Krok 1: Diagnostika (Supabase SQL Editor)

Spusťte tento SQL a podívejte se na výsledek:

```sql
-- Zjistit počet produktů
SELECT COUNT(*) AS total_products FROM liming_products;

-- Zobrazit všechny produkty
SELECT id, name, cao_content, mgo_content, is_active
FROM liming_products
ORDER BY display_order;
```

### Krok 2A: Pokud je tabulka PRÁZDNÁ (count = 0)

**Tabulka existuje, ale nemá data.**

Spusťte jeden z těchto SQL:

#### Varianta 1: Rychlé naplnění (DOPORUČENO)

```sql
-- Kompletní vytvoření včetně dat (DROP + CREATE + INSERT)
-- POZOR: Toto SMAŽE existující data!
```
📁 Spusťte soubor: **`create_liming_products_complete.sql`**

#### Varianta 2: Jen vložení dat (pokud tabulka už existuje)

📁 Spusťte soubor: **`insert_liming_products.sql`**

### Krok 2B: Pokud tabulka NEEXISTUJE

```sql
-- Zkontrolovat existenci tabulky
SELECT EXISTS (
  SELECT FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'liming_products'
);
```

Pokud vrátí `false`, spusťte:
📁 **`create_liming_products_complete.sql`** (vytvoří tabulku + vloží data)

### Krok 2C: Pokud tabulka má produkty, ale chybí konkrétní UUID

To by znamenalo problém v kódu. Kontaktujte vývojáře.

---

## 📋 Rychlý checklist

Otevřete Supabase Dashboard → SQL Editor a postupně:

- [ ] Krok 1: Spustit diagnostiku (SELECT COUNT...)
- [ ] Krok 2: Na základě výsledku spustit příslušný SQL soubor
- [ ] Krok 3: Zkusit znovu vytvořit plán vápnění

---

## 📁 Které SQL soubory spustit (v pořadí)

### Scénář A: Úplně od začátku (nejbezpečnější)

```sql
1. create_liming_products_complete.sql   -- Tabulka + data (6 produktů)
2. create_liming_plans.sql               -- Tabulky pro plány
3. (zkuste vytvořit plán v UI)
```

### Scénář B: Tabulka už existuje, jen chybí data

```sql
1. insert_liming_products.sql            -- Jen data (6 produktů)
2. (zkuste vytvořit plán v UI)
```

---

## 🔍 Ověření úspěchu

Po spuštění SQL byste měli vidět:

```sql
SELECT COUNT(*) FROM liming_products;
-- Mělo by vrátit: 6 (nebo více)

SELECT name FROM liming_products WHERE is_active = true;
-- Mělo by vrátit seznam produktů:
--   - Vápenec mletý
--   - Dolomit mletý
--   - Vápenec granulovaný
--   - Dolomit granulovaný
--   - Křídovec
--   - Pálené vápno
```

---

## 🎯 Po opravě

1. Vraťte se do portálu
2. Otevřete detail pozemku
3. Přejděte na "Plán vápnění"
4. Klikněte "Generovat plán"
5. **Mělo by fungovat!** ✅

---

**Pokud problém přetrvává, pošlete screenshot výsledku diagnostického SQL.**


