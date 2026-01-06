'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth-helpers'
import type { LimingCartItem } from '@/lib/contexts/LimingCartContext'

interface CreateLimingRequestData {
  items: LimingCartItem[]
  deliveryPeriod: string
  notes: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  deliveryAddress: string
}

const DELIVERY_PERIOD_LABELS: Record<string, string> = {
  spring_2025: 'Jaro 2025 (únor-duben)',
  autumn_2025: 'Podzim 2025 (září-říjen)',
  spring_2026: 'Jaro 2026 (únor-duben)',
  asap: 'Co nejdříve',
  flexible: 'Termín je flexibilní',
}

export async function createLimingRequest(data: CreateLimingRequestData) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    if (data.items.length === 0) {
      return { error: 'Košík je prázdný' }
    }

    // Calculate totals
    const totalArea = data.items.reduce((sum, item) => sum + item.area_ha, 0)
    const totalQuantity = data.items.reduce(
      (sum, item) => sum + item.quantity_product_t,
      0
    )

    // Create liming request
    const { data: request, error: requestError } = await supabase
      .from('liming_requests')
      .insert({
        user_id: user.id,
        status: 'new',
        total_area: totalArea,
        total_quantity: totalQuantity,
        delivery_address: data.deliveryAddress || null,
        delivery_date: data.deliveryPeriod || null,
        contact_person: data.contactPerson,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (requestError || !request) {
      console.error('Error creating request:', requestError)
      return { error: 'Nepodařilo se vytvořit poptávku' }
    }

    // Create request items
    const requestItems = data.items.flatMap((item) => {
      // Pokud položka obsahuje aplikace z plánu, vytvoř pro každou aplikaci samostatnou položku
      if (item.applications && item.applications.length > 0) {
        return item.applications.map((app) => ({
          request_id: request.id,
          parcel_id: item.parcel_id,
          product_id: item.product_id || null,
          product_name: app.product_name,
          quantity: app.total_tons,
          unit: 't',
          notes: `${app.year} ${app.season} - ${app.dose_per_ha.toFixed(2)} t/ha`,
          // Nové: vazba na plán vápnění
          liming_plan_id: app.plan_id || null,
          liming_application_id: app.application_id || null,
          application_year: app.year,
          application_season: app.season,
        }))
      }
      
      // Pokud položka nemá aplikace (starý formát), vytvoř jednu položku
      return [{
        request_id: request.id,
        parcel_id: item.parcel_id,
        product_id: item.product_id || null,
        product_name: item.product_name || 'Vápencový produkt',
        quantity: item.quantity_product_t,
        unit: 't',
        notes: item.reason || null,
        liming_plan_id: null,
        liming_application_id: null,
        application_year: null,
        application_season: null,
      }]
    })

    const { error: itemsError } = await supabase
      .from('liming_request_items')
      .insert(requestItems)

    if (itemsError) {
      console.error('Error creating request items:', itemsError)
      // Try to delete the request if items failed
      await supabase.from('liming_requests').delete().eq('id', request.id)
      return { error: 'Nepodařilo se vytvořit položky poptávky' }
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `Vytvořena poptávka vápnění: ${data.items.length} pozemků, ${totalArea.toFixed(1)} ha`,
      table_name: 'liming_requests',
      record_id: request.id,
      new_data: {
        request_id: request.id,
        total_area: totalArea,
        total_quantity: totalQuantity,
        items_count: data.items.length,
      },
    })

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, district')
      .eq('id', user.id)
      .single()

    // Prepare email data for client-side sending
    // EmailJS requires browser environment, so we return data for client
    const emailData = {
      requestId: request.id,
      companyName: profile?.company_name || data.contactPerson,
      contactName: data.contactPerson,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      district: profile?.district || 'Neuvedeno',
      parcelCount: data.items.length,
      totalArea,
      totalQuantity,
      deliveryPeriod: DELIVERY_PERIOD_LABELS[data.deliveryPeriod] || data.deliveryPeriod,
      notes: data.notes,
    }

    // Revalidate paths
    revalidatePath('/portal/poptavky')
    revalidatePath('/portal/dashboard')

    return {
      success: true,
      requestId: request.id,
      message: 'Poptávka byla úspěšně odeslána',
      emailData, // Return data for client-side email sending
    }
  } catch (error) {
    console.error('Error in createLimingRequest:', error)
    return { error: 'Nepodařilo se odeslat poptávku. Zkuste to prosím znovu.' }
  }
}

// Note: Email sending is done client-side using sendLimingRequestEmailClient
// from lib/utils/email-client.ts because EmailJS requires browser environment
