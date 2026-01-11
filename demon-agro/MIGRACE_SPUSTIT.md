# 🚀 NÁVOD: Spuštění migrace soil categories

## 1️⃣ INSTALACE ZÁVISLOSTÍ

```bash
cd demon-agro
npm install -D tsx dotenv
```

## 2️⃣ ZÍSKÁNÍ SERVICE ROLE KEY

1. Otevřete Supabase Dashboard
2. Jděte na **Settings** → **API**
3. Zkopírujte **service_role** key (secret key, ne anon key!)

## 3️⃣ PŘIDÁNÍ DO .env.local

Otevřete nebo vytvořte soubor `demon-agro/.env.local` a přidejte:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
```

**⚠️ POZOR:** Service role key má plný přístup k databázi - nikdy ho necommitujte do gitu!

## 4️⃣ SPUŠTĚNÍ MIGRACE

```bash
npx tsx scripts/recalculate-soil-categories.ts
```

### Co skript dělá:

1. ✅ Načte všechny záznamy z `soil_analyses`
2. ✅ Pro každý záznam zavolá `categorizePh()` a `categorizeNutrient()`
3. ✅ Porovná nové kategorie se starými
4. ✅ Pokud se liší, uloží nové kategorie do DB
5. ✅ Vypíše detailní log všech změn

### Očekávaný výstup:

```
╔═══════════════════════════════════════════════════════════════╗
║   MIGRACE: Přepočítání soil categories podle Mehlich 3      ║
╚═══════════════════════════════════════════════════════════════╝

🔄 Načítání všech soil_analyses...

📊 Načteno 38 rozborů

================================================================================

📝 Rozbor ID: abc-123 (půda: S)
   pH 6.50: slabe_kysela → slabe_kysela ✓
   P 116 mg/kg: dobry → vyhovujici
   K 259 mg/kg: dobry → vysoky
   Mg 210 mg/kg: velmi_vysoky → dobry
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

## 5️⃣ RESTART APLIKACE

```bash
# Smazat cache
rm -rf .next

# Restart dev serveru
npm run dev
```

## 6️⃣ VERIFIKACE V PROHLÍŽEČI

1. **Hard refresh:** `Ctrl + Shift + R` (Windows/Linux) nebo `Cmd + Shift + R` (Mac)
2. Otevřete detail pozemku se středním půdním druhem
3. Zkontrolujte hodnoty:

### Očekávané výsledky (střední půda):

| Parametr | Hodnota | Kategorie | Barva |
|----------|---------|-----------|-------|
| pH | 6.5 | Slabě kyselá | 🟠 Oranžová |
| P | 116.5 mg/kg | Vyhovující | 🟠 Oranžová |
| K | 259 mg/kg | Vysoký | 🔵 Modrá |
| Mg | 210 mg/kg | Dobrý | 🟢 Zelená |
| Ca | 1585 mg/kg | Dobrý | 🟢 Zelená |

## 🔍 VERIFIKACE V DATABÁZI

Spusťte v Supabase SQL Editor:

```sql
-- Zkontrolovat konkrétní hodnoty
SELECT 
  ph, ph_category,
  p, p_category,
  k, k_category,
  mg, mg_category
FROM soil_analyses 
WHERE parcel_id IN (
  SELECT id FROM parcels WHERE soil_type = 'S'
)
ORDER BY analysis_date DESC 
LIMIT 5;
```

### Očekávané kategorie pro střední půdu (S):

**pH:**
- 4.0 - 4.4 → `extremne_kysela`
- 4.5 - 5.5 → `silne_kysela`
- 5.6 - 6.5 → `slabe_kysela`
- 6.6 - 7.2 → `neutralni`
- 7.3 - 8.0 → `slabe_alkalicka`
- 8.1+ → `alkalicka`

**P (Fosfor):**
- 0 - 100 → `nizky`
- 101 - 160 → `vyhovujici`
- 161 - 250 → `dobry`
- 251 - 350 → `vysoky`
- 351+ → `velmi_vysoky`

**K (Draslík):**
- 0 - 105 → `nizky`
- 106 - 160 → `vyhovujici`
- 161 - 250 → `dobry`
- 251 - 380 → `vysoky`
- 381+ → `velmi_vysoky`

**Mg (Hořčík):**
- 0 - 105 → `nizky`
- 106 - 160 → `vyhovujici`
- 161 - 250 → `dobry`
- 251 - 380 → `vysoky`
- 381+ → `velmi_vysoky`

## ❌ TROUBLESHOOTING

### Chyba: "Chybí proměnné prostředí"
- Zkontrolujte, že máte `SUPABASE_SERVICE_ROLE_KEY` v `.env.local`
- Ujistěte se, že používáte **service_role** key, ne anon key

### Chyba: "Cannot find module"
- Spusťte: `npm install -D tsx dotenv`

### Stále vidím staré kategorie v UI
1. Smazat `.next`: `rm -rf .next`
2. Restartovat server
3. Hard refresh v prohlížeči (vypnout cache v DevTools)
4. Zkontrolovat přímo v databázi, že migrace proběhla

### Kategorie se liší od očekávaných
- Zkontrolujte `soil_type` v tabulce `parcels`
- Kategorie se liší pro lehkou (L), střední (S) a těžkou (T) půdu
- Spusťte SQL query výše pro verifikaci

## 📞 SUPPORT

Pokud migrace selže nebo hodnoty stále nesedí:
1. Pošlete screenshot výstupu skriptu
2. Pošlete výsledek SQL query z verifikace
3. Pošlete screenshot z UI s nesprávnými hodnotami




