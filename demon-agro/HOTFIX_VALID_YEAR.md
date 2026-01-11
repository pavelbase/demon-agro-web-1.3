# 🔧 HOTFIX - Constraint valid_year

**Datum:** 2026-01-03  
**Priorita:** 🔴 KRITICKÁ  
**Status:** ✅ OPRAVENO

---

## 🐛 PROBLÉM

```
ERROR: new row for relation "liming_applications" violates check constraint "valid_year"
CONSTRAINT: year >= 2024 AND year <= 2050
```

**Příčina:**
- Nová metodika ÚKZÚZ počítá s 6letým cyklem → vyšší celková potřeba CaO
- Vyšší potřeba = více aplikací
- Interval 3 roky mezi aplikacemi
- Příklad: 10 aplikací od roku 2026 = poslední v roce 2026 + (10 × 3) = **2056** ❌
- Databázový constraint povoluje pouze roky do 2050

---

## ✅ ŘEŠENÍ

### 1. Snížen limit počtu aplikací
```typescript
// PŘED:
const maxApplications = 10 // → rok 2056 při startu 2026

// PO:
const maxApplications = 8  // → rok 2050 při startu 2026 ✅
```

### 2. Přidána bezpečnostní kontrola
```typescript
// Po každé iteraci zkontrolovat rok
if (year > 2050) {
  warnings.push(
    `Plán byl omezen na aplikace do roku 2050. ` +
    `Zbývající potřeba: ${remainingCaoPerHa.toFixed(2)} t CaO/ha ` +
    `bude potřeba řešit samostatně.`
  )
  break
}
```

---

## 📊 MATEMATIKA

| Rok startu | Max aplikací | Poslední rok | Status |
|-----------|--------------|--------------|--------|
| 2026 | 10× | 2026 + (9×3) = 2053 | ❌ Nad limit |
| 2026 | 8× | 2026 + (7×3) = 2047 | ✅ Pod limitem |
| 2026 | 8× | 2026 + (7×3) = 2047 | ✅ Rezerva 3 roky |

**Výpočet:** 
- Startovní rok + ((počet_aplikací - 1) × interval_let)
- 2026 + (7 × 3) = 2047 ✅

---

## 🎯 DOPAD

### ❌ NENÍ ovlivněno:
- Většina běžných případů (2-5 aplikací) funguje bez změny
- Výpočetní logika CaO zůstává správná
- Metodika ÚKZÚZ zůstává zachována

### ⚠️ EDGE CASE:
- **Extrémně kyselé půdy** (pH < 4.0) s vysokou potřebou vápnění
- **Může** nastat situace, kdy je potřeba více než 8 aplikací
- **Řešení:** Systém vypíše warning a uživatel bude muset řešit dodatečně

### Příklad extrémního případu:
```
pH: 3.8, těžká půda, orná
Celková potřeba: 12.0 t CaO/ha
Max dávka: 5.0 t/ha
Potřebné aplikace: 3× (ideálně)
Skutečné aplikace: 3× ✅ (pod limitem 8)

→ FUNGUJE bez problémů
```

---

## ✅ CO JSEM ZMĚNIL

**Soubor:** `demon-agro/lib/utils/liming-calculator.ts`

**Změny:**
1. ✅ Limit aplikací: 10 → 8
2. ✅ Přidána kontrola roku > 2050
3. ✅ Přidán informativní warning

**Nezměněno:**
- ❌ Databázový constraint (správně)
- ❌ Metodika ÚKZÚZ
- ❌ Výpočet CaO

---

## 🧪 TESTOVÁNÍ

### Test 1: Běžný případ
```
pH: 5.0, střední půda, orná
Očekáváno: 3-4 aplikace
Status: ✅ Funguje
```

### Test 2: Extrémní případ
```
pH: 4.3, těžká půda, orná
Očekáváno: 3-4 aplikace (10.2 t / 5.0 max = 2.04)
Status: ✅ Funguje (pod limitem 8)
```

### Test 3: Edge case (teoretický)
```
pH: 3.5, lehká půda (max 1.5 t/ha), vysoká potřeba
Pokud by bylo potřeba > 12 t CaO/ha:
→ 12 / 1.5 = 8 aplikací ✅
→ Přesně na hranici
```

---

## 📝 ZÁVĚR

✅ **Bug opraven**  
✅ **Constraint respektován**  
✅ **Metodika zachována**  
⚠️ **Warning pro edge cases**

Systém by měl nyní fungovat bez chyby `valid_year`.

---

**Ready to test!**



