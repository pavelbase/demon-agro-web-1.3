# 📋 SYSTÉM PLÁNOVÁNÍ VÁPNĚNÍ - IMPLEMENTACE KOMPLETNÍ

## ✅ IMPLEMENTOVÁNO

### 1. Databázové schéma
**Soubor:** `demon-agro/lib/supabase/sql/create_liming_plans.sql`

#### Tabulky:
- ✅ `liming_plans` - hlavní plány vápnění
- ✅ `liming_applications` - jednotlivé aplikace v čase
- ✅ Row Level Security (RLS) politiky
- ✅ Triggery pro `updated_at`
- ✅ Indexy pro optimalizaci dotazů
- ✅ View `liming_plans_overview`

**Spuštění migrace:**
```bash
cd demon-agro
psql -h <SUPABASE_HOST> -U postgres -d postgres -f lib/supabase/sql/create_liming_plans.sql
```

---

### 2. Utility funkce - Výpočty vápnění
**Soubor:** `demon-agro/lib/utils/liming-calculator.ts`

#### Implementované funkce:
- ✅ `generateLimingPlan()` - hlavní funkce pro generování plánu
- ✅ `formatLimingPlanForExport()` - formátování pro Excel
- ✅ Oficiální tabulky potřeby vápnění (ČZU Praha)
- ✅ Výpočet pH změny po aplikaci CaO
- ✅ Výpočet Mg změny po aplikaci MgO
- ✅ Inteligentní výběr produktu (vápenec vs. dolomit)
- ✅ Mapování půdních typů (L/S/T)

**Klíčové konstanty:**
```typescript
LIMING_NEED_CA: Record<SoilDetailType, Record<string, number>>
MAX_SINGLE_DOSE_CA: Record<SoilDetailType, number>
```

**Převod jednotek:**
- 1 t Ca = 1.4 t CaO (molární hmotnost CaO/Ca = 56/40)

---

### 3. API Routes

#### 3.1 Generování plánu
**Soubor:** `demon-agro/app/api/portal/liming-plans/generate/route.ts`
- ✅ POST `/api/portal/liming-plans/generate`
- ✅ Validace vstupů
- ✅ Kontrola vlastnictví pozemku
- ✅ Načtení dostupných produktů
- ✅ Generování plánu pomocí kalkulátoru
- ✅ Uložení do databáze
- ✅ Audit log

**Příklad použití:**
```typescript
const response = await fetch('/api/portal/liming-plans/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parcelId: 'xxx',
    currentPh: 5.5,
    targetPh: 6.5,
    soilType: 'S',
    landUse: 'orna',
    currentMg: 100,
    area: 10.5
  })
})
```

#### 3.2 Aktualizace aplikace
**Soubor:** `demon-agro/app/api/portal/liming-plans/[planId]/applications/[applicationId]/route.ts`
- ✅ PATCH - aktualizace aplikace (rok, sezóna, dávka)
- ✅ DELETE - smazání aplikace

#### 3.3 Správa plánu
**Soubor:** `demon-agro/app/api/portal/liming-plans/[planId]/route.ts`
- ✅ GET - načtení plánu s aplikacemi
- ✅ PATCH - aktualizace plánu
- ✅ DELETE - smazání celého plánu

---

### 4. React komponenty

#### 4.1 Generátor plánu
**Soubor:** `demon-agro/components/portal/LimingPlanGenerator.tsx`

**Funkce:**
- ✅ Formulář s validací vstupů
- ✅ Načtení dat z půdního rozboru
- ✅ Indikace stavu Mg (kriticky nízké / nízké / vyhovující)
- ✅ Zobrazení upozornění z kalkulátoru
- ✅ Loading state při generování
- ✅ Error handling

**Props:**
```typescript
interface LimingPlanGeneratorProps {
  parcelId: string
  latestAnalysis: { id, ph, magnesium, soil_type } | null
  parcelArea: number
  onPlanGenerated: () => void
}
```

#### 4.2 Tabulka plánu
**Soubor:** `demon-agro/components/portal/LimingPlanTable.tsx`

**Funkce:**
- ✅ Zobrazení všech aplikací v tabulce
- ✅ Inline úpravy (rok, sezóna, dávka)
- ✅ Predikce pH pro každou aplikaci
- ✅ Součty v patičce tabulky
- ✅ Smazání celého plánu
- ✅ Doporučení pro každou aplikaci
- ✅ Barevné odlišení období (jaro/podzim)

**Props:**
```typescript
interface LimingPlanTableProps {
  plan: LimingPlan
  parcelArea: number
  onUpdate: () => void
  onDelete?: () => void
}
```

#### 4.3 Excel export
**Soubor:** `demon-agro/components/portal/ExportLimingPlan.tsx`

**Funkce:**
- ✅ Export do .xlsx formátu (knihovna `xlsx`)
- ✅ 3 listy: Souhrn, Časový plán, Upozornění
- ✅ Formátování sloupců
- ✅ Automatický název souboru

**Struktura Excelu:**
- **Sheet 1: Souhrn** - přehled potřeby CaO/Ca
- **Sheet 2: Časový plán** - všechny aplikace
- **Sheet 3: Upozornění** - varování z kalkulátoru

