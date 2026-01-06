# 🚀 ŘEŠENÍ: Chyba "relation liming_products does not exist"

## ❌ Problém
```
Error: Failed to run sql query: 
ERROR: 42P01: relation "liming_products" does not exist
```

## ✅ Řešení

Tabulka `liming_products` v databázi ještě neexistuje. Musíš ji nejdřív vytvořit.

---

## 📝 SPRÁVNÝ POSTUP

### Varianta A: Úplně nová databáze (DOPORUČENO)

**Spusť tento jeden soubor:**
```
lib/supabase/sql/create_liming_products_complete.sql
```

✅ Tento soubor udělá VŠE najednou:
- Vytvoří tabulku `liming_products`
- Přidá všechny základní sloupce
- Přidá NOVÉ sloupce (vlhkost a částice)
- Vytvoří indexy
- Nastaví RLS policies
- Přidá 6 výchozích produktů
- Vytvoří triggery

---

### Varianta B: Databáze s existující tabulkou (pokud již existuje)

Pokud už máš tabulku `liming_products`, spusť POUZE:
```
lib/supabase/sql/add_moisture_particles_to_liming_products.sql
```

⚠️ **POZNÁMKA:** Toto použij jen pokud tabulka již existuje a chceš pouze přidat nové sloupce!

---

## 🔍 Jak zjistit, zda tabulka existuje?

Spusť v SQL Editoru:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'liming_products'
);
```

**Výsledek:**
- `true` → Tabulka existuje → Použij Variantu B
- `false` → Tabulka neexistuje → Použij Variantu A ✅

---

## 📋 Krok za krokem

### 1. Přihlaš se do Supabase
- Jdi na https://supabase.com
- Vyber svůj projekt

### 2. Otevři SQL Editor
- V levém menu klikni na **"SQL Editor"**
- Klikni **"New query"**

### 3. Zkopíruj a spusť SQL
- Otevři soubor: `lib/supabase/sql/create_liming_products_complete.sql`
- Zkopíruj celý obsah
- Vlož do SQL Editoru
- Klikni **"Run"** (nebo Ctrl+Enter)

### 4. Ověř úspěch
Měl bys vidět:
```
✅ Tabulka liming_products byla úspěšně vytvořena!
✅ Včetně nových sloupců: moisture_content, particles_over_1mm, ...
✅ Přidáno 6 výchozích produktů
```

A v tabulkách:
```
table_name       | table_type
-----------------+------------
liming_products | BASE TABLE

product_count
--------------
6
```

---

## 🎯 Po úspěšném vytvoření

Nyní můžeš:

1. ✅ **Přidat nové produkty** v admin rozhraní
2. ✅ **Vyplnit vlhkost a částice** u všech produktů
3. ✅ Použít referenční hodnoty z dokumentu `VAPNENI_PRODUKTY_REFERENCE.md`

### Příklad - Dolomit Štěpán
```
Název: Dolomit Štěpán
Typ: Dolomitický
CaO: 50.0%
MgO: 40.0%
Reaktivita: Střední
Vlhkost: 3.0%
Částice nad 1 mm: 18.0%
Částice pod 0.5 mm: 74.0%
```

### Příklad - Vápenec Vitošov
```
Název: Vápenec Vitošov jemně mletý
Typ: Kalcitický
CaO: 45.0%
MgO: 1.0%
Reaktivita: Vysoká
Vlhkost: 17.5%
Částice 0.09-0.5 mm: 90.0%
```

---

## 🔄 Pokud něco nevyšlo

### Problem: "DROP TABLE ... CASCADE" selhalo
**Důvod:** Tabulka má závislosti (foreign keys z jiných tabulek)

**Řešení 1 - Smazat závislé tabulky:**
```sql
DROP TABLE IF EXISTS public.liming_request_items CASCADE;
DROP TABLE IF EXISTS public.liming_requests CASCADE;
DROP TABLE IF EXISTS public.liming_products CASCADE;
```
Pak spusť `create_liming_products_complete.sql`

**Řešení 2 - Pouze přidat sloupce (pokud tabulka existuje):**
Spusť místo toho: `add_moisture_particles_to_liming_products.sql`

### Problem: "column already exists"
**Důvod:** Sloupce již byly přidány

**Řešení:** To je OK! SQL obsahuje `IF NOT EXISTS`, takže se nic nestane.

### Problem: RLS Policy error
**Důvod:** Policy s tímto jménem již existuje

**Řešení:** 
```sql
-- Smaž staré policies
DROP POLICY IF EXISTS "Veřejné čtení aktivních produktů" ON public.liming_products;
DROP POLICY IF EXISTS "Admin může upravovat produkty" ON public.liming_products;
```
Pak znovu spusť vytvoření.

---

## 📚 Související soubory

**SQL soubory:**
- ✅ `create_liming_products_complete.sql` - **POUŽIJ TENTO!**
- `create_liming_products_table.sql` - Starý soubor (bez vlhkosti a částic)
- `add_moisture_particles_to_liming_products.sql` - Pouze přidání sloupců

**Dokumentace:**
- `HOTOVO_VAPNENI_VLHKOST_CASTICE.md` - Hlavní dokumentace
- `VAPNENI_PRODUKTY_REFERENCE.md` - Referenční hodnoty z etiket
- `MIGRACE_VAPNENI_VLHKOST_CASTICE.md` - Technické detaily

---

## ✅ Checklist

- [ ] Spustil jsem `create_liming_products_complete.sql`
- [ ] Viděl jsem SUCCESS zprávy
- [ ] Tabulka existuje (ověřeno SELECT)
- [ ] Je tam 6 výchozích produktů
- [ ] Sloupce pro vlhkost a částice existují
- [ ] Admin rozhraní funguje
- [ ] Mohu přidat nový produkt
- [ ] Mohu vyplnit fyzikální vlastnosti

---

**Status:** 🎯 Připraveno k použití  
**Datum:** 3.1.2026  
**Poslední aktualizace:** Po opravě chyby "relation does not exist"


