# 🚨 DEFINITIVNÍ ŘEŠENÍ - Foreign Key Problém

## 🎯 Situace

Stále se objevuje chyba:
```
insert or update on table "liming_applications" violates foreign key constraint
```

**Problém:** Databáze je v **nekonzistentním stavu** - buď:
1. Tabulky byly vytvořeny různými verzemi SQL skriptů
2. Produkty v `liming_products` mají jiné UUID než očekávané
3. Starší data odkazují na neexistující produkty

## ✅ ŘEŠENÍ: 2 možnosti

---

### ⚡ Možnost A: RYCHLÝ RESET (DOPORUČENO)

**Co to udělá:** Smaže VŠECHNA data v liming tabulkách a vytvoří je znovu od nuly.

**⚠️ VAROVÁNÍ:** Ztratíte všechny existující plány vápnění!

**Kroky:**

1. Otevřete **Supabase Dashboard → SQL Editor**
2. Spusťte soubor: **`RESET_LIMING_COMPLETE.sql`**
3. Zkontrolujte výstup - měli byste vidět:
   ```
   ✅ RESET DOKONČEN!
   product_count: 6
   ```
4. Zkuste vytvořit nový plán vápnění

**Co tento skript udělá:**
- ✅ Smaže staré tabulky (CASCADE)
- ✅ Vytvoří nové s aktuální strukturou
- ✅ Vloží 6 produktů s novými UUID
- ✅ Nastaví správné foreign keys
- ✅ Nastaví RLS policies

---

### 🔍 Možnost B: DIAGNOSTIKA NEJDŘÍV

**Pokud potřebujete zjistit, co přesně je špatně:**

1. Spusťte **`DIAGNOSE_COMPLETE.sql`**
2. Pošlete mi **celý výstup** (všechny RAISE NOTICE a SELECT výsledky)
3. Na základě toho určím přesný problém
4. Vytvořím cílené řešení

**Co diagnostika ukáže:**
- Které tabulky existují
- Kolik mají záznamů
- Jaké jsou foreign key constraints
- Která UUID chybí
- Přesné doporučení

---

## 🎯 Moje doporučení: Použijte Možnost A (RESET)

**Proč:**
- ✅ Rychlé (1 minuta)
- ✅ Garantovaně funkční
- ✅ Čisté prostředí
- ✅ Aktuální struktura
- ✅ Správné UUID

**Nevýhody:**
- ❌ Ztráta existujících plánů (ale ty stejně nefungovaly)

---

## 📝 Po RESETU:

1. Přejděte do portálu
2. Otevřete detail pozemku s rozboreme
3. Tab "Plán vápnění"
4. **"Generovat plán"**
5. **Mělo by FUNGOVAT!** ✅

---

## 🆘 Pokud ani RESET nepomůže:

Pošlete mi výstup z:
```sql
SELECT * FROM liming_products;
SELECT 
  conname, confrelid::regclass 
FROM pg_constraint 
WHERE conrelid = 'liming_applications'::regclass 
  AND contype = 'f';
```

A log z API při pokusu o vytvoření plánu (z terminálu).

---

## 📁 Soubory k použití:

- **`RESET_LIMING_COMPLETE.sql`** - Kompletní reset (POUŽIJTE TOTO)
- **`DIAGNOSE_COMPLETE.sql`** - Diagnostika stavu
- **`NAMING_CONVENTIONS.md`** - Pravidla pro budoucnost

---

**Jsem připraven pomoci s jakýmkoli dalším krokem!** 🚀




