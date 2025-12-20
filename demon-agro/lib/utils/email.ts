// EmailJS Notification System for Démon Agro Portal
// Handles all email notifications (welcome, password reset, new requests)

import type { LimingRequest } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

interface EmailJSConfig {
  serviceId: string
  publicKey: string
}

interface EmailJSResponse {
  status: number
  text: string
}

interface WelcomeEmailData {
  to_email: string
  to_name: string
  user_email: string
  temporary_password: string
  portal_url: string
}

interface PasswordResetEmailData {
  to_email: string
  to_name: string
  user_email: string
  new_password: string
  portal_url: string
}

interface LimingRequestNotificationData {
  to_email: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  district: string
  parcel_count: number
  total_area: string
  total_quantity: string
  delivery_period: string
  notes: string
  admin_url: string
  request_id: string
}

// ============================================================================
// EMAILJS CONFIG
// ============================================================================

/**
 * Get EmailJS configuration from environment variables
 */
function getEmailJSConfig(): EmailJSConfig | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !publicKey) {
    console.warn('EmailJS not configured - missing environment variables')
    return null
  }

  return { serviceId, publicKey }
}

/**
 * Send email via EmailJS API
 */
async function sendEmailViaEmailJS(
  templateId: string,
  templateParams: Record<string, any>
): Promise<EmailJSResponse> {
  const config = getEmailJSConfig()
  
  if (!config) {
    throw new Error('EmailJS is not configured')
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: templateId,
      user_id: config.publicKey,
      template_params: templateParams,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`EmailJS error: ${response.statusText} - ${error}`)
  }

  return {
    status: response.status,
    text: await response.text(),
  }
}

// ============================================================================
// 1. WELCOME EMAIL
// ============================================================================

/**
 * Send welcome email to new user with temporary password
 * 
 * Template name in EmailJS: "demon_agro_welcome"
 * 
 * Template variables:
 * - {{to_name}} - User's full name
 * - {{user_email}} - User's email (login)
 * - {{temporary_password}} - Temporary password
 * - {{portal_url}} - Link to portal login
 * 
 * @param email - User's email address
 * @param fullName - User's full name
 * @param temporaryPassword - Generated temporary password
 * @returns Promise with email send result
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID
    
    if (!templateId) {
      console.warn('Welcome email template not configured')
      return { success: false, error: 'Template not configured' }
    }

    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.demonagro.cz'

    const templateParams: WelcomeEmailData = {
      to_email: email,
      to_name: fullName,
      user_email: email,
      temporary_password: temporaryPassword,
      portal_url: `${portalUrl}/portal/prihlaseni`,
    }

    await sendEmailViaEmailJS(templateId, templateParams)

    console.log(`Welcome email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// 2. PASSWORD RESET EMAIL
// ============================================================================

/**
 * Send password reset email with new password
 * 
 * Template name in EmailJS: "demon_agro_password_reset"
 * 
 * Template variables:
 * - {{to_name}} - User's full name
 * - {{user_email}} - User's email (login)
 * - {{new_password}} - New password
 * - {{portal_url}} - Link to portal login
 * 
 * @param email - User's email address
 * @param fullName - User's full name
 * @param newPassword - New generated password
 * @returns Promise with email send result
 */
export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID
    
    if (!templateId) {
      console.warn('Password reset email template not configured')
      return { success: false, error: 'Template not configured' }
    }

    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.demonagro.cz'

    const templateParams: PasswordResetEmailData = {
      to_email: email,
      to_name: fullName,
      user_email: email,
      new_password: newPassword,
      portal_url: `${portalUrl}/portal/prihlaseni`,
    }

    await sendEmailViaEmailJS(templateId, templateParams)

    console.log(`Password reset email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// 3. NEW LIMING REQUEST NOTIFICATION
// ============================================================================

/**
 * Send notification to admin about new liming request
 * 
 * Template name in EmailJS: "demon_agro_new_liming_request"
 * 
 * Template variables:
 * - {{company_name}} - Customer's company name
 * - {{contact_name}} - Contact person name
 * - {{contact_email}} - Contact email
 * - {{contact_phone}} - Contact phone
 * - {{district}} - Customer's district
 * - {{parcel_count}} - Number of parcels
 * - {{total_area}} - Total area (ha)
 * - {{total_quantity}} - Total quantity (t)
 * - {{delivery_period}} - Preferred delivery period
 * - {{notes}} - Customer notes
 * - {{admin_url}} - Link to admin panel
 * - {{request_id}} - Request ID (short)
 * 
 * @param request - Liming request data
 * @param items - Request items (parcels)
 * @param user - User profile data
 * @returns Promise with email send result
 */
export async function sendNewLimingRequestNotification(
  request: any, // LimingRequest with relations
  items: any[],
  user: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID
    
    if (!templateId) {
      console.warn('Liming request notification template not configured')
      return { success: false, error: 'Template not configured' }
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'base@demonagro.cz'
    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.demonagro.cz'

    // Calculate totals
    const parcelCount = items.length
    const totalArea = items.reduce((sum: number, item: any) => {
      return sum + (item.parcel?.area || 0)
    }, 0)
    const totalQuantity = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity_tons || 0)
    }, 0)

    const templateParams: LimingRequestNotificationData = {
      to_email: adminEmail,
      company_name: user.company_name || user.full_name || 'N/A',
      contact_name: request.contact_name || user.full_name || 'N/A',
      contact_email: request.contact_email || user.email,
      contact_phone: request.contact_phone || user.phone || 'N/A',
      district: user.district || 'N/A',
      parcel_count: parcelCount,
      total_area: totalArea.toFixed(2),
      total_quantity: totalQuantity.toFixed(2),
      delivery_period: request.delivery_period || 'Neuvedeno',
      notes: request.notes || 'Žádné poznámky',
      admin_url: `${portalUrl}/portal/admin/poptavky`,
      request_id: request.id.slice(0, 8),
    }

    await sendEmailViaEmailJS(templateId, templateParams)

    console.log(`New liming request notification sent to: ${adminEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send liming request notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if EmailJS is properly configured
 */
export function isEmailJSConfigured(): boolean {
  return getEmailJSConfig() !== null
}

/**
 * Get list of missing EmailJS configuration variables
 */
export function getMissingEmailJSConfig(): string[] {
  const missing: string[] = []
  
  if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) {
    missing.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID')
  }
  if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
    missing.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY')
  }
  if (!process.env.NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID) {
    missing.push('NEXT_PUBLIC_EMAILJS_WELCOME_TEMPLATE_ID')
  }
  if (!process.env.NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID) {
    missing.push('NEXT_PUBLIC_EMAILJS_PASSWORD_RESET_TEMPLATE_ID')
  }
  if (!process.env.NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID) {
    missing.push('NEXT_PUBLIC_EMAILJS_LIMING_REQUEST_TEMPLATE_ID')
  }
  
  return missing
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
