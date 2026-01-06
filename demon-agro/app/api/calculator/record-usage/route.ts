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
 * POST /api/calculator/record-usage
 * 
 * Records calculator usage after successful calculation
 * 
 * Body: { 
 *   email: string, 
 *   calculationData?: object (optional, for analytics)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, calculationData } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email je povinný' },
        { status: 400 }
      );
    }

    // Get IP address from request
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Record usage
    const { data, error } = await supabaseAdmin
      .rpc('record_calculator_usage', {
        user_email: email,
        user_ip: ip,
        user_agent_string: userAgent,
        calc_data: calculationData || null
      });

    if (error) {
      console.error('Error recording calculator usage:', error);
      return NextResponse.json(
        { error: 'Chyba při záznamu použití' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data
    });

  } catch (error) {
    console.error('Error in record-usage API:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}