---

### 5. Hlavní stránka
**Soubor:** `demon-agro/app/portal/pozemky/[id]/plan-vapneni/page.tsx`

**Funkce:**
- ✅ Načtení pozemku a rozboru
- ✅ Načtení existujícího plánu
- ✅ Podmíněné zobrazení (generátor vs. tabulka)
- ✅ Export tlačítko v hlavičce
- ✅ Upozornění při chybějícím rozboru
- ✅ Zobrazení použitých dat z rozboru

**URL:** `/portal/pozemky/[id]/plan-vapneni`

---

## 🔧 OFICIÁLNÍ METODIKA (ČZU Praha)

### Tabulka potřeby vápnění (t Ca/ha)

| pH →      | <4.5 | 5.0 | 5.5 | 5.8 | 6.0 | 6.3 | 6.7 |
|-----------|------|-----|-----|-----|-----|-----|-----|
| **Píščitá (P)** | 1.0 | 0.5 | 0 | 0 | 0 | 0 | 0 |
| **Hlinito-písčitá (L)** | 2.5 | 1.5 | 1.0 | 0.5 | 0 | 0 | 0 |
| **Písčito-hlinitá** | 4.5 | 2.7 | 2.0 | 1.5 | 1.0 | 0.5 | 0 |
| **Hlinitá (S)** | 5.0 | 3.5 | 2.5 | 2.0 | 1.5 | 1.0 | 0.5 |
| **Jílovito-hlinitá (T)** | 6.5 | 4.2 | 3.3 | 2.5 | 2.0 | 1.5 | 0.9 |

**POZOR:** Hodnoty jsou v **t Ca/ha**, NIKOLIV t CaO/ha!

### Maximální jednorázová dávka

| Půdní typ | t Ca/ha | t CaO/ha |
|-----------|---------|----------|
| Písčitá (P) | 0.7 | 1.0 |
| Lehká (L) | 1.1 | 1.5 |
| Písčito-hlinitá | 1.4 | 2.0 |
| Střední (S) | 2.1 | 3.0 |
| Těžká (T) | 2.5 | 3.5 |

### Cílové pH

| Využití | Lehká (L) | Střední (S) | Těžká (T) |
|---------|-----------|-------------|-----------|
| Orná půda | 6.0 | 6.5 | 6.8 |
| TTP | 5.5 | 6.0 | 6.3 |

---

## 📊 ALGORITMUS GENEROVÁNÍ PLÁNU

### Krok 1: Určení celkové potřeby Ca
```typescript
const totalCaNeedPerHa = lookupCaNeed(currentPh, soilDetailType)
```

### Krok 2: Převod Ca → CaO
```typescript
const totalCaoNeedPerHa = totalCaNeedPerHa * 1.4
```

### Krok 3: Rozložení do aplikací
```typescript
while (remainingCaoPerHa > 0.1) {
  const dosePerHaCao = Math.min(remainingCaoPerHa, maxDoseCao)
  
  // Výběr produktu
  const product = selectProduct(currentMg, remainingCaoPerHa, products)
  
  // Výpočet množství produktu
  const dosePerHa = dosePerHaCao / (product.caoContent / 100)
  
  // Predikce pH změny
  const phChange = calculatePhChange(dosePerHaCao, soilDetailType, currentPh)
  const phAfter = Math.min(currentPh + phChange, targetPh)
  
  // Uložení aplikace
  applications.push({ year, season, dosePerHa, phAfter, ... })
  
  // Aktualizace pro další iteraci
  remainingCaoPerHa -= dosePerHaCao
  currentPh = phAfter
  year += 3 // interval 3 roky
}
```

### Krok 4: Výběr produktu
- **Mg < 80 mg/kg:** Kriticky nízké → dolomit NUTNÝ
- **Mg < 105 mg/kg:** Nízké → dolomit doporučen
- **Mg ≥ 105 mg/kg:** Čistý vápenec (nejvyšší CaO)

---

## 🧪 TESTOVÁNÍ

### 1. Spuštění migrace
```bash
# Přejdi do složky projektu
cd demon-agro

# Spusť SQL migraci
psql -h <SUPABASE_HOST> -U postgres -d postgres -f lib/supabase/sql/create_liming_plans.sql

# Nebo pomocí Supabase CLI
supabase db push
```

### 2. Testovací scénář

#### A) Vytvoř testovací pozemek
- Výměra: 10 ha
- Půdní typ: S (střední)
- Využití: Orná půda

#### B) Vytvoř půdní rozbor
- pH: 5.0
- Mg: 76 mg/kg (nízké → doporučí dolomit)
- Datum: Aktuální

#### C) Vygeneruj plán
1. Přejdi na `/portal/pozemky/[id]/plan-vapneni`
2. Vyplň formulář:
   - Aktuální pH: 5.0
   - Cílové pH: 6.5 (střední půda, orná)
   - Půdní typ: S
   - Mg: 76 mg/kg
3. Klikni "Vygenerovat plán"

