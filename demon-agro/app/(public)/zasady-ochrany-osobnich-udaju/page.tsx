import ReactMarkdown from "react-markdown";

const PRIVACY_POLICY_TEXT = `# Zásady ochrany osobních údajů
**Poslední aktualizace:** 9. února 2025

## 1. Úvodní ustanovení
Tyto zásady ochrany osobních údajů popisují, jak společnost **Démon agro s.r.o.** shromažďuje, používá a chrání vaše osobní údaje v souladu s nařízením GDPR a českým zákonem č. 110/2019 Sb., o zpracování osobních údajů.

### Správce osobních údajů:
* **Název:** Démon agro s.r.o.
* **IČO:** 24477753
* **Sídlo:** Piletická 486, Věkoše, 503 41 Hradec Králové
* **Email:** [base@demonagro.cz](mailto:base@demonagro.cz)
* **Telefon:** +420 731 734 907

---

## 2. Jaké údaje shromažďujeme
* Jméno a příjmení
* E-mailová adresa a telefonní číslo
* IČO (u firemních zákazníků)
* Fakturační a kontaktní adresa
* **Zemědělská data:** Informace o vaší farmě a pozemcích (názvy, výměra, GPS souřadnice), půdní analýzy a agronomická data.
* **Technická data:** IP adresa a technické údaje o návštěvě webu.

---

## 3. Jak údaje využíváme
Vaše údaje využíváme výhradně pro:
1.  **Komunikaci** s vámi a poskytování našich služeb.
2.  **Zpracování objednávek** služeb půdní analýzy a vápnění.
3.  **Vytváření fertilizačních plánů** a agronomických doporučení.
4.  **Administrativu:** Vystavování faktur a vedení účetnictví.
5.  **Zlepšování webu:** Technický provoz a vývoj platformy.
6.  **Marketing:** Zasílání informací o službách (pouze s vaším výslovným souhlasem).

---

## 4. Právní základ zpracování
* **Plnění smlouvy:** Poskytování našich služeb.
* **Právní povinnost:** Fakturace, účetnictví, daňová evidence.
* **Oprávněný zájem:** Technický provoz webu, zlepšování služeb.
* **Souhlas:** Marketingová komunikace (můžete kdykoliv odvolat).

---

## 5. Předávání údajů třetím stranám
Vaše údaje můžeme sdílet s prověřenými partnery:
* **Techničtí poskytovatelé:** Hosting (Supabase, Vercel), e-mailové služby.
* **Obchodní partneři:** Laboratoře pro půdní rozbory, dodavatelé vápna.
* **Profesionální poradci:** Účetní a právní služby.

> **Upozornění:** Údaje nepředáváme mimo Evropskou unii. Všichni partneři jsou vázáni mlčenlivostí a dodržují GDPR.

---

## 6. Jak dlouho údaje uchováváme
* **Zákaznické údaje:** Po dobu trvání smluvního vztahu + 3 roky.
* **Fakturační údaje:** 10 let (dle zákonné povinnosti).
* **Marketing:** Do odvolání souhlasu nebo 3 roky od posledního kontaktu.
* **Technické logy:** 90 dní.

---

## 7. Vaše práva
Máte plné právo na:
* Přístup k osobním údajům a jejich opravu.
* Výmaz ("právo být zapomenut").
* Omezení zpracování nebo přenos údajů jinému poskytovateli.
* Vznesení námitky proti zpracování.
* Odvolání souhlasu (pokud byl udělen).

Pro uplatnění práv nás kontaktujte na **base@demonagro.cz**. Odpovíme vám nejpozději do 30 dnů.

---

## 8. Cookies
Používáme cookies pro technické fungování webu (přihlášení, zabezpečení) a analytiku návštěvnosti (pouze s vaším souhlasem). Cookies můžete spravovat v nastavení svého prohlížeče.

---

## 9. Zabezpečení údajů
Vaše data jsou v bezpečí díky:
* **Šifrování:** Přenos dat přes HTTPS.
* **Ochraně:** Bezpečné ukládání hesel a pravidelné zálohy.
* **Řízení přístupu:** Přístup mají pouze oprávněné osoby.

---

## 10. Automatizované zpracování
Pro analýzu půdních rozborů využíváme **umělou inteligenci**, která pomáhá vytvářet agronomická doporučení. Konečná rozhodnutí však vždy činíte vy nebo náš agronomický tým.

---

## 11. Stížnosti
Pokud máte pochybnosti o správnosti zpracování, můžete podat stížnost:
* **Úřad pro ochranu osobních údajů**
* Adresa: Pplk. Sochora 27, 170 00 Praha 7
* Web: [www.uoou.cz](https://www.uoou.cz)

---

## 12. Kontakt a změny
V případě dotazů nás kontaktujte na:
* **Email:** [base@demonagro.cz](mailto:base@demonagro.cz)
* **Adresa:** Piletická 486, Věkoše, 503 41 Hradec Králové

*Tyto zásady můžeme aktualizovat. O podstatných změnách vás budeme informovat e-mailem nebo oznámením na webu.*`;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Zásady ochrany osobních údajů
        </h1>
        
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 mt-8" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3 mt-6 text-[#4A7C59]" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-700 ml-4" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
              a: ({node, ...props}) => <a className="text-[#4A7C59] hover:underline" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#4A7C59] pl-4 italic my-4 text-gray-600" {...props} />,
            }}
          >
            {PRIVACY_POLICY_TEXT}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
