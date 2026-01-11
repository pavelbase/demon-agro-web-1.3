# ✅ Vylepšení stránky Historie rozborů

## Implementované funkce:

### 1. ✅ Přidána živina Síra (S)
Síra se nyní zobrazuje v historii rozborů společně s ostatními živinami.

### 2. ✅ Automatický aritmetický průměr
Když se na pozemku nachází více rozborů ze **stejného data**, systém automaticky:
- Seskupí rozbory podle data
- Vypočítá aritmetický průměr hodnot všech živin:
  - pH
  - Fosfor (P)
  - Draslík (K)
  - Hořčík (Mg)
  - Vápník (Ca)
  - Síra (S)
  - Poměr K:Mg
- Zobrazí počet vzorků (např. "2 vzorky (průměr)")
- V poznámkách uvede: "Aritmetický průměr z X rozborů"

## Příklad z vaší databáze:

**Pozemek 3803/9** má 2 rozbory z 31. prosince 2023:
- Rozbor 1: pH 7.2, P 68, K 290, Mg 206, Ca 3889, S 13.58
- Rozbor 2: pH 7.5, P 259, K 594, Mg 218, Ca 5801, S 35.49

**Zobrazený průměr:**
- pH: 7.35 = (7.2 + 7.5) / 2
- P: 163.5 = (68 + 259) / 2
- K: 442 = (290 + 594) / 2
- Mg: 212 = (206 + 218) / 2
- Ca: 4845 = (3889 + 5801) / 2
- S: 24.54 = (13.58 + 35.49) / 2

## Změny v kódu:

### Nová funkce `groupAndAverageAnalyses()`
Tato funkce:
1. Seskupí rozbory podle `analysis_date`
2. Pro každou skupinu vypočítá průměry všech živin
3. Vrátí pole seskupených a zprůměrovaných rozborů
4. Seřadí podle data (nejnovější první)

### Zobrazení:
- Při jednom vzorku: Standardní zobrazení
- Při více vzorcích: Badge "X vzorky (průměr)"
- Poznámka: "Aritmetický průměr z X rozborů"

## Zobrazené živiny:

Nyní se zobrazují všechny hlavní živiny:
1. **pH (CaCl₂)** - s kategorií (EK, SK, N, SZ, EZ)
2. **Fosfor (P)** - mg/kg - s kategorií (N, VH, D, V, VV)
3. **Draslík (K)** - mg/kg - s kategorií
4. **Hořčík (Mg)** - mg/kg - s kategorií
5. **Vápník (Ca)** - mg/kg - pokud je k dispozici
6. **Síra (S)** - mg/kg - pokud je k dispozici, s kategorií

## Technické detaily:

### Seskupování:
- Klíč seskupení: `analysis_date` (YYYY-MM-DD)
- Rozbory ze stejného dne = jedna skupina
- Rozbory z různých dnů = samostatné záznamy

### Výpočet průměru:
```typescript
průměr = suma(hodnoty) / počet_vzorků
```

### Kategorie:
- Pro průměrné hodnoty se používá kategorie z prvního vzorku
- V budoucnu lze implementovat přepočet kategorií na základě průměrných hodnot

## Soubory změněny:

1. **`app/portal/pozemky/[id]/rozbory/page.tsx`**
   - ✅ Přidána funkce `groupAndAverageAnalyses()`
   - ✅ Přidáno zobrazení Síry (S)
   - ✅ Přidán badge pro více vzorků
   - ✅ Změněno používání `analyses` → `groupedAnalyses`
   - ✅ Přidána informace o průměrování v Info Boxu

## Co se zobrazuje:

### V kartě rozboru:
```
Rozbor z 31. prosince 2023  [Aktuální] [2 vzorky (průměr)]

pH (CaCl₂)    Fosfor (P)      Draslík (K)     Hořčík (Mg)     Vápník (Ca)
7.35          163 mg/kg       442 mg/kg       212 mg/kg       4845 mg/kg
Neutrální     Velmi vysoký    Velmi vysoký    Velmi vysoký    

Síra (S)
24.54 mg/kg

Poznámky: Aritmetický průměr z 2 rozborů
```

## Testování:

1. ✅ Otestujte na pozemku 3803/9 - měli byste vidět průměr dvou vzorků
2. ✅ Ověřte zobrazení všech živin včetně síry
3. ✅ Zkontrolujte badge "2 vzorky (průměr)"

---

**Vytvořeno:** 2026-01-01  
**Status:** ✅ IMPLEMENTOVÁNO - čeká na test




