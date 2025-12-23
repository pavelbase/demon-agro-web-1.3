import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = "AIzaSyCamLqh5Ys8ji8JPZ_PndtPWsfbri-nHgg";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log(">>> DEBUG: API Route extract-soil-data byla zavolána! <<<");
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { pdfUrl } = body

    if (!pdfUrl) return NextResponse.json({ error: 'No PDF URL' }, { status: 400 })

    console.log("Stahuji PDF:", pdfUrl)
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) throw new Error('Failed to fetch PDF')
    
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

    console.log("Volám Gemini...")
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    })

    const result = await model.generateContent([
      { inlineData: { data: base64Pdf, mimeType: 'application/pdf' } },
      { text: "Extrahuj data z půdního rozboru do JSON. Klíče: analysis_date, ph, phosphorus, potassium, magnesium, calcium. Vrať validní JSON." }
    ])

    const text = result.response.text()
    console.log("Gemini odpověděl:", text.substring(0, 50) + "...")

    const cleanedText = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleanedText)

    return NextResponse.json({ ...data, pdfUrl, extractedAt: new Date().toISOString() })

  } catch (error) {
    console.error('API CHYBA:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
