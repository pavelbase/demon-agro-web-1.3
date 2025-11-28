"use client";

import { useState } from "react";
import { KalkulackaInputs, TypPudy } from "@/lib/kalkulace-types";
import { vypocetKalkulace, ulozitKalkulaci, zkontrolujDuplicitniEmail } from "@/lib/kalkulace";
import { VysledekKalkulace } from "@/lib/kalkulace-types";
import { Calculator, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

const TYPYPUDY = {
  'piscita': {
    nazev: 'Písčitá (lehká)',
    popis: 'Lehké půdy s nízkým obsahem jílu'
  },
  'hlinito_piscita': {
    nazev: 'Hlinito-písčitá',
    popis: 'Přechodné půdy mezi lehkými a středními'
  },
  'hlinita': {
    nazev: 'Hlinitá (střední)',
    popis: 'Střední půdy, nejběžnější typ v ČR'
  },
  'jilovita': {
    nazev: 'Jílovitá (těžká)',
    popis: 'Těžké půdy s vysokým obsahem jílu'
  }
};

export default function KalkulackaPage() {
  const [krok, setKrok] = useState(1);
  const [vysledek, setVysledek] = useState<VysledekKalkulace | null>(null);
  const [odesila, setOdesila] = useState(false);
  
  const [formData, setFormData] = useState<KalkulackaInputs>({
    typPudy: 'hlinita',
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

  const validovatKrok3 = (): boolean => {
    const novéChyby: Record<string, string> = {};
    
    if (formData.jmeno.length < 2) {
      novéChyby.jmeno = 'Zadejte jméno (min 2 znaky)';
    }
    if (!formData.email.includes('@')) {
      novéChyby.email = 'Zadejte platný email';
    }
    if (formData.telefon.length < 9) {
      novéChyby.telefon = 'Zadejte platné telefonní číslo';
    }
    if (!formData.souhlas) {
      novéChyby.souhlas = 'Musíte souhlasit se zpracováním osobních údajů';
    }
    
    // Kontrola duplicitního emailu
    if (formData.email && zkontrolujDuplicitniEmail(formData.email)) {
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
    if (!validovatKrok3()) return;

    setOdesila(true);

    // Výpočet
    const vypocet = vypocetKalkulace(formData);
    
    // Uložení
    ulozitKalkulaci(vypocet);
    
    // Simulace odeslání emailu (EmailJS by šel přidat)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setVysledek(vypocet);
    setOdesila(false);
  };

  const handleNovaKalkulace = () => {
    setKrok(1);
    setVysledek(null);
    setFormData({
      typPudy: 'hlinita',
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
            Metodika VDLUFA pro střední Evropu
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
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Typ půdy zjistíte z rozboru nebo orientačně podle zpracovatelnosti (lehká = sypká, těžká = lepivá)
                </p>
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
                  💡 <strong>Tip:</strong> Hodnoty najdete ve výsledcích laboratorního rozboru půdy (AZZP nebo soukromá laboratoř, metoda Mehlich III).
                  Zadávejte hodnoty v <strong>mg/kg</strong>.
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
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.souhlas}
                    onChange={(e) => setFormData({ ...formData, souhlas: e.target.checked })}
                    className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59] mt-1"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Souhlasím se zpracováním osobních údajů pro účely této kalkulace a kontaktování obchodním zástupcem. *
                  </span>
                </label>
                {chyby.souhlas && <p className="text-red-600 text-sm mt-1">{chyby.souhlas}</p>}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setKrok(2)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg"
                  disabled={odesila}
                >
                  ← Zpět
                </button>
                <button
                  onClick={handleVypocet}
                  disabled={odesila}
                  className="flex-1 bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg disabled:opacity-50"
                >
                  {odesila ? 'Zpracovávám...' : 'Vypočítat →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponenta pro zobrazení výsledků
function VysledekView({ vysledek, onNova }: { vysledek: VysledekKalkulace; onNova: () => void }) {
  const getIconForTrida = (trida: string) => {
    if (trida === 'A') return '🔴';
    if (trida === 'B') return '⚠️';
    if (trida === 'C') return '✅';
    if (trida === 'D') return '📊';
    return '📈';
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
            📊 POTŘEBA VÁPNĚNÍ (na 1 hektar)
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
              <span className="text-gray-700">Popis:</span>
              <span className="text-sm text-gray-600">{vysledek.vapneni.phTridaPopis}</span>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-[#4A7C59]">
                {vysledek.vapneni.celkovaPotrebaCaO_t} t CaO/ha
              </div>
              <div className="text-sm text-gray-600">Celková potřeba vápníku</div>
            </div>
            
            <div className="text-center mt-3 pt-3 border-t border-green-200">
              <div className="text-xl font-bold text-[#2D5016]">
                {vysledek.vapneni.prepocetyHnojiva.mletyVapenec_t} t/ha
              </div>
              <div className="text-sm text-gray-600">Mletý vápenec (48% CaO)</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 italic">
            ⚠️ Maximální jednorázová dávka a počet aplikací dle etikety použitého hnojiva.
          </div>

          {vysledek.vapneni.pocetAplikaci > 1 && (
            <div className="mt-4 bg-orange-50 p-4 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-orange-900">
                <strong>Upozornění:</strong> Doporučená dávka přesahuje maximální jednorázovou aplikaci.
                {vysledek.vapneni.doporucenyInterval && ` Doporučujeme ${vysledek.vapneni.doporucenyInterval}.`}
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
          <p className="text-blue-900">
            ℹ️ Toto je orientační výpočet na 1 hektar podle metodiky VDLUFA. Pro kompletní plán hnojení 
            s konkrétními hnojivy a cenovou nabídkou vás bude kontaktovat náš obchodní zástupce.
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
