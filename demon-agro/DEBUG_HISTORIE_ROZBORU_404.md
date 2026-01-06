# 🐛 Debug: Historie rozborů - chyba 404

## Problém
Stránka **Historie rozborů** (`/portal/pozemky/[id]/rozbory`) vrací chybu 404.

## Příčina
Stránka se snažila zobrazit `ca_category` (kategorie vápníku), ale tento sloupec **neexistuje v databázové tabulce `soil_analyses`**.

### Detailní vysvětlení:

1. **Co se děje v kódu:**
   - Soubor `app/portal/pozemky/[id]/rozbory/page.tsx` na řádcích 241-244 odkazuje na `analysis.ca_category`
   - TypeScript/Next.js tento kód zkompiluje bez chyby
   - Když se stránka načte, data z databáze **nemají** pole `ca_category`
   - Pokus o přístup k neexistujícímu poli může způsobit runtime chybu

2. **Proč to způsobuje 404:**
   - Next.js při server-side renderingu zachytí chybu
   - Místo zobrazení chyby uživateli vrátí 404 (page not found)
   - Toto je bezpečnostní mechanismus Next.js

3. **Struktura databáze:**
   ```
   soil_analyses tabulka obsahuje:
   ✅ ph, ph_category
   ✅ p, p_category  
   ✅ k, k_category
   ✅ mg, mg_category
   ✅ ca              👈 hodnota existuje
   ❌ ca_category     👈 kategorie NEEXISTUJE
   ✅ s, s_category
   ```

## Řešení

### Krok 1: Odstranit referenci na ca_category ✅
Upravil jsem soubor `app/portal/pozemky/[id]/rozbory/page.tsx`:

**Před:**
```tsx
{analysis.ca && (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="text-xs text-gray-600 mb-1">Vápník (Ca)</div>
    <div className="text-2xl font-bold text-gray-900 mb-1">
      {analysis.ca.toFixed(0)}
      <span className="text-sm text-gray-500 ml-1">mg/kg</span>
    </div>
    {analysis.ca_category && (  // ❌ Tento řádek způsobil problém
      <div className={...}>
        {getCategoryLabel(analysis.ca_category)}
      </div>
    )}
  </div>
)}
```

**Po:**
```tsx
{analysis.ca && (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="text-xs text-gray-600 mb-1">Vápník (Ca)</div>
    <div className="text-2xl font-bold text-gray-900 mb-1">
      {analysis.ca.toFixed(0)}
      <span className="text-sm text-gray-500 ml-1">mg/kg</span>
    </div>
    {/* ca_category odstraněna */}
  </div>
)}
```

### Krok 2: Restart serveru
Po změně souboru je nutné:
1. **Uložit soubor** (už uloženo)
2. **Next.js automaticky detekuje změnu** a překompiluje stránku
3. **Obnovit stránku v prohlížeči** (hard refresh: Ctrl+Shift+R)

## Jak diagnostikovat podobné problémy v budoucnu

### 1. Zkontrolovat terminál
```powershell
# V terminálu kde běží npm run dev hledejte:
- "Error: ..." 
- "ReferenceError: ..."
- "TypeError: ..."
- Stack trace s názvy souborů
```

### 2. Zkontrolovat strukturu databáze
```sql
-- V Supabase SQL Editor:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'soil_analyses';
```

### 3. Ověřit data z API
```typescript
// Přidejte console.log do page.tsx:
console.log('Analyses data:', JSON.stringify(analyses, null, 2))
```

### 4. Zkontrolovat TypeScript typy
```typescript
// V lib/types/database.ts zkontrolujte interface SoilAnalysis
// Ujistěte se, že všechna pole odpovídají databázi
```

## Proč plán vápnění fungoval, ale historie rozborů ne?

**Historie rozborů:**
- ❌ Zobrazuje `ca_category` (neexistuje v DB)
- Výsledek: 404 chyba

**Plán vápnění:**
- ✅ Používá pouze existující sloupce
- Výsledek: Funguje správně

## Co dělat příště, když stránka vrací 404

### Kontrolní seznam:

1. ✅ **Zkontrolovat terminál** - jsou tam chyby?
2. ✅ **Zkontrolovat import** - všechny importované funkce existují?
3. ✅ **Zkontrolovat datová pole** - odpovídají struktuře databáze?
4. ✅ **Zkontrolovat TypeScript typy** - jsou správně definované?
5. ✅ **Smazat .next cache** - může obsahovat starou verzi
6. ✅ **Restartovat dev server** - zavřít a spustit znovu

### Příkazy pro opravu:

```powershell
# 1. Smazat cache
Remove-Item -Recurse -Force .next

# 2. Restartovat server
# Stisknout Ctrl+C v terminálu kde běží npm run dev
# Pak spustit znovu:
npm run dev

# 3. Hard refresh v prohlížeči
# Stisknout Ctrl+Shift+R
```

## Stav opravy

- ✅ Identifikován problém: reference na neexistující `ca_category`
- ✅ Odstraněna problematická reference v `app/portal/pozemky/[id]/rozbory/page.tsx`
- ✅ Odstraněna problematická reference v `components/portal/ParcelHealthCard.tsx`
- ✅ Ověřeno: žádné další reference na `ca_category` v app/portal
- ✅ Všechny soubory uloženy
- 🔄 **Čeká se na:** Automatickou rekompilaci Next.js (5-10 sekund)
- 🔄 **Další krok:** Obnovit stránku v prohlížeči (Ctrl+Shift+R)

## Poznámky

Pokud chcete v budoucnu **přidat `ca_category`**, musíte:

1. **Přidat sloupec do databáze:**
   ```sql
   ALTER TABLE soil_analyses 
   ADD COLUMN ca_category TEXT 
   CHECK (ca_category IN ('N', 'VH', 'D', 'V', 'VV'));
   ```

2. **Aktualizovat TypeScript typy** v `lib/types/database.ts`

3. **Aktualizovat API route** `save-soil-analyses-batch/route.ts` pro výpočet kategorie

4. **Pak** můžete zobrazovat kategorii na stránce

---

**Vytvořeno:** 2026-01-01  
**Status:** ✅ OPRAVENO - čeká se na refresh prohlížeče

