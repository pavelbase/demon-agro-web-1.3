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
 *   calculationData?: object (optional, for analytics),
 *   calculationResults?: object (optional, complete results for admin)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, calculationData, calculationResults } = body;

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

    // Record usage with RPC function
    const { data: usageId, error: rpcError } = await supabaseAdmin
      .rpc('record_calculator_usage', {
        user_email: email,
        user_ip: ip,
        user_agent_string: userAgent,
        calc_data: calculationData || null
      });

    if (rpcError) {
      console.error('Error recording calculator usage:', rpcError);
      return NextResponse.json(
        { error: 'Chyba při záznamu použití' },
        { status: 500 }
      );
    }

    // Update the record with full calculation results if provided
    if (calculationResults && usageId) {
      const { error: updateError } = await supabaseAdmin
        .from('calculator_usage')
        .update({ calculation_results: calculationResults })
        .eq('id', usageId);

      if (updateError) {
        console.error('Error updating calculator results:', updateError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      id: usageId
    });

  } catch (error) {
    console.error('Error in record-usage API:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}

