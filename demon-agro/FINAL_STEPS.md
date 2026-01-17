# 🎯 FINÁLNÍ KROKY - Dokončení migrace soil categories

## ✅ CO BYLO PROVEDENO:

1. ✅ SQL migrace `migrate_soil_categories.sql` - přejmenování starých kategorií
2. ✅ SQL `add_ca_s_category_columns.sql` - přidání sloupců ca_category a s_category
3. ✅ Skript `recalculate-soil-categories.ts` - přepočítání VŠECH kategorií včetně Ca a S
4. ✅ ParcelHealthCard - přidáno pH vyhodnocení pro typ půdy + zobrazení Ca, S kategorií

---

## 🚀 SPUSŤTE NYNÍ (KROK ZA KROKEM):

### KROK 1: Přidejte sloupce Ca a S do databáze

V Supabase SQL Editor spusťte:
```sql
-- Soubor: lib/supabase/sql/add_ca_s_category_columns.sql
```

**Očekávaný výstup:**
```
ALTER TABLE
ALTER TABLE
ADD CONSTRAINT
ADD CONSTRAINT
COMMENT
COMMENT

column_name    | data_type          | is_nullable
ca_category    | character varying  | YES
s_category     | character varying  | YES
```

---

### KROK 2: Spusťte přepočítání kategorií

```bash
cd demon-agro
npx tsx scripts/recalculate-soil-categories.ts
```

**Očekávaný výstup:**
```
╔═══════════════════════════════════════════════════════════════╗
║   MIGRACE: Přepočítání soil categories podle Mehlich 3      ║
╚═══════════════════════════════════════════════════════════════╝

🔄 Načítání všech soil_analyses...

📊 Načteno 38 rozborů

================================================================================

📝 Rozbor ID: abc-123 (půda: S)
   P 116 mg/kg: dobry → vyhovujici
   K 259 mg/kg: dobry → vysoky  
   Mg 210 mg/kg: velmi_vysoky → dobry
   Ca 1585 mg/kg: null → dobry
   ✅ Aktualizováno

...

================================================================================

📊 VÝSLEDKY MIGRACE:
✅ Úspěšně přepočítáno: 35
⚪ Beze změny: 3
❌ Chyby: 0
📝 Celkem záznamů: 38

🎉 Migrace dokončena!
```

---

### KROK 3: Restart aplikace

```bash
# Smazat cache
rm -rf .next

# Restart dev serveru
npm run dev
```

---

### KROK 4: Hard refresh v prohlížeči

- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- **Nebo:** DevTools (F12) → pravý klik na refresh → "Empty Cache and Hard Reload"

---

## ✅ VERIFIKACE VÝSLEDKŮ:

### Otevřete pozemek se **středním půdním druhem (S)**:

#### **pH 6.5** by mělo zobrazovat:
```
✅ Kategorie: "Slabě kyselá" (oranžová barva)
✅ Status: "✓ Optimální pH" (zelený text)
✅ Box pod pH: "Status pro Střední orná půda: ✓ Optimální pH | Cíl: pH 6.5"
✅ Doporučení: "pH je v optimálním rozmezí pro tento typ půdy."
```

#### **Živiny pro střední půdu:**

| Parametr | Hodnota | Kategorie | Barva | Progress Bar |
|----------|---------|-----------|-------|--------------|
| P | 116.5 mg/kg | Vyhovující | 🟠 Oranžová | ~30% |
| K | 259 mg/kg | Vysoký | 🔵 Modrá | ~85% |
| Mg | 210 mg/kg | Dobrý | 🟢 Zelená | ~60% |
| Ca | 1585 mg/kg | Dobrý | 🟢 Zelená | Progress bar |
| S | (pokud máte) | (dle hodnoty) | (dle kategorie) | Progress bar |

---

## 🔍 SQL VERIFIKACE:

Spusťte v Supabase pro kontrolu:

```sql
-- Zkontrolovat konkrétní rozbor
SELECT 
  ph, ph_category,
  p, p_category,
  k, k_category,
  mg, mg_category,
  ca, ca_category,
  s, s_category,
  parcels.soil_type
FROM soil_analyses 
LEFT JOIN parcels ON soil_analyses.parcel_id = parcels.id
WHERE parcels.soil_type = 'S'
ORDER BY analysis_date DESC 
LIMIT 5;
```

**Očekávané výsledky pro střední půdu (S):**

| pH | ph_category | P | p_category | K | k_category | Mg | mg_category |
|----|-------------|---|------------|---|------------|----| ------------|
| 6.5 | slabe_kysela | 116 | vyhovujici | 259 | vysoky | 210 | dobry |

---

## 📊 KONTROLNÍ BODY:

### ✅ Databáze:
- [  ] Sloupce `ca_category` a `s_category` existují
- [  ] Všechny kategorie mají nové hodnoty (`nizky`, `vyhovujici`, atd.)
- [  ] Žádné staré hodnoty (`N`, `VH`, `D`, `V`, `VV`)

### ✅ UI - Zdravotní karta:
- [  ] pH zobrazuje kategorii (Slabě kyselá)
- [  ] pH zobrazuje status pro půdu (✓ Optimální pH)
- [  ] P, K, Mg kategorie sedí s hodnotami
- [  ] Ca se zobrazuje s kategorií
- [  ] S se zobrazuje s kategorií (pokud máte data)
- [  ] Progress bary odpovídají kategoriím
- [  ] Barvy odpovídají kategoriím (červená, oranžová, zelená, modrá, fialová)

---

## ❌ TROUBLESHOOTING:

### Problém: Ca/S kategorie se nezobrazují
- Zkontrolujte že SQL `add_ca_s_category_columns.sql` byl spuštěn
- Zkontrolujte že skript `recalculate-soil-categories.ts` byl spuštěn
- Restartujte aplikaci a hard refresh

### Problém: Stále vidím staré kategorie
- Smažte `.next`: `rm -rf .next`
- Hard refresh v prohlížeči (vypnout cache v DevTools)
- Zkontrolujte databázi přímo SQL query

### Problém: pH status se nezobrazuje
- Zkontrolujte že ParcelHealthCard byl aktualizován
- Restartujte dev server
- Zkontrolujte console na chyby

---

## 📋 CHECKLIST PŘED COMMITEM:

- [  ] SQL migrace úspěšně proběhly
- [  ] Skript přepočítal všechny záznamy
- [  ] UI zobrazuje správné kategorie
- [  ] pH zobrazuje optimální status
- [  ] Ca a S se zobrazují s kategoriemi
- [  ] Barvy a progress bary jsou správné
- [  ] Žádné TypeScript/Lint chyby
- [  ] Aplikace běží bez chyb

---

## 🎉 PO DOKONČENÍ:

```bash
# Commit změn
git add .
git commit -m "feat: Kompletní migrace soil categories na Mehlich 3 metodiku

- Přepočítání všech kategorií podle nových prahů
- Přidání Ca a S kategorií
- pH vyhodnocení podle typu půdy
- Zobrazení optimálního pH statusu
- Opravy progress barů a barev"

git push
```

---

**Status:** ⏳ Čeká na spuštění KROK 1 a KROK 2




