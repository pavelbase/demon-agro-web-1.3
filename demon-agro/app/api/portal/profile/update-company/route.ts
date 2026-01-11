import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Ověření přihlášení
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nepřihlášený uživatel' },
        { status: 401 }
      )
    }

    // Načtení dat z requestu
    const body = await request.json()
    const { companyName } = body

    // Validace
    if (typeof companyName !== 'string') {
      return NextResponse.json(
        { error: 'Neplatný formát názvu společnosti' },
        { status: 400 }
      )
    }

    // Aktualizace profilu
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        company_name: companyName.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating company name:', updateError)
      return NextResponse.json(
        { error: 'Chyba při aktualizaci názvu společnosti' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Název společnosti byl úspěšně aktualizován' 
    })

  } catch (error) {
    console.error('Error in update-company route:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}


