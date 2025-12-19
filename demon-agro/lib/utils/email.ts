// EmailJS funkce pro odesílání emailů

interface EmailParams {
  to_email: string
  to_name: string
  subject: string
  message: string
}

/**
 * Odeslání emailu přes EmailJS
 */
export async function sendEmail(params: EmailParams) {
  // TODO: Implementace EmailJS integrace
  // Vyžaduje konfiguraci service ID, template ID a public key
  console.log('Email would be sent:', params)
  
  // Placeholder - implementovat po nastavení EmailJS
  return {
    success: true,
    message: 'Email odeslán',
  }
}

/**
 * Odeslání notifikačního emailu adminu
 */
export async function sendAdminNotification(message: string) {
  return sendEmail({
    to_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@demon-agro.cz',
    to_name: 'Admin',
    subject: 'Notifikace z portálu',
    message,
  })
}

/**
 * Odeslání emailu o nové poptávce
 */
export async function sendQuoteRequestEmail(userData: any, quoteData: any) {
  const message = `
    Nová poptávka od: ${userData.name}
    Email: ${userData.email}
    Detail poptávky: ${JSON.stringify(quoteData, null, 2)}
  `
  
  return sendAdminNotification(message)
}
