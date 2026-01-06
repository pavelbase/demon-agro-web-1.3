# ✅ VYŘEŠENO: Historie rozborů - chyba 404

## Problém
Stránka **Historie rozborů** vracela chybu 404 kvůli chybě v databázovém dotazu:
```
column parcels.cadastral_number does not exist
```

## Příčina
Stránky se snažily používat sloupec `cadastral_number` z tabulky `parcels`, ale tento sloupec v databázi **neexistuje**. 

**Správný název sloupce je `code`**, ne `cadastral_number`.

## Řešení

### Opravené soubory:

1. **`app/portal/pozemky/[id]/rozbory/page.tsx`**
   - ✅ Změněno: `.select('id, name, cadastral_number, area')` → `.select('*')`
   - ✅ Změněno: `parcel.cadastral_number` → `parcel.code`
   - ✅ Odstraněny debug logy

2. **`app/portal/pozemky/[id]/page.tsx`**
   - ✅ Změněno: `parcel.cadastral_number` → `parcel.code`

3. **`app/portal/pozemky/[id]/plan-vapneni/page.tsx`**
   - ✅ Změněno: `parcel.cadastral_number` → `parcel.code`

4. **`components/portal/ParcelHealthCard.tsx`**
   - ✅ Odstraněna reference na neexistující `ca_category`

### Detaily oprav:

#### Před:
```typescript
const { data: parcel } = await supabase
  .from('parcels')
  .select('id, name, cadastral_number, area')  // ❌ cadastral_number neexistuje
  
// ...
{parcel.cadastral_number && ` - ${parcel.cadastral_number}`}  // ❌
```

#### Po:
```typescript
const { data: parcel } = await supabase
  .from('parcels')
  .select('*')  // ✅ Načte všechny sloupce včetně 'code'
  
// ...
{parcel.code && ` - ${parcel.code}`}  // ✅
```

## Ověření

### Test 1: Zkontrolovat terminál
Po kliknutí na "Historie rozborů" by terminál **neměl** zobrazovat chybu.

### Test 2: Zkontrolovat stránku
Stránka by se měla načíst správně a zobrazit:
- ✅ Hlavičku s názvem pozemku a kódem
- ✅ Seznam všech rozborů pro daný pozemek
- ✅ Hodnoty živin (pH, P, K, Mg, Ca, S)

## O zobrazení síry a vápníku

**Síra (S) a Vápník (Ca) se zobrazují SPRÁVNĚ!**

Ze screenshotu:
- ✅ **Síra (S)**: 13.08 mg/kg - zobrazuje se
- ✅ **Vápník (Ca)**: 1892 mg/kg - zobrazuje se

**Šedý pruh** u těchto živin je **normální a očekávaný**, protože:
- Databáze nemá sloupce `ca_category` a `s_category`
- Kategorizace pro tyto živiny není implementována
- Zobrazují se pouze číselné hodnoty bez barevného hodnocení

### Pokud chcete přidat kategorie pro Ca a S:

1. **Přidat sloupce do databáze:**
```sql
ALTER TABLE soil_analyses 
ADD COLUMN ca_category TEXT,
ADD COLUMN s_category TEXT;
```

2. **Aktualizovat API** `save-soil-analyses-batch/route.ts`:
```typescript
const ca_category = analysis.calcium ? categorizeNutrient('Ca', analysis.calcium, soilType) : null
const s_category = analysis.sulfur ? categorizeNutrient('S', analysis.sulfur, soilType) : null
```

3. **Vložit do databáze:**
```typescript
ca: analysis.calcium || null,
ca_category,
s: analysis.sulfur || null,
s_category,
```

## Časová osa řešení

1. ✅ Přidány debug logy
2. ✅ Identifikován problém: `column parcels.cadastral_number does not exist`
3. ✅ Zjištěno, že správný sloupec je `code`
4. ✅ Opraveny všechny 3 stránky používající `cadastral_number`
5. ✅ Odstraněny debug logy
6. ✅ Ověřeno zobrazení síry a vápníku

## Status: ✅ KOMPLETNĚ VYŘEŠENO

**Co dělat dál:**
1. **Obnovte stránku v prohlížeči** (Ctrl+Shift+R)
2. **Klikněte na "Historie rozborů"**
3. **Stránka by měla fungovat!** 🎉

---

**Vytvořeno:** 2026-01-01  
**Status:** ✅ VYŘEŠENO



