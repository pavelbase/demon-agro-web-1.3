import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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

    const { pdfUrl, documentType, userId } = await request.json()

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF URL není poskytnuto' },
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

    // Download PDF from Supabase Storage
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      throw new Error('Nelze stáhnout PDF soubor')
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    // Prepare extraction prompt based on document type
    const systemPrompt = getSystemPrompt(documentType)
    const userPrompt = getUserPrompt(documentType)

    // Call Anthropic API with PDF
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    })

    // Extract JSON from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
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
  return `Extrahuj následující data z tohoto půdního rozboru a vrať je jako JSON objekt:

{
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
  "lab_name": string | null,
  "cadastral_number": string | null,
  "parcel_name": string | null,
  "notes": string | null,
  "confidence": "high" | "medium" | "low"
}

PRAVIDLA:
- analysis_date: Datum odběru vzorku nebo datum analýzy
- ph: Hodnota pH (CaCl2 nebo KCl, pokud obě, preferuj CaCl2)
- phosphorus: Fosfor (P) v mg/kg (může být označen jako P2O5)
- potassium: Draslík (K) v mg/kg (může být označen jako K2O)
- magnesium: Hořčík (Mg) v mg/kg (může být označen jako MgO)
- calcium: Vápník (Ca) v mg/kg (může být označen jako CaO) - pokud dostupný
- nitrogen: Dusík (N) v mg/kg - pokud dostupný
- lab_name: Název laboratoře
- cadastral_number: Katastrální číslo pozemku (pokud uvedeno)
- parcel_name: Název pozemku (pokud uveden)
- notes: Jakékoliv důležité poznámky nebo doporučení z rozboru
- confidence: Jak si jsi jistý extrakcí (high/medium/low)

Vrať POUZE JSON objekt bez dalšího textu nebo vysvětlení.`
}

function validateExtractedData(data: any): string[] {
  const errors: string[] = []

  // Required fields
  if (!data.analysis_date) {
    errors.push('Chybí datum analýzy')
  } else {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(data.analysis_date)) {
      errors.push('Neplatný formát data')
    }
  }

  if (typeof data.ph !== 'number' || data.ph < 4 || data.ph > 9) {
    errors.push('Neplatná hodnota pH (očekáváno 4-9)')
  }

  if (typeof data.phosphorus !== 'number' || data.phosphorus < 0 || data.phosphorus > 1000) {
    errors.push('Neplatná hodnota P (očekáváno 0-1000 mg/kg)')
  }

  if (typeof data.potassium !== 'number' || data.potassium < 0 || data.potassium > 1000) {
    errors.push('Neplatná hodnota K (očekáváno 0-1000 mg/kg)')
  }

  if (typeof data.magnesium !== 'number' || data.magnesium < 0 || data.magnesium > 1000) {
    errors.push('Neplatná hodnota Mg (očekáváno 0-1000 mg/kg)')
  }

  // Optional fields validation
  if (data.calcium !== null && (typeof data.calcium !== 'number' || data.calcium < 0)) {
    errors.push('Neplatná hodnota Ca')
  }

  if (data.nitrogen !== null && (typeof data.nitrogen !== 'number' || data.nitrogen < 0)) {
    errors.push('Neplatná hodnota N')
  }

  return errors
}
