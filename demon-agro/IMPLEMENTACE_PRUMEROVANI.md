# ✅ KOMPLETNÍ IMPLEMENTACE - Průměrování rozborů

## Implementováno:

### 1. ✅ Historie rozborů
- **Průměr se zobrazuje** jako hlavní hodnota
- **Badge "X vzorky (průměr)"** když je více vzorků
- **Rozbalovací sekce** pro zobrazení jednotlivých vzorků
- **Živina Síra (S)** přidána do zobrazení
- **Poznámka** "Aritmetický průměr z X rozborů"

### 2. ✅ Zdravotní karta půdy
- **Používá průměrované hodnoty** z nejnovějšího data
- Pokud existuje více rozborů ze stejného dne, zobrazuje průměr

### 3. ✅ Detail pozemku  
- **Používá průměrované hodnoty** v hlavním zobrazení
- ParcelHealthCard dostává průměrované data

## Nové soubory:

### `/lib/utils/soil-analysis-helpers.ts`
Sdílená utility funkce `groupAndAverageAnalyses()`:
- Seskupuje rozbory podle data
- Vypočítává aritmetické průměry všech živin
- Uchovává originální rozbory pro rozbalení
- Seřazuje od nejnovějších

### `/components/portal/IndividualSamples.tsx`
Klientská komponenta pro rozbalování jednotlivých vzorků:
- Zobrazí tlačítko "Zobrazit jednotlivé vzorky (X)"
- Po kliknutí rozbalí všechny vzorky
- Každý vzorek má své hodnoty a kategorie

## Upravené soubory:

### 1. `app/portal/pozemky/[id]/rozbory/page.tsx`
- ✅ Import `groupAndAverageAnalyses` z utils
- ✅ Import `IndividualSamples` komponenty
- ✅ Přidána živina S (síra)
- ✅ Zobrazení rozbalovací sekce s jednotlivými vzorky

### 2. `app/portal/pozemky/[id]/page.tsx`
- ✅ Import `groupAndAverageAnalyses`
- ✅ Aplikace průměrování na `latestAnalysis`

### 3. `components/portal/ParcelHealthCard.tsx`
- ✅ Akceptuje typ `GroupedAnalysis | SoilAnalysis | null`
- ✅ Funguje s průměrovanými daty

## Jak to funguje:

### Příklad: Pozemek 3803/9 (2 vzorky z 31.12.2023)

**Databáze obsahuje:**
```
Vzorek 1: pH 7.2, P 68, K 290, Mg 206, Ca 3889, S 13.58
Vzorek 2: pH 7.5, P 259, K 594, Mg 218, Ca 5801, S 35.49
```

**Zobrazený průměr:**
```
pH: 7.35 = (7.2 + 7.5) / 2
P: 163.5 mg/kg = (68 + 259) / 2
K: 442 mg/kg = (290 + 594) / 2
Mg: 212 mg/kg = (206 + 218) / 2
Ca: 4845 mg/kg = (3889 + 5801) / 2
S: 24.54 mg/kg = (13.58 + 35.49) / 2
```

**UI zobrazí:**
- Hlavní karta: Průměrné hodnoty
- Badge: "2 vzorky (průměr)"
- Tlačítko: "Zobrazit jednotlivé vzorky (2)"
- Po rozbalení: Oba originální vzorky s jejich hodnotami

## Kde se průměrování aplikuje:

### ✅ Historie rozborů (`/portal/pozemky/[id]/rozbory`)
- Průměr + jednotlivé vzorky rozbalitelně

### ✅ Detail pozemku (`/portal/pozemky/[id]`)
- Hlavní zobrazení používá průměr z nejnovějšího data
- Zdravotní karta půdy zobrazuje průměrné hodnoty

### ✅ Dashboard (`/portal/dashboard`)
- Už dříve používal `analyses[0]`, teď dostane průměr (automaticky, protože detail pozemku posílá průměr)

## Metodika (AZZP):

Podle AZZP metodiky:
> "Jeden průměrný vzorek se v bramborářské a horské výrobní oblasti odebírá z výměry 7 ha, v řepařské a kukuričné z 10 ha. Průměrný půdní vzorek se skládá minimálně ze 30 dílčích vpichů."

Když je odebráno více vzorků z jednoho pozemku ve stejný den:
1. Každý vzorek se analyzuje samostatně
2. **Výsledky se zprůměrují** - což jsme implementovali
3. Průměr se používá pro plánování hnojení a vápnění

## Testování:

1. ✅ Otevřete pozemek 3803/9 (nebo jiný s více vzorky)
2. ✅ **Detail pozemku:** Měli byste vidět průměrné hodnoty v Zdravotní kartě
3. ✅ **Historie rozborů:** Klikněte na "Historie rozborů"
   - Měli byste vidět badge "2 vzorky (průměr)"
   - Průměrné hodnoty ve hlavní kartě
   - Tlačítko "Zobrazit jednotlivé vzorky (2)"
   - Po kliknutí se rozbalí oba originální vzorky

## Poznámky:

- **Kategorie:** Momentálně se používá kategorie z prvního vzorku. V budoucnu lze implementovat přepočet kategorií na základě průměrných hodnot.
- **Síra (S):** Nyní se zobrazuje ve všech sekcích kde má hodnotu
- **Jednotlivé vzorky:** Zobrazují se pouze v historii rozborů (rozbalitelně), ne v hlavním detailu pozemku

---

**Vytvořeno:** 2026-01-01  
**Status:** ✅ KOMPLETNĚ IMPLEMENTOVÁNO - připraveno k testování




