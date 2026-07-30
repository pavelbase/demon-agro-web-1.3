import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorizeNutrient, categorizePh } from '@/lib/utils/soil-categories'

interface AnalysisInput {
  // Parcel info
  parcelId?: string // existing parcel ID
  createNewParcel?: boolean
  parcelName?: string
  parcelArea?: number
  parcelCode?: string // LPIS kód nebo lab označení (např. "0701/27")
  parcelSoilType?: 'L' | 'S' | 'T'
  parcelCulture?: 'orna' | 'ttp' | 'chmelnice'
  
  // Analysis data
  analysis_date: string
  ph: number
  phosphorus: number
  potassium: number
  magnesium: number
  calcium?: number | null
  sulfur?: number | null
  lab_name?: string | null
  methodology?: 'mehlich3' | 'vdlufa' | null
  notes?: string | null
  pdfUrl: string
}

interface BatchSaveRequest {
  userId: string
  analyses: AnalysisInput[]
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

    const { userId, analyses } = await request.json() as BatchSaveRequest

    // Verify user matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!analyses || analyses.length === 0) {
      return NextResponse.json(
        { error: 'Žádné rozbory k uložení' },
        { status: 400 }
      )
    }

    const results = {
      parcelsCreated: 0,
      parcelsReused: 0,
      analysesCreated: 0,
      errors: [] as string[],
      createdParcelIds: [] as string[],
      reusedParcelIds: [] as string[],
      createdAnalysisIds: [] as string[],
    }

    // Process each analysis
    console.log(`\n🚀 ========================================`)
    console.log(`🚀 ZAHÁJENÍ BATCH SAVE: ${analyses.length} rozborů`)
    console.log(`🚀 ========================================\n`)
    
    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i]
      
      console.log(`\n--- Rozbor ${i + 1}/${analyses.length} ---`)
      
      try {
        let parcelId = analysis.parcelId

        // Create new parcel if needed
        if (analysis.createNewParcel) {
          console.log(`\n📦 Rozbor ${i + 1}: Zpracovávám vytvoření pozemku`)
          console.log(`   - parcelName: "${analysis.parcelName}"`)
          console.log(`   - parcelCode: "${analysis.parcelCode}"`)
          console.log(`   - parcelArea: ${analysis.parcelArea}`)
          
          // Validace - název NEBO kód musí být vyplněn
          if ((!analysis.parcelName && !analysis.parcelCode) || !analysis.parcelArea) {
            results.errors.push(`Rozbor ${i + 1}: Chybí (název nebo kód) a výměra pozemku`)
            continue
          }

          // ANTI-DUPLIKÁT LOGIKA: Zkontroluj, jestli už neexistuje pozemek se stejným kódem
          let existingParcel = null
          if (analysis.parcelCode) {
            console.log(`🔍 Hledám existující pozemek s kódem: "${analysis.parcelCode}"`)
            
            const { data: found, error: searchError } = await supabase
              .from('parcels')
              .select('id, soil_type, name')
              .eq('user_id', userId)
              .eq('code', analysis.parcelCode)
              .eq('status', 'active')
              .maybeSingle()
            
            if (searchError) {
              console.error('❌ Chyba při hledání pozemku:', searchError)
            }
            
            existingParcel = found
            console.log(`🔍 Výsledek hledání: ${existingParcel ? `NALEZEN (id: ${existingParcel.id}, název: ${existingParcel.name})` : 'NENALEZEN'}`)
          } else {
            console.log(`⚠️ Bez kódu pozemku - nemohu kontrolovat duplikáty`)
          }

          if (existingParcel) {
            // Pozemek s tímto kódem už existuje - použij ho
            parcelId = existingParcel.id
            results.parcelsReused++
            if (parcelId && !results.reusedParcelIds.includes(parcelId)) {
              results.reusedParcelIds.push(parcelId)
            }
            console.log(`♻️ POUŽIT EXISTUJÍCÍ pozemek s kódem "${analysis.parcelCode}": ${parcelId}`)
          } else {
            // Vytvoř nový pozemek
            console.log(`✨ VYTVÁŘÍM NOVÝ pozemek (nenalezen existující)`)
            
            const parcelData = {
              user_id: userId,
              name: analysis.parcelName || analysis.parcelCode || 'Nový pozemek',
              area: analysis.parcelArea,
              code: analysis.parcelCode || null,
              soil_type: analysis.parcelSoilType || null,
              culture: analysis.parcelCulture || 'orna',
              status: 'active',
            }
            
            console.log('   Data pro nový pozemek:', JSON.stringify(parcelData, null, 2))
            
            const { data: newParcel, error: parcelError } = await supabase
              .from('parcels')
              .insert(parcelData)
              .select('id, soil_type')
              .single()

            if (parcelError) {
              console.error('❌ Chyba při vytváření pozemku:', parcelError)
              results.errors.push(`Rozbor ${i + 1}: Chyba při vytváření pozemku - ${parcelError.message}`)
              continue
            }

            parcelId = newParcel.id
            results.parcelsCreated++
            if (parcelId) {
              results.createdParcelIds.push(parcelId)
            }
            console.log(`✅ VYTVOŘEN nový pozemek s kódem "${analysis.parcelCode}": ${parcelId}`)
          }
        }

        // Validate parcel ID
        if (!parcelId) {
          results.errors.push(`Rozbor ${i + 1}: Chybí ID pozemku`)
          continue
        }

        // Verify parcel ownership and get soil type + kultura
        const { data: parcel, error: parcelCheckError } = await supabase
          .from('parcels')
          .select('id, soil_type, culture')
          .eq('id', parcelId)
          .eq('user_id', userId)
          .single()

        if (parcelCheckError || !parcel) {
          results.errors.push(`Rozbor ${i + 1}: Pozemek nenalezen nebo nemáte oprávnění`)
          continue
        }

        // Kategorize živiny podle druhu půdy a kultury (chmelnice mají vlastní
        // kritéria zásobenosti - viz zadani-chmelnice-engine.md)
        const soilType = parcel.soil_type
        const culture = parcel.culture
        const ph_category = categorizePh(analysis.ph)
        const p_category = categorizeNutrient('P', analysis.phosphorus, soilType, culture)
        const k_category = categorizeNutrient('K', analysis.potassium, soilType, culture)
        const mg_category = categorizeNutrient('Mg', analysis.magnesium, soilType, culture)
        const s_category = analysis.sulfur ? categorizeNutrient('S', analysis.sulfur, soilType) : null

        // Vypočti K:Mg ratio
        const k_mg_ratio = analysis.magnesium > 0 
          ? parseFloat((analysis.potassium / analysis.magnesium).toFixed(2))
          : null

        // Create soil analysis
        console.log(`\n📝 Rozbor ${i + 1}: Připravuji data pro soil_analyses INSERT`)
        console.log(`   - parcel_id: ${parcelId}`)
        console.log(`   - analysis_date: ${analysis.analysis_date}`)
        console.log(`   - methodology: ${analysis.methodology || 'mehlich3'}`)
        console.log(`   - ph: ${analysis.ph}`)
        console.log(`   - p: ${analysis.phosphorus}`)
        console.log(`   - k: ${analysis.potassium}`)
        console.log(`   - mg: ${analysis.magnesium}`)
        console.log(`   - ca: ${analysis.calcium || null}`)
        console.log(`   - s: ${analysis.sulfur || null}`)
        console.log(`   - k_mg_ratio: ${k_mg_ratio}`)
        console.log(`   - source_document: ${analysis.pdfUrl}`)
        
        try {
          const { data: newAnalysis, error: analysisError } = await supabase
            .from('soil_analyses')
            .insert({
              parcel_id: parcelId,
              analysis_date: analysis.analysis_date,
              methodology: analysis.methodology || 'mehlich3',
              
              // Živiny - krátké názvy sloupců (p, k, mg, ca, s)
              ph: analysis.ph,
              ph_category,
              p: analysis.phosphorus,
              p_category,
              k: analysis.potassium,
              k_category,
              mg: analysis.magnesium,
              mg_category,
              ca: analysis.calcium || null,
              s: analysis.sulfur || null,
              s_category,
              
              // Ratio
              k_mg_ratio,
              
              // Metadata
              source_document: analysis.pdfUrl,
              ai_extracted: true,
              user_validated: true,
              is_current: true,
            })
            .select('id')
            .single()

          if (analysisError) {
            console.error(`❌ Chyba při vytváření soil_analysis:`, analysisError)
            console.error(`   Full error object:`, JSON.stringify(analysisError, null, 2))
            results.errors.push(`Rozbor ${i + 1}: Chyba při ukládání rozboru - ${analysisError.message}`)
            continue
          }
          
          console.log(`✅ Rozbor ${i + 1} uložen s ID: ${newAnalysis.id}`)
          results.analysesCreated++
          if (newAnalysis?.id) {
            results.createdAnalysisIds.push(newAnalysis.id)
          }
          
        } catch (error) {
          console.error(`💥 Rozbor ${i + 1} - Neočekávaná chyba při soil_analyses INSERT:`, error)
          if (error instanceof Error) {
            console.error(`   Error message: ${error.message}`)
            console.error(`   Error stack:`, error.stack)
          }
          results.errors.push(`Rozbor ${i + 1}: ${error instanceof Error ? error.message : 'Neznámá chyba při ukládání rozboru'}`)
        }

      } catch (error) {
        console.error(`💥 Rozbor ${i + 1} - Neočekávaná chyba:`, error)
        results.errors.push(`Rozbor ${i + 1}: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
      }
    }

    console.log(`\n🏁 ========================================`)
    console.log(`🏁 DOKONČENO BATCH SAVE`)
    console.log(`   ✅ Vytvořeno pozemků: ${results.parcelsCreated}`)
    console.log(`   ♻️  Použito existujících: ${results.parcelsReused}`)
    console.log(`   📊 Uloženo rozborů: ${results.analysesCreated}`)
    console.log(`   ❌ Chyb: ${results.errors.length}`)
    console.log(`🏁 ========================================\n`)

    const parcelMsg = results.parcelsCreated > 0 
      ? `${results.parcelsCreated} pozemků vytvořeno`
      : ''
    const reusedMsg = results.parcelsReused > 0
      ? `${results.parcelsReused} rozborů přiřazeno k existujícím pozemkům`
      : ''
    const parcelSummary = [parcelMsg, reusedMsg].filter(Boolean).join(', ')
    
    return NextResponse.json({
      success: true,
      ...results,
      message: `Úspěšně uloženo: ${results.analysesCreated} rozborů (${parcelSummary || 'bez nových pozemků'})`,
    })

  } catch (error) {
    console.error('Batch save error:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při hromadném ukládání',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
}
