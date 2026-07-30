/**
 * Test agregace rozborů na pozemek + determinismu doporučení vápnění.
 *
 * Ověřuje dvě věci, které spolu souvisí:
 *  1. Pozemek s víc vzorky se hodnotí z ARITMETICKÉHO PRŮMĚRU (metodika ÚKZÚZ),
 *     ne z jednoho vybraného vzorku.
 *  2. Výsledek je DETERMINISTICKÝ - nezávisí na pořadí, v jakém databáze vrátí
 *     řádky. Vzorky jednoho odběru mají shodné analysis_date, takže bez
 *     stabilního řazení vracel dotaz pokaždé jiný "nejnovější" vzorek.
 *
 * Spuštění: npx tsx scripts/test-parcel-aggregation.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { groupAndAverageAnalyses } from '../lib/utils/soil-analysis-helpers'
import { calculateOneTimeProductSplit, type LimeProduct } from '../lib/utils/liming-calculator'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DOLOMIT: LimeProduct = {
  id: 'test-dolomit',
  name: 'Dolomit mletý',
  type: 'dolomite',
  caoContent: 30,
  mgoContent: 20,
}

const VAPENEC: LimeProduct = {
  id: 'test-vapenec',
  name: 'Vápenec mletý',
  type: 'calcitic',
  caoContent: 52,
  mgoContent: 1,
}

/** Deterministicky zamíchá pole (stejný seed = stejné pořadí). */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let state = seed
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

async function main() {
  const { data: parcels, error } = await supabase
    .from('parcels')
    .select('id, code, name, area, soil_type, culture, soil_analyses(*)')
    .eq('status', 'active')

  if (error) throw error

  const withAnalyses = (parcels || []).filter(p => (p.soil_analyses || []).length > 0)
  const multiSample = withAnalyses.filter(p => (p.soil_analyses || []).length > 1)

  console.log(`Pozemků s rozborem: ${withAnalyses.length}`)
  console.log(`Z toho s víc vzorky: ${multiSample.length}\n`)

  // ---------------------------------------------------------------
  // TEST 1: Determinismus - 25 náhodných pořadí musí dát stejný výsledek
  // ---------------------------------------------------------------
  console.log('=== TEST 1: Determinismus při různém pořadí řádků ===')
  let nedeterministickych = 0

  for (const parcel of multiSample) {
    const results = new Set<string>()

    for (let seed = 1; seed <= 25; seed++) {
      const shuffled = shuffle(parcel.soil_analyses as any[], seed)
      const avg = groupAndAverageAnalyses(shuffled, parcel.soil_type, parcel.culture)[0]
      const split = calculateOneTimeProductSplit(
        {
          currentPh: avg.ph,
          currentMg: avg.mg,
          currentK: avg.k,
          soilType: parcel.soil_type,
          landUse: parcel.culture,
          area: parcel.area,
        },
        DOLOMIT,
        VAPENEC,
        parcel.id
      )
      results.add(
        `${avg.ph}|${avg.p}|${avg.k}|${avg.mg}|${avg.id}|${split.totalCaoNeedTHa}|${split.dolomitTHa}|${split.vapenecTHa}`
      )
    }

    if (results.size > 1) {
      nedeterministickych++
      console.log(`❌ ${parcel.code}: ${results.size} různých výsledků`)
    }
  }

  console.log(
    nedeterministickych === 0
      ? `✅ Všech ${multiSample.length} pozemků vrátilo shodný výsledek ve všech 25 pořadích.\n`
      : `❌ Nedeterministických pozemků: ${nedeterministickych}\n`
  )

  // ---------------------------------------------------------------
  // TEST 2: Průměr vs. jednotlivé vzorky - dopad na dávku
  // ---------------------------------------------------------------
  console.log('=== TEST 2: Průměr pozemku vs. jednotlivé vzorky ===')
  console.log('(kolik by se lišila dávka, kdyby se vzal jeden vzorek místo průměru)\n')

  const rozdily: { code: string; area: number; prumer: number; min: number; max: number; rozptyl: number }[] = []

  for (const parcel of multiSample) {
    const samples = parcel.soil_analyses as any[]
    const avg = groupAndAverageAnalyses(samples, parcel.soil_type, parcel.culture)[0]

    const doseFor = (ph: number, mg: number, k: number) =>
      calculateOneTimeProductSplit(
        {
          currentPh: ph,
          currentMg: mg,
          currentK: k,
          soilType: parcel.soil_type,
          landUse: parcel.culture,
          area: parcel.area,
        },
        DOLOMIT,
        VAPENEC,
        parcel.id
      ).totalCaoNeedTHa

    const davkaPrumer = doseFor(avg.ph, avg.mg, avg.k)
    const davkyVzorku = samples.map(s => doseFor(Number(s.ph), Number(s.mg), Number(s.k)))
    const min = Math.min(...davkyVzorku)
    const max = Math.max(...davkyVzorku)

    if (max - min > 0.001) {
      rozdily.push({
        code: parcel.code || parcel.name,
        area: parcel.area,
        prumer: davkaPrumer,
        min,
        max,
        rozptyl: max - min,
      })
    }
  }

  rozdily.sort((a, b) => b.rozptyl * b.area - a.rozptyl * a.area)

  console.log('Pozemek     |    ha | dávka z průměru | rozptyl jednotlivých vzorků | riziko (t)')
  console.log('-'.repeat(88))
  for (const r of rozdily.slice(0, 15)) {
    console.log(
      `${r.code.padEnd(11)} | ${r.area.toFixed(2).padStart(5)} | ${r.prumer.toFixed(2).padStart(15)} | ` +
        `${(r.min.toFixed(2) + ' – ' + r.max.toFixed(2)).padStart(27)} | ${(r.rozptyl * r.area).toFixed(1).padStart(9)}`
    )
  }

  const celkoveRiziko = rozdily.reduce((sum, r) => sum + r.rozptyl * r.area, 0)
  console.log('-'.repeat(88))
  console.log(`Pozemků, kde na výběru vzorku záleželo: ${rozdily.length}`)
  console.log(`Celkový rozptyl objednávky mezi "nejlepším" a "nejhorším" vzorkem: ${celkoveRiziko.toFixed(1)} t`)
}

main().catch(err => {
  console.error('💥 Chyba:', err)
  process.exit(1)
})
