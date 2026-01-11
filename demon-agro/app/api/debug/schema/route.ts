import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  try {
    // Zkus SELECT * s LIMIT 0 - vrátí strukturu bez dat
    const { data: parcelData, error: parcelError } = await supabase
      .from('parcels')
      .select('*')
      .limit(0)
    
    const { data: analysisData, error: analysisError } = await supabase
      .from('soil_analyses')
      .select('*')
      .limit(0)
    
    // Zkus získat první záznam pro zjištění struktury
    const { data: sampleParcel } = await supabase
      .from('parcels')
      .select('*')
      .limit(1)
      .single()
    
    const { data: sampleAnalysis } = await supabase
      .from('soil_analyses')
      .select('*')
      .limit(1)
      .single()
    
    return NextResponse.json({
      parcels: {
        columns: sampleParcel ? Object.keys(sampleParcel) : [],
        sample: sampleParcel,
        error: parcelError
      },
      soil_analyses: {
        columns: sampleAnalysis ? Object.keys(sampleAnalysis) : [],
        sample: sampleAnalysis,
        error: analysisError
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}




