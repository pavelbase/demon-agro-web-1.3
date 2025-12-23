import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// Helper function to extract filename from Supabase Storage URL
function extractFilenameFromUrl(url: string): string {
  try {
    // Supabase storage URLs have format: 
    // https://[project].supabase.co/storage/v1/object/public/soil-documents/[filepath]
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Find 'soil-documents' in the path and get everything after it
    const bucketIndex = pathParts.indexOf('soil-documents')
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/')
    }
    
    // Fallback: try to get the last parts of the path
    // Looking for pattern like: userId/temp/filename.pdf
    const lastThreeParts = pathParts.slice(-3).join('/')
    if (lastThreeParts.includes('.pdf')) {
      return lastThreeParts
    }
    
    return ''
  } catch (error) {
    console.error('Error extracting filename from URL:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { pdfUrl, filename, documentType, userId } = await request.json()

    if (!pdfUrl && !filename) {
      return NextResponse.json(
        { error: 'PDF URL nebo filename není poskytnuto' },
        { status: 400 }
      )
    }

    // Check daily extraction limit (10 per user)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('soil_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    if (count !== null && count >= 10) {
      return NextResponse.json(
        { error: 'Denní limit extrakcí vyčerpán (10/10). Zkuste to zítra.' },
        { status: 429 }
      )
    }

    // Download PDF from Supabase Storage using the correct bucket
    let pdfBuffer: ArrayBuffer
    
    // Try to extract filename from pdfUrl if filename not provided
    const filePathToDownload = filename || extractFilenameFromUrl(pdfUrl)
    
    if (filePathToDownload) {
      // Use Supabase Storage API to download from soil-documents bucket
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('soil-documents')
        .download(filePathToDownload)
      
      if (downloadError || !downloadData) {
        console.error('Supabase storage download error:', downloadError)
        // Fallback to fetch if storage download fails
        const pdfResponse = await fetch(pdfUrl)
        if (!pdfResponse.ok) {
          throw new Error('Nelze stáhnout PDF soubor')
        }
        pdfBuffer = await pdfResponse.arrayBuffer()
      } else {
        pdfBuffer = await downloadData.arrayBuffer()
      }
    } else {
      // Fallback to direct fetch if we can't determine the filename
      const pdfResponse = await fetch(pdfUrl)
      if (!pdfResponse.ok) {
        throw new Error('Nelze stáhnout PDF soubor')
      }
      pdfBuffer = await pdfResponse.arrayBuffer()
    }

    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    // Prepare extraction prompt based on document type
    const systemPrompt = getSystemPrompt(documentType)
    const userPrompt = getUserPrompt(documentType)

    // Call Google Gemini API with PDF
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
      systemInstruction: systemPrompt,
    })

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Pdf,
          mimeType: 'application/pdf',
        },
      },
      {
        text: userPrompt,
      },
    ])

    // Extract JSON from response
    const response = await result.response
    const responseText = response.text()
    
    // Parse JSON response
    let extractedData
    try {
      // Try to find JSON in the response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText
      extractedData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text:', responseText)
      return NextResponse.json(
        { error: 'Nepodařilo se parsovat extrahovaná data' },
        { status: 500 }
      )
    }

    // Validate extracted data
    const validationErrors = validateExtractedData(extractedData)
    if (validationErrors.length > 0) {
      extractedData.validationErrors = validationErrors
      extractedData.confidence = 'low'
    }

    // Add metadata
    extractedData.pdfUrl = pdfUrl
    extractedData.extractedAt = new Date().toISOString()
    extractedData.documentType = documentType

    return NextResponse.json(extractedData)

  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při extrakci dat',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}

function getSystemPrompt(documentType: string): string {
  const basePrompt = `Jsi expert na analýzu půdních rozborů. Tvým úkolem je extrahovat strukturovaná data z PDF dokumentu.

DŮLEŽITÉ:
- Extrahuj pouze faktická data, která jsou v dokumentu
- Pokud hodnota není v dokumentu, použij null
- Všechna čísla zaokrouhli na 2 desetinná místa
- Pro datum použij formát YYYY-MM-DD
- Kategorie nutrientů: N (Nízký), VH (Velmi Hluboký), D (Dobrý), V (Vysoký), VV (Velmi Vysoký)
- pH kategorie: EK (Extrémně Kyselý), SK (Silně Kyselý), N (Neutrální), SZ (Slabě Zásaditý), EZ (Extrémně Zásaditý)`

  if (documentType === 'azzp') {
    return basePrompt + `\n\nDokument je AZZP zpráva (Agregovaný zemědělský zásobovací podnik) od ÚKZÚZ.`
  } else if (documentType === 'lab') {
    return basePrompt + `\n\nDokument je standardní laboratorní protokol od akreditované laboratoře.`
  }

  return basePrompt + `\n\nAutomaticky detekuj typ dokumentu a extrahuj data podle odpovídajícího formátu.`
}

