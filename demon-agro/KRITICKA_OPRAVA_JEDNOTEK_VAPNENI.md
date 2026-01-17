# ⚠️ KRITICKÁ OPRAVA JEDNOTEK VÁPNĚNÍ

**Datum:** 4. ledna 2026  
**Verze:** 1.0  
**Severity:** CRITICAL 🔴

---

## 🚨 SHRNUTÍ PROBLÉMU

V PDF protokolech doporučení vápnění vygenerovaných **před 4. 1. 2026** byla nalezena **kritická chyba v jednotkách**, která vedla k **nadhodnoceným doporučením vápnění o 79%**.

---

## 📋 CO SE STALO?

### Technický popis chyby

**Soubor:** `demon-agro/components/portal/TabulkovyPrehledVapneni.tsx`  
**Řádek:** 225

```typescript
// CHYBNÝ KÓD (před opravou):
potrebaCaoTHa = limeNeed.amount / 1000 // převod z kg na tuny
// ❌ limeNeed.amount je v kg CaCO3/ha
// ❌ Výsledek se zobrazil jako "CaO (t/ha)" bez konverze
```

**Důsledek:**
- Funkce `calculateLimeNeed()` vrací hodnoty v **kg CaCO3/ha** (uhličitan vápenatý)
- Tyto hodnoty se vydělily 1000 → **t CaCO3/ha**
- Ale v PDF se natiskly jako **"CaO (t/ha)"** (oxid vápenatý) **BEZ KONVERZE**

### Chemický přepočet

**1 t CaCO3 = 0.559 t CaO**  
**1 t CaO = 1.79 t CaCO3**

---

## 📊 PŘÍKLAD DOPADŮ

### Střední půda, pH 4.4 (z vašeho PDF)

| | Chybný PDF | Správná hodnota | Rozdíl |
|---|------------|-----------------|--------|
| **Zobrazeno** | 9.60 t CaO/ha | - | - |
| **Ve skutečnosti bylo** | 9.60 t CaCO3/ha | - | - |
| **Mělo být zobrazeno** | **5.36 t CaO/ha** | ✅ | **-79%** |

**Pro pozemek 10 ha:**
- Chybné PDF: 96 t CaO
- Správně: **54 t CaO**
- **Nadbytek: 42 tuny CaO** 💰💀

---

## ✅ CO BYLO OPRAVENO?

**Opravený kód:**

```typescript
// SPRÁVNÝ KÓD (po opravě):
potrebaCaoTHa = (limeNeed.amount / 1000) * 0.559
// ✅ Převod z kg CaCO3/ha na t CaO/ha
// ✅ Koeficient 0.559 = správná chemická konverze
```

**Datum opravy:** 4. ledna 2026  
**Verze portálu:** 1.3+  
**Status:** ✅ OPRAVENO

---

## 🎯 CO DĚLAT, POKUD MÁTE STARÝ PDF?

### Pokud jste PDF **ještě nepoužili**:

1. **STÁHNĚTE NOVÝ PDF** z portálu (po 4.1.2026)
2. Nový PDF obsahuje **správné hodnoty**
3. Starý PDF **ZNIČTE** nebo označte jako NEPLATNÝ

### Pokud jste podle PDF **už objednali vápno**:

**Přepočítejte hodnoty ručně:**

```
Správná potřeba CaO (t/ha) = Hodnota z PDF × 0.559
```

**Příklad:**
- PDF ukazuje: 9.60 t CaO/ha
- Správně: 9.60 × 0.559 = **5.36 t CaO/ha**

### Pokud jste vápno **už aplikovali**:

1. **NEKONČTE!** Není to smrtelné pro půdu, ale není ideální
2. Předávkování vápnem může způsobit:
   - Nadměrné zvýšení pH (může překročit optimum)
   - Deficit mikroelementů (Fe, Mn, Zn, Cu) - rostliny mohou žloutnout
   - Zablokování příjmu fosforu
3. **Doporučení:**
   - Provést kontrolní rozbor půdy za 3-6 měsíců
   - Sledovat barvu listů (žloutnutí = chloróza)
   - Pokud pH > 7.5: Může být potřeba kyselá hnojiva nebo sirné látky
   - Případně doplnit chelátované mikroelementy

---

## 📞 KONTAKT

Pokud máte dotazy nebo potřebujete pomoc s přepočtem, kontaktujte:

**Démon Agro**  
Email: [váš email]  
Tel: [váš telefon]

---

## 📝 TECHNICKÉ DETAILY PRO VÝVOJÁŘE

### Nalezené chyby

1. **Hlavní chyba:** `TabulkovyPrehledVapneni.tsx:225`
   - Chyběl přepočet z CaCO3 na CaO (× 0.559)

2. **Souvisejících chyb:** Kontrola proběhla v:
   - ✅ `liming-calculator.ts` - používá správnou metodiku ÚKZÚZ (t CaO/ha/rok)
   - ✅ `liming-pdf-export.ts` - pouze zobrazuje data z props
   - ❌ `TabulkovyPrehledVapneni.tsx` - zde byla chyba

### Doporučená opatření

1. **Unit testy** - Vytvořit testy pro konverze jednotek:
   ```typescript
   expect(caco3ToCao(1790)).toBe(1000)
   expect(caoToCaco3(1000)).toBe(1790)
   ```

2. **Type safety** - Uvážit použití branded types:
   ```typescript
   type CaO_kg = number & { __brand: 'CaO_kg' }
   type CaCO3_kg = number & { __brand: 'CaCO3_kg' }
   ```

3. **Dokumentace** - Jasně označovat jednotky v názvech proměnných:
   ```typescript
   const limingNeed_kgCaCO3: number = ...
   const limingNeed_tCaO: number = limingNeed_kgCaCO3 * 0.000559
   ```

---

## 📚 SOUVISEJÍCÍ DOKUMENTY

- [AUDIT_METODIKY_VYPOCTU_ZIVIN.md](./AUDIT_METODIKY_VYPOCTU_ZIVIN.md) - Kompletní audit metodiky
- [KLICOVE_ROZDILY_METODIKY.md](./KLICOVE_ROZDILY_METODIKY.md) - Stručné shrnutí rozdílů

---

**Konec dokumentu**

Datum poslední aktualizace: 4. ledna 2026




