// Client-side EmailJS functions
// These must be called from browser (client components), not from server

import emailjs from '@emailjs/browser'

/**
 * Send welcome email from client-side
 * EmailJS requires browser environment
 */
export async function sendWelcomeEmailClient(
  email: string,
  displayName: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      return {
        success: false,
        error: 'EmailJS není nakonfigurován',
      }
    }

    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

    const templateParams = {
      to_email: email,
      to_name: displayName,
      user_email: email,
      temporary_password: temporaryPassword,
      portal_url: `${portalUrl}/portal/prihlaseni`,
    }

    await emailjs.send(serviceId, templateId, templateParams, publicKey)

    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Neznámá chyba',
    }
  }
}

/**
 * Send password reset email from client-side
 */
export async function sendPasswordResetEmailClient(
  email: string,
  displayName: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      return {
        success: false,
        error: 'EmailJS není nakonfigurován',
      }
    }

    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

    const templateParams = {
      to_email: email,
      to_name: displayName,
      user_email: email,
      new_password: newPassword,
      portal_url: `${portalUrl}/portal/prihlaseni`,
    }

    await emailjs.send(serviceId, templateId, templateParams, publicKey)

    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Neznámá chyba',
    }
  }
}

/**
 * Send liming request notification email from client-side
 */
export async function sendLimingRequestEmailClient(
  requestId: string,
  companyName: string,
  contactName: string,
  contactEmail: string,
  contactPhone: string,
  district: string,
  parcelCount: number,
  totalArea: number,
  totalQuantity: number,
  deliveryPeriod: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_LIMING_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS není nakonfigurován pro liming request')
      return {
        success: false,
        error: 'EmailJS není nakonfigurován',
      }
    }

    const adminUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    
    const templateParams = {
      request_id: requestId,
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      district: district || 'Neuvedeno',
      parcel_count: parcelCount.toString(),
      total_area: totalArea.toFixed(2),
      total_quantity: totalQuantity.toFixed(2),
      delivery_period: deliveryPeriod,
      notes: notes || 'Žádné poznámky',
      admin_url: `${adminUrl}/portal/admin/poptavky/${requestId}`,
    }
    
    await emailjs.send(serviceId, templateId, templateParams, publicKey)

    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send liming request email:', error)
    
    // Extract detailed error message
    let errorMessage = 'Neznámá chyba'
    if (error && typeof error === 'object') {
      if ('text' in error) {
        errorMessage = (error as any).text
      } else if ('message' in error) {
        errorMessage = (error as Error).message
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

