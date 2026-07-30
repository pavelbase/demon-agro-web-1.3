import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  EXTRACTION_PROMPT,
  GEMINI_MODEL,
  buildValidationWarnings,
  cleanJsonString,
  normalizeData,
  validateExtractedData,
  type ExtractionResponse,
  type SoilAnalysis,
} from '@/lib/utils/soil-extraction'

// Načtení API klíče z prostředí (bezpečné)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
 
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
    
    // Kontrola, zda je API klíč nastaven
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY není nastaven')
      return NextResponse.json(
        { 
          error: 'Chyba konfigurace serveru', 
          details: 'GEMINI_API_KEY není nastaven v prostředí' 
        },
        { status: 500 }
      )
    }
    
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
    // 7b. PROGRAMOVÉ KONTROLY (nezávislé na sebehodnocení AI)
    // ========================================================================

    const programmaticWarnings = buildValidationWarnings(analyses)
    const aiValidationNotes: string[] = Array.isArray(rawData?.validation_notes)
      ? rawData.validation_notes.map((n: any) => String(n)).filter(Boolean)
      : []
    const validationErrors = [...aiValidationNotes, ...programmaticWarnings]

    const missingCultureCount = analyses.filter(a => a.culture === null || a.culture === 'jina').length
    if (missingCultureCount > 0) {
      console.warn(`⚠️ ${missingCultureCount}/${analyses.length} vzorků má nerozpoznanou nebo nepodporovanou kulturu - vyžaduje ruční kontrolu`)
    }

    const aiConfidence: 'high' | 'medium' | 'low' =
      rawData?.confidence === 'high' || rawData?.confidence === 'low' ? rawData.confidence : 'medium'
    // Pokud programové kontroly našly problém, nikdy nenech projít "high" confidence -
    // AI si sama nemusí všimnout, že např. kulturu nevrátila u všech vzorků.
    const confidence: 'high' | 'medium' | 'low' =
      validationErrors.length > 0 && aiConfidence === 'high' ? 'medium' : aiConfidence

    // ========================================================================
    // 8. SESTAVENÍ A VRÁCENÍ ODPOVĚDI
    // ========================================================================
    
    const response: ExtractionResponse = {
      analyses,
      pdfUrl,
      laboratory: rawData?.laboratory ? String(rawData.laboratory) : null,
      document_type: rawData?.document_type ? String(rawData.document_type) : null,
      document_date: rawData?.document_date ? String(rawData.document_date) : null,
      confidence,
      validationErrors,
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