#### D) Očekávaný výsledek
- **Celková potřeba:** ~3.5 t CaO/ha = 35 t CaO celkem
- **Počet aplikací:** 2-3 (max dávka 3.0 t CaO/ha pro střední půdu)
- **Produkt:** Dolomit (kvůli nízkému Mg)
- **Interval:** 3 roky
- **Příklad:**
  - 2026 Podzim: 3.0 t/ha dolomitu → pH 5.0 → 5.9
  - 2029 Podzim: 2.0 t/ha dolomitu → pH 5.9 → 6.5

#### E) Úprava aplikace
1. Klikni "Upravit" u první aplikace
2. Změň rok na 2025
3. Změň dávku na 2.5 t/ha
4. Klikni "Uložit"

#### F) Export do Excelu
1. Klikni "Exportovat do Excelu"
2. Ověř 3 listy: Souhrn, Časový plán, Upozornění

---

## 📦 ZÁVISLOSTI

### Již nainstalované:
- ✅ `xlsx@0.18.5` (Excel export)

### Supabase tabulky:
- ✅ `parcels` (existující)
- ✅ `soil_analyses` (existující)
- ✅ `lime_products` (existující)
- ✅ `liming_plans` (nová)
- ✅ `liming_applications` (nová)

---

## 📚 DOKUMENTACE PRO UŽIVATELE

### Co je plán vápnění?
Vícedetý plán, který automaticky rozloží potřebu vápnění do více aplikací s intervalem 3 roky, respektující maximální legislativní dávky.

### Jak to funguje?
1. **Zadáte aktuální stav:** pH, typ půdy, obsah Mg
2. **Systém vypočítá:** Celkovou potřebu CaO podle oficiálních tabulek
3. **Rozloží na aplikace:** Max. dávky, interval 3 roky
4. **Vybere produkt:** Dolomit (nízké Mg) nebo vápenec
5. **Predikuje změny:** pH a Mg po každé aplikaci

### Důležitá doporučení
- ✅ **Kontrolní rozbory:** 1 rok po každé aplikaci
- ✅ **Interval:** Minimálně 3 roky mezi aplikacemi
- ✅ **Termín:** Nejlépe podzim po sklizni (ideálně do konce října)
- ✅ **Alternativa:** Jaro před setím (únor-březen)
- ❌ **Nevhodné:** V zimě nebo na zmrzlou půdu

---

## 🔄 BUDOUCÍ VYLEPŠENÍ (volitelné)

### 1. Detailnější půdní klasifikace
Rozšířit mapování `L/S/T` na přesné textury:
- Písčitá
- Hlinito-písčitá
- Písčito-hlinitá
- Hlinitá
- Jílovito-hlinitá

### 2. Mobilní optimalizace
- Responzivní tabulka s horizontálním scrollem
- Touch-friendly úpravy

### 3. Notifikace
- Email upozornění před plánovanou aplikací
- Push notifikace v mobilní aplikaci

### 4. Integrace s kosmetkou
- Export přímo do objednávkového systému
- Kalkulace ceny za celý plán

### 5. AI doporučení
- Optimalizace termínů dle počasí
- Predikce efektivity podle půdních podmínek

---

## 🐛 TROUBLESHOOTING

### Problém: Migrace selže
```
ERROR: relation "liming_plans" already exists
```
**Řešení:** Tabulka už existuje, přeskoč migraci nebo smaž a znovu vytvoř:
```sql
DROP TABLE IF EXISTS liming_applications CASCADE;
DROP TABLE IF EXISTS liming_plans CASCADE;
```

### Problém: RLS blokuje přístup
```
Error: new row violates row-level security policy
```
**Řešení:** Ověř, že uživatel vlastní pozemek:
```sql
SELECT * FROM parcels WHERE id = '<parcel_id>' AND user_id = '<user_id>';
```

### Problém: Žádné produkty k dispozici
```
Error: Žádné vápenné produkty k dispozici
```
**Řešení:** Naplň tabulku `lime_products`:
```sql
INSERT INTO lime_products (name, type, cao_content, mgo_content, is_active) VALUES
  ('Vápenec mletý', 'vapenec_mlety', 52, 0, true),
  ('Dolomit mletý', 'dolomit_mlety', 30, 18, true);
```

### Problém: Excel export nefunguje
```
Error: Cannot find module 'xlsx'
```
**Řešení:**
```bash
npm install xlsx
```

---

## ✅ FINÁLNÍ CHECKLIST

- [x] Databázové schéma vytvořeno
- [x] Utility funkce implementovány
- [x] API routes vytvořeny (generate, update, delete)
- [x] React komponenty vytvořeny (Generator, Table, Export)
- [x] Hlavní stránka implementována
- [x] RLS politiky nastaveny
- [x] Dokumentace napsána
- [x] Závislost `xlsx` ověřena (již nainstalovaná)

---

## 📞 KONTAKT

Pro otázky nebo problémy s implementací kontaktujte vývojový tým.

**Vytvořeno:** 2026-01-03
**Verze:** 1.0.0
**Metodika:** ČZU Praha, Oficiální tabulky potřeby vápnění


