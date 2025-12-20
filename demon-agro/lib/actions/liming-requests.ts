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
    const supabase = createClient()

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
    const requestItems = data.items.map((item) => ({
      request_id: request.id,
      parcel_id: item.parcel_id,
      product_id: item.product_id || null,
      product_name: item.product_name || 'Vápencový produkt',
      quantity: item.quantity_product_t,
      unit: 't',
      notes: item.reason || null,
    }))

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

    // Send email notification (EmailJS)
    try {
      await sendLimingRequestEmail({
        requestId: request.id,
        userName: data.contactPerson,
        userEmail: data.contactEmail,
        userPhone: data.contactPhone,
        items: data.items,
        totalArea,
        totalQuantity,
        deliveryPeriod: DELIVERY_PERIOD_LABELS[data.deliveryPeriod] || data.deliveryPeriod,
        notes: data.notes,
        deliveryAddress: data.deliveryAddress,
      })
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Error sending email:', emailError)
      // Email failure is not critical - request was created successfully
    }

    // Revalidate paths
    revalidatePath('/portal/poptavky')
    revalidatePath('/portal/dashboard')

    return {
      success: true,
      requestId: request.id,
      message: 'Poptávka byla úspěšně odeslána',
    }
  } catch (error) {
    console.error('Error in createLimingRequest:', error)
    return { error: 'Nepodařilo se odeslat poptávku. Zkuste to prosím znovu.' }
  }
}

interface EmailData {
  requestId: string
  userName: string
  userEmail: string
  userPhone: string
  items: LimingCartItem[]
  totalArea: number
  totalQuantity: number
  deliveryPeriod: string
  notes: string
  deliveryAddress: string
}

async function sendLimingRequestEmail(data: EmailData) {
  // Check if EmailJS is configured
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured - skipping email')
    return
  }

  // Prepare items list for email
  const itemsList = data.items
    .map(
      (item) =>
        `- ${item.parcel_name} (${item.area_ha} ha): ${item.product_name || 'Vápencový produkt'} - ${item.quantity_product_t.toFixed(2)} t`
    )
    .join('\n')

  // Email template parameters
  const templateParams = {
    request_id: data.requestId,
    user_name: data.userName,
    user_email: data.userEmail,
    user_phone: data.userPhone,
    total_area: data.totalArea.toFixed(2),
    total_quantity: data.totalQuantity.toFixed(2),
    items_count: data.items.length,
    items_list: itemsList,
    delivery_period: data.deliveryPeriod,
    delivery_address: data.deliveryAddress || 'Neuvedeno',
    notes: data.notes || 'Žádné poznámky',
    to_email: 'base@demonagro.cz',
  }

  // Send email using EmailJS
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    }),
  })

  if (!response.ok) {
    throw new Error(`EmailJS error: ${response.statusText}`)
  }

  return response.json()
}
