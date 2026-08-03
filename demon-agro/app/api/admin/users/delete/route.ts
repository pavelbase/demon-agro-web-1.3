import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/supabase/auth-helpers'

type AdminClient = ReturnType<typeof createAdminClient>

// Tabulky vlastněné uživatelem, které se smažou kaskádou přes profiles.
const OWNED_TABLES = [
  { table: 'parcels', label: 'pozemky' },
  { table: 'land_blocks', label: 'díly půdních bloků' },
  { table: 'applications', label: 'záznamy o aplikacích' },
  { table: 'liming_requests', label: 'poptávky vápnění' },
  { table: 'product_cards', label: 'karty přípravků' },
  { table: 'crop_parcels', label: 'plodiny na pozemcích' },
  { table: 'agro_customers', label: 'agro zákazníci' },
] as const

async function collectRelatedData(adminClient: AdminClient, userId: string) {
  const related: { label: string; count: number }[] = []

  for (const { table, label } of OWNED_TABLES) {
    const { count } = await adminClient
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count > 0) {
      related.push({ label, count })
    }
  }

  // Rozbory půdy visí na pozemcích, ne přímo na uživateli.
  const { data: parcelIds } = await adminClient
    .from('parcels')
    .select('id')
    .eq('user_id', userId)

  if (parcelIds && parcelIds.length > 0) {
    const { count } = await adminClient
      .from('soil_analyses')
      .select('id', { count: 'exact', head: true })
      .in('parcel_id', parcelIds.map((p) => p.id))

    if (count && count > 0) {
      related.push({ label: 'rozbory půdy', count })
    }
  }

  return related
}

export async function DELETE(request: NextRequest) {
  try {
    // Ověření, že žádost podává admin (pod jeho session, aby platila RLS)
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, confirmCascade } = body as {
      userId?: string
      confirmCascade?: boolean
    }

    if (!userId) {
      return NextResponse.json({ error: 'UserId je povinný' }, { status: 400 })
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Nemůžete smazat svůj vlastní účet' },
        { status: 400 }
      )
    }

    // Od tohoto místa se pracuje pod service-role klientem, aby výsledek
    // nezávisel na RLS politikách.
    const adminClient = createAdminClient()

    const { data: targetUser } = await adminClient
      .from('profiles')
      .select('email, company_name, role')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Uživatel nenalezen' }, { status: 404 })
    }

    const relatedData = await collectRelatedData(adminClient, userId)

    // Uživatel s daty se smaže až po výslovném potvrzení. Frontend si díky
    // tomu může vyžádat souhlas s konkrétním výčtem toho, co zmizí.
    if (relatedData.length > 0 && !confirmCascade) {
      return NextResponse.json(
        {
          requiresConfirmation: true,
          email: targetUser.email,
          companyName: targetUser.company_name,
          relatedData,
        },
        { status: 409 }
      )
    }

    // Audit se zapisuje před smazáním – po kaskádě už nejsou data k dispozici.
    await adminClient.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] Smazání uživatele ${targetUser.email}`,
      table_name: 'profiles',
      record_id: userId,
      old_data: {
        email: targetUser.email,
        company_name: targetUser.company_name,
        role: targetUser.role,
        deleted_related_data: relatedData,
      },
    })

    // Smazání auth uživatele kaskáduje na profil a všechna navázaná data.
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Failed to delete auth user:', authError)
      throw new Error(`Nepodařilo se smazat uživatele: ${authError.message}`)
    }

    const { data: leftoverProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (leftoverProfile) {
      throw new Error(
        'Uživatel byl smazán z Auth, ale jeho profil v databázi zůstal. Zkontrolujte cizí klíče tabulky profiles.'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Uživatel byl smazán',
      deletedRelatedData: relatedData,
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Došlo k chybě' },
      { status: 500 }
    )
  }
}