function getUserPrompt(documentType: string): string {
  return `Extrahuj data z tohoto půdního rozboru. Dokument může obsahovat jeden nebo více rozborů (pozemků).

Vrať JSON ve formátu:

{
  "analyses": [
    {
      "parcel_name": string | null,
      "cadastral_number": string | null,
      "area_ha": number | null,
      "soil_type": string | null,
      "analysis_date": "YYYY-MM-DD",
      "ph": number,
      "ph_category": "EK" | "SK" | "N" | "SZ" | "EZ" | null,
      "phosphorus": number,
      "phosphorus_category": "N" | "VH" | "D" | "V" | "VV" | null,
      "potassium": number,
      "potassium_category": "N" | "VH" | "D" | "V" | "VV" | null,
      "magnesium": number,
      "magnesium_category": "N" | "VH" | "D" | "V" | "VV" | null,
      "calcium": number | null,
      "calcium_category": "N" | "VH" | "D" | "V" | "VV" | null,
      "nitrogen": number | null,
      "methodology": string | null,
      "notes": string | null
    }
  ],
  "laboratory": string | null,
  "document_type": "AZZP" | "lab" | "other",
  "document_date": "YYYY-MM-DD" | null,
  "confidence": "high" | "medium" | "low"
}

PRAVIDLA PRO EXTRAKCI:
1. VŽDY vrať pole "analyses", i když je jen jeden rozbor
2. Pro každý rozbor/pozemek v dokumentu vytvoř samostatný objekt v poli
3. AZZP zprávy typicky obsahují 10-50+ pozemků - extrahuj všechny
4. Laboratorní protokoly typicky obsahují 1-5 rozborů

PRAVIDLA PRO HODNOTY:
- parcel_name: Název pozemku/dílu (např. "Za humny", "Pole 1", "Díl 123/4")
- cadastral_number: Katastrální číslo pozemku (např. "1234/5")
- area_ha: Výměra pozemku v hektarech
- soil_type: Typ půdy (např. "hlinitá", "písčitá", "jílovitá")
- analysis_date: Datum odběru vzorku nebo datum analýzy
- ph: Hodnota pH (CaCl2 nebo KCl, pokud obě, preferuj CaCl2)
- phosphorus: Fosfor (P) v mg/kg (může být označen jako P2O5)
- potassium: Draslík (K) v mg/kg (může být označen jako K2O)
- magnesium: Hořčík (Mg) v mg/kg (může být označen jako MgO)
- calcium: Vápník (Ca) v mg/kg (může být označen jako CaO) - pokud dostupný
- nitrogen: Dusík (N) v mg/kg - pokud dostupný
- methodology: Metoda analýzy (např. "Mehlich III", "Egner-Riehm")
- laboratory: Název laboratoře (např. "ÚKZÚZ Brno", "ZEPOS")
- document_type: Typ dokumentu
- confidence: Celková jistota extrakce (high/medium/low)

DŮLEŽITÉ:
- Extrahuj VŠECHNY rozbory z dokumentu
- Každý pozemek/díl/rozbor = jeden objekt v poli analyses
- Pokud hodnota není v dokumentu, použij null
- Všechna čísla zaokrouhli na 2 desetinná místa

Vrať POUZE JSON objekt bez dalšího textu nebo vysvětlení.`
}

function validateExtractedData(data: any): string[] {
  const errors: string[] = []

  // Check for analyses array
  if (!data.analyses || !Array.isArray(data.analyses)) {
    errors.push('Chybí pole rozborů (analyses)')
    return errors
  }

  if (data.analyses.length === 0) {
    errors.push('Nebyly extrahovány žádné rozbory')
    return errors
  }

  // Validate each analysis
  data.analyses.forEach((analysis: any, index: number) => {
    const prefix = data.analyses.length > 1 ? `Rozbor ${index + 1}: ` : ''

    // Required fields
    if (!analysis.analysis_date) {
      errors.push(`${prefix}Chybí datum analýzy`)
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(analysis.analysis_date)) {
        errors.push(`${prefix}Neplatný formát data`)
      }
    }

    if (typeof analysis.ph !== 'number' || analysis.ph < 4 || analysis.ph > 9) {
      errors.push(`${prefix}Neplatná hodnota pH (očekáváno 4-9)`)
    }

    if (typeof analysis.phosphorus !== 'number' || analysis.phosphorus < 0 || analysis.phosphorus > 1000) {
      errors.push(`${prefix}Neplatná hodnota P (očekáváno 0-1000 mg/kg)`)
    }

    if (typeof analysis.potassium !== 'number' || analysis.potassium < 0 || analysis.potassium > 1000) {
      errors.push(`${prefix}Neplatná hodnota K (očekáváno 0-1000 mg/kg)`)
    }

    if (typeof analysis.magnesium !== 'number' || analysis.magnesium < 0 || analysis.magnesium > 1000) {
      errors.push(`${prefix}Neplatná hodnota Mg (očekáváno 0-1000 mg/kg)`)
    }

    // Optional fields validation
    if (analysis.calcium !== null && (typeof analysis.calcium !== 'number' || analysis.calcium < 0)) {
      errors.push(`${prefix}Neplatná hodnota Ca`)
    }

    if (analysis.nitrogen !== null && (typeof analysis.nitrogen !== 'number' || analysis.nitrogen < 0)) {
      errors.push(`${prefix}Neplatná hodnota N`)
    }

    if (analysis.area_ha !== null && (typeof analysis.area_ha !== 'number' || analysis.area_ha <= 0)) {
      errors.push(`${prefix}Neplatná výměra pozemku`)
    }
  })

  return errors
}
