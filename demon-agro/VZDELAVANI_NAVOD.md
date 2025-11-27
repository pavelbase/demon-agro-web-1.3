# 📚 Návod - Vzdělávací sekce (Blog)

## 🎯 Účel

Vzdělávací sekce slouží k:
- ✅ Publikování odborných článků o pH půdy, vápnění, živinách
- ✅ SEO optimalizaci (přilákání zákazníků přes Google)
- ✅ Budování důvěry a odbornosti
- ✅ Sdílení výzkumů, tipů, best practices

---

## 🚀 Rychlý start

### Přístup k článkům:

**Veřejné stránky:**
- Seznam článků: `http://localhost:3000/vzdelavani`
- Detail článku: `http://localhost:3000/vzdelavani/nazev-clanku`

**Admin panel:**
- `http://localhost:3000/admin` → Záložka **"Vzdělávací články"**
- Heslo: `demonagro2024`

---

## ✍️ Jak přidat nový článek

### Postup:

1. **Admin panel** → záložka **"Vzdělávací články"**

2. **Klikněte "Přidat článek"**

3. **Vyplňte formulář:**

   **Nadpis:**
   ```
   Optimální pH půdy pro dostupnost živin
   ```

   **Slug (auto-generuje se):**
   ```
   optimalni-ph-pudy-pro-dostupnost-zivin
   ```
   *(můžete upravit ručně)*

   **Kategorie:**
   - pH půdy
   - Vápnění
   - Živiny
   - Výzkumy
   - Tipy pro zemědělce

   **Perex (max 200 znaků):**
   ```
   pH půdy je jedním z nejdůležitějších faktorů ovlivňujících 
   dostupnost živin pro rostliny...
   ```

   **Obrázek:**
   - Nahrajte fotku (drag & drop)
   - nebo zadejte URL

   **Obsah článku (Markdown):**
   ```markdown
   ## Úvod
   
   pH půdy je klíčový faktor...
   
   ## Optimální pH pro plodiny
   
   | Plodina | Optimální pH |
   |---------|--------------|
   | Pšenice | 6.0-7.5 |
   | Ječmen  | 6.5-7.5 |
   
   ### Důležité body
   
   - První bod
   - Druhý bod
   - Třetí bod
   ```

   **Datum publikace:**
   - Default: dnes
   - Můžete změnit

   **Čas čtení:**
   - Minuty (např. 5, 8, 10)

   **Meta description (SEO):**
   ```
   Zjistěte, jaké je optimální pH půdy pro dostupnost 
   jednotlivých živin. Kompletní přehled s tabulkami.
   ```

   **Publikovat:**
   - ☑️ Zaškrtnuto = publikuje se na web
   - ☐ Nezaškrtnuto = uloží se jako koncept

4. **Klikněte "Uložit a publikovat"** nebo **"Uložit koncept"**

5. **Hotovo!** Článek je na webu: `/vzdelavani/slug`

---

## 📝 Markdown syntaxe

### Nadpisy:

```markdown
## Hlavní nadpis (H2)
### Podnadpis (H3)
```

### Text:

```markdown
**Tučný text**
*Kurzíva*
[Odkaz](https://example.com)
```

### Seznamy:

```markdown
- Položka 1
- Položka 2
- Položka 3

1. Číslovaná 1
2. Číslovaná 2
```

### Tabulky:

```markdown
| Sloupec 1 | Sloupec 2 | Sloupec 3 |
|-----------|-----------|-----------|
| Hodnota A | Hodnota B | Hodnota C |
| Hodnota D | Hodnota E | Hodnota F |
```

**Výsledek:**
- Zelený header
- Střídavé řádky (zebra striping)
- Hover efekt
- Responzivní (scroll na mobilu)

### Citace:

```markdown
> Toto je citace nebo důležitá poznámka
```

### Oddělovač:

```markdown
---
```

---

## 🎨 Styly a formátování

### Automatické styly článku:

- **H2 nadpisy:** Velké, tučné, zelinkavé
- **H3 nadpisy:** Střední, tučné
- **Odstavce:** Čitelné, velkorysé řádkování
- **Tabulky:** Zelený header, zebra striping
- **Seznamy:** Bullets, číslované
- **Odkazy:** Zelené, podtržené, hover efekt
- **Obrázky:** Rounded rohy, stín

### Tabulky - příklad výsledku:

```
┌──────────────────────────────────────┐
│ Zelený header                        │
├──────────────────────────────────────┤
│ Bílý řádek                           │
│ Šedý řádek (střídavě)                │
│ Bílý řádek                           │
└──────────────────────────────────────┘
```

---

## 🔍 Filtry kategorií

Na stránce `/vzdelavani` jsou **filtry**:

