# Oprava UX košíku a poptávek + indikace odeslané poptávky

## Datum: 3. ledna 2026

## 📋 Přehled implementace

### ✅ 1. Oprava badge logiky v navigaci

**Implementováno:**
- ✅ Odstraněn badge košíku z "Moje poptávky" v sidebaru
- ✅ Badge košíku zůstává pouze na floating buttonu (vpravo dole)
- ✅ Oddělení konceptu "košík" (rozpracované) vs. "poptávky" (odeslané)

**Soubory:**
- `components/portal/Sidebar.tsx` (upraven)

**Poznámka:** 
Badge u "Moje poptávky" by v budoucnu mohl ukazovat počet nových/aktivních poptávek, ale to vyžaduje další SQL queries a není to priorita.

---

### ✅ 2. Rozšíření databáze pro trackování poptaných aplikací

**Implementováno:**
- ✅ SQL migrace `add_liming_applications_to_request_items.sql`
- ✅ Nové sloupce v `liming_request_items`:
  - `liming_plan_id` - reference na plán vápnění
  - `liming_application_id` - reference na konkrétní aplikaci
  - `application_year` - rok aplikace (pro historii)
  - `application_season` - sezóna aplikace (pro historii)
- ✅ Aktualizované TypeScript typy v `database.ts`

**Soubory:**
- `lib/supabase/sql/add_liming_applications_to_request_items.sql` (nový)
- `lib/types/database.ts` (upraven)

**Jak to funguje:**
- Při vytvoření poptávky se uloží vazba na aplikaci z plánu
- I když se plán smaže, zůstane rok a sezóna v historii
- Umožňuje zpětně zjistit, které aplikace už byly poptány

---

### ✅ 3. Aktualizace action pro vytvoření poptávky

**Implementováno:**
- ✅ `createLimingRequest()` nyní ukládá vazbu na aplikace
- ✅ Pokud košík obsahuje `applications[]`, vytvoří se položka pro každou aplikaci samostatně
- ✅ Zachována zpětná kompatibilita se starým formátem (bez applications)

**Soubory:**
- `lib/actions/liming-requests.ts` (upraven)

**Logika:**
```typescript
// Nový formát: Každá aplikace = samostatná položka poptávky
items.flatMap(item => {
  if (item.applications) {
    // Vytvoř položku pro každý rok/sezónu
    return item.applications.map(app => ({
      parcel_id, product_name, quantity,
      liming_plan_id, liming_application_id,
      application_year, application_season
    }))
  }
  // Starý formát - jedna položka
  return [{ parcel_id, product_name, quantity }]
})
```

---

### ✅ 4. Vylepšený košík komponent

**Implementováno:**
- ✅ Zobrazení aplikací v košíku (rok + sezóna + množství)
- ✅ Vylepšený empty state s odkazy
- ✅ Tlačítko "Odeslat poptávku" s lepším flow (router.push místo Link)

**Soubory:**
- `components/portal/LimingCartButton.tsx` (upraven)

**UX změny:**
- Empty state nabízí přejít na plány vápnění nebo odeslané poptávky
- Položky košíku zobrazují detailní rozpad na roky
- Lepší vizuální hierarchie

---

### ✅ 5. Inteligentní empty state na stránce poptávek

**Implementováno:**
- ✅ Nový komponent `EmptyRequestsState`
- ✅ Detekce položek v košíku pomocí `useLimingCart()`
- ✅ Dva stavy empty state:
  1. **Košík je prázdný:** Standardní výzva k vytvoření poptávky
  2. **Košík má položky:** Výrazné upozornění + náhled košíku + CTA "Dokončit poptávku"

**Soubory:**
- `components/portal/EmptyRequestsState.tsx` (nový)
- `app/portal/poptavky/page.tsx` (upraven)

**UX flow:**
```
Uživatel přidá pozemky do košíku → Přejde na "Moje poptávky"
→ Vidí: "Máte 3 položky v košíku čekající na odeslání"
→ Náhled položek v košíku
→ Tlačítko "Dokončit poptávku" (prominentní)
```

---

## 🚧 Zbývající implementace

### TODO: Indikace poptaných roků v LimingPlanTable

