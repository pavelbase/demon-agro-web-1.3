import { PageContent, PageKey } from "./types";

export const defaultContent: Record<PageKey, PageContent> = {
  home: {
    hero_nadpis: "Komplexní řešení pro zdravou a výnosnou půdu",
    hero_podnadpis: "pH management, výživa půdy a GPS mapování pro zemědělce v severních a západních Čechách",
  },
  ph: {
    hero_nadpis: "pH půdy a vápnění",
    hero_podnadpis: "Optimalizace pH půdy pro maximální výnosy",
    problem_nadpis: "Problém nízkého pH",
    problem_obsah: "Více než 50% půdy v ČR má nevhodné pH. Kyselá půda snižuje dostupnost živin a může způsobit ztrátu výnosů až o 30%. Fosfor, draslík a vápník jsou v kyselé půdě málo dostupné.",
    dopad_nadpis: "Ekonomický dopad",
    dopad_obsah: "Neoptimální pH může znamenat ztráty 5 000-15 000 Kč na hektar ročně. ROI vápnění je 5-10:1, návratnost často do 1 roku.",
    reseni_nadpis: "Naše řešení",
    reseni_obsah: "GPS mapování variability pH, precizní vzorkování, výběr optimálního typu vápna a variabilní aplikace podle potřeb každé části pole.",
  },
  sira: {
    hero_nadpis: "Nedostatek síry",
    hero_podnadpis: "Síra - často opomíjená, ale klíčová živina",
    problem_nadpis: "Problém nedostatku síry",
    problem_obsah: "Síra je nezbytná pro tvorbu bílkovin a chlorofylu. Nedostatek se projevuje žloutnutím mladých listů a sníženou kvalitou produkce. Moderní odrůdy obilnin potřebují více síry.",
    dopad_nadpis: "Ekonomický dopad",
    dopad_obsah: "Nedostatek síry může snížit výnos až o 20%. Snížená kvalita zrna (nižší obsah bílkovin) znamená nižší cenu. Investice do síry se vrátí několikanásobně.",
    reseni_nadpis: "Naše řešení",
    reseni_obsah: "Analýza obsahu síry v půdě, výběr vhodné formy hnojiva (síran vs. elementární síra) a precizní aplikace podle potřeb jednotlivých částí pole.",
  },
  k: {
    hero_nadpis: "Nedostatek draslíku",
    hero_podnadpis: "Draslík pro odolnost a kvalitu",
    problem_nadpis: "Problém nedostatku draslíku",
    problem_obsah: "Draslík je klíčový pro odolnost proti suchu, mrazům a chorobám. Ovlivňuje kvalitu plodů a skladovatelnost. Nedostatek se projevuje hnědnutím okrajů listů.",
    dopad_nadpis: "Ekonomický dopad",
    dopad_obsah: "Nedostatek draslíku snižuje výnosy až o 25%. Rostliny jsou náchylnější k stresu a chorobám. Horší kvalita plodů znamená nižší tržní cenu.",
    reseni_nadpis: "Naše řešení",
    reseni_obsah: "Rozbor půdy, GPS mapování variability draslíku, výběr vhodné formy (chlorid vs. síran) a variabilní aplikace podle potřeb každé části pole.",
  },
  mg: {
    hero_nadpis: "Nedostatek hořčíku",
    hero_podnadpis: "Hořčík - základ fotosyntézy",
    problem_nadpis: "Problém nedostatku hořčíku",
    problem_obsah: "Hořčík je ústředním atomem chlorofylu. Nedostatek se projevuje mezižilkovým žloutnutím starších listů. Častý problém na lehkých půdách a při vysokých dávkách draslíku.",
    dopad_nadpis: "Ekonomický dopad",
    dopad_obsah: "Nedostatek hořčíku snižuje fotosyntézu a tím i výnosy. Může způsobit ztráty 10-20% výnosu. Špatná kvalita plodů (nižší obsah cukrů).",
    reseni_nadpis: "Naše řešení",
    reseni_obsah: "Analýza půdy včetně poměru Mg:K, výběr vhodné formy hořčíku (síran, oxid) a aplikace podle potřeb. Možnost foliární aplikace pro rychlou nápravu.",
  },
  analyza: {
    hero_nadpis: "Analýza půdy",
    hero_podnadpis: "Znalost půdy je základ úspěchu",
    problem_nadpis: "Proč analyzovat půdu?",
    problem_obsah: "Bez znalosti stavu půdy je hnojení jen střelbou naslepo. Každé pole je jiné, dokonce i jednotlivé části téhož pole se liší. GPS mapování odhalí variabilitu v poli.",
    dopad_nadpis: "Ekonomický přínos",
    dopad_obsah: "Přesné hnojení podle analýzy šetří náklady (nepřehnojujete) a zvyšuje výnosy (nepodhňojujete). ROI analýzy je 10:1 a více. Variabilní aplikace šetří až 30% hnojiv.",
    reseni_nadpis: "Naše služby",
    reseni_obsah: "Komplexní GPS mapování, odběr vzorků, laboratorní analýza pH a živin, vytvoření map variability a doporučení pro variabilní aplikaci. Vše od jednoho dodavatele.",
  },
  onas: {
    hero_nadpis: "O společnosti Démon agro",
    hero_podnadpis: "Moderní přístup k péči o půdu",
    kdo_jsme_nadpis: "Kdo jsme",
    kdo_jsme_text: "Démon agro je nová firma specializující se na komplexní pH management a výživu půdy pro zemědělce v severních a západních Čechách. Kombinujeme nejnovější GPS technologie s osobním přístupem ke každému zákazníkovi. Pomáháme zemědělcům optimalizovat pH půdy, řešit nedostatek živin a maximalizovat výnosy.",
    nase_mise_nadpis: "Naše mise",
    nase_mise_text: "Věříme, že zdravá půda je základem úspěšného zemědělství. Proto nabízíme komplexní řešení - od přesné analýzy přes doporučení až po aplikaci živin. Chceme být partnerem, který pomáhá zemědělcům dosahovat lepších výsledků prostřednictvím moderních technologií a odborného přístupu.",
    cta_nadpis: "Začněme spolupracovat",
    cta_text: "Kontaktujte nás pro nezávaznou konzultaci",
  },
};

export function getPageContent(page: PageKey): PageContent {
  if (typeof window === 'undefined') return defaultContent[page];
  
  const stored = localStorage.getItem(`content_${page}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing content for ${page}:`, e);
      return defaultContent[page];
    }
  }
  return defaultContent[page];
}

export function savePageContent(page: PageKey, content: PageContent): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`content_${page}`, JSON.stringify(content));
}

export function resetPageContent(page: PageKey): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`content_${page}`, JSON.stringify(defaultContent[page]));
}
