import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ============================================================================
// KONFIGURACE
// ============================================================================

// ZDE SI UŽIVATEL DOPLNÍ SVŮJ FUNKČNÍ KLÍČ
const GEMINI_API_KEY = "AIzaSyCxy7KtycmhjXN6DFa0vMi6M-cnqJgRFbA"

// Model, který funguje (ověřeno)
const GEMINI_MODEL = "gemini-1.5-flash-latest"

// ============================================================================
// TYPY
// ============================================================================

interface SoilAnalysis {
  analysis_date: string // YYYY-MM-DD
  ph: number | null
  phosphorus: number | null // P
  potassium: number | null // K
  magnesium: number | null // Mg
  calcium: number | null // Ca
  notes: string
}

interface ExtractionResponse {
  analyses: SoilAnalysis[]
  pdfUrl: string
}

// ============================================================================
// HELPER FUNKCE
// ============================================================================

/**
 * Odstraní Markdown značky (```json, ```) a ořízne text
 */
function cleanJsonString(text: string): string {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()
}

/**
 * Parsuje datum z různých formátů a převede na ISO (YYYY-MM-DD)
 */
function parseDate(dateValue: any): string {
  if (!dateValue) return new Date().toISOString().split('T')[0]
  
  const dateStr = String(dateValue).trim()
  
  // Pokud už je ISO formát (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // Pokud je DD.MM.YYYY nebo DD/MM/YYYY
  const europeanMatch = dateStr.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/)
  if (europeanMatch) {
    const [, day, month, year] = europeanMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Pokud je DD-MM-YYYY
  const dashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dashMatch) {
    const [, day, month, year] = dashMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Zkusit standardní Date parsing
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch {
    // Fallback na dnešní datum
  }
  
  // Fallback: dnešní datum
  return new Date().toISOString().split('T')[0]
}

/**
 * Parsuje číselnou hodnotu a odstraní jednotky (mg/kg, %, atd.)
 */
function parseNumericValue(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  
  // Pokud už je číslo, vrať ho
  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }
  
  // Převeď na string a očisti
  let strValue = String(value).trim()
  
  // Odstraň jednotky (mg/kg, %, ppm, atd.)
  strValue = strValue.replace(/\s*(mg\/kg|mg|kg|%|ppm|mmol\/kg|meq\/l)\s*/gi, '')
  
  // Nahraď desetinnou čárku za tečku
  strValue = strValue.replace(',', '.')
  
  // Odstraň mezery
  strValue = strValue.replace(/\s/g, '')
  
  // Zkus parsovat
  const parsed = parseFloat(strValue)
  
  return isNaN(parsed) ? null : parsed
}

/**
 * Normalizuje jeden vzorek analýzy
 */
function normalizeSample(sample: any): SoilAnalysis {
  return {
    analysis_date: parseDate(sample.analysis_date || sample.date || sample.datum || null),
    ph: parseNumericValue(sample.ph || sample.pH || sample.PH),
    phosphorus: parseNumericValue(sample.phosphorus || sample.p || sample.P),
    potassium: parseNumericValue(sample.potassium || sample.k || sample.K),
    magnesium: parseNumericValue(sample.magnesium || sample.mg || sample.Mg),
    calcium: parseNumericValue(sample.calcium || sample.ca || sample.Ca),
    notes: String(sample.notes || sample.poznamka || sample.poznámka || '').trim()
  }
}

/**
 * Zajistí, že výstup je vždy objekt s polem `analyses`
 */
function normalizeData(data: any): SoilAnalysis[] {
  // Pokud je data null nebo undefined
  if (!data) {
    throw new Error('AI nevrátila žádná data')
  }
  
  // Pokud už má správnou strukturu
  if (data.analyses && Array.isArray(data.analyses)) {
    return data.analyses.map(normalizeSample)
  }
  
  // Pokud je to pole přímo
  if (Array.isArray(data)) {
    return data.map(normalizeSample)
  }
  
  // Pokud je to objekt s indexy {"0": {...}, "1": {...}}
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    
    // Zkontroluj, jestli jsou klíče numerické
    const isIndexed = keys.every(key => /^\d+$/.test(key))
    
    if (isIndexed && keys.length > 0) {
      // Převeď na pole
      const samples = keys.sort((a, b) => parseInt(a) - parseInt(b)).map(key => data[key])
      return samples.map(normalizeSample)
    }
    
    // Pokud je to jeden objekt (jeden vzorek)
    if (keys.length > 0) {
      return [normalizeSample(data)]
    }
  }
  
  throw new Error('Neznámý formát dat z AI')
}

