import { Article } from "./types";

export const defaultArticles: Article[] = [
  {
    id: "article-1",
    slug: "optimalni-ph-pudy-pro-dostupnost-zivin",
    nadpis: "Optimální pH půdy pro dostupnost živin",
    kategorie: "ziviny",
    perex: "pH půdy je jedním z nejdůležitějších faktorů ovlivňujících dostupnost živin pro rostliny. Optimální pH pro většinu polních plodin se pohybuje v rozmezí 6.0-7.0.",
    obrazek_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80",
    datum_publikace: new Date().toISOString(),
    cas_cteni: 8,
    publikovano: true,
    autor: "Démon agro",
    meta_description: "Zjistěte, jaké je optimální pH půdy pro dostupnost jednotlivých živin. Kompletní přehled s tabulkami a doporučeními pro zemědělce.",
    obsah: `## Úvod

pH půdy je jedním z nejdůležitějších faktorů, které ovlivňují dostupnost živin pro rostliny. Správné pH zajišťuje, že rostliny mohou efektivně přijímat živiny z půdy, což přímo ovlivňuje výnosy a kvalitu sklizně.

## Co je pH půdy?

pH půdy je míra kyselosti nebo zásaditosti půdního roztoku. Škála pH se pohybuje od 0 do 14:
- **pH < 7** = kyselá půda
- **pH = 7** = neutrální půda
- **pH > 7** = zásaditá půda

## Optimální pH pro polní plodiny

Většina polních plodin preferuje **mírně kyselé až neutrální pH v rozmezí 6.0-7.0**. V tomto rozmezí je dostupnost většiny živin optimální.

### Doporučené pH podle plodin

| Plodina | Optimální pH |
|---------|--------------|
| Pšenice ozimá | 6.0-7.5 |
| Ječmen | 6.5-7.5 |
| Řepka ozimá | 6.5-7.5 |
| Kukuřice | 6.0-7.0 |
| Brambory | 5.0-6.0 |
| Cukrovka | 6.5-7.5 |
| Vojtěška | 6.5-7.5 |

## Dostupnost makroživin podle pH

### Dusík (N)
- **Optimální pH: 6.0-8.0**
- Pod pH 5.5: snížená nitrifikace, akumulace amoniaku
- Nad pH 8.0: možné ztráty amoniakem do ovzduší

### Fosfor (P)
- **Optimální pH: 6.0-7.0**
- Pod pH 6.0: váže se na železo a hliník (nedostupný)
- Nad pH 7.5: váže se na vápník a hořčík (nedostupný)
- Fosfor je nejcitlivější na pH!

### Draslík (K)
- **Optimální pH: 6.0-7.5**
- Relativně dostupný v širokém rozmezí pH
- Problém v extrémně kyselých půdách (< 5.0)

## Dostupnost mikroživin podle pH

| Živina | Optimální pH | Poznámky |
|--------|--------------|----------|
| Železo (Fe) | 4.0-6.5 | Nad pH 7.0 prudce klesá dostupnost |
| Mangan (Mn) | 5.0-6.5 | Nad pH 7.5 nedostupný |
| Zinek (Zn) | 5.0-7.0 | Nad pH 7.5 vázaný |
| Měď (Cu) | 5.0-7.0 | Relativně stabilní |
| Bor (B) | 5.0-7.0 | Nad pH 7.5 klesá dostupnost |
| Molybden (Mo) | 6.0-8.0 | Jediná živina s vyšší dostupností v zásaditých půdách |

## Důsledky nevhodného pH

### Kyselá půda (pH < 5.5):
- ❌ Nízká dostupnost fosforu
- ❌ Nízká dostupnost vápníku a hořčíku
- ❌ Toxicita hliníku a manganu
- ❌ Špatná aktivita půdních mikroorganismů
- ❌ Nízká účinnost hnojení

### Zásaditá půda (pH > 7.5):
- ❌ Nízká dostupnost fosforu
- ❌ Nedostatek mikroživin (Fe, Mn, Zn)
- ❌ Chloróza rostlin
- ❌ Špatné využití dusíku

## Jak upravit pH půdy?

### Zvýšení pH (vápnění):
- **Vápenec mletý (CaCO₃)** - rychlý efekt
- **Dolomit (CaMg(CO₃)₂)** - přidává i hořčík
- **Pálené vápno (CaO)** - velmi rychlý, ale dražší
- Dávka: 2-6 t/ha podle aktuálního pH a cílového pH

### Snížení pH:
- **Elementární síra** - postupné okyselení
- **Síran amonný** - vedlejší efekt hnojení
- Dávka: 200-500 kg/ha síry

## Praktická doporučení

### 1. Pravidelná analýza
- Analyzujte pH každé 3-4 roky
- GPS mapování odhalí variabilitu v poli
- Různé části pole mohou mít různé pH

### 2. Variabilní aplikace
- Aplikujte vápno podle map variability
- Ušetříte náklady (nepřevápníte)
- Zvýšíte efektivitu (dostatečně vápníte)

### 3. Dlouhodobá strategie
- Vápnění je dlouhodobá investice
- Efekt trvá 4-6 let
- ROI: 5-10:1

## Závěr

Optimální pH půdy je klíčem k efektivnímu využití hnojiv a maximálním výnosům. Investice do vápnění se vrátí několikanásobně díky:
- Lepší dostupnosti živin
- Vyšším výnosům
- Lepší kvalitě produkce
- Nižším nákladům na hnojiva

**Potřebujete pomoc s pH managementem? [Kontaktujte nás](/kontakt) pro nezávaznou konzultaci!**
`
  }
];

export function getArticles(): Article[] {
  if (typeof window === 'undefined') return defaultArticles;
  
  const stored = localStorage.getItem('articles');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing articles:', e);
      return defaultArticles;
    }
  }
  return defaultArticles;
}

export function getPublishedArticles(): Article[] {
  return getArticles()
    .filter(a => a.publikovano)
    .sort((a, b) => new Date(b.datum_publikace).getTime() - new Date(a.datum_publikace).getTime());
}

export function getArticleBySlug(slug: string): Article | null {
  const articles = getArticles();
  return articles.find(a => a.slug === slug) || null;
}

export function getArticlesByCategory(category: string): Article[] {
  return getPublishedArticles().filter(a => a.kategorie === category);
}

export function saveArticles(articles: Article[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('articles', JSON.stringify(articles));
}

export function resetArticles(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('articles', JSON.stringify(defaultArticles));
}

// Utility: Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
