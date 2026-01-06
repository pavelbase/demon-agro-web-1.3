import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { changePasswordSchema } from '@/lib/utils/validations'

/**
 * API route pro změnu hesla uživatele
 * Poskytuje dodatečnou vrstvu zabezpečení s validací na backendu
 */
export async function POST(request: NextRequest) {
  try {
    // Získání Supabase klienta
    const supabase = await createClient()

    // Ověření, že je uživatel přihlášen
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Nejste přihlášeni' },
        { status: 401 }
      )
    }

    // Parsování a validace requestu
    const body = await request.json()
    const validationResult = changePasswordSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Neplatné vstupní údaje',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    // Ověření současného hesla pokusem o přihlášení
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (verifyError) {
      return NextResponse.json(
        { success: false, error: 'Současné heslo není správné' },
        { status: 400 }
      )
    }

    // Změna hesla
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'Nepodařilo se změnit heslo. Zkuste to prosím znovu.',
        },
        { status: 500 }
      )
    }

    // Logování změny hesla do audit logu (volitelné)
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'Změna hesla',
        table_name: 'auth.users',
        record_id: user.id,
      })
    } catch (auditError) {
      // Neúspěšné logování by nemělo znemožnit změnu hesla
      console.error('Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Heslo bylo úspěšně změněno',
    })
  } catch (error) {
    console.error('Change password API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Došlo k neočekávané chybě. Zkuste to prosím znovu.',
      },
      { status: 500 }
    )
  }
}