- **Všechny** - zobrazí všechny publikované články
- **pH půdy** - jen články o pH
- **Vápnění** - jen články o vápnění
- **Živiny** - jen články o živinách
- **Výzkumy** - výzkumné články
- **Tipy** - praktické tipy

**Barevné odlišení:**
- pH půdy: 🟢 Zelená
- Vápnění: 🔵 Modrá
- Živiny: 🟡 Žlutá
- Výzkumy: 🟣 Fialová
- Tipy: 🟠 Oranžová

---

## 📊 Správa článků v Admin panelu

### Přehled článků:

**Tabulka zobrazuje:**
- Nadpis
- Kategorie
- Datum publikace
- Status (Publikováno / Koncept)
- Akce (Upravit, Smazat)

### Akce:

**Upravit (✏️):**
- Otevře formulář s článkem
- Můžete změnit cokoliv
- Uložit změny

**Smazat (🗑️):**
- Smaže článek permanentně
- Potvrzení před smazáním

**Toggle publikování:**
- Klikněte na status badge
- Přepne mezi "Publikováno" ↔ "Koncept"
- Publikované = viditelné na webu
- Koncept = skryté, pracovní verze

**Obnovit výchozí:**
- Tlačítko nahoře
- Obnoví vzorový článek
- POZOR: Smaže všechny vaše články!

---

## 🎯 Vzorový článek

**Předinstalovaný článek:**
- **Nadpis:** "Optimální pH půdy pro dostupnost živin"
- **Kategorie:** Živiny
- **Obsah:** Kompletní článek s:
  - Úvod
  - Tabulky optimálního pH pro plodiny
  - Tabulky dostupnosti makro a mikroživin
  - Praktická doporučení
  - Závěr s CTA
- **Délka:** ~8 minut čtení

**Použijte ho jako šablonu** pro další články!

---

## 📐 Struktura článku (doporučená)

### Dobrý článek obsahuje:

1. **Úvod** (1-2 odstavce)
   - O čem článek je
   - Proč je důležitý

2. **Hlavní obsah** (rozdělený do sekcí)
   - H2 nadpisy pro hlavní sekce
   - H3 pro podsekce
   - Tabulky pro data
   - Seznamy pro přehlednost

3. **Praktická doporučení**
   - Konkrétní tipy
   - Číslované kroky

4. **Závěr + CTA**
   - Shrnutí
   - Odkaz na kontakt nebo produkty

### Ideální délka:
- **Krátký článek:** 3-5 minut čtení (~600-1000 slov)
- **Střední článek:** 6-10 minut (~1200-2000 slov)
- **Dlouhý článek:** 10+ minut (~2000+ slov)

---

## 🔗 URL struktura

### Automatické slug:

**Z nadpisu:**
```
"Optimální pH půdy pro dostupnost živin"
```

**Vytvoří slug:**
```
optimalni-ph-pudy-pro-dostupnost-zivin
```

**URL článku:**
```
https://demonagro.cz/vzdelavani/optimalni-ph-pudy-pro-dostupnost-zivin
```

### Pravidla slug:
- Malá písmena
- Bez diakritiky (ě→e, č→c)
- Mezery → pomlčky
- Bez speciálních znaků
- Pouze: a-z, 0-9, pomlčka

---

## 📸 Obrázky v článcích

### Hlavní obrázek:
- Zobrazí se v seznamu článků
- Zobrazí se v hero detailu článku
- Doporučeno: **1200×630 px** (Open Graph formát)

### Obrázky v obsahu:
Markdown:
```markdown
![Popis obrázku](https://example.com/image.jpg)
```

Nebo HTML:
```html
<img src="/images/graf.jpg" alt="Graf dostupnosti živin" />
```

**Tip:** Nahrajte obrázky přes admin panel (Správa obrázků), pak použijte jejich URL.

---

## 🔍 SEO Optimalizace

### Meta tags (automatické):

**Title:**
```
[Nadpis článku] | Démon agro
```

**Description:**
```
[Meta description z formuláře]
```

**Open Graph:**
- og:title
- og:description
- og:image
- og:type: article

### Doporučení pro SEO:

1. **Nadpis:**
   - 50-60 znaků
   - Obsahuje klíčové slovo
   - Čitelný, lákavý

2. **Meta description:**
   - 150-160 znaků
   - Shrnutí článku
   - Call to action

3. **URL (slug):**
   - Krátké, výstižné
   - Obsahuje klíčové slovo
   - Bez stop slov (a, v, na, pro)

4. **Obsah:**
   - Min 600 slov
   - Používejte H2, H3 nadpisy
   - Interní odkazy na ostatní stránky
   - Externí odkazy na zdroje

---

## 💡 Tipy pro psaní článků

### ✅ Dobré praktiky:

1. **Začněte problémem čtenáře**
   ```
   "Máte nízké výnosy? Může to být způsobeno..."
   ```

