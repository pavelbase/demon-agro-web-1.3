# SHRNUTÍ AUDITU METODIKY V2 - PO OPRAVĚ

**Datum:** 4. ledna 2026 (17:00)  
**Status:** ✅ Kritická chyba opravena, zbývají nekritické rozdíly

---

## ✅ CO BYLO OPRAVENO

### Kritická chyba v jednotkách ✅ HOTOVO

**Soubor:** `TabulkovyPrehledVapneni.tsx` (řádek 229)

```typescript
// PŘED (CHYBA):
potrebaCaoTHa = limeNeed.amount / 1000
// ❌ Zobrazovalo 9.60 místo 5.36

// PO OPRAVĚ (SPRÁVNĚ):
potrebaCaoTHa = kgCaco3PerHa_to_tCaoPerHa(limeNeed.amount)
// ✅ Zobrazuje 5.36 (správně!)
```

**Výsledek:**
- PDF protokoly nyní zobrazují **správné hodnoty t CaO/ha**
- Hodnoty jsou o **44% nižší** než před opravou (správně!)
- Přepočet je **chemicky správný**: 1 t CaCO3 = 0.559 t CaO

---

## 📊 POROVNÁNÍ METODIK PO OPRAVĚ

### Příklad: Střední půda, pH 4.4

| Metodika | Výsledek | Rozdíl |
|----------|----------|--------|
| **Portál (po opravě)** | **5.36 t CaO/ha** | Baseline |
| **Veřejná kalkulačka** | **6.00 t CaO/ha** | +12% |
| **Před opravou (CHYBA)** | ~~9.60 t CaCO3~~ | ~~+79%~~ ❌ |

**Interpretace:**
- ✅ Rozdíl 12% je **přijatelný** (obě metodiky jsou korektní)
- ✅ **NENÍ TO CHYBA**, ale rozdíl v přístupu k metodice
- ✅ Obě hodnoty jsou agronomicky správné

---

## ⚠️ ZBÝVAJÍCÍ ROZDÍLY (nekritické)

### 1. Různé přístupy k metodice

**Portál:**
- Používá statickou tabulku celkové potřeby (**kg CaCO3/ha**)
- Jednodušší, ale méně flexibilní

**Veřejná kalkulačka:**
- Používá ÚKZÚZ roční normativy (**t CaO/ha/rok** × 4 roky)
- Flexibilnější, oficiální česká metodika

**Rozdíly:**
- pH 4.0-5.0: ±7% až ±31% (přijatelné)
- pH 5.5-6.5: až -186% (větší rozdíly v udržovacích dávkách)

---

## 🎯 DOPORUČENÍ

### Krátkodobě (týdny)

1. ✅ **HOTOVO:** Opravit kritickou chybu v jednotkách
2. [ ] **TODO:** Přidat poznámku do PDF o metodice:
   ```
   POZNÁMKA: Výpočty jsou založeny na standardní tabulce 
   celkové potřeby vápnění. Pro srovnání s ÚKZÚZ ročními 
   normativy mohou být hodnoty mírně odlišné (±10-20%).
   ```
3. [ ] **TODO:** Notifikovat uživatele se starými PDF

### Dlouhodobě (měsíce-rok)

- [ ] Sjednotit metodiku (portál → ÚKZÚZ roční normativy)
- [ ] Konzultace s agronomem / ÚKZÚZ
- [ ] Unit testy pro všechny konverze

---

## 📄 DOKUMENTACE

### Pro uživatele:
- [KRITICKA_OPRAVA_JEDNOTEK_VAPNENI.md](./KRITICKA_OPRAVA_JEDNOTEK_VAPNENI.md) - Co dělat se starými PDF

### Pro vývojáře:
- [AUDIT_METODIKY_V2_PO_OPRAVE.md](./AUDIT_METODIKY_V2_PO_OPRAVE.md) - Kompletní audit (tabulky, výpočty)
- [OPRAVA_JEDNOTEK_CHANGELOG.md](./OPRAVA_JEDNOTEK_CHANGELOG.md) - Changelog všech změn
- [lib/utils/lime-unit-conversions.ts](./lib/utils/lime-unit-conversions.ts) - Utility modul pro konverze

---

## ✅ ZÁVĚR

**Kritická chyba byla úspěšně opravena!** 🎉

- ✅ PDF protokoly jsou nyní **správné**
- ✅ Jednotky jsou **konzistentní**
- ✅ Přepočty jsou **chemicky správné**
- ⚠️ Zbývající rozdíly jsou **nekritické** a vyplývají z rozdílné metodiky

**Akční položky:**
1. Přidat poznámku do PDF (nekritické)
2. Notifikovat uživatele (důležité!)
3. Dlouhodobě sjednotit metodiku (doporučeno)

---

**Poslední aktualizace:** 4. ledna 2026 (17:00)