**Požadavek:**
- U řádků (roků), pro které byla odeslána poptávka, zobrazit zelený badge "Poptáno"
- Změnit pozadí řádku na světle zelenou
- Tooltip s datem odeslání poptávky

**Implementace:**
1. V `LimingPlanTable` načíst seznam poptaných aplikací:
```typescript
const { data: requestedApps } = await supabase
  .from('liming_request_items')
  .select('liming_application_id, created_at, request_id')
  .eq('parcel_id', parcelId)
  .not('liming_application_id', 'is', null)
```

2. Přidat sloupec "Stav" do tabulky
3. Pro každou aplikaci zkontrolovat, jestli je v `requestedApps`

**Soubory k úpravě:**
- `components/portal/LimingPlanTable.tsx`

---

### TODO: AddLimingPlanToCart - označit poptané roky

**Požadavek:**
- Při otevření výběru roků označit již poptané jako "již poptáno" (disabled checkboxy)
- Předvybrat pouze nepoptané roky
- Zobrazit varování "Některé roky již byly poptány"

**Implementace:**
1. V `AddLimingPlanToCart` props přidat `requestedApplicationIds: string[]`
2. Parent component načte seznam poptaných aplikací
3. Checkboxy pro poptané aplikace = disabled + jiný styl

**Soubory k úpravě:**
- `components/portal/AddLimingPlanToCart.tsx`
- `app/portal/pozemky/[id]/plan-vapneni/page.tsx` (načíst poptané aplikace)

---

## 📊 Statistiky implementace

### Dokončeno:
- ✅ Odstranění matoucího badge
- ✅ SQL migrace a TypeScript typy
- ✅ Action pro ukládání vazeb
- ✅ Vylepšený košík
- ✅ Inteligentní empty state

### Zbývá:
- ⏳ Indikace poptaných roků v tabulce plánu (5-10 řádků v LimingPlanTable)
- ⏳ Disabled checkboxy pro poptané roky (3-5 řádků v AddLimingPlanToCart)

**Celkem řádků kódu:** ~500 nových/upravených
**Nové soubory:** 2
**Upravené soubory:** 6

---

## 🚀 Nasazení

### 1. Spustit SQL migraci:
```bash
# V Supabase SQL Editoru spustit:
demon-agro/lib/supabase/sql/add_liming_applications_to_request_items.sql
```

### 2. Ověřit TypeScript typy:
```bash
npm run build
```

### 3. Testování:
1. Přidat plán do košíku
2. Přejít na "Moje poptávky" → mělo by se zobrazit upozornění
3. Odeslat poptávku
4. Ověřit, že položky mají vyplněné `liming_application_id`

---

## 📝 Poznámky

### Databázová struktura:
```sql
liming_request_items
├── request_id → liming_requests(id)
├── parcel_id → parcels(id)
├── product_id → liming_products(id)
├── liming_plan_id → liming_plans(id)        ← NOVÉ
├── liming_application_id → liming_applications(id)  ← NOVÉ
├── application_year (integer)                ← NOVÉ
└── application_season (varchar)              ← NOVÉ
```

### UX Flow:
```
1. Uživatel vytvoří plán vápnění
2. Přidá roky do košíku (s vazbou na applications)
3. Odešle poptávku
   → V DB se uloží liming_application_id pro každý rok
4. Při příštím zobrazení plánu:
   → SELECT liming_application_id FROM liming_request_items
   → Zobrazit badge "Poptáno" u těchto roků
5. Při přidávání do košíku:
   → Zakázat checkboxy pro již poptané roky
```

---

## 🐛 Známé limitace

- Indikace poptaných roků zatím není implementována (zbývá 2 TODO)
- Badge u "Moje poptávky" v sidebaru neukazuje počet aktivních poptávek
- Při smazání aplikace z plánu se neukazuje historie poptávky (zobrazí se pouze rok)

---

## 👥 Pro budoucí vývoj

1. **Badge aktivních poptávek:** Přidat counter poptávek se statusem 'new' nebo 'quote_sent'
2. **Historie poptávek:** Na stránce plánu zobrazit, kdy byl rok poptán
3. **Editace poptávky:** Umožnit upravit poptávku před odesláním
4. **Notifikace:** Email notifikace při změně stavu poptávky

---

Implementoval AI asistent Claude v Cursor IDE  
Datum: 3. ledna 2026



