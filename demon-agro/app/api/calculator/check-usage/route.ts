import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * POST /api/calculator/check-usage
 * 
 * Checks if user can use calculator based on:
 * 1. Email hasn't been used in last 30 days
 * 2. IP hasn't exceeded rate limit (3 per 24 hours)
 * 
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email je povinný' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          allowed: false, 
          reason: 'invalid_email',
          message: 'Zadejte platnou emailovou adresu (např. jmeno@domena.cz)' 
        },
        { status: 400 }
      );
    }

    // Get IP address from request
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check email usage (last 30 days)
    const { data: emailUsed, error: emailError } = await supabaseAdmin
      .rpc('check_calculator_email_usage', { user_email: email });

    if (emailError) {
      console.error('Error checking email usage:', emailError);
      return NextResponse.json(
        { error: 'Chyba při kontrole použití' },
        { status: 500 }
      );
    }

    if (emailUsed) {
      return NextResponse.json({
        allowed: false,
        reason: 'email_used',
        message: 'Na tento email již byl odeslán výsledek kalkulace. Pro další výpočty nás prosím kontaktujte přímo na base@demonagro.cz nebo +420 731 734 907.'
      });
    }

    // Check IP rate limit (3 per 24 hours)
    const { data: ipLimitExceeded, error: ipError } = await supabaseAdmin
      .rpc('check_calculator_ip_rate_limit', { user_ip: ip });

    if (ipError) {
      console.error('Error checking IP rate limit:', ipError);
      return NextResponse.json(
        { error: 'Chyba při kontrole limitu' },
        { status: 500 }
      );
    }

    if (ipLimitExceeded) {
      return NextResponse.json({
        allowed: false,
        reason: 'rate_limit',
        message: 'Byl překročen denní limit použití kalkulačky. Zkuste to prosím zítra nebo nás kontaktujte přímo.'
      });
    }

    // User can proceed
    return NextResponse.json({
      allowed: true,
      message: 'Můžete pokračovat s výpočtem'
    });

  } catch (error) {
    console.error('Error in check-usage API:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}