/**
 * Validuje, že máme alespoň nějaká data
 */
function validateExtractedData(analyses: SoilAnalysis[]): void {
  if (analyses.length === 0) {
    throw new Error('AI neextrahovala žádná data z PDF')
  }
  
  // Zkontroluj, že alespoň jeden vzorek má nějaká data
  const hasAnyData = analyses.some(sample => 
    sample.ph !== null || 
    sample.phosphorus !== null || 
    sample.potassium !== null || 
    sample.magnesium !== null || 
    sample.calcium !== null
  )
  
  if (!hasAnyData) {
    throw new Error('AI extrahovala vzorky, ale žádný neobsahuje hodnoty')
  }
}

// ============================================================================
// PROMPT PRO GEMINI
// ============================================================================

const EXTRACTION_PROMPT = `Jsi expert na analýzu půdních rozborů. Analyzuj přiložený PDF dokument a extrahuj VŠECHNA data půdních analýz.

DŮLEŽITÉ: 
- V PDF může být TABULKA s MNOHA vzorky (řádky). Extrahuj VŠECHNY řádky!
- Každý řádek/vzorek v tabulce je jedna analýza.
- Pokud je v PDF jen jeden vzorek, vrať pole s jedním objektem.
- Pokud je v PDF tabulka s 10 vzorky, vrať pole s 10 objekty.

FORMÁT ODPOVĚDI (JSON):
{
  "analyses": [
    {
      "analysis_date": "YYYY-MM-DD",
      "ph": number | null,
      "phosphorus": number | null,
      "potassium": number | null,
      "magnesium": number | null,
      "calcium": number | null,
      "notes": "jakékoliv poznámky nebo identifikační údaje"
    },
    ... další vzorky ...
  ]
}

CO HLEDAT:
- analysis_date: Datum odběru vzorku nebo analýzy (formát YYYY-MM-DD)
- ph: Hodnota pH (kyselost půdy)
- phosphorus: Fosfor (P, P₂O₅) v mg/kg
- potassium: Draslík (K, K₂O) v mg/kg
- magnesium: Hořčík (Mg, MgO) v mg/kg
- calcium: Vápník (Ca, CaO) v mg/kg
- notes: Číslo parcely, identifikace vzorku, nebo jiné poznámky

PRAVIDLA:
1. Pokud hodnota není v PDF, použij null
2. Extrahuj jen číselné hodnoty (bez jednotek)
3. Pokud je hodnota jako "< 10", použij 10
4. Pokud je rozsah "10-15", použij střed (12.5)
5. Ignoruj tučné nebo referenční řádky (např. "doporučené hodnoty")
6. Datum převeď vždy na formát YYYY-MM-DD

VRAŤ POUZE ČISTÝ JSON, BEZ MARKDOWN ZNAČEK!`;

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('═══════════════════════════════════════════════════')
    console.log('🚀 START: Soil Data Extraction API')
    console.log('═══════════════════════════════════════════════════')
    
    // ========================================================================
    // 1. AUTENTIZACE
    // ========================================================================
    
    console.log('🔐 Ověřuji uživatele...')
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return NextResponse.json(
        { error: 'Chyba autentizace', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.error('❌ Uživatel není přihlášen')
      return NextResponse.json(
        { error: 'Unauthorized - musíte být přihlášeni' },
        { status: 401 }
      )
    }
    
    console.log('✅ Uživatel ověřen:', user.email)
    
    // ========================================================================
    // 2. PARSING REQUESTU
    // ========================================================================
    
    console.log('📥 Parsování requestu...')
    let pdfUrl: string
    
    try {
      const body = await request.json()
      pdfUrl = body.pdfUrl
    } catch (parseError) {
      console.error('❌ Chyba parsování JSON:', parseError)
      return NextResponse.json(
        { error: 'Neplatný formát requestu' },
        { status: 400 }
      )
    }
    
    if (!pdfUrl || typeof pdfUrl !== 'string') {
      console.error('❌ Chybí pdfUrl v requestu')
      return NextResponse.json(
        { error: 'Chybí parametr pdfUrl' },
        { status: 400 }
      )
    }
    
    console.log('✅ PDF URL:', pdfUrl)
    
    // ========================================================================
    // 3. STAŽENÍ PDF ZE SUPABASE STORAGE
    // ========================================================================
    
    console.log('📄 Stahuji PDF ze storage...')
    
    // Extrahuj cestu ze storage URL
    const storagePath = pdfUrl.split('/soil-documents/')[1]
    
    if (!storagePath) {
      console.error('❌ Neplatná URL storage')
      return NextResponse.json(
        { error: 'Neplatná URL PDF souboru' },
        { status: 400 }
      )
    }
    
    console.log('📁 Storage path:', storagePath)
    
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('soil-documents')
      .download(storagePath)
    
    if (downloadError) {
      console.error('❌ Chyba stahování:', downloadError.message)
      return NextResponse.json(
        { error: 'Chyba stahování PDF', details: downloadError.message },
        { status: 500 }
      )
    }
    
    if (!fileData) {
      console.error('❌ Soubor nenalezen')
      return NextResponse.json(
        { error: 'PDF soubor nenalezen' },
        { status: 404 }
      )
    }
    
    console.log('✅ PDF staženo, velikost:', fileData.size, 'bytes')
    
    // ========================================================================
    // 4. KONVERZE PDF NA BASE64
    // ========================================================================
    
    console.log('🔄 Konvertuji PDF na Base64...')
    
    const pdfBuffer = await fileData.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')
    
    console.log('✅ Base64 vytvořen, délka:', base64Pdf.length, 'znaků')
    
    // ========================================================================
    // 5. VOLÁNÍ GEMINI API
    // ========================================================================
    
    console.log('🤖 Volám Gemini API...')
    console.log('   Model:', GEMINI_MODEL)
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1, // Nízká teplota pro konzistentní výsledky
      }
    })
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Pdf,
          mimeType: 'application/pdf'
        }
      },
      {
        text: EXTRACTION_PROMPT
      }
    ])
    
    const responseText = result.response.text()
    
    console.log('✅ Gemini odpověděl')
    console.log('📝 Délka odpovědi:', responseText.length, 'znaků')
    
    // ========================================================================
    // 6. PARSOVÁNÍ A ČIŠTĚNÍ ODPOVĚDI
    // ========================================================================
    
    console.log('🧹 Čistím a parsuju JSON...')
    
    const cleanedText = cleanJsonString(responseText)
    
    let rawData: any
    try {
      rawData = JSON.parse(cleanedText)
    } catch (jsonError) {
      console.error('❌ Chyba parsování JSON:', jsonError)
      console.error('📄 Raw text:', cleanedText.substring(0, 500))
      return NextResponse.json(
        { error: 'AI vrátila neplatný JSON', details: String(jsonError) },
        { status: 500 }
      )
    }
    
    console.log('✅ JSON naparsován')
    
    // ========================================================================
    // 7. NORMALIZACE A VALIDACE DAT
    // ========================================================================
    
    console.log('🔧 Normalizuji data...')
    
    let analyses: SoilAnalysis[]
    try {
      analyses = normalizeData(rawData)
    } catch (normalizeError) {
      console.error('❌ Chyba normalizace:', normalizeError)
      return NextResponse.json(
        { error: 'Chyba normalizace dat', details: String(normalizeError) },
        { status: 500 }
      )
    }
    
    console.log('✅ Data normalizována, počet vzorků:', analyses.length)
    
    console.log('🔍 Validuji data...')
    try {
      validateExtractedData(analyses)
    } catch (validationError) {
      console.error('❌ Validace selhala:', validationError)
      return NextResponse.json(
        { error: String(validationError) },
        { status: 422 }
      )
    }
    
    console.log('✅ Data validována')
    
    // ========================================================================
    // 8. SESTAVENÍ A VRÁCENÍ ODPOVĚDI
    // ========================================================================
    
    const response: ExtractionResponse = {
      analyses,
      pdfUrl
    }
    
    const duration = Date.now() - startTime
    
    console.log('═══════════════════════════════════════════════════')
    console.log('✨ SUCCESS: Extrakce dokončena')
    console.log('   Počet vzorků:', analyses.length)
    console.log('   Trvání:', duration, 'ms')
    console.log('═══════════════════════════════════════════════════')
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error: any) {
    const duration = Date.now() - startTime
    
    console.error('═══════════════════════════════════════════════════')
    console.error('💥 CRITICAL ERROR')
    console.error('   Trvání:', duration, 'ms')
    console.error('   Error:', error)
    console.error('═══════════════════════════════════════════════════')
    
    return NextResponse.json(
      {
        error: 'Kritická chyba při zpracování',
        details: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
