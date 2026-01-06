# 📚 UŽIVATELSKÁ PŘÍRUČKA: Plán vápnění

## Co je plán vápnění?

Vícedetý plán, který vám automaticky navrhne **kdy, kolik a jakým produktem** vápnit vaše pole pro dosažení optimálního pH půdy.

---

## 🎯 Proč vápnit?

### Výhody správného pH:
- ✅ **Lepší využití hnojiv** - Živiny lépe dostupné při správném pH
- ✅ **Vyšší výnosy** - Až o 15-20% vyšší úroda
- ✅ **Zdravější půda** - Lepší mikrobiální aktivita
- ✅ **Menší spotřeba hnojiv** - Úspora až 30%
- ✅ **Odolnější rostliny** - Menší náchylnost k chorobám

### Optimální pH pro různé plodiny:

| Plodina | Optimální pH |
|---------|--------------|
| Pšenice ozimá | 6.5 - 7.0 |
| Ječmen jarní | 6.5 - 7.5 |
| Kukuřice | 6.0 - 7.0 |
| Řepka ozimá | 6.5 - 7.5 |
| TTP (louky) | 5.5 - 6.5 |

---

## 📋 Jak na to? (Krok za krokem)

### Krok 1: Máte půdní rozbor?

#### ANO - Skvělé! 🎉
1. Nahrajte rozbor v sekci **"Rozbory půdy"**
2. Systém automaticky načte hodnoty pH a Mg
3. Přejděte na **"Plán vápnění"**

#### NE - Nevadí! 📝
1. Přejděte přímo na **"Plán vápnění"**
2. Vyplňte hodnoty ručně (odhad nebo z minulého rozboru)
3. **Doporučujeme:** Co nejdříve si nechat udělat rozbor pro přesnější výsledky

---

### Krok 2: Generování plánu

1. **Otevřete pozemek** - Klikněte na pozemek ze seznamu
2. **Přejděte na "Plán vápnění"** - V horním menu
3. **Zkontrolujte hodnoty:**
   - ✓ Aktuální pH (z rozboru nebo zadejte)
   - ✓ Cílové pH (automaticky dle půdy)
   - ✓ Typ půdy (L/S/T)
   - ✓ Využití (orná půda / TTP)
   - ✓ Hořčík (Mg)
4. **Klikněte "Vygenerovat plán"** 🚀

---

### Krok 3: Pochopení výsledků

Systém vám ukáže tabulku s aplikacemi:

```
┌──────┬─────────┬─────────────────┬──────────┬──────────────┐
│ Rok  │ Období  │ Produkt         │ Dávka    │ pH změna     │
├──────┼─────────┼─────────────────┼──────────┼──────────────┤
│ 2026 │ Podzim  │ Dolomit mletý   │ 3.5 t/ha │ 5.0 → 5.4    │
│ 2029 │ Podzim  │ Dolomit mletý   │ 3.0 t/ha │ 5.4 → 5.9    │
│ 2032 │ Podzim  │ Vápenec mletý   │ 2.5 t/ha │ 5.9 → 6.5    │
└──────┴─────────┴─────────────────┴──────────┴──────────────┘
```

#### Co jednotlivé sloupce znamenají:

- **Rok** - Kdy aplikovat (interval 3 roky)
- **Období** - Jaro nebo podzim (podzim je lepší)
- **Produkt** - Jaký typ vápna použít
- **Dávka** - Kolik produktu na hektar
- **pH změna** - Jak se změní pH po aplikaci

---

### Krok 4: Úprava plánu (volitelné)

Můžete upravit jednotlivé aplikace:

1. **Klikněte na ikonu tužky** ✏️ u aplikace
2. **Upravte:**
   - Rok (např. posunout na 2027)
   - Období (změnit podzim → jaro)
   - Dávku (zvýšit/snížit)
3. **Uložte změny** 💾

---

### Krok 5: Export do Excelu

Pro tisk nebo sdílení:

1. **Klikněte "Exportovat do Excelu"** 📊
2. **Stáhne se soubor** s 3 listy:
   - **Souhrn** - Celková potřeba CaO
   - **Časový plán** - Všechny aplikace
   - **Upozornění** - Důležité poznámky

---

## 🌾 Praktické rady

### Kdy vápnit?

| ✅ DOPORUČENO | ❌ NEDOPORUČENO |
|---------------|-----------------|
| Podzim (září-říjen) | V zimě |
| Jaro (únor-březen) | Na zmrzlou půdu |
| Po sklizni | Těsně před setím |
| Suchá půda | Mokrá půda |

### Jak aplikovat?

1. **Rovnoměrně rozhodit** - Použijte rozmetač vápna
2. **Zapravit do půdy** - Kultivace nebo podmítka (5-10 cm)
3. **Ideálně před deštěm** - Pomůže s rozpuštěním

### Kontrola efektu

