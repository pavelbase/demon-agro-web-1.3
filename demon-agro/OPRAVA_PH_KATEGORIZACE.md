# OPRAVA: pH kategorizace - Špatné hranice kategorií

## 🐛 Problém

**Uživatel nahlásil:** 
> "Když najedu na ikonu informace o pH, tooltip napíše 'pH 5.0-5.5 a doporučeno vápnění', ale pH je 6.5"

### Příčina

Funkce `categorizePh()` měla **špatně nastavené hranice** kategorií:

**PŘED (ŠPATNĚ):**
```typescript
if (ph < 5.0) return 'EK'   // < 5.0: Extrémně kyselý
if (ph < 6.5) return 'SK'   // 5.0-6.5: Silně kyselý ❌ CHYBA!
if (ph < 7.2) return 'N'    // 6.5-7.2: Neutrální
if (ph < 8.0) return 'SZ'   // 7.2-8.0: Slabě zásaditý
return 'EZ'                  // >= 8.0: Extrémně zásaditý
```

**Problém:**
- pH **6.5 bylo kategorizováno jako SK** (Silně kyselý)
- Ale popis v constants říkal: "pH 5.0 - 5.5"
- **Nesrovnalost mezi logikou a popisem!**

### Důsledky

- pH 6.5 (optimální hodnota) bylo špatně označeno jako "Silně kyselý"
- Tooltips zobrazovaly zavádějící informace
- Doporučení k vápnění pro půdy, které ho nepotřebují

---

## ✅ Řešení

### 1. Opravena logika kategorizace

**Soubor:** `lib/utils/soil-categories.ts`

**PO (SPRÁVNĚ podle AZZP metodiky):**
```typescript
export function categorizePh(ph: number): PhCategory {
  if (ph < 5.0) return 'EK'   // < 5.0: Extrémně kyselý
  if (ph < 5.5) return 'SK'   // 5.0-5.5: Silně kyselý ✅
  if (ph < 7.0) return 'N'    // 5.5-7.0: Neutrální (optimální) ✅
  if (ph < 8.0) return 'SZ'   // 7.0-8.0: Slabě zásaditý
  return 'EZ'                  // >= 8.0: Extrémně zásaditý
}
```

### 2. Aktualizovány popisy kategorií

**Soubor:** `lib/constants/database.ts`

**PŘED:**
```typescript
export const PH_CATEGORY_DESCRIPTIONS: Record<PhCategory, string> = {
  EK: 'pH < 5.0 - nutné vápnění',
  SK: 'pH 5.0 - 5.5 - doporučeno vápnění',
  N: 'pH 6.0 - 7.0 - optimální',        // ❌ Neshodovalo se s logikou!
  SZ: 'pH 7.0 - 7.5 - mírně alkalická', // ❌ Neshodovalo se s logikou!
  EZ: 'pH > 8.0 - vysoká alkalita',
}
```

**PO:**
```typescript
export const PH_CATEGORY_DESCRIPTIONS: Record<PhCategory, string> = {
  EK: 'pH < 5.0 - nutné vápnění',
  SK: 'pH 5.0 - 5.5 - doporučeno vápnění',
  N: 'pH 5.5 - 7.0 - optimální',        // ✅ Odpovídá logice!
  SZ: 'pH 7.0 - 8.0 - mírně alkalická', // ✅ Odpovídá logice!
  EZ: 'pH ≥ 8.0 - vysoká alkalita',
}
```

### 3. Vytvořen SQL skript pro přepočítání existujících dat

**Soubor:** `lib/supabase/sql/fix_ph_categories.sql`

---

## 📋 Kategorie pH podle AZZP metodiky

| Kategorie | Zkratka | pH rozsah | Popis | Doporučení |
|-----------|---------|-----------|-------|------------|
| Extrémně kyselý | EK | < 5.0 | Velmi kyselá půda | **Nutné vápnění** |
| Silně kyselý | SK | 5.0 - 5.5 | Kyselá půda | **Doporučeno vápnění** |
| Neutrální | N | 5.5 - 7.0 | Optimální pH | Udržovací vápnění |
| Slabě zásaditý | SZ | 7.0 - 8.0 | Mírně alkalická | Sledovat |
| Extrémně zásaditý | EZ | ≥ 8.0 | Vysoká alkalita | Speciální opatření |

---

## 🔧 Jak aplikovat opravu

### Krok 1: Přepočítat kategorie v databázi

**DŮLEŽITÉ:** Všechny existující rozbory mají špatně kategorizované pH!

