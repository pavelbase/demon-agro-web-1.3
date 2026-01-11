# 📐 METODIKA CÍLOVÉHO pH PRO VÁPNĚNÍ

**Verze:** 2.0 (opraveno 2026-01-03)  
**Zdroj:** Česká agronomická praxe

---

## ✅ SPRÁVNÁ METODIKA

Cílové pH se určuje na základě **DVOU proměnných**:
1. **Kultura** (Orná půda vs. TTP)
2. **Typ půdy** (Lehká / Střední / Těžká)

### 📊 Tabulka cílových hodnot pH

| Kultura | Lehká (L) | Střední (S) | Těžká (T) |
|---------|-----------|-------------|-----------|
| **Orná půda** | 5.8 - 6.0 | 6.2 - 6.5 | 6.5 - 6.8 |
| **TTP** | 5.5 | 5.5 - 6.0 | 6.0 |

### 🎯 Použité střední hodnoty v aplikaci

Pro automatický výpočet používáme **střed rozsahu**:

```typescript
function getTargetPh(landUse: 'orna' | 'ttp', soilType: 'L' | 'S' | 'T'): number {
  if (landUse === 'orna') {
    // Orná půda
    if (soilType === 'L') return 5.9  // střed z 5.8-6.0
    if (soilType === 'S') return 6.35 // střed z 6.2-6.5
    if (soilType === 'T') return 6.65 // střed z 6.5-6.8
  } else {
    // TTP (travní porost)
    if (soilType === 'L') return 5.5  // 5.5
    if (soilType === 'S') return 5.75 // střed z 5.5-6.0
    if (soilType === 'T') return 6.0  // 6.0
  }
  return 6.5 // Fallback
}
```

---

## ❌ CHYBA, KTEROU JSME OPRAVILI

### Původní špatný kód:

```typescript
// ❌ ŠPATNĚ - ignorovalo kulturu
targetPh: latestAnalysis?.soil_type === 'L' ? 6.0 : 
           latestAnalysis?.soil_type === 'S' ? 6.5 : 6.8
```

**Problém:** Zohledňoval pouze typ půdy, ne kulturu!

### Opravený kód:

```typescript
// ✅ SPRÁVNĚ - zohledňuje kulturu I typ půdy
const getTargetPh = (landUse: 'orna' | 'ttp', soilType: SoilType): number => {
  // ... viz tabulka výše
}
```

---

## 📖 Agronomické zdůvodnění

### Proč záleží na typu půdy?

1. **Lehké půdy (L)** - písčité
   - Nižší pufrační kapacita
   - Rychlejší změna pH
   - **Nižší cílové pH** (5.8-6.0 pro ornou)
   - Důvod: Prevence převápnění

2. **Střední půdy (S)** - hlinité
   - Střední pufrační kapacita
   - **Střední cílové pH** (6.2-6.5 pro ornou)
   - Nejběžnější v ČR

3. **Těžké půdy (T)** - jílovité
   - Vysoká pufrační kapacita
   - Pomalá změna pH
   - **Vyšší cílové pH** (6.5-6.8 pro ornou)
   - Důvod: Kompenzace vysoké pufrační kapacity

### Proč záleží na kultuře?

1. **Orná půda**
   - Náročnější plodiny (obilniny, řepka, kukuřice)
   - Vyžadují **vyšší pH** (6.0-6.8)
   - Důvod: Optimální dostupnost živin, zejména P, K, Mg

2. **TTP (Trvalý travní porost)**
   - Méně náročný na pH
   - Vyžadují **nižší pH** (5.5-6.0)
   - Důvod: Některé travní druhy preferují kyselejší prostředí

---

## 🔧 Implementace v kódu

### Soubor: `components/portal/LimingPlanGenerator.tsx`

**Funkce:**
- ✅ Automatický výpočet cílového pH při načtení
- ✅ Dynamická aktualizace při změně kultury
- ✅ Dynamická aktualizace při změně typu půdy
- ✅ Zobrazení doporučeného rozsahu v UI

**UI nápověda:**
```
Doporučeno: Orná 6.2-6.5 (pro střední půdu)
Doporučeno: TTP 5.5-6.0 (pro střední půdu)
```

---

## ✅ Příklady

### Příklad 1: Orná půda, střední typ
- **Vstup:** Kultura = Orná, Typ půdy = S
- **Cílové pH:** 6.35 (střed z 6.2-6.5)

### Příklad 2: TTP, lehký typ
- **Vstup:** Kultura = TTP, Typ půdy = L
- **Cílové pH:** 5.5

### Příklad 3: Orná půda, těžký typ
- **Vstup:** Kultura = Orná, Typ půdy = T
- **Cílové pH:** 6.65 (střed z 6.5-6.8)

---

## 📚 Zdroje

- Ústav zemědělské a potravinářské informace (ÚZEI)
- Metodika agrochemického zkoušení ČZU Praha
- Vyhl. č. 275/1998 Sb., o agrochemickém zkoušení

---

**Status:** ✅ IMPLEMENTOVÁNO  
**Testováno:** Čeká na uživatelské ověření  
**Verze:** 2.0 (2026-01-03)