2. **Používejte konkrétní čísla**
   ```
   "Optimální pH 6.0-7.0"
   "ROI 5-10:1"
   "Zvýšení výnosu až o 30%"
   ```

3. **Přidejte tabulky a seznamy**
   - Přehlednější než text
   - Snadné skenování

4. **Ukončete CTA**
   ```markdown
   **Potřebujete pomoc? [Kontaktujte nás](/kontakt)!**
   ```

5. **Interní odkazy**
   ```markdown
   Více o [vápnění naleznete zde](/ph-pudy).
   ```

### ❌ Čemu se vyhnout:

- Příliš technický jazyk bez vysvětlení
- Dlouhé odstavce (max 4-5 řádků)
- Články bez struktury (používejte nadpisy!)
- Clickbait nadpisy

---

## 📋 Kategorie článků

### **pH půdy** (kategorie: "ph")
Témata:
- Měření pH
- Interpretace výsledků
- pH pro různé plodiny
- Vliv pH na půdní život

### **Vápnění** (kategorie: "vapneni")
Témata:
- Typy vápen
- Dávkování
- Aplikace
- Ekonomika vápnění
- Variabilní aplikace

### **Živiny** (kategorie: "ziviny")
Témata:
- NPK živiny
- Mikroživiny
- Dostupnost živin
- Hnojení podle potřeby

### **Výzkumy** (kategorie: "vyzkumy")
Témata:
- Vědecké studie
- Polní pokusy
- Nové technologie
- Data a statistiky

### **Tipy pro zemědělce** (kategorie: "tipy")
Témata:
- Praktické návody
- Best practices
- Časté chyby
- Sezónní tipy

---

## 🎨 Příklady článků (inspirace)

### Článek 1: "Jak správně odebrat vzorek půdy?"
```markdown
## Úvod
Správný odběr vzorku je základ přesné analýzy...

## Kdy odebírat vzorky
- Na podzim po sklizni
- Na jaře před hnojením
- Každé 3-4 roky

## Postup odběru
1. Rozdělte pole na homogenní části
2. Odeberte 15-20 dílčích vzorků
3. Smíchejte do jednoho vzorku
...
```

### Článek 2: "Top 5 chyb při vápnění"
```markdown
## Chyba #1: Vápnění bez analýzy
Mnoho zemědělců vápní "od oka"...

## Chyba #2: Špatný typ vápna
Ne každé vápno je stejné...
...
```

### Článek 3: "Kalkulace dávky vápna"
```markdown
## Jak vypočítat potřebnou dávku

### Vzorec:
Dávka = (cílové pH - aktuální pH) × pufrovací kapacita

### Příklad:
- Aktuální pH: 5.5
- Cílové pH: 6.5
...
```

---

## 📊 Zobrazení na webu

### Seznam článků (/vzdelavani):

**Layout:**
- Grid 3 sloupce (desktop)
- 1 sloupec (mobil)
- Nejnovější nahoře

**Card obsahuje:**
- Obrázek (aspect-video)
- Barevný badge kategorie
- Nadpis článku
- Perex (3 řádky max)
- Datum publikace
- Čas čtení
- Tlačítko "Číst více →"

**Hover efekt:**
- Shadow zvětšení
- Scale 105%
- Smooth transition

### Detail článku (/vzdelavani/[slug]):

**Layout:**
- Hero s obrázkem + overlay
- Breadcrumbs navigace
- Článek v max šířce 800px (čitelnost)
- Formátovaný Markdown obsah
- Navigace předchozí/další článek
- CTA sekce na konci

---

## 🚀 Publikování vs Koncepty

### **Publikováno** (✅):
- Viditelné na webu
- V seznamu článků
- Indexované Googlem
- Sdílitelné

### **Koncept** (📝):
- Skryté před veřejností
- Jen v admin panelu
- Můžete pracovat na článku
- Publikujete, až bude hotový

### Změna statusu:
- V admin tabulce klikněte na badge
- Okamžitě přepne stav
- Refresh webu a článek se zobrazí/skryje

---

## 🎓 SEO Best Practices

### 1. **Klíčová slova:**
Používejte v:
- Nadpisu článku
- Prvním odstavci
- H2, H3 nadpisech
- Meta description
- URL (slug)

Příklady:
- "pH půdy"
- "vápnění"
- "analýza půdy"
- "hnojení"
- "výnosy"

### 2. **Interní linking:**
Odkazujte na jiné stránky webu:
```markdown
Více o [pH půdy a vápnění](/ph-pudy).
Nabízíme [analýzu půdy](/analyza).
[Kontaktujte nás](/kontakt) pro konzultaci.
```

### 3. **Externí odkazy:**
Odkazujte na věrohodné zdroje:
```markdown
Podle [studie ÚKZÚZ](https://example.com)...
```

