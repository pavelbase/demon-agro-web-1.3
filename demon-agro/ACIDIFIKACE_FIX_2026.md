# Fix: Kaskádový přepočet acidifikace při úpravách plánu vápnění

## Problém
Při manuálních úpravách plánu vápnění (přidání, úprava nebo smazání aplikací) se **nepřepočítávala přirozená acidifikace** mezi roky aplikací. To vedlo k nesprávným hodnotám pH v následujících aplikacích.

### Příklad problému:
```
Aplikace 2026: pH 5.0 → 6.5 (po vápnění)
--- 3 roky bez aplikace ---
Aplikace 2029: pH 6.5 → ... ❌ CHYBA!
```

**Správně by mělo být:**
```
Aplikace 2026: pH 5.0 → 6.5
--- 3 roky bez aplikace ---
  2027: pH 6.5 → 6.43 (acidifikace -0.07)
  2028: pH 6.43 → 6.36 (acidifikace -0.07)
  2029: pH 6.36 → 6.29 (acidifikace -0.07)
Aplikace 2029: pH 6.29 → ... ✅ SPRÁVNĚ!
```

## Řešení

### 1. Nová utilita: `liming-recalculation.ts`
Vytvořen centrální modul pro kaskádový přepočet s acidifikací:

- **`recalculateAllApplications()`** - Přepočítá všechny aplikace od daného bodu
- **`recalculateAfterDeletion()`** - Specializovaná funkce pro přepočet po smazání

**Klíčová logika:**
```typescript
// Roční pokles pH podle typu půdy
const ANNUAL_PH_DROP = {
  L: 0.09, // lehká půda
  S: 0.07, // střední půda  
  T: 0.04  // těžká půda
}

// Pro každou následující aplikaci:
const yearsGap = currentApp.year - previousApp.year
const phBefore = previousApp.ph_after - (yearsGap * annualPhDrop)
```

### 2. Aktualizace API endpointů

#### PATCH `/api/portal/liming-plans/[planId]/applications/[applicationId]`
- Po úpravě aplikace automaticky přepočítá všechny následující
- Přepočet se spustí, pokud se změnil rok, pH nebo dávka CaO

#### DELETE `/api/portal/liming-plans/[planId]/applications/[applicationId]`
- Po smazání aplikace přepočítá všechny následující
- Používá `recalculateAfterDeletion()` pro správné navázání pH

#### POST `/api/portal/liming-plans/[planId]/applications`
- **OPRAVENO**: Výpočet `ph_before` nové aplikace nyní zohledňuje acidifikaci od předchozí aplikace
- Po přidání nové aplikace (i uprostřed plánu) přepočítá všechny následující
- Nahrazena původní neúplná logika přepočtu

### 3. Aktualizace frontendu

#### `LimingPlanTable.tsx`
- **Odstraněn manuální kaskádový přepočet** z `handleSave()`
- Přepočet nyní dělá backend automaticky při každé změně
- Frontend jen pošle změny, backend se postará o zbytek

## Roční acidifikace podle typu půdy

| Typ půdy | Kód | Roční pokles pH |
|----------|-----|-----------------|
| Lehká    | L   | -0.09 pH/rok    |
| Střední  | S   | -0.07 pH/rok    |
| Těžká    | T   | -0.04 pH/rok    |

## Testovací scénáře

### Scénář 1: Úprava dávky existující aplikace
1. Upravte dávku v roce 2026 (změní pH po aplikaci)
2. ✅ Backend automaticky přepočítá pH pro roky 2029, 2032 atd.
3. ✅ Acidifikace mezi roky je správně započítána

### Scénář 2: Přidání nové aplikace mezi existující
1. Přidejte novou aplikaci v roce 2028 (mezi 2026 a 2029)
2. ✅ Backend přepočítá pH pro rok 2029 a následující
3. ✅ Acidifikace 2026→2028 a 2028→2029 je správně započítána

### Scénář 3: Smazání aplikace
1. Smažte aplikaci v roce 2029
2. ✅ Backend přepočítá pH pro rok 2032 (nyní navazuje na 2026)
3. ✅ Acidifikace 2026→2032 (6 let) je správně započítána

### Scénář 4: Změna roku aplikace
1. Změňte rok aplikace z 2029 na 2030
2. ✅ Backend přepočítá pH pro následující aplikace
3. ✅ Nový časový odstup je správně zohledněn

## Změněné soubory

1. **`lib/utils/liming-recalculation.ts`** - NOVÝ
   - Centrální logika pro přepočet s acidifikací

2. **`app/api/portal/liming-plans/[planId]/applications/[applicationId]/route.ts`**
   - PATCH: Přidán automatický přepočet
   - DELETE: Přidán automatický přepočet po smazání

3. **`app/api/portal/liming-plans/[planId]/applications/route.ts`**
   - POST: Nahrazena logika přepočtu za novou utilitu

4. **`components/portal/LimingPlanTable.tsx`**
   - Odstraněn neúplný manuální přepočet z frontendu

## Poznámky pro vývoj

- Backend nyní **vždy** přepočítává pH s acidifikací
- Frontend nemusí řešit kaskádové přepočty
- Všechny změny (úprava/přidání/smazání) jsou konzistentní
- Acidifikace se zobrazuje správně i mezi manuálně upravenými aplikacemi

## Datum implementace
5. ledna 2026

## Autor
AI Assistant (Claude Sonnet 4.5) + Pavel Baše