- **Po 1 roce:** Kontrolní rozbor pH
- **Po 3 letech:** Další rozbor + nová dávka
- **Sledujte:** Výnosy, zdraví rostlin

---

## 🧮 Jak se to počítá?

### 1. Určení potřeby vápna

Systém použije **oficiální tabulky ČZU Praha**:

| pH    | Lehká (L) | Střední (S) | Těžká (T) |
|-------|-----------|-------------|-----------|
| < 4.5 | 2.5 t/ha  | 5.0 t/ha    | 6.5 t/ha  |
| 5.0   | 1.5 t/ha  | 3.5 t/ha    | 4.2 t/ha  |
| 5.5   | 1.0 t/ha  | 2.5 t/ha    | 3.3 t/ha  |
| 6.0   | 0 t/ha    | 1.5 t/ha    | 2.0 t/ha  |

*Hodnoty v t Ca/ha, systém automaticky převede na CaO*

### 2. Rozložení na více let

- **Max. dávka najednou:**
  - Lehká půda: 1.5 t CaO/ha
  - Střední půda: 3.0 t CaO/ha
  - Těžká půda: 3.5 t CaO/ha
- **Interval:** 3 roky mezi aplikacemi

### 3. Výběr produktu

- **Mg < 80 mg/kg** → Dolomit (obsahuje Mg)
- **Mg 80-105 mg/kg** → Dolomit doporučen
- **Mg > 105 mg/kg** → Vápenec (čistý)

---

## ❓ Často kladené otázky (FAQ)

### Proč systém doporučil dolomit?

Máte **nízký obsah hořčíku (Mg)** v půdě. Dolomit obsahuje jak vápník (Ca), tak hořčík (Mg), což vyřeší oba problémy najednou.

### Můžu vápnit vše najednou?

**Ne!** Příliš vysoká dávka najednou může:
- Zablokovat příjem jiných živin (Fe, Mn, Zn)
- Prudce změnit pH → stres pro rostliny
- Být méně efektivní (část vápna "propadne")

Proto systém rozdělí do **více aplikací s intervalem 3 roky**.

### Kolik to bude stát?

**Příklad výpočet (10 ha, střední půda, pH 5.0 → 6.5):**

```
Celková potřeba: 35 t CaO
= cca 67 t dolomitu (30% CaO)

Náklady:
- Dolomit: 67 t × 300 Kč/t = 20 100 Kč
- Aplikace: 10 ha × 400 Kč/ha = 4 000 Kč
- Rozbory (3x): 3 × 800 Kč = 2 400 Kč
-----------------------------------------
CELKEM: 26 500 Kč

Ale rozloženo do 9 let (3 aplikace po 3 letech)
= cca 3 000 Kč/rok
```

**Návratnost:** Zvýšení výnosu o 15% = 6-12 měsíců

### Jak často kontrolovat pH?

- **Po aplikaci:** 1 rok (ověření efektu)
- **Běžně:** Každé 4 roky
- **Intenzivní hnojení:** Každé 2-3 roky

### Co když se pH nezmění?

Možné příčiny:
- ⏳ **Příliš brzy** - Počkejte alespoň 6 měsíců
- 💧 **Příliš mnoho srážek** - Vápno se "vyplavilo"
- 🌾 **Vysoká pufrační kapacita** - Těžká půda, potřeba více dávek
- ❌ **Špatná aplikace** - Nebyl zapravený do půdy

➡️ Kontaktujte našeho agronoma pro radu.

---

## 🔔 Upozornění systému

Systém vás může varovat:

### ⚠️ "Kriticky nízké Mg - dolomit NUTNÝ"
**Co to znamená:** Mg < 80 mg/kg  
**Co dělat:** Použijte pouze dolomit (ne vápenec)

### ⚠️ "Doporučeny kontrolní rozbory"
**Co to znamená:** Plán má více aplikací  
**Co dělat:** Udělejte rozbor 1 rok po každé aplikaci

### ⚠️ "Plán nedosahuje cílového pH"
**Co to znamená:** Cílové pH je příliš vysoké  
**Co dělat:** Snižte cílové pH nebo přidejte více aplikací

---

## 📞 Potřebujete poradit?

### Kontakty:

**Agronomické dotazy:**  
📧 Email: agronom@demon-agro.cz  
📱 Telefon: +420 XXX XXX XXX  
⏰ Po-Pá: 8:00 - 16:00

**Technická podpora:**  
📧 Email: support@demon-agro.cz  
💬 Chat: V aplikaci (pravý dolní roh)

**Návody a videa:**  
🌐 https://demon-agro.cz/napoveda

---

## 📖 Další zdroje

- [Metodika ČZU Praha](https://czu.cz)
- [ÚKZÚZ - Agrochemické zkoušení](https://ukzuz.cz)
- [Blog Démon Agro - Články o vápnění](https://demon-agro.cz/blog)

---

**Vytvořeno:** Démon Agro Team  
**Datum:** Leden 2026  
**Verze:** 1.0


