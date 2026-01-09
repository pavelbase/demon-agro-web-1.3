"use client";

import { useState } from "react";
import { KalkulackaInputs, TypPudy, VysledekKalkulace } from "@/lib/kalkulace-types";
import { vypocetKalkulace, ulozitKalkulaci, zkontrolujDuplicitniEmail } from "@/lib/kalkulace";
import { Calculator, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import TurnstileWidget from "@/components/TurnstileWidget";

// Sjednoceno s portálem - 3 typy půd podle české metodiky ÚKZÚZ
const TYPYPUDY = {
  'L': {
    nazev: 'Lehká (písčitá)',
    popis: 'Lehké půdy s nízkým obsahem jílu - sypké, snadno zpracovatelné',
    kategorie: 'L'
  },
  'S': {
    nazev: 'Střední (hlinitá)',
    popis: 'Střední půdy, nejběžnější typ v ČR - optimální struktura',
    kategorie: 'S'
  },
  'T': {
    nazev: 'Těžká (jílovitá)',
    popis: 'Těžké půdy s vysokým obsahem jílu - lepivé, náročné na zpracování',
    kategorie: 'T'
  }
};

export default function KalkulackaPage() {
  const [krok, setKrok] = useState(1);
  const [vysledek, setVysledek] = useState<VysledekKalkulace | null>(null);
  const [odesila, setOdesila] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<KalkulackaInputs>({
    typPudy: 'S', // Střední půda jako výchozí (nejběžnější)
    pH: 0,
    P: 0,
    K: 0,
    Mg: 0,
    Ca: 0,
    S: 0,
    jmeno: '',
    firma: '',
    email: '',
    telefon: '',
    souhlas: false
  });

  const [chyby, setChyby] = useState<Record<string, string>>({});

  const validovatKrok1 = (): boolean => {
    // Typ půdy je vždy vybraný
    return true;
  };

  const validovatKrok2 = (): boolean => {
    const novéChyby: Record<string, string> = {};
    
    if (formData.pH < 3.0 || formData.pH > 8.5) {
      novéChyby.pH = 'pH musí být mezi 3.0 a 8.5';
    }
    if (formData.P < 0 || formData.P > 500) {
      novéChyby.P = 'Hodnota musí být mezi 0 a 500 mg/kg';
    }
    if (formData.K < 0 || formData.K > 1000) {
      novéChyby.K = 'Hodnota musí být mezi 0 a 1000 mg/kg';
    }
    if (formData.Mg < 0 || formData.Mg > 800) {
      novéChyby.Mg = 'Hodnota musí být mezi 0 a 800 mg/kg';
    }
    if (formData.Ca < 0 || formData.Ca > 15000) {
      novéChyby.Ca = 'Hodnota musí být mezi 0 a 15000 mg/kg';
    }
    if (formData.S < 0 || formData.S > 100) {
      novéChyby.S = 'Hodnota musí být mezi 0 a 100 mg/kg';
    }
    
    setChyby(novéChyby);
    return Object.keys(novéChyby).length === 0;
  };

  const validovatKrok3 = async (): Promise<boolean> => {
    const novéChyby: Record<string, string> = {};
    
    if (formData.jmeno.length < 2) {
      novéChyby.jmeno = 'Zadejte jméno (min 2 znaky)';
    }
    
    // Důkladnější validace emailu
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(formData.email)) {
      novéChyby.email = 'Zadejte platnou emailovou adresu (např. jmeno@domena.cz)';
    }
    
    if (formData.telefon.length < 9) {
      novéChyby.telefon = 'Zadejte platné telefonní číslo';
    }
    
    // Checkbox 'souhlas' is now optional for marketing, so we don't validate it here.
    
    // Server-side kontrola použití kalkulačky (email + IP rate limiting)
    if (formData.email && emailRegex.test(formData.email)) {
      try {
        const response = await fetch('/api/calculator/check-usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();

        if (!data.allowed) {
          novéChyby.email = data.message;
        }
      } catch (error) {
        console.error('Error checking calculator usage:', error);
        // V případě chyby API necháme uživatele pokračovat (fail-open)
        // ale logujeme chybu pro monitoring
      }
    }
    
    // Fallback: lokální kontrola duplicitního emailu (pro případ výpadku API)
    if (formData.email && !novéChyby.email && zkontrolujDuplicitniEmail(formData.email)) {
      novéChyby.email = 'Na tento email již byl odeslán výsledek kalkulace. Pro další výpočty nás prosím kontaktujte přímo.';
    }
    
    setChyby(novéChyby);
    return Object.keys(novéChyby).length === 0;
  };

  const handleDalsi = () => {
    if (krok === 1 && validovatKrok1()) {
      setKrok(2);
    } else if (krok === 2 && validovatKrok2()) {
      setKrok(3);
    }
  };

  const handleVypocet = async () => {
    // Validace s async kontrolou
    const isValid = await validovatKrok3();
    if (!isValid) return;

    // Validace Turnstile tokenu (ochrana proti botům)
    if (!turnstileToken) {
      setChyby({ ...chyby, turnstile: "Prosím ověřte, že nejste robot" });
      return;
    }

    setOdesila(true);

    try {
      // Výpočet
      const vypocet = vypocetKalkulace(formData);
      
      // Uložení lokálně
      ulozitKalkulaci(vypocet);
      
      // Záznam použití do databáze (server-side tracking)
      try {
        await fetch('/api/calculator/record-usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            calculationData: {
              typPudy: vypocet.vstup.typPudy,
              pH: vypocet.vstup.pH,
              jmeno: formData.jmeno,
              firma: formData.firma,
              telefon: formData.telefon,
              marketing_consent: formData.souhlas,
            },
            // Ukládáme kompletní výsledky pro admin panel
            calculationResults: vypocet
          }),
        });
      } catch (recordError) {
        console.error('Error recording usage:', recordError);
        // Pokračujeme i při chybě záznamu
      }
      
      // Odeslání emailu přes EmailJS
      // Obaleno v try-catch, aby selhání emailu nezablokovalo zobrazení výsledků
      try {
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_CALCULATOR_TEMPLATE_ID || "template_grgltnp";
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !publicKey) {
          throw new Error('EmailJS není nakonfigurován');
        }

        // Sestavení nutrients_summary pro email
        const nutrients_summary = Object.entries(vypocet.ziviny)
          .map(([key, val]) => `${key}: ${val.aktualni} mg/kg (${val.tridaNazev})`)
          .join(", ");

        // EmailJS template params - POUZE pole, která jsou v template!
        // Template obsahuje: user_name, soil_type, ph_current, ph_target, cao_need, limestone_suggestion, nutrients_summary
        const templateParams = {
          user_name: formData.jmeno || '',
          soil_type: TYPYPUDY[vypocet.vstup.typPudy]?.nazev || 'Neznámá',
          ph_current: vypocet.vstup.pH?.toFixed(1) || '0',
          ph_target: vypocet.vapneni?.optimalniPhRozmezi || 'N/A',
          cao_need: vypocet.vapneni?.celkovaPotrebaCaO_t?.toFixed(1) || '0',
          limestone_suggestion: vypocet.vapneni?.prepocetyHnojiva?.mletyVapenec_t?.toFixed(1) || '0',
          nutrients_summary: nutrients_summary || 'Není k dispozici',
        };

        console.log("Email params:", templateParams);

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        alert("Výsledky odeslány na váš email");
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Pokračujeme i když email selže - výsledek se zobrazí
        alert("Výpočet byl dokončen, ale odeslání emailu selhalo. Výsledky si můžete prohlédnout níže.");
      }
      
      // Zobrazíme výsledek i když email selhal
      setVysledek(vypocet);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Došlo k chybě při zpracování kalkulace. Zkuste to prosím znovu.");
    } finally {
      setOdesila(false);
    }
  };

  const handleNovaKalkulace = () => {
    setKrok(1);
    setVysledek(null);
    setTurnstileToken(null); // Reset Turnstile
    setFormData({
      typPudy: 'S', // Střední půda jako výchozí
      pH: 0,
      P: 0,
      K: 0,
      Mg: 0,
      Ca: 0,
      S: 0,
      jmeno: '',
      firma: '',
      email: '',
      telefon: '',
      souhlas: false
    });
    setChyby({});
  };

  if (vysledek) {
    return <VysledekView vysledek={vysledek} onNova={handleNovaKalkulace} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Calculator className="w-16 h-16 text-[#4A7C59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Kalkulačka vápnění
          </h1>
          <p className="text-lg text-gray-600 mb-1">
            Metodika ÚKZÚZ (Mehlich 3) pro ornou půdu
          </p>
          <p className="text-sm text-gray-500">
            Výpočet potřeby vápnění a živin na 1 hektar
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${krok >= 1 ? 'text-[#4A7C59]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${krok >= 1 ? 'bg-[#4A7C59] text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 hidden sm:inline">Typ půdy</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${krok >= 2 ? 'text-[#4A7C59]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${krok >= 2 ? 'bg-[#4A7C59] text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 hidden sm:inline">Rozbor půdy</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${krok >= 3 ? 'text-[#4A7C59]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${krok >= 3 ? 'bg-[#4A7C59] text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 hidden sm:inline">Kontakt</span>
            </div>
          </div>
        </div>

        {/* Formulář */}
        <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
          {/* KROK 1 - TYP PŮDY */}
          {krok === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                KROK 1: Typ půdy
              </h2>

              <div className="space-y-4">
                {Object.entries(TYPYPUDY).map(([key, data]) => (
                  <label
                    key={key}
                    className={`flex items-start p-4 rounded-lg cursor-pointer transition-all ${
                      formData.typPudy === key
                        ? 'bg-green-50 ring-2 ring-[#4A7C59]'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={formData.typPudy === key}
                      onChange={() => setFormData({ ...formData, typPudy: key as TypPudy })}
                      className="w-5 h-5 text-[#4A7C59] focus:ring-[#4A7C59] mt-0.5"
                    />
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900">{data.nazev}</div>
                      <div className="text-sm text-gray-600">{data.popis}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  💡 <strong>Tip:</strong> Typ půdy zjistíte z rozboru nebo orientačně podle zpracovatelnosti:
                </p>
                <ul className="text-xs text-blue-800 ml-4 space-y-1">
                  <li>• <strong>Lehká (L):</strong> Sypká, snadno se zpracovává, rychle vysychá</li>
                  <li>• <strong>Střední (S):</strong> Optimální struktura, nejběžnější v ČR</li>
                  <li>• <strong>Těžká (T):</strong> Lepivá, náročná na zpracování, dobře drží vodu</li>
                </ul>
              </div>

              <button
                onClick={handleDalsi}
                className="w-full bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg"
              >
                Pokračovat →
              </button>
            </div>
          )}

          {/* KROK 2 - ROZBOR PŮDY */}
          {krok === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                KROK 2: Hodnoty z rozboru půdy
              </h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Hodnoty najdete ve výsledcích laboratorního rozboru půdy (AZZP nebo soukromá laboratoř).
                  Zadávejte hodnoty v <strong>mg/kg podle metody Mehlich 3</strong>.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  pH (CaCl₂) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pH || ''}
                  onChange={(e) => setFormData({ ...formData, pH: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                  placeholder="např. 5.5"
                />
                {chyby.pH && <p className="text-red-600 text-sm mt-1">{chyby.pH}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Fosfor (P) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.P || ''}
                    onChange={(e) => setFormData({ ...formData, P: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 45"
                  />
                  {chyby.P && <p className="text-red-600 text-sm mt-1">{chyby.P}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Draslík (K) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.K || ''}
                    onChange={(e) => setFormData({ ...formData, K: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 180"
                  />
                  {chyby.K && <p className="text-red-600 text-sm mt-1">{chyby.K}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Hořčík (Mg) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.Mg || ''}
                    onChange={(e) => setFormData({ ...formData, Mg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 150"
                  />
                  {chyby.Mg && <p className="text-red-600 text-sm mt-1">{chyby.Mg}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Vápník (Ca) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.Ca || ''}
                    onChange={(e) => setFormData({ ...formData, Ca: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 2500"
                  />
                  {chyby.Ca && <p className="text-red-600 text-sm mt-1">{chyby.Ca}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Síra (S) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.S || ''}
                    onChange={(e) => setFormData({ ...formData, S: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 18"
                  />
                  {chyby.S && <p className="text-red-600 text-sm mt-1">{chyby.S}</p>}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setKrok(1)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg"
                >
                  ← Zpět
                </button>
                <button
                  onClick={handleDalsi}
                  className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg"
                >
                  Pokračovat →
                </button>
              </div>
            </div>
          )}

          {/* KROK 3 - KONTAKT */}
          {krok === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                KROK 3: Kontaktní údaje
              </h2>

              <p className="text-gray-600">
                Pro zaslání výsledku kalkulace vyplňte prosím kontaktní údaje.
              </p>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Jméno *
                </label>
                <input
                  type="text"
                  value={formData.jmeno}
                  onChange={(e) => setFormData({ ...formData, jmeno: e.target.value })}
                  className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                  placeholder="Jan Novák"
                />
                {chyby.jmeno && <p className="text-red-600 text-sm mt-1">{chyby.jmeno}</p>}
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Firma (nepovinné)
                </label>
                <input
                  type="text"
                  value={formData.firma || ''}
                  onChange={(e) => setFormData({ ...formData, firma: e.target.value })}
                  className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                  placeholder="Farma s.r.o."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                  placeholder="jan.novak@example.com"
                />
                {chyby.email && <p className="text-red-600 text-sm mt-1">{chyby.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                  placeholder="+420 123 456 789"
                />
                {chyby.telefon && <p className="text-red-600 text-sm mt-1">{chyby.telefon}</p>}
              </div>

              <div>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.souhlas}
                    onChange={(e) => setFormData({ ...formData, souhlas: e.target.checked })}
                    className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59] mt-1 rounded border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Chci odebírat novinky a tipy pro efektivní zemědělství.
                  </span>
                </label>
              </div>

              {/* Turnstile CAPTCHA (ochrana proti botům) */}
              <div>
                <TurnstileWidget
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setChyby({ ...chyby, turnstile: "" });
                  }}
                  onError={() => {
                    setTurnstileToken(null);
                    setChyby({ ...chyby, turnstile: "Ověření selhalo, zkuste to znovu" });
                  }}
                />
                {chyby.turnstile && (
                  <p className="text-red-600 text-sm mt-2 text-center">{chyby.turnstile}</p>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => setKrok(2)}
                  className="w-full md:flex-1 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg"
                  disabled={odesila}
                >
                  ← Zpět
                </button>
                <button
                  onClick={handleVypocet}
                  disabled={odesila}
                  className="w-full md:flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg disabled:opacity-50"
                >
                  {odesila ? 'Zpracovávám...' : 'Vypočítat →'}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Vaše údaje zpracováváme pro účely výpočtu kalkulace a zaslání nabídky. Více informací v{' '}
                <Link
                  href="/zasady-ochrany-osobnich-udaju"
                  target="_blank"
                  className="underline hover:text-gray-700"
                >
                  Zásadách ochrany osobních údajů
                </Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponenta pro zobrazení výsledků
function VysledekView({ vysledek, onNova }: { vysledek: VysledekKalkulace; onNova: () => void }) {
  // Ikony pro kategorie živin - sjednoceno s portálem
  const getIconForTrida = (trida: string) => {
    if (trida === 'nizky') return '🔴';
    if (trida === 'vyhovujici') return '⚠️';
    if (trida === 'dobry') return '✅';
    if (trida === 'vysoky') return '📊';
    if (trida === 'velmi_vysoky') return '📈';
    return '✅'; // výchozí
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Výsledek kalkulace
          </h1>
          <p className="text-lg text-gray-600">
            📧 Výsledek byl odeslán na váš email.
          </p>
        </div>

        {/* Vápnění */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 ORIENTAČNÍ POTŘEBA VÁPNĚNÍ
          </h2>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-700">pH třída:</span>
              <span className="font-semibold">
                {vysledek.vapneni.phTrida} ({vysledek.vapneni.phTridaNazev})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Aktuální pH:</span>
              <span className="font-semibold">{vysledek.vstup.pH}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Optimální pH:</span>
              <span className="font-semibold text-[#4A7C59]">{vysledek.vapneni.optimalniPhRozmezi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Doporučení:</span>
              <span className="text-sm text-gray-600">{vysledek.vapneni.phTridaPopis}</span>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-[#4A7C59]">
                {vysledek.vapneni.celkovaPotrebaCaO_t} t CaO/ha
              </div>
              <div className="text-sm text-gray-600">Celková potřeba pro nápravu deficitu (cca 4 roky)</div>
            </div>
          </div>

          {/* Smart Product Selection - Doporučení */}
          <div className={`p-4 rounded-lg mb-4 ${
            vysledek.vapneni.doporucenyProdukt === 'dolomit' 
              ? 'bg-amber-50 border-2 border-amber-300' 
              : 'bg-blue-50 border-2 border-blue-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {vysledek.vapneni.doporucenyProdukt === 'dolomit' ? '💎' : '🪨'}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">
                  ✅ Doporučujeme: {vysledek.vapneni.doporucenyProdukt === 'dolomit' ? 'Dolomitický vápenec' : 'Vápenec mletý'}
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {vysledek.vapneni.duvod}
                </p>
                <div className="text-2xl font-bold text-[#2D5016]">
                  {vysledek.vapneni.doporucenyProdukt === 'dolomit' 
                    ? `${vysledek.vapneni.prepocetyHnojiva.dolomit_t} t/ha`
                    : `${vysledek.vapneni.prepocetyHnojiva.vapenec_t} t/ha`
                  }
                </div>
                <div className="text-xs text-gray-600">
                  {vysledek.vapneni.doporucenyProdukt === 'dolomit' 
                    ? 'Dolomit (30% CaO + 18% MgO) - řeší pH i Mg'
                    : 'Vápenec (48% CaO) - pouze pH'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Alternativní varianta */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              📊 Alternativní varianta:
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-amber-700 mb-1">💎 Dolomit</div>
                <div className="text-xl font-bold text-gray-900">
                  {vysledek.vapneni.prepocetyHnojiva.dolomit_t} t/ha
                </div>
                <div className="text-xs text-gray-600">30% CaO + 18% MgO</div>
                <div className="text-xs text-gray-500 mt-1">Řeší pH + doplní Mg</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-blue-700 mb-1">🪨 Vápenec</div>
                <div className="text-xl font-bold text-gray-900">
                  {vysledek.vapneni.prepocetyHnojiva.vapenec_t} t/ha
                </div>
                <div className="text-xs text-gray-600">48% CaO</div>
                <div className="text-xs text-gray-500 mt-1">Pouze pH (bez Mg)</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="text-xs text-blue-900">
              <p className="font-semibold mb-1">ℹ️ Poznámka k výpočtu:</p>
              <p className="mb-2">
                Dávky jsou vypočítány s použitím <strong>ENV (Effective Neutralizing Value)</strong> - 
                zohledňují skutečnou neutralizační schopnost MgO (1.39× silnější než CaO).
              </p>
              <p>
                Celková potřeba se aplikuje postupně v několika dávkách. 
                Maximální jednorázová dávka závisí na typu půdy:
              </p>
              <ul className="mt-2 ml-4 space-y-1">
                <li>• Lehká půda (L): max 1.5 t CaO/ha</li>
                <li>• Střední půda (S): max 3.0 t CaO/ha</li>
                <li>• Těžká půda (T): max 5.0 t CaO/ha</li>
              </ul>
              <p className="mt-2">Interval mezi aplikacemi: minimálně 3 roky</p>
            </div>
          </div>

          {vysledek.vapneni.pocetAplikaci > 1 && (
            <div className="mt-4 bg-orange-50 p-4 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-orange-900">
                <strong>Upozornění:</strong> Celková potřeba vyžaduje {vysledek.vapneni.pocetAplikaci} aplikace.
                {vysledek.vapneni.doporucenyInterval && ` Doporučený ${vysledek.vapneni.doporucenyInterval}.`}
              </p>
            </div>
          )}
        </div>

        {/* Živiny */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🌱 STAV ŽIVIN (na 1 hektar)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Živina</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Stav</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Aktuální</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Třída</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Deficit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(vysledek.ziviny).map(([key, data]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{key}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: data.tridaBarva }}>
                        {getIconForTrida(data.trida)} {data.tridaNazev}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{data.aktualni} mg/kg</td>
                    <td className="px-4 py-3 text-right">{data.trida}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {data.deficit_kg_ha ? `${data.deficit_kg_ha} kg/ha` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${vysledek.pomerKMgBarva}15` }}>
            <p className="text-sm font-semibold" style={{ color: vysledek.pomerKMgBarva }}>
              <strong>Poměr K:Mg:</strong> {vysledek.pomerKMg} ({vysledek.pomerKMgKategorie})
            </p>
            <p className="text-sm mt-1" style={{ color: vysledek.pomerKMgBarva }}>
              {vysledek.hodnoceniPomeru}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <p className="text-blue-900 mb-3">
            <strong>ℹ️ O výpočtu:</strong>
          </p>
          <p className="text-blue-900 text-sm mb-2">
            Toto je <strong>orientační výpočet</strong> celkové potřeby vápnění pro nápravu deficitu 
            podle metodiky ÚKZÚZ (Mehlich 3). Výsledky jsou uvedeny na 1 hektar.
          </p>
          <p className="text-blue-900 text-sm">
            Pro <strong>komplexní víceletý plán vápnění</strong> s konkrétními produkty, 
            rozložením do jednotlivých let a cenovou nabídkou se zaregistrujte do portálu 
            nebo nás kontaktujte.
          </p>
        </div>

        {/* Tlačítko */}
        <div className="text-center">
          <button
            onClick={onNova}
            className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md text-lg"
          >
            Zpět na kalkulačku
          </button>
        </div>
      </div>
    </div>
  );
}
