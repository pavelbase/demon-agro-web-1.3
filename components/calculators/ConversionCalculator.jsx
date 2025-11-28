'use client'

import { useState, useMemo } from 'react'
import NutrientButton from '@/components/ui/NutrientButton'
import ConversionInput from '@/components/ui/ConversionInput'

// Jednotky
const UNITS = [
  { id: 'percent', label: '%', multiplier: 1 },
  { id: 'kg_ha', label: 'kg/ha', multiplier: 1 },
  { id: 'kg_t', label: 'kg/t', multiplier: 1 },
  { id: 'g_kg', label: 'g/kg', multiplier: 0.1 },
  { id: 'mg_kg', label: 'mg/kg', multiplier: 0.001 },
]

// Převodní koeficienty pro vápník (speciální - 3 formy)
const CALCIUM_CONVERSIONS = {
  Ca_CaO: 1.3992,
  CaO_Ca: 0.7147,
  Ca_CaCO3: 2.4973,
  CaCO3_Ca: 0.4005,
  CaO_CaCO3: 1.7848,
  CaCO3_CaO: 0.5603,
}

// Převodní koeficienty pro ostatní živiny
const CONVERSION_FACTORS = {
  Mg_MgO: 1.6582,
  MgO_Mg: 0.6031,
  K_K2O: 1.2046,
  K2O_K: 0.8302,
  S_SO3: 2.4972,
  SO3_S: 0.4005,
  P_P2O5: 2.2914,
  P2O5_P: 0.4364,
  N_NO3: 4.4268,
  NO3_N: 0.2259,
}

// Konfigurace živin
const NUTRIENTS = ['Ca', 'Mg', 'K', 'S', 'P', 'N']

// Možnosti pro vápník
const CALCIUM_OPTIONS = [
  { id: 'Ca_CaO', from: 'Ca', to: 'CaO' },
  { id: 'Ca_CaCO3', from: 'Ca', to: 'CaCO₃' },
  { id: 'CaO_Ca', from: 'CaO', to: 'Ca' },
  { id: 'CaO_CaCO3', from: 'CaO', to: 'CaCO₃' },
  { id: 'CaCO3_Ca', from: 'CaCO₃', to: 'Ca' },
  { id: 'CaCO3_CaO', from: 'CaCO₃', to: 'CaO' },
]