### 4. **Délka článku:**
- Min 600 slov (dobrá SEO)
- Ideál 1000-2000 slov
- Google preferuje delší, kvalitní obsah

### 5. **Struktura:**
- Použijte H2, H3 nadpisy (SEO důležité)
- Krátké odstavce (4-5 řádků max)
- Tabulky a seznamy (skenování)

---

## 📱 Responzivní design

### Desktop:
- 3 sloupce článků
- Široké tabulky
- Velké obrázky

### Tablet:
- 2 sloupce článků
- Tabulky scrollovatelné

### Mobil:
- 1 sloupec článků
- Tabulky scrollovatelné horizontálně
- Touch-friendly buttony

---

## 🔄 Workflow

### Příprava článku:

1. **Research** - zjistěte téma, data
2. **Outline** - naplánujte strukturu
3. **Draft** - napište v Markdownu
4. **Review** - zkontrolujte faktáž
5. **Images** - přidejte obrázky
6. **SEO** - meta description, slug
7. **Preview** - zkontrolujte na webu
8. **Publish** - publikujte!

### Editace existujícího:

1. Admin → Vzdělávací články
2. Najděte článek
3. Klikněte ✏️ Upravit
4. Změňte co potřebujete
5. Uložit

### Skrytí článku:

1. Klikněte na status "Publikováno"
2. Změní se na "Koncept"
3. Článek zmizí z webu
4. Zůstane v admin panelu

---

## 📈 Měření úspěšnosti

### Co sledovat:

- **Návštěvnost:** Google Analytics
- **Čas na stránce:** Delší = lepší obsah
- **Bounce rate:** Nižší = relevantnější
- **Konverze:** Klikli na kontakt?

### Google Search Console:
- Které články přivádějí návštěvníky
- Jaké klíčové slova fungují
- Pozice ve vyhledávání

---

## 💾 Databáze

### Uložení:
- **localStorage** (prohlížeč)
- Klíč: `articles`
- Formát: JSON

### Backup článků:

**Export:** (přidat do admin panelu později)
```javascript
const backup = localStorage.getItem('articles');
// Uložte do souboru
```

**Import:**
```javascript
localStorage.setItem('articles', backupData);
```

---

## 🚀 Produkční nasazení

### Před nasazením:

- [ ] Vytvořte alespoň 3-5 článků
- [ ] Zkontrolujte Markdown formátování
- [ ] Přidejte meta descriptions
- [ ] Optimalizujte obrázky (< 500 KB)
- [ ] Otestujte na mobilu
- [ ] Interní odkazy fungují

### Po nasazení:

- [ ] Přidejte do Google Search Console
- [ ] Submitněte sitemap
- [ ] Sdílejte na sociálních sítích
- [ ] Email newsletter
- [ ] Pravidelně publikujte (1-2 články/měsíc)

---

## 📚 Nápady na další články

### pH půdy série:
1. "Jak správně měřit pH půdy?"
2. "Interpretace výsledků analýzy pH"
3. "pH a půdní mikroorganismy"
4. "Vliv pH na strukturu půdy"

### Vápnění série:
1. "Typy vápen a jejich vlastnosti"
2. "Kalkulace dávky vápna"
3. "Variabilní aplikace vápna"
4. "Ekonomika vápnění - ROI kalkulace"

### Živiny série:
1. "Dusík - formy a dostupnost"
2. "Fosfor - klíč k energii rostlin"
3. "Draslík - odolnost proti stresu"
4. "Mikroživiny - malé množství, velký význam"

### Praktické tipy:
1. "10 tipů pro zdravou půdu"
2. "Chyby při hnojení a jak se jim vyhnout"
3. "Sezónní plán péče o půdu"
4. "Jak číst rozbor půdy?"

---

## 🆘 Řešení problémů

### Článek se nezobrazuje:

**Zkontrolujte:**
- [ ] Je publikován? (zelený badge)
- [ ] Má vyplněný slug?
- [ ] URL je správná: `/vzdelavani/slug`
- [ ] Refresh cache (Ctrl+Shift+R)

### Markdown se neformátuje:

**Zkontrolujte:**
- [ ] Jsou nainstalované závislosti? (`npm install`)
- [ ] Syntax je správná?
- [ ] Prázdné řádky mezi sekcemi?

### Tabulka vypadá špatně:

**Zkontrolujte:**
- [ ] Správný počet `|` na každém řádku
- [ ] Druhý řádek má `---` oddělovač
- [ ] Stejný počet sloupců všude

**Správná syntax:**
```markdown
| A | B |
|---|---|
| 1 | 2 |
```

---

## 📞 Podpora

- 📧 Email: base@demonagro.cz
- 📞 Telefon: +420 731 734 907

---

**Úspěšné psaní! 🎉**
