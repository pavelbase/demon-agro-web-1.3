import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, formatResetTime } from '@/lib/utils/rate-limiter';

/**
 * API Route pro odeslání kontaktního formuláře s rate limitingem
 * 
 * Endpoint: POST /api/submit-contact
 * Body: { name, email, phone, message, turnstileToken }
 * 
 * Ochrana:
 * 1. Turnstile token validace
 * 2. Rate limiting (max 3 odeslaná za hodinu z jedné IP)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turnstileToken } = body;

    // 1. Rate Limiting
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`contact:${clientIp}`, 3, 60 * 60 * 1000); // 3 za hodinu

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Překročen limit odeslaných formulářů. Zkuste to prosím ${formatResetTime(rateLimit.resetAt)}.`,
        },
        { status: 429 }
      );
    }

    // 2. Turnstile Validation
    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: 'Chybí Turnstile token' },
        { status: 400 }
      );
    }

    // Validace tokenu na serveru
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/verify-turnstile`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return NextResponse.json(
        { success: false, error: 'Ověření proti botům selhalo' },
        { status: 400 }
      );
    }

    // 3. Zde by bylo odeslání emailu (už je v kontaktním formuláři na front-endu)
    // Tento endpoint slouží jako server-side validace

    return NextResponse.json({
      success: true,
      message: 'Formulář byl úspěšně ověřen',
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Error in submit-contact:', error);
    return NextResponse.json(
      { success: false, error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}


