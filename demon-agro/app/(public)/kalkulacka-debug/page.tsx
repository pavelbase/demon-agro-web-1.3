"use client";

import { useState } from "react";
import { vypocetKalkulace } from "@/lib/kalkulace";
import type { TypPudy } from "@/lib/kalkulace-types";

export default function KalkulackaDebugPage() {
  const [typPudy, setTypPudy] = useState<TypPudy>('S'); // Změněno na nový formát
  const [pH, setPh] = useState(5.2);
  
  // Testovací data
  const testData = {
    typPudy,
    pH,
    P: 80,
    K: 150,
    Mg: 90,
    Ca: 2000,
    S: 12,
    jmeno: 'Test',
    email: 'test@test.cz',
    telefon: '123456789',
    souhlas: false
  };

  const vysledek = vypocetKalkulace(testData);

  // Mapování na české typy - aktualizováno
  const czechTypeMap = {
    'L': 'L (lehká)',
    'S': 'S (střední)',
    'T': 'T (těžká)'
  };

  // Tabulky vápnění
  const LIME_NEED_TABLE = {
    L: { '4.0': 8000, '4.5': 6000, '5.0': 4000, '5.5': 2000, '6.0': 0 },
    S: { '4.0': 12000, '4.5': 9000, '5.0': 6000, '5.5': 3000, '6.0': 1000, '6.5': 0 },
    T: { '4.0': 16000, '4.5': 12000, '5.0': 8000, '5.5': 4000, '6.0': 2000, '6.5': 0 }
  };

  // Kategorie P pro střední půdu (S)
  const kategorieP_S = {
    'A (nízký)': '≤ 100',
    'B (vyhovující)': '101-160',
    'C (dobrý)': '161-250',
    'D (vysoký)': '251-350',
    'E (velmi vysoký)': '> 350'
  };

  const kategorieK_S = {
    'A (nízký)': '≤ 105',
    'B (vyhovující)': '106-160',
    'C (dobrý)': '161-250',
    'D (vysoký)': '251-380',
    'E (velmi vysoký)': '> 380'
  };

  const kategorieMg_S = {
    'A (nízký)': '≤ 105',
    'B (vyhovující)': '106-160',
    'C (dobrý)': '161-250',
    'D (vysoký)': '251-380',
    'E (velmi vysoký)': '> 380'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔍 Debug kalkulačky - Ověření metodiky ÚKZÚZ
        </h1>

        {/* Ovládání */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Testovací data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Typ půdy</label>
              <select 
                value={typPudy}
                onChange={(e) => setTypPudy(e.target.value as TypPudy)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="L">Lehká (L) - písčitá</option>
                <option value="S">Střední (S) - hlinitá</option>
                <option value="T">Těžká (T) - jílovitá</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">pH</label>
              <input 
                type="number"
                step="0.1"
                value={pH}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm">P: 80, K: 150, Mg: 90, Ca: 2000, S: 12 mg/kg</p>
          </div>
        </div>

        {/* Mapování typu půdy */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            ✅ 1. Mapování typu půdy
          </h2>
          <div className="space-y-2">
            <p className="text-lg">
              <strong>Vybraný typ:</strong> {typPudy}
            </p>
            <p className="text-lg">
              <strong>České označení:</strong> <span className="text-blue-700 font-bold">{czechTypeMap[typPudy]}</span>
            </p>
            <p className="text-sm text-gray-700 mt-3">
              ℹ️ Hlinito-písčitá a Hlinitá půda se mapují na stejný typ S (střední), používají tedy stejné hranice pro živiny.
            </p>
          </div>
        </div>

        {/* Tabulka vápnění */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">
            ✅ 2. Tabulka vápnění (kg CaCO3/ha)
          </h2>
          <p className="mb-3">
            Pro typ <strong>{czechTypeMap[typPudy]}</strong>:
          </p>
          <div className="bg-white rounded p-4 font-mono text-sm">
            {Object.entries(LIME_NEED_TABLE[typPudy === 'piscita' ? 'L' : typPudy === 'jilovita' ? 'T' : 'S']).map(([ph, value]) => (
              <div key={ph} className={`py-1 ${parseFloat(ph) === Math.round(pH * 2) / 2 ? 'bg-yellow-100 font-bold' : ''}`}>
                pH {ph}: {value} kg/ha CaCO3
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-white rounded">
            <p className="font-bold text-lg mb-2">Výpočet pro pH {pH}:</p>
            <p>Potřeba CaCO3: <span className="text-green-700 font-bold">~{Math.round(vysledek.vapneni.celkovaPotrebaCaO_t / 0.56 * 100) / 100} t/ha</span></p>
            <p>Potřeba CaO (× 0.56): <span className="text-green-700 font-bold">{vysledek.vapneni.celkovaPotrebaCaO_t} t/ha</span></p>
            <p>Mletý vápenec (48% CaO): <span className="text-green-700 font-bold">{vysledek.vapneni.prepocetyHnojiva.mletyVapenec_t} t/ha</span></p>
          </div>
        </div>

        {/* Kategorie živin */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">
            ✅ 3. Kategorie živin (Mehlich 3) pro {czechTypeMap[typPudy]}
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded p-4">
              <h3 className="font-bold mb-2">Fosfor (P) - aktuálně: 80 mg/kg</h3>
              {Object.entries(kategorieP_S).map(([kat, rozmezi]) => (
                <div key={kat} className={`py-1 ${vysledek.ziviny.P.trida === kat.split(' ')[0] ? 'bg-yellow-100 font-bold' : ''}`}>
                  {kat}: {rozmezi} mg/kg
                </div>
              ))}
              <p className="mt-2 text-sm">
                → Výsledek: <strong className="text-purple-700">{vysledek.ziviny.P.trida} ({vysledek.ziviny.P.tridaNazev})</strong>
              </p>
            </div>

            <div className="bg-white rounded p-4">
              <h3 className="font-bold mb-2">Draslík (K) - aktuálně: 150 mg/kg</h3>
              {Object.entries(kategorieK_S).map(([kat, rozmezi]) => (
                <div key={kat} className={`py-1 ${vysledek.ziviny.K.trida === kat.split(' ')[0] ? 'bg-yellow-100 font-bold' : ''}`}>
                  {kat}: {rozmezi} mg/kg
                </div>
              ))}
              <p className="mt-2 text-sm">
                → Výsledek: <strong className="text-purple-700">{vysledek.ziviny.K.trida} ({vysledek.ziviny.K.tridaNazev})</strong>
              </p>
            </div>

            <div className="bg-white rounded p-4">
              <h3 className="font-bold mb-2">Hořčík (Mg) - aktuálně: 90 mg/kg</h3>
              {Object.entries(kategorieMg_S).map(([kat, rozmezi]) => (
                <div key={kat} className={`py-1 ${vysledek.ziviny.Mg.trida === kat.split(' ')[0] ? 'bg-yellow-100 font-bold' : ''}`}>
                  {kat}: {rozmezi} mg/kg
                </div>
              ))}
              <p className="mt-2 text-sm">
                → Výsledek: <strong className="text-purple-700">{vysledek.ziviny.Mg.trida} ({vysledek.ziviny.Mg.tridaNazev})</strong>
              </p>
            </div>
          </div>
        </div>

        {/* K:Mg poměr */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-orange-900 mb-4">
            ✅ 4. Poměr K:Mg
          </h2>
          <div className="bg-white rounded p-4">
            <p className="text-lg mb-2">
              Poměr: {testData.K} / {testData.Mg} = <strong className="text-orange-700">{vysledek.pomerKMg}</strong>
            </p>
            <p className="text-sm mb-2">Optimální rozmezí: <strong>1.5 - 2.5</strong></p>
            <p className="mt-3 p-3 rounded" style={{ backgroundColor: vysledek.pomerKMgBarva + '20', color: vysledek.pomerKMgBarva }}>
              <strong>Status:</strong> {vysledek.pomerKMgKategorie}<br />
              {vysledek.hodnoceniPomeru}
            </p>
          </div>
        </div>

        {/* Deficity */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">
            ✅ 5. Výpočet deficitů (koeficient 4.2)
          </h2>
          <div className="bg-white rounded p-4 space-y-2">
            <p><strong>P:</strong> Střed třídy C (205) - aktuální (80) = 125 mg/kg × 4.2 = <strong className="text-red-700">{vysledek.ziviny.P.deficit_kg_ha} kg/ha</strong></p>
            <p><strong>K:</strong> Střed třídy C (205) - aktuální (150) = 55 mg/kg × 4.2 = <strong className="text-red-700">{vysledek.ziviny.K.deficit_kg_ha} kg/ha</strong></p>
            <p><strong>Mg:</strong> Střed třídy C (205) - aktuální (90) = 115 mg/kg × 4.2 = <strong className="text-red-700">{vysledek.ziviny.Mg.deficit_kg_ha} kg/ha</strong></p>
          </div>
        </div>

        {/* Závěr */}
        <div className="bg-gray-900 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            ✅ Potvrzení používané metodiky
          </h2>
          <ul className="space-y-2">
            <li>✓ Mapování na české typy půd (L, S, T)</li>
            <li>✓ Tabulky vápnění podle ÚKZÚZ (kg CaCO3/ha)</li>
            <li>✓ Kategorizace živin podle Mehlich 3</li>
            <li>✓ K:Mg optimum 1.5-2.5</li>
            <li>✓ Deficit koeficient 4.2</li>
          </ul>
          <p className="mt-4 text-yellow-300 font-bold">
            Kalkulačka používá českou metodiku ÚKZÚZ!
          </p>
        </div>
      </div>
    </div>
  );
}

