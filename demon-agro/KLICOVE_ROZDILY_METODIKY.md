# KLÍČOVÉ ROZDÍLY MEZI VEŘEJNOU KALKULAČKOU A PORTÁLEM

## 🚨 KRITICKÝ NÁLEZ

Veřejná kalkulačka (`/kalkulacka`) a portál (`/portal`) používají **RŮZNÉ METODIKY** pro výpočet potřeby vápnění, což vede k **odlišným doporučením** pro stejnou situaci.

---

## ⚠️ HLAVNÍ ROZDÍL: JEDNOTKY A HODNOTY VÁPNĚNÍ

### Veřejná kalkulačka
- **Jednotka:** t CaO/ha (tuny oxidu vápenatého)
- **Metodika:** ÚKZÚZ roční normativy × 4 roky
- **Příklad (střední půda, pH 5.5):** 0.70 × 4 = **2.8 t CaO/ha** = **5,012 kg CaCO3/ha**

### Portál
- **Jednotka:** kg CaCO3/ha (kilogramy uhličitanu vápenatého)
- **Metodika:** Celková potřeba podle tabulky
- **Příklad (střední půda, pH 5.5):** **3,000 kg CaCO3/ha**

### Rozdíl
- **+2,012 kg CaCO3/ha** (+67%)

---

## 📊 PŘÍKLADY ROZDÍLŮ

### Střední půda (S)

| pH  | Veřejná kalkulačka | Portál         | Rozdíl  |
|-----|--------------------|----------------|---------|
| 5.5 | 5,012 kg CaCO3/ha  | 3,000 kg/ha    | **+67%** |
| 6.0 | 2,864 kg CaCO3/ha  | 1,000 kg/ha    | **+186%** |
| 6.5 | 1,432 kg CaCO3/ha  | 0 kg/ha        | **+∞** |

---

## ✅ CO JE KONZISTENTNÍ

1. **Kategorizace živin** (P, K, Mg, Ca, S) - SHODNÉ
2. **Hodnocení zásobenosti** - SHODNÉ
3. **Výpočet deficitu** - SHODNÉ
4. **Poměr K:Mg** - SHODNÉ
5. **Cílové pH hodnoty** - SHODNÉ

---

## 🎯 DOPORUČENÍ

### 1. SJEDNOTIT METODIKU (KRITICKÉ!)
- Preferujeme **ÚKZÚZ metodiku** (t CaO/ha/rok) - používá veřejná kalkulačka
- Je oficiální česká metodika
- Lepší pro podmínky ČR

### 2. AKCE
1. Upravit `demon-agro/lib/utils/calculations.ts`
2. Nahradit tabulku kg CaCO3/ha tabulkou t CaO/ha/rok
3. Přidat přepočtové funkce mezi CaO a CaCO3
4. Vytvořit unit testy

---

## 📄 DETAILNÍ DOKUMENTACE

Viz: `AUDIT_METODIKY_VYPOCTU_ZIVIN.md`




