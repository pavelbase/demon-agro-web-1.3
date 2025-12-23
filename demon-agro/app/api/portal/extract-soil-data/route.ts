import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// VÁŠ KLÍČ
const API_KEY = "AIzaSyCamLqh5Ys8ji8JPZ_PndtPWsfbri-nHgg";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log(">>> START: Soil Extraction (Gemini Pro) <<<")
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Request parsing
    const { pdfUrl, documentType, parcelId } = await request.json()
    if (!pdfUrl) return NextResponse.json({ error: 'No PDF URL' }, { status: 400 })

    // 3. Download PDF (Supabase Internal)
    console.log("Stahuji PDF interně:", pdfUrl)
    const storagePath = pdfUrl.split('/soil-documents/')[1]
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('soil-documents')
      .download(storagePath)

    if (downloadError) throw new Error(`Chyba stahování ze Supabase: ${downloadError.message}`)
    
    const pdfBuffer = await fileData.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    // 4. Prepare Prompts
    const systemPrompt = `Jsi expert na analýzu půdních rozborů (AZZP a laboratorní protokoly). 
    Tvým úkolem je extrahovat přesná data.
    - Pokud hodnota chybí, vrať null.
    - Čísla převáděj na typ number (tečka jako desetinný oddělovač).
    - Datum formátuj YYYY-MM-DD.
    - Kategorie (pH, živiny) převeď na zkratky: N (Nízký), D (Dobrý/Vyhovující), V (Vysoký), VV (Velmi vysoký).`

    const userPrompt = `Analyzuj přiložené PDF a extrahuj data do tohoto JSON formátu:
    {
      "analysis_date": "YYYY-MM-DD",
      "ph": number,
      "ph_category": string,
      "phosphorus": number,
      "phosphorus_category": string,
      "potassium": number,
      "potassium_category": string,
      "magnesium": number,
      "magnesium_category": string,
      "calcium": number,
      "calcium_category": string,
      "nitrogen": number,
      "lab_name": string,
      "cadastral_number": string,
      "parcel_name": string,
      "notes": string,
      "confidence": "high" | "medium" | "low"
    }
    Vrať POUZE validní JSON.`

    // 5. Gemini Call
    console.log("Volám Gemini 1.5 Pro...")
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro', // Používáme PRO verzi
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: systemPrompt
    })

    const result = await model.generateContent([
      { inlineData: { data: base64Pdf, mimeType: 'application/pdf' } },
      { text: userPrompt }
    ])

    const text = result.response.text()
    console.log("Gemini odpověděl (délka):", text.length)

    // 6. Parse & Validate
    const cleanedText = text.replace(/```json|```/g, '').trim()
    const extractedData = JSON.parse(cleanedText)

    // Basic Validation logic
    if (!extractedData.analysis_date) extractedData.confidence = 'low';

    return NextResponse.json({ 
        ...extractedData, 
        pdfUrl, 
        parcelId, 
        extractedAt: new Date().toISOString() 
    })

  } catch (error) {
    console.error('CRITICAL ERROR:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
