import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pro server-side validaci Cloudflare Turnstile tokenu
 * 
 * Endpoint: POST /api/verify-turnstile
 * Body: { token: string }
 * 
 * Použití:
 * - Volá se před odesláním formuláře (kalkulačka, kontakt)
 * - Validuje token na Cloudflare serverech
 * - Vrací success: true/false
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('⚠️ TURNSTILE_SECRET_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Turnstile is not configured' },
        { status: 500 }
      );
    }

    // Validace tokenu na Cloudflare API
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      return NextResponse.json({ success: true });
    } else {
      console.warn('Turnstile verification failed:', verifyData);
      return NextResponse.json(
        { success: false, error: 'Verification failed', details: verifyData['error-codes'] },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}



