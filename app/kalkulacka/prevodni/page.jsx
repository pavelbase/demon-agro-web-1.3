import ConversionCalculator from '@/components/calculators/ConversionCalculator'

export const metadata = {
  title: 'Převodní kalkulačka živin | Démon agro',
  description: 'Rychlý převod mezi prvkovou a oxidovou formou živin. Přepočet Ca, CaCO₃, CaO, Mg, K, S, P, N pro práci s laboratorními rozbory půdy.',
  keywords: 'převod živin, CaCO3 na CaO, fosfor P2O5, draslík K2O, hořčík MgO, agronomická kalkulačka',
}

export default function PrevorniKalkulackaPage() {
  return <ConversionCalculator />
}