1. Přihlaste se do **Supabase → SQL Editor**
2. Otevřete soubor: `lib/supabase/sql/fix_ph_categories.sql`
3. Zkopírujte SQL kód
4. Spusťte v SQL Editoru

**Co skript dělá:**
```sql
UPDATE soil_analyses
SET ph_category = CASE
  WHEN ph < 5.0 THEN 'EK'::ph_category
  WHEN ph < 5.5 THEN 'SK'::ph_category
  WHEN ph < 7.0 THEN 'N'::ph_category
  WHEN ph < 8.0 THEN 'SZ'::ph_category
  ELSE 'EZ'::ph_category
END;
```

**Zobrazí statistiku:**
```
ph_category | pocet | prumerne_ph | min_ph | max_ph
------------|-------|-------------|--------|-------
EK          | ...   | ...         | ...    | ...
SK          | ...   | ...         | ...    | ...
N           | ...   | ...         | ...    | ...
SZ          | ...   | ...         | ...    | ...
EZ          | ...   | ...         | ...    | ...
```

### Krok 2: Restartovat aplikaci

```bash
# V terminálu:
# Zastavit server (Ctrl+C)
# Smazat cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Spustit znovu
npm run dev
```

### Krok 3: Ověřit opravu

1. Otevřete detail pozemku s pH 6.5
2. Najeďte na info ikonu u pH
3. **Mělo by se zobrazit:** "pH 5.5 - 7.0 - optimální" ✅
4. **Badge kategorie:** "Neutrální" (zelená barva) ✅

---

## 📊 Příklady změn

### Před opravou

| pH hodnota | Stará kategorie | Zobrazený popis | Správné? |
|------------|-----------------|-----------------|----------|
| 5.2 | SK | pH 5.0 - 5.5 | ✅ Správně |
| 6.0 | SK | pH 5.0 - 5.5 | ❌ **ŠPATNĚ!** |
| 6.5 | SK | pH 5.0 - 5.5 | ❌ **ŠPATNĚ!** |
| 6.8 | N | pH 6.0 - 7.0 | ✅ Správně |
| 7.1 | N | pH 6.0 - 7.0 | ❌ **ŠPATNĚ!** |

### Po opravě

| pH hodnota | Nová kategorie | Zobrazený popis | Správné? |
|------------|----------------|-----------------|----------|
| 5.2 | SK | pH 5.0 - 5.5 | ✅ Správně |
| 6.0 | N | pH 5.5 - 7.0 | ✅ **OPRAVENO!** |
| 6.5 | N | pH 5.5 - 7.0 | ✅ **OPRAVENO!** |
| 6.8 | N | pH 5.5 - 7.0 | ✅ Správně |
| 7.1 | SZ | pH 7.0 - 8.0 | ✅ **OPRAVENO!** |

---

## ✅ Výsledek

**Před:**
- ❌ pH 6.5 → kategorie SK → tooltip "pH 5.0-5.5"
- ❌ Zavádějící informace
- ❌ Špatná doporučení

**Po:**
- ✅ pH 6.5 → kategorie N → tooltip "pH 5.5-7.0 - optimální"
- ✅ Přesné informace
- ✅ Správná doporučení
- ✅ Konzistence mezi logikou a popisy

---

## 📝 Poznámky

### Proč došlo k chybě?

Pravděpodobně kvůli:
1. Různé agronomické školy používají různé hranice
2. Někdo použil zjednodušení (5.5 → 6.5)
3. Nesynchronizace mezi kódem a konstantami

### Referenční metodika

Použitá metodika: **AZZP (Agrochemický zkušební a zjišťovací postup)**
- Oficiální česká metodika pro hodnocení půdy
- Uznávaná ÚKZÚZ a MZe ČR

---

## 🔗 Související soubory

- ✅ `lib/utils/soil-categories.ts` - Opravena funkce `categorizePh()`
- ✅ `lib/constants/database.ts` - Aktualizovány popisy kategorií
- ✅ `lib/supabase/sql/fix_ph_categories.sql` - SQL skript pro přepočítání
- ✅ `components/portal/ParcelHealthCard.tsx` - Používá opravené kategorie

---

## 🎉 Shrnutí

**Problém vyřešen!**

- ✅ Opravena logika kategorizace pH
- ✅ Aktualizovány popisy kategorií
- ✅ Vytvořen SQL skript pro přepočítání
- ✅ Tooltips nyní zobrazují správné informace

**Zbývá spustit SQL skript v Supabase!**



