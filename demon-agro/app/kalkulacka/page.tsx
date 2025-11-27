"use client";

import { useState } from "react";
import { KalkulackaInputs } from "@/lib/kalkulace-types";
import { vypocetKalkulace, ulozitKalkulaci } from "@/lib/kalkulace";
import { VysledekKalkulace } from "@/lib/kalkulace-types";
import { Calculator, CheckCircle, AlertCircle } from "lucide-react";

export default function KalkulackaPage() {
  const [krok, setKrok] = useState(1);
  const [vysledek, setVysledek] = useState<VysledekKalkulace | null>(null);
  const [odesila, setOdesila] = useState(false);
  
  const [formData, setFormData] = useState<KalkulackaInputs>({
    plocha: 0,
    typPudy: 'stredni',
    cilovePH: 'optimalni',
    pH: 0,
    P2O5: 0,
    K2O: 0,
    CaO: 0,
    MgO: 0,
    S: 0,
    jmeno: '',
    firma: '',
    email: '',
    telefon: '',
    souhlas: false
  });

  const [chyby, setChyby] = useState<Record<string, string>>({});

  const validovatKrok1 = (): boolean => {
    const novéChyby: Record<string, string> = {};
    
    if (formData.plocha <= 0 || formData.plocha > 10000) {
      novéChyby.plocha = 'Zadejte plochu mezi 0.1 a 10000 ha';
    }
    
    setChyby(novéChyby);
    return Object.keys(novéChyby).length === 0;
  };

  const validovatKrok2 = (): boolean => {
    const novéChyby: Record<string, string> = {};
    
    if (formData.pH < 3.5 || formData.pH > 9.0) {
      novéChyby.pH = 'pH musí být mezi 3.5 a 9.0';
    }
    if (formData.P2O5 < 0 || formData.P2O5 > 1000) {
      novéChyby.P2O5 = 'Hodnota musí být mezi 0 a 1000 mg/kg';
    }
    if (formData.K2O < 0 || formData.K2O > 2000) {
      novéChyby.K2O = 'Hodnota musí být mezi 0 a 2000 mg/kg';
    }
    if (formData.CaO < 0 || formData.CaO > 15000) {
      novéChyby.CaO = 'Hodnota musí být mezi 0 a 15000 mg/kg';
    }
    if (formData.MgO < 0 || formData.MgO > 1000) {
      novéChyby.MgO = 'Hodnota musí být mezi 0 a 1000 mg/kg';
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
      plocha: 0,
      typPudy: 'stredni',
      cilovePH: 'optimalni',
      pH: 0,
      P2O5: 0,
      K2O: 0,
      CaO: 0,
      MgO: 0,
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
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Calculator className="w-16 h-16 text-[#4A7C59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kalkulačka hnojení
          </h1>
          <p className="text-xl text-gray-600">
            Zjistěte potřebu vápnění a živin pro vaše pole
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${krok >= 1 ? 'text-[#4A7C59]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${krok >= 1 ? 'bg-[#4A7C59] text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 hidden sm:inline">Základní údaje</span>
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
          {/* KROK 1 */}
          {krok === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                KROK 1: Základní údaje o pozemku
              </h2>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Plocha pozemku (ha) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.plocha || ''}
                  onChange={(e) => setFormData({ ...formData, plocha: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                  placeholder="např. 50"
                />
                {chyby.plocha && <p className="text-red-600 text-sm mt-1">{chyby.plocha}</p>}
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-3">
                  Typ půdy *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.typPudy === 'lehka'}
                      onChange={() => setFormData({ ...formData, typPudy: 'lehka' })}
                      className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59]"
                    />
                    <span className="ml-3">Lehká (písčitá)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.typPudy === 'stredni'}
                      onChange={() => setFormData({ ...formData, typPudy: 'stredni' })}
                      className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59]"
                    />
                    <span className="ml-3">Střední (hlinitá)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.typPudy === 'tezka'}
                      onChange={() => setFormData({ ...formData, typPudy: 'tezka' })}
                      className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59]"
                    />
                    <span className="ml-3">Těžká (jílovitá)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-3">
                  Cílové pH *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.cilovePH === 'ekonomicke'}
                      onChange={() => setFormData({ ...formData, cilovePH: 'ekonomicke' })}
                      className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59]"
                    />
                    <span className="ml-3">Ekonomické (pH 6.2)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.cilovePH === 'optimalni'}
                      onChange={() => setFormData({ ...formData, cilovePH: 'optimalni' })}
                      className="w-4 h-4 text-[#4A7C59] focus:ring-[#4A7C59]"
                    />
                    <span className="ml-3">Optimální (pH 6.5)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleDalsi}
                className="w-full bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md text-lg"
              >
                Pokračovat →
              </button>
            </div>
          )}

          {/* KROK 2 */}
          {krok === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                KROK 2: Hodnoty z rozboru půdy
              </h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Hodnoty najdete ve výsledcích laboratorního rozboru půdy (metoda Mehlich III).
                  Zadávejte hodnoty v <strong>mg/kg</strong>.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  pH půdy *
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
                    P₂O₅ (fosfor) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.P2O5 || ''}
                    onChange={(e) => setFormData({ ...formData, P2O5: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 85"
                  />
                  {chyby.P2O5 && <p className="text-red-600 text-sm mt-1">{chyby.P2O5}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    K₂O (draslík) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.K2O || ''}
                    onChange={(e) => setFormData({ ...formData, K2O: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 180"
                  />
                  {chyby.K2O && <p className="text-red-600 text-sm mt-1">{chyby.K2O}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    CaO (vápník) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.CaO || ''}
                    onChange={(e) => setFormData({ ...formData, CaO: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 2500"
                  />
                  {chyby.CaO && <p className="text-red-600 text-sm mt-1">{chyby.CaO}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    MgO (hořčík) mg/kg *
                  </label>
                  <input
                    type="number"
                    value={formData.MgO || ''}
                    onChange={(e) => setFormData({ ...formData, MgO: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white shadow-sm rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:outline-none"
                    placeholder="např. 150"
                  />
                  {chyby.MgO && <p className="text-red-600 text-sm mt-1">{chyby.MgO}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    S (síra) mg/kg *
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

          {/* KROK 3 */}
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
                  {odesila ? 'Zpracovávám...' : 'Vypočítat a odeslat →'}
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
  const getHodnoceniColor = (hodnoceni: string) => {
    if (hodnoceni === 'nizky' || hodnoceni === 'vyhovujici') return 'text-orange-600';
    if (hodnoceni === 'dobry') return 'text-green-600';
    return 'text-blue-600';
  };

  const getHodnoceniIcon = (hodnoceni: string) => {
    if (hodnoceni === 'nizky' || hodnoceni === 'vyhovujici') return '⚠️';
    if (hodnoceni === 'dobry') return '✅';
    return '📊';
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
            📧 Kompletní výsledek byl odeslán na váš email.<br />
            Pro detailní plán hnojení vás bude kontaktovat náš obchodní zástupce.
          </p>
        </div>

        {/* Vápnění */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 POTŘEBA VÁPNĚNÍ
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Aktuální pH:</span>
              <span className="font-semibold">
                {vysledek.vstup.pH} ({vysledek.hodnotenipH})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Cílové pH:</span>
              <span className="font-semibold">
                {vysledek.vstup.cilovePH === 'optimalni' ? '6.5 (optimální)' : '6.2 (ekonomické)'}
              </span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Potřeba vápna:</span>
              <span className="font-bold text-[#4A7C59]">
                {vysledek.potrebaVapneniTha} t CaO/ha
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-700">Celkem:</span>
              <span className="font-bold text-[#4A7C59]">
                {vysledek.potrebaVapneniCelkem} t CaO (pro {vysledek.vstup.plocha} ha)
              </span>
            </div>
          </div>

          {vysledek.upozorneniRozdelitDavku && (
            <div className="mt-4 bg-orange-50 p-4 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-orange-900">
                <strong>Upozornění:</strong> Doporučená dávka přesahuje maximální jednorázovou aplikaci 
                ({vysledek.maxDavka} t CaO/ha). Doporučujeme rozdělit do 2 aplikací.
              </p>
            </div>
          )}
        </div>

        {/* Živiny */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🌱 STAV ŽIVIN
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Živina</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Stav</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Aktuální</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Optimum</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Deficit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(vysledek.ziviny).map(([key, data]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{key === 'P' ? 'P₂O₅' : key === 'K' ? 'K₂O' : key === 'Mg' ? 'MgO' : key === 'Ca' ? 'CaO' : 'S'}</td>
                    <td className="px-4 py-3">
                      <span className={getHodnoceniColor(data.hodnoceni)}>
                        {getHodnoceniIcon(data.hodnoceni)} {data.hodnoceniText}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{data.aktualni} mg/kg</td>
                    <td className="px-4 py-3 text-right">{data.optimum} mg/kg</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {data.deficit > 0 ? `${data.deficit} kg/ha` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Poměr K:Mg:</strong> {vysledek.pomerKMg} - {vysledek.hodnoceniPomeru}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <p className="text-blue-900">
            ℹ️ Toto je orientační výpočet. Pro sestavení kompletního plánu hnojení s konkrétními 
            hnojivy a cenovou kalkulací vás bude kontaktovat náš obchodní zástupce.
          </p>
        </div>

        {/* Tlačítko */}
        <div className="text-center">
          <button
            onClick={onNova}
            className="bg-[#4A7C59] hover:bg-[#3d6449] text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md text-lg"
          >
            Nová kalkulace
          </button>
        </div>
      </div>
    </div>
  );
}
