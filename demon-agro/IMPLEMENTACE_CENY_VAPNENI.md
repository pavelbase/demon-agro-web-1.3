# Implementace cen pro produkty vápnění

## 📋 Přehled změn

Dne 2026-01-03 byla implementována podpora cen pro produkty vápnění v systému Démon Agro. Nyní je možné ve správě produktů nastavit cenu v CZK/t, která se automaticky použije při výpočtu odhadované ceny v plánu vápnění.

## 🗂️ Implementované soubory

### 1. SQL Migrace

#### `lib/supabase/sql/add_price_to_liming_products.sql`
- Přidání sloupce `price_per_ton` do tabulky `liming_products`
- Typ: `NUMERIC(10,2) DEFAULT NULL`
- Význam: Orientační cena produktu v CZK/t (bez dopravy a aplikace)
- Automatické nastavení výchozích cen pro existující produkty:
  - Vápenec drcený: 550 CZK/t
  - Vápenec mletý: 600 CZK/t
  - Granulovaný vápenec: 650 CZK/t
  - Dolomit mletý: 800 CZK/t
  - Dolomit granulovaný: 850 CZK/t
  - Hybridní produkty: 700 CZK/t

#### `lib/supabase/sql/add_price_to_liming_applications.sql`
- Přidání sloupce `product_price_per_ton` do tabulky `liming_applications`
- Typ: `NUMERIC(10,2) DEFAULT NULL`
- Význam: Denormalizovaná cena v době vytvoření plánu (historická přesnost)
- Automatická aktualizace existujících aplikací s cenami z `liming_products`

### 2. TypeScript Typy

#### `lib/types/database.ts`
Aktualizované typy pro:
- `liming_products.Row` - přidáno `price_per_ton: number | null`
- `liming_products.Insert` - přidáno `price_per_ton?: number | null`
- `liming_products.Update` - přidáno `price_per_ton?: number | null`

Přidány také chybějící fyzikální vlastnosti:
- `moisture_content`
- `particles_over_1mm`
- `particles_under_05mm`
- `particles_009_05mm`

### 3. Admin komponenty

#### `components/admin/LimingProductModal.tsx`
- Přidáno pole pro zadání ceny produktu
- Validace: číslo >= 0
- Placeholder: "např. 800"
- Nápověda: "Orientační cena v CZK/t bez dopravy a aplikace. Ponechte prázdné pro individuální stanovení."

#### `components/admin/LimingProductsTable.tsx`
- Nový sloupec "Cena (CZK/t)" v tabulce produktů
- Formátování pomocí `Intl.NumberFormat` v českém formátu
- Zobrazení "individuální" pokud cena není nastavena
- Odstranění sloupců "Vlhkost" a "Částice" pro přehlednější zobrazení

### 4. API Endpointy

#### `app/api/admin/liming-products/create/route.ts`
- Přidán parametr `price_per_ton` do payload
- Ukládání ceny při vytváření nového produktu

#### `app/api/admin/liming-products/update/route.ts`
- Přidán parametr `price_per_ton` do payload
- Aktualizace ceny při úpravě produktu

#### `app/api/portal/liming-plans/generate/route.ts`
- Vytvoření mapy produktů s cenami: `productsMap`
- Při vytváření aplikací se kopíruje cena z produktu do `product_price_per_ton`
- Zachování historické ceny pro každou aplikaci

### 5. Utility funkce

#### `lib/constants/liming-prices.ts`
**Nové funkce:**
- `getProductPrice(priceFromDb, productName)` - primárně používá DB cenu, fallback na heuristiku
- `calculateEstimatedCost(pricePerTon, totalTons)` - výpočet s cenou z DB

**Deprecated:**
- `calculateEstimatedCostByName(productName, totalTons)` - zachováno pro zpětnou kompatibilitu

**Aktualizováno:**
- Komentáře upozorňující, že primárním zdrojem je DB

### 6. Zobrazení v portálu

#### `components/portal/LimingPlanTable.tsx`
- Aktualizace interface `LimingApplication` - přidán `product_price_per_ton`
- Výpočet odhadované ceny: `calculateEstimatedCost(app.product_price_per_ton, app.total_dose)`
- Zobrazení "individuální" pokud cena není k dispozici
- Řádek CELKEM aktualizován pro součet cen z DB

#### `components/portal/PlanyVapneniClient.tsx`
- Aktualizace interface `Application` - přidán `product_price_per_ton`
- Výpočet celkové odhadované ceny pro plán z DB cen

## 🔄 Workflow

