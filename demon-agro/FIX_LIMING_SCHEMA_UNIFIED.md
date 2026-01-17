# ✅ OPRAVENO: Schéma liming_products sjednoceno

## 🔧 Co bylo opraveno (2026-01-03)

### Problém 1: Nekonzistentní názvy tabulek
- ❌ `lime_products` (starý)
- ✅ `liming_products` (správný)
- **Řešení:** Všechny SQL soubory aktualizovány

### Problém 2: Chybějící sloupec `price_per_ton`
```
ERROR: column "price_per_ton" of relation "liming_products" does not exist
```
- **Příčina:** `insert_liming_products.sql` byl vytvořen pro starou verzi schématu
- **Řešení:** Kompletně přepsán podle aktuální struktury z `create_liming_products_complete.sql`

### Problém 3: Špatné hodnoty `type`
- ❌ `'vapenec_mlety'`, `'dolomit_mlety'` (starý formát)
- ✅ `'calcitic'`, `'dolomite'`, `'both'` (správný formát)
- **Řešení:** Všechny INSERTy aktualizovány

---

## 📁 Opravené soubory

### 1. `insert_liming_products.sql` (KOMPLETNĚ PŘEPSÁN)
✅ Odstraněn `price_per_ton`  
✅ Opraveny `type` hodnoty (`calcitic`, `dolomite`)  
✅ Přidány nové sloupce (`granulation`, `form`, `display_order`)  
✅ Aktualizován podle `create_liming_products_complete.sql`

### 2. `app/api/portal/liming-plans/generate/route.ts`
```diff
- pricePerTon: p.price_per_ton
+ // odstraněno
```

### 3. `lib/utils/liming-calculator.ts`
```diff
export interface LimeProduct {
  ...
- pricePerTon?: number
+ // odstraněno
}
```

---

## ✅ Nyní můžete spustit SQL

V **Supabase SQL Editoru** spusťte jeden z těchto:

### Varianta A: Kompletní vytvoření (DOPORUČENO)
```bash
create_liming_products_complete.sql
```
- Vytvoří tabulku od nuly
- Vloží 6 základních produktů
- Vše v jednom souboru

### Varianta B: Jen data (pokud tabulka už existuje)
```bash
insert_liming_products.sql
```
- Vloží pouze 6 produktů
- Pro případ, že tabulka už existuje

---

## 🎯 Po spuštění SQL

Měli byste vidět:

```sql
SELECT name, type, cao_content, mgo_content 
FROM liming_products 
ORDER BY display_order;

-- Výsledek:
name                    | type      | cao_content | mgo_content
------------------------|-----------|-------------|------------
Vápenec mletý           | calcitic  | 52.00       | 0.00
Dolomit mletý           | dolomite  | 30.00       | 18.00
Vápenec granulovaný     | calcitic  | 50.00       | 0.00
Dolomit granulovaný     | dolomite  | 28.00       | 16.00
Křídovec                | calcitic  | 45.00       | 0.00
Pálené vápno            | both      | 85.00       | 0.00
```

---

## 🚀 Test funkčnosti

1. Otevřete portál
2. Přejděte na detail pozemku s rozboreme půdy
3. Tab "Plán vápnění"
4. Klikněte "Generovat plán"
5. **Mělo by fungovat bez chyb!** ✅

---

## 📋 Checklist kompatibility

- [x] SQL schéma: `create_liming_products_complete.sql`
- [x] SQL data: `insert_liming_products.sql`
- [x] TypeScript interface: `LimeProduct`
- [x] API endpoint: `generate/route.ts`
- [x] Database types: `database.ts`

Všechno je teď **synchronizované** a používá **stejné názvy sloupců a hodnot**!

---

**Status:** ✅ PŘIPRAVENO K POUŽITÍ  
**Testováno:** Ne (ještě je potřeba spustit SQL)  
**Další krok:** Spustit SQL v Supabase Dashboard




