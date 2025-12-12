"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft, Info } from "lucide-react";

// Typy
type NutrientId = "Ca" | "Mg" | "K" | "S" | "P" | "N";

interface Unit {
  id: string;
  label: string;
  multiplier: number;
}

// Barvy živin
const NUTRIENT_COLORS: Record<NutrientId, string> = {
  Ca: "#0EA5E9", // sky-500
  Mg: "#10B981", // emerald-500
  K: "#8B5CF6",  // violet-500
  S: "#EAB308",  // yellow-500
  P: "#F97316",  // orange-500
  N: "#EC4899",  // pink-500
};

// Názvy živin
const NUTRIENT_NAMES: Record<NutrientId, string> = {
  Ca: "Vápník",
  Mg: "Hořčík",
  K: "Draslík",
  S: "Síra",
  P: "Fosfor",
  N: "Dusík",
};

// Formy živin
const NUTRIENT_FORMS: Record<NutrientId, string[]> = {
  Ca: ["Ca", "CaO", "CaCO₃"],
  Mg: ["Mg", "MgO", "MgCO₃"],
  K: ["K", "K₂O"],
  S: ["S", "SO₃"],
  P: ["P", "P₂O₅"],
  N: ["N", "NO₃"],
};

// Převodní koeficienty pro vápník
const CALCIUM_CONVERSIONS: Record<string, number> = {
  Ca_CaO: 1.3992,
  CaO_Ca: 0.7147,
  Ca_CaCO3: 2.4973,
  CaCO3_Ca: 0.4005,
  CaO_CaCO3: 1.7848,
  CaCO3_CaO: 0.5603,
};

// Převodní koeficienty pro hořčík (Mg)
const MAGNESIUM_CONVERSIONS: Record<string, number> = {
  // Mg → MgO
  Mg_to_MgO: 1.6582,
  MgO_to_Mg: 0.6031,

  // Mg → MgCO₃
  Mg_to_MgCO3: 3.4678,
  MgCO3_to_Mg: 0.2884,

  // MgO → MgCO₃
  MgO_to_MgCO3: 2.0913,
  MgCO3_to_MgO: 0.4782,
};

// Převodní koeficienty pro ostatní živiny
const CONVERSION_FACTORS: Record<string, number> = {
  K_K2O: 1.2046,
  K2O_K: 0.8302,
  S_SO3: 2.4972,
  SO3_S: 0.4005,
  P_P2O5: 2.2914,
  P2O5_P: 0.4364,
  N_NO3: 4.4268,
  NO3_N: 0.2259,
};

// Jednotky
const UNITS: Unit[] = [
  { id: "percent", label: "%", multiplier: 1 },
  { id: "kg_ha", label: "kg/ha", multiplier: 1 },
  { id: "kg_t", label: "kg/t", multiplier: 1 },
  { id: "mg_kg", label: "mg/kg", multiplier: 0.001 },
  { id: "g_kg", label: "g/kg", multiplier: 0.1 },
];

function normalizeFormula(value: string): string {
  return value.replace(/[₂₃₅]/g, (match) => (match === "₂" ? "2" : match === "₃" ? "3" : "5"));
}

// Získání koeficientu pro převod
function getConversionFactor(nutrient: NutrientId, from: number, to: number): number {
  if (nutrient === "Ca") {
    const forms = NUTRIENT_FORMS.Ca;
    const key = normalizeFormula(`${forms[from]}_${forms[to]}`);
    return CALCIUM_CONVERSIONS[key] || 1;
  }

  if (nutrient === "Mg") {
    const forms = NUTRIENT_FORMS.Mg;
    const key = normalizeFormula(`${forms[from]}_to_${forms[to]}`);
    return MAGNESIUM_CONVERSIONS[key] || 1;
  }

  const forms = NUTRIENT_FORMS[nutrient];
  const key = normalizeFormula(`${forms[from]}_${forms[to]}`);
  return CONVERSION_FACTORS[key] || 1;
}