export default function ConversionCalculator() {
  const [selectedNutrient, setSelectedNutrient] = useState('Ca')
  const [inputValue, setInputValue] = useState('')
  const [inputUnit, setInputUnit] = useState('percent')
  const [outputUnit, setOutputUnit] = useState('percent')
  
  // Pro vápník: směr převodu
  const [calciumConversion, setCalciumConversion] = useState('Ca_CaO')
  
  // Pro ostatní živiny: směr (true = prvková→oxidová, false = oxidová→prvková)
  const [isForward, setIsForward] = useState(true)

  // Získat formy pro aktuální živinu
  const { fromForm, toForm, coefficient } = useMemo(() => {
    if (selectedNutrient === 'Ca') {
      const option = CALCIUM_OPTIONS.find(o => o.id === calciumConversion)
      return {
        fromForm: option.from,
        toForm: option.to,
        coefficient: CALCIUM_CONVERSIONS[calciumConversion],
      }
    } else {
      const oxideForms = {
        Mg: 'MgO',
        K: 'K₂O',
        S: 'SO₃',
        P: 'P₂O₅',
        N: 'NO₃',
      }
      
      if (isForward) {
        return {
          fromForm: selectedNutrient,
          toForm: oxideForms[selectedNutrient],
          coefficient: CONVERSION_FACTORS[`${selectedNutrient}_${oxideForms[selectedNutrient].replace('₂', '2').replace('₃', '3').replace('₅', '5')}`],
        }
      } else {
        return {
          fromForm: oxideForms[selectedNutrient],
          toForm: selectedNutrient,
          coefficient: CONVERSION_FACTORS[`${oxideForms[selectedNutrient].replace('₂', '2').replace('₃', '3').replace('₅', '5')}_${selectedNutrient}`],
        }
      }
    }
  }, [selectedNutrient, calciumConversion, isForward])

  // Výpočet výsledku
  const result = useMemo(() => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return ''
    
    const inputNum = parseFloat(inputValue)
    const inputMultiplier = UNITS.find(u => u.id === inputUnit)?.multiplier || 1
    const outputMultiplier = UNITS.find(u => u.id === outputUnit)?.multiplier || 1
    
    // Převod na základní jednotku
    const baseValue = inputNum * inputMultiplier
    
    // Aplikace koeficientu
    const convertedValue = baseValue * coefficient
    
    // Převod na výstupní jednotku
    const finalValue = convertedValue / outputMultiplier
    
    // Formátování (více desetinných míst pro malá čísla)
    if (finalValue < 1) {
      return finalValue.toFixed(4)
    } else if (finalValue < 10) {
      return finalValue.toFixed(3)
    } else if (finalValue < 100) {
      return finalValue.toFixed(2)
    } else {
      return finalValue.toFixed(1)
    }
  }, [inputValue, inputUnit, outputUnit, coefficient])

  // Prohození směru
  const handleSwap = () => {
    if (selectedNutrient === 'Ca') {
      // Pro vápník: najdi opačný směr
      const current = CALCIUM_OPTIONS.find(o => o.id === calciumConversion)
      const reversed = CALCIUM_OPTIONS.find(
        o => o.from === current.to && o.to === current.from
      )
      if (reversed) {
        setCalciumConversion(reversed.id)
      }
    } else {
      setIsForward(!isForward)
    }
    
    // Prohod hodnoty a jednotky
    setInputValue(result)
    const tempUnit = inputUnit
    setInputUnit(outputUnit)
    setOutputUnit(tempUnit)
  }

  // Změna živiny
  const handleNutrientChange = (nutrient) => {
    setSelectedNutrient(nutrient)
    setInputValue('')
    setInputUnit('percent')
    setOutputUnit('percent')
    
    if (nutrient === 'Ca') {
      setCalciumConversion('Ca_CaO')
    } else {
      setIsForward(true)
    }
  }

  return (
    <div className="min-h-screen bg-cream py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hlavička */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-beige/20 rounded-full text-sm font-medium text-primary-brown mb-4">
            Nástroje pro agronomy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-brown mb-4">
            Převodní kalkulačka
          </h1>
          <p className="text-lg md:text-xl text-text-light leading-relaxed max-w-2xl mx-auto">
            Rychlý převod mezi prvkovou a oxidovou formou živin používaných v zemědělství
          </p>
        </div>

        {/* Výběr živiny */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary-brown mb-4">Vyberte živinu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {NUTRIENTS.map((nutrient) => (
              <NutrientButton
                key={nutrient}
                nutrient={nutrient}
                isActive={selectedNutrient === nutrient}
                onClick={() => handleNutrientChange(nutrient)}
              />
            ))}
          </div>
        </div>

        {/* Kalkulátor */}
        <div className="bg-white rounded-3xl shadow-warm-lg p-6 md:p-8 mb-8">
          {/* Zobrazení směru převodu */}
          <div className="mb-6">
            {selectedNutrient === 'Ca' ? (
              <div>
                <label className="text-sm font-medium text-text-light mb-2 block">
                  Směr převodu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={calciumConversion}
                    onChange={(e) => setCalciumConversion(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-cream border-2 border-transparent focus:border-primary-brown focus:outline-none transition-all duration-200 font-medium"
                  >
                    {CALCIUM_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.from} → {option.to}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 p-4 bg-cream rounded-xl">
                <span className="text-lg font-bold text-primary-brown">
                  {fromForm}
                </span>
                <span className="text-2xl text-text-light">→</span>
                <span className="text-lg font-bold text-primary-brown">
                  {toForm}
                </span>
              </div>
            )}
          </div>

          {/* Vstup a výstup */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <ConversionInput
              label={`Zadejte hodnotu (${fromForm})`}
              value={inputValue}
              onChange={setInputValue}
              unit={inputUnit}
              onUnitChange={setInputUnit}
              units={UNITS}
            />

            <ConversionInput
              label={`Výsledek (${toForm})`}
              value={result}
              unit={outputUnit}
              onUnitChange={setOutputUnit}
              units={UNITS}
              readOnly
              placeholder="—"
            />
          </div>

          {/* Tlačítko prohození */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSwap}
              className="p-3 rounded-full bg-primary-brown text-white hover:bg-opacity-90 transition-all duration-300 hover:scale-110 shadow-warm"
              aria-label="Prohodit směr"
            >
              <svg
                className="w-6 h-6 transform rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          {/* Zobrazení koeficientu */}
          <div className="text-center p-4 bg-cream rounded-xl">
            <div className="text-sm text-text-light mb-1">Použitý koeficient</div>
            <div className="text-2xl font-bold text-primary-brown">
              {coefficient.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Tabulka koeficientů */}
        <CoefficientsTable />

        {/* Info box */}
        <InfoBox />
      </div>
    </div>
  )
}

function CoefficientsTable() {
  return (
    <div className="bg-white rounded-3xl shadow-warm-lg p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-bold text-primary-brown mb-6">
        Přehled přepočtových koeficientů
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-stone-200">
              <th className="text-left py-3 px-4 font-bold text-primary-brown">Živina</th>
              <th className="text-left py-3 px-4 font-bold text-primary-brown">Směr</th>
              <th className="text-right py-3 px-4 font-bold text-primary-brown">Koeficient</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4 font-medium" rowSpan={6}>Vápník (Ca)</td>
              <td className="py-3 px-4">Ca → CaO</td>
              <td className="py-3 px-4 text-right font-mono">{CALCIUM_CONVERSIONS.Ca_CaO.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">CaO → Ca</td>
              <td className="py-3 px-4 text-right font-mono">{CALCIUM_CONVERSIONS.CaO_Ca.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">Ca → CaCO₃</td>
              <td className="py-3 px-4 text-right font-mono">{CALCIUM_CONVERSIONS.Ca_CaCO3.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">CaCO₃ → Ca</td>
              <td className="py-3 px-4 text-right font-mono">{CALCIUM_CONVERSIONS.CaCO3_Ca.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">CaO → CaCO₃</td>
              <td className="py-3 px-4 text-right font-mono">{CALCIUM_CONVERSIONS.CaO_CaCO3.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">CaCO₃ → CaO</td>
              <td className="py-3 px-4 text-right font-mono">{CALCIUM_CONVERSIONS.CaCO3_CaO.toFixed(4)}</td>
            </tr>
            
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4 font-medium" rowSpan={2}>Hořčík (Mg)</td>
              <td className="py-3 px-4">Mg → MgO</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.Mg_MgO.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">MgO → Mg</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.MgO_Mg.toFixed(4)}</td>
            </tr>
            
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4 font-medium" rowSpan={2}>Draslík (K)</td>
              <td className="py-3 px-4">K → K₂O</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.K_K2O.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">K₂O → K</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.K2O_K.toFixed(4)}</td>
            </tr>
            
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4 font-medium" rowSpan={2}>Síra (S)</td>
              <td className="py-3 px-4">S → SO₃</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.S_SO3.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">SO₃ → S</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.SO3_S.toFixed(4)}</td>
            </tr>
            
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4 font-medium" rowSpan={2}>Fosfor (P)</td>
              <td className="py-3 px-4">P → P₂O₅</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.P_P2O5.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">P₂O₅ → P</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.P2O5_P.toFixed(4)}</td>
            </tr>
            
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4 font-medium" rowSpan={2}>Dusík (N)</td>
              <td className="py-3 px-4">N → NO₃</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.N_NO3.toFixed(4)}</td>
            </tr>
            <tr className="hover:bg-cream transition-colors">
              <td className="py-3 px-4">NO₃ → N</td>
              <td className="py-3 px-4 text-right font-mono">{CONVERSION_FACTORS.NO3_N.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InfoBox() {
  return (
    <div className="bg-gradient-to-br from-primary-brown/5 to-beige/10 rounded-3xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-primary-brown mb-4">
        Proč je převod důležitý?
      </h2>
      <div className="prose prose-stone max-w-none">
        <p className="text-text-dark leading-relaxed mb-4">
          V zemědělské praxi se obsah živin v půdě a hnojivech udává v různých formách. 
          Laboratorní rozbory půdy často uvádějí výsledky v <strong>prvkové formě</strong> (např. Ca, Mg, K), 
          zatímco informace na obalech hnojiv jsou běžně v <strong>oxidové formě</strong> (např. CaO, MgO, K₂O).
        </p>
        <p className="text-text-dark leading-relaxed mb-4">
          Tato kalkulačka vám umožňuje rychle převádět mezi oběma formami, což je nezbytné pro:
        </p>
        <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
          <li>Správnou interpretaci laboratorních rozborů půdy</li>
          <li>Přesné výpočty potřebného množství hnojiv</li>
          <li>Porovnání nabídek různých dodavatelů hnojiv</li>
          <li>Optimalizaci nákladů na hnojení</li>
        </ul>
        <div className="mt-6 p-4 bg-white rounded-xl">
          <p className="text-sm text-text-light italic">
            <strong>Příklad:</strong> Pokud rozbor půdy ukazuje 150 mg/kg Ca a potřebujete vědět, 
            kolik to odpovídá CaO, jednoduše zadáte hodnotu a kalkulačka provede přepočet pomocí 
            ověřeného koeficientu 1.3992.
          </p>
        </div>
      </div>
    </div>
  )
}
