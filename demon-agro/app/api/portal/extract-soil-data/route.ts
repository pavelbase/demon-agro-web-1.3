import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ZDE SI UŽIVATEL DOPLNÍ SVŮJ NOVÝ KLÍČ RUČNĚ
const API_KEY = "AIzaSyCxy7KtycmhjXN6DFa0vMi6M-cnqJgRFbA"; 

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log(">>> START: Soil Extraction (RECOVERY MODE) <<<")
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Request parsing
    const { pdfUrl } = await request.json()
    if (!pdfUrl) return NextResponse.json({ error: 'No PDF URL' }, { status: 400 })

    // 3. Download PDF
    const storagePath = pdfUrl.split('/soil-documents/')[1]
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('soil-documents')
      .download(storagePath)

    if (downloadError) throw new Error(`Chyba stahování: ${downloadError.message}`)
    
    const pdfBuffer = await fileData.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    // 4. Gemini Call
    console.log("Volám Gemini 1.5 Flash...")
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = `Analyzuj tento půdní rozbor a vytáhni data do JSON:
    {
      "analysis_date": "YYYY-MM-DD",
      "ph": number,
      "phosphorus": number,
      "potassium": number,
      "magnesium": number,
      "calcium": number,
      "notes": string
    }
    Pokud hodnota chybí, dej null.`;

    const result = await model.generateContent([
      { inlineData: { data: base64Pdf, mimeType: 'application/pdf' } },
      { text: prompt }
    ])

    const text = result.response.text()
    console.log("Gemini odpověděl úspěšně!")

    const cleanedText = text.replace(/```json|```/g, '').trim()
    const extractedData = JSON.parse(cleanedText)

    return NextResponse.json({ ...extractedData, pdfUrl })

  } catch (error) {
    console.error('CRITICAL ERROR:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