export default function PrevorniKalkulackaPage() {
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientId>("Ca");
  const [fromForm, setFromForm] = useState(0);
  const [toForm, setToForm] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [inputUnit, setInputUnit] = useState(UNITS[0]);
  const [outputUnit, setOutputUnit] = useState(UNITS[0]);

  // Výpočet výsledku
  const result = useMemo(() => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return "";
    
    const value = parseFloat(inputValue);
    const conversionFactor = getConversionFactor(selectedNutrient, fromForm, toForm);
    const unitConversion = inputUnit.multiplier / outputUnit.multiplier;
    
    const result = value * conversionFactor * unitConversion;
    
    // Formátování podle velikosti
    if (result === 0) return "0";
    if (result < 0.01) return result.toExponential(3);
    if (result < 1) return result.toFixed(4);
    if (result < 100) return result.toFixed(2);
    return result.toFixed(1);
  }, [inputValue, selectedNutrient, fromForm, toForm, inputUnit, outputUnit]);

  // Aktuální koeficient
  const currentCoefficient = useMemo(() => {
    const factor = getConversionFactor(selectedNutrient, fromForm, toForm);
    return factor.toFixed(4);
  }, [selectedNutrient, fromForm, toForm]);

  // Prohození směru
  const handleSwap = () => {
    setFromForm(toForm);
    setToForm(fromForm);
    if (result) {
      setInputValue(result);
    }
  };

  // Reset při změně živiny
  const handleNutrientChange = (nutrient: NutrientId) => {
    setSelectedNutrient(nutrient);
    setFromForm(0);
    setToForm(1);
    setInputValue("");
  };

  const nutrientForms = NUTRIENT_FORMS[selectedNutrient];
  const nutrientColor = NUTRIENT_COLORS[selectedNutrient];

  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hlavička */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm mb-4">
            <span className="text-sm font-semibold text-[#4A7C59]">Nástroje pro agronomy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Převodní kalkulačka
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rychlý převod mezi prvkovou a oxidovou formou živin pro práci s laboratorními rozbory půdy.
          </p>
        </div>

        {/* Výběr živiny */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Vyberte živinu</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {(["Ca", "Mg", "K", "S", "P", "N"] as NutrientId[]).map((nutrient) => (
              <button
                key={nutrient}
                onClick={() => handleNutrientChange(nutrient)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
                  selectedNutrient === nutrient
                    ? "scale-105 shadow-lg ring-2"
                    : "bg-white shadow-md hover:shadow-lg hover:scale-102"
                }`}
                style={{
                  backgroundColor: selectedNutrient === nutrient ? `${NUTRIENT_COLORS[nutrient]}15` : undefined,
                  borderColor: selectedNutrient === nutrient ? NUTRIENT_COLORS[nutrient] : undefined,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2"
                  style={{ backgroundColor: NUTRIENT_COLORS[nutrient] }}
                >
                  {nutrient}
                </div>
                <span className="text-sm font-semibold text-gray-700">{NUTRIENT_NAMES[nutrient]}</span>
                <span className="text-xs text-gray-500 mt-1">
                  {NUTRIENT_FORMS[nutrient].join(" ↔ ")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Kalkulátor */}
        <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
            
            {/* Vstup */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Z (vstup)
              </label>
              <div className="space-y-3">
                <select
                  value={fromForm}
                  onChange={(e) => setFromForm(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-[#4A7C59] focus:outline-none transition-colors"
                  style={{ borderColor: selectedNutrient ? `${nutrientColor}40` : undefined }}
                >
                  {nutrientForms.map((form, idx) => (
                    <option key={idx} value={idx}>{form}</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Zadejte hodnotu"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-[#4A7C59] focus:outline-none transition-colors"
                    style={{ borderColor: selectedNutrient && inputValue ? `${nutrientColor}60` : undefined }}
                  />
                  <select
                    value={inputUnit.id}
                    onChange={(e) => setInputUnit(UNITS.find(u => u.id === e.target.value) || UNITS[0])}
                    className="px-3 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-[#4A7C59] focus:outline-none transition-colors"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tlačítko swap */}
            <div className="flex md:flex-col justify-center items-center gap-2">
              <button
                onClick={handleSwap}
                className="p-3 rounded-full bg-[#4A7C59] hover:bg-[#3d6449] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                title="Prohodit směr"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
              <div className="text-xs text-gray-500 font-mono hidden md:block">
                ×{currentCoefficient}
              </div>
            </div>

            {/* Výstup */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Na (výstup)
              </label>
              <div className="space-y-3">
                <select
                  value={toForm}
                  onChange={(e) => setToForm(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-[#4A7C59] focus:outline-none transition-colors"
                  style={{ borderColor: selectedNutrient ? `${nutrientColor}40` : undefined }}
                >
                  {nutrientForms.map((form, idx) => (
                    <option key={idx} value={idx}>{form}</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <div 
                    className="flex-1 px-4 py-3 rounded-xl border-2 font-semibold text-lg flex items-center"
                    style={{ 
                      backgroundColor: result ? `${nutrientColor}10` : "#F9FAFB",
                      borderColor: result ? `${nutrientColor}60` : "#E5E7EB",
                      color: result ? nutrientColor : "#9CA3AF"
                    }}
                  >
                    {result || "—"}
                  </div>
                  <select
                    value={outputUnit.id}
                    onChange={(e) => setOutputUnit(UNITS.find(u => u.id === e.target.value) || UNITS[0])}
                    className="px-3 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-[#4A7C59] focus:outline-none transition-colors"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Zobrazení koeficientu na mobilu */}
          <div className="mt-4 text-center md:hidden">
            <span className="text-xs text-gray-500">
              Převodní koeficient: <span className="font-mono font-semibold">{currentCoefficient}</span>
            </span>
          </div>
        </div>

        {/* Tabulka koeficientů */}
        <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Přepočtové koeficienty</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Živina</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Směr</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Koeficient</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Směr</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Koeficient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Vápník */}
                <tr>
                  <td className="px-4 py-3 font-semibold" style={{ color: NUTRIENT_COLORS.Ca }}>
                    Vápník (Ca)
                  </td>
                  <td className="px-4 py-3 text-gray-700">Ca → CaO</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 1.3992</td>
                  <td className="px-4 py-3 text-gray-700">CaO → Ca</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.7147</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-gray-700">Ca → CaCO₃</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 2.4973</td>
                  <td className="px-4 py-3 text-gray-700">CaCO₃ → Ca</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.4005</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-gray-700">CaO → CaCO₃</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 1.7848</td>
                  <td className="px-4 py-3 text-gray-700">CaCO₃ → CaO</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.5603</td>
                </tr>
                
                {/* Hořčík */}
                <tr>
                  <td className="px-4 py-3 font-semibold" style={{ color: NUTRIENT_COLORS.Mg }}>
                    Hořčík (Mg)
                  </td>
                  <td className="px-4 py-3 text-gray-700">Mg → MgO</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 1.6582</td>
                  <td className="px-4 py-3 text-gray-700">MgO → Mg</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.6031</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-gray-700">Mg → MgCO₃</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 3.4678</td>
                  <td className="px-4 py-3 text-gray-700">MgCO₃ → Mg</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.2884</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-gray-700">MgO → MgCO₃</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 2.0913</td>
                  <td className="px-4 py-3 text-gray-700">MgCO₃ → MgO</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.4782</td>
                </tr>
                
                {/* Draslík */}
                <tr>
                  <td className="px-4 py-3 font-semibold" style={{ color: NUTRIENT_COLORS.K }}>
                    Draslík (K)
                  </td>
                  <td className="px-4 py-3 text-gray-700">K → K₂O</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 1.2046</td>
                  <td className="px-4 py-3 text-gray-700">K₂O → K</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.8302</td>
                </tr>
                
                {/* Síra */}
                <tr>
                  <td className="px-4 py-3 font-semibold" style={{ color: NUTRIENT_COLORS.S }}>
                    Síra (S)
                  </td>
                  <td className="px-4 py-3 text-gray-700">S → SO₃</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 2.4972</td>
                  <td className="px-4 py-3 text-gray-700">SO₃ → S</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.4005</td>
                </tr>
                
                {/* Fosfor */}
                <tr>
                  <td className="px-4 py-3 font-semibold" style={{ color: NUTRIENT_COLORS.P }}>
                    Fosfor (P)
                  </td>
                  <td className="px-4 py-3 text-gray-700">P → P₂O₅</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 2.2914</td>
                  <td className="px-4 py-3 text-gray-700">P₂O₅ → P</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.4364</td>
                </tr>
                
                {/* Dusík */}
                <tr>
                  <td className="px-4 py-3 font-semibold" style={{ color: NUTRIENT_COLORS.N }}>
                    Dusík (N)
                  </td>
                  <td className="px-4 py-3 text-gray-700">N → NO₃</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 4.4268</td>
                  <td className="px-4 py-3 text-gray-700">NO₃ → N</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">× 0.2259</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 rounded-3xl p-6 md:p-8 border-2 border-blue-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Proč je převod důležitý?
              </h3>
              <p className="text-blue-800 leading-relaxed">
                Laboratorní rozbory půdy často uvádějí obsah živin v prvkové formě (Ca, Mg, K...), 
                zatímco hnojiva jsou deklarována v oxidové formě (CaO, MgO, K₂O...). 
                Pro správné dávkování hnojiv je nutné provést přepočet mezi těmito formami. 
                Tato kalkulačka vám umožní rychle a přesně převádět hodnoty z rozborů půdy 
                na deklarované obsahy hnojiv a naopak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