### Vytvoření nového produktu
1. Admin vyplní formulář včetně ceny (volitelné)
2. Cena se uloží do `liming_products.price_per_ton`
3. Zobrazí se v admin tabulce

### Editace existujícího produktu
1. Admin klikne na "Upravit"
2. Může změnit cenu produktu
3. **Změna neovlivní již vytvořené aplikace** (jsou denormalizované)

### Generování plánu vápnění
1. Systém načte aktivní produkty včetně cen
2. Vygeneruje aplikace dle algoritmu
3. **Pro každou aplikaci zkopíruje aktuální cenu produktu** do `product_price_per_ton`
4. Historická cena zůstane i pokud se později změní cena v produktu

### Zobrazení plánu
1. Načte se plán včetně aplikací
2. Pro každou aplikaci se zobrazí odhadovaná cena: `cena × množství`
3. Pokud `product_price_per_ton IS NULL` → zobrazí se "individuální"

### Výpočet celkové odhadované ceny
```typescript
const totalCost = applications.reduce(
  (sum, app) => sum + calculateEstimatedCost(app.product_price_per_ton || 0, app.total_dose),
  0
)
```

## 📊 Datový model

### Denormalizace cen
Cena produktu je **denormalizovaná** v aplikacích z následujících důvodů:

✅ **Výhody:**
1. **Historická přesnost** - cena zůstane stejná i když se změní v produktu
2. **Výkon** - není třeba JOIN při zobrazení aplikací
3. **Jednoduchost** - cena je přímo v záznamu aplikace
4. **Auditovatelnost** - víme jaká byla cena v době vytvoření plánu

❌ **Nevýhody:**
1. Duplikace dat (akceptovatelná pro historické účely)

### NULL hodnoty
- `price_per_ton IS NULL` v `liming_products` = cena bude stanovena individuálně
- `product_price_per_ton IS NULL` v `liming_applications` = cena nebyla v době vytvoření známa

## 🧪 Testování

### Před spuštěním migrací:
1. Zálohovat databázi
2. Otestovat na development prostředí

### Po spuštění migrací:
1. ✅ Ověřit, že sloupce byly přidány
2. ✅ Zkontrolovat výchozí ceny u existujících produktů
3. ✅ Vytvořit nový produkt s cenou
4. ✅ Vygenerovat nový plán a ověřit, že se cena zkopírovala
5. ✅ Ověřit zobrazení ceny v tabulce plánu
6. ✅ Změnit cenu produktu a ověřit, že staré aplikace mají původní cenu

### SQL příkazy pro ověření:
```sql
-- Ověření sloupců
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'liming_products' 
  AND column_name = 'price_per_ton';

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'liming_applications' 
  AND column_name = 'product_price_per_ton';

-- Ověření cen produktů
SELECT 
  id,
  name,
  type,
  price_per_ton
FROM liming_products
ORDER BY display_order;

-- Ověření cen v aplikacích
SELECT 
  la.id,
  la.product_name,
  la.total_dose,
  la.product_price_per_ton,
  lp.price_per_ton as current_product_price,
  (la.total_dose * COALESCE(la.product_price_per_ton, 0)) as estimated_cost
FROM liming_applications la
LEFT JOIN liming_products lp ON la.lime_product_id = lp.id
ORDER BY la.created_at DESC
LIMIT 10;
```

## 📝 Poznámky pro další vývoj

### Rozšíření v budoucnu:
1. **Historie cen** - tabulka pro sledování změn cen v čase
2. **Množstevní slevy** - cena podle množství
3. **Regionální ceny** - různé ceny podle okresu
4. **Doprava a aplikace** - samostatné sloupce pro tyto náklady
5. **Měna** - podpora různých měn (momentálně pouze CZK)

### Známá omezení:
- Cena je orientační (nezahrnuje dopravu a aplikaci)
- Není podpora pro různé ceny podle množství
- Není podpora pro sezónní ceny

## 🚀 Nasazení

### Postup:
1. **Spustit SQL migrace** (v pořadí):
   ```bash
   psql -d your_database < lib/supabase/sql/add_price_to_liming_products.sql
   psql -d your_database < lib/supabase/sql/add_price_to_liming_applications.sql
   ```

2. **Deploy kódu** - commit a push všech změn

3. **Ověření** - zkontrolovat admin rozhraní a vytvoření nového plánu

4. **Dokumentace** - informovat uživatele o nové funkci

## 📞 Kontakt

V případě problémů kontaktujte vývojový tým.

---

**Datum implementace:** 2026-01-03  
**Verze:** 1.3  
**Status:** ✅ Kompletní


