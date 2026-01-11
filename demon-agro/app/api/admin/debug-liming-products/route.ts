import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DEBUG: Zobrazení všech produktů v liming_products
 * GET /api/admin/debug-liming-products
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Načíst všechny produkty
    const { data: products, error, count } = await supabase
      .from('liming_products')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Chyba při načítání produktů',
        details: error,
        recommendation: 'Tabulka liming_products pravděpodobně neexistuje. Spusťte create_liming_products_complete.sql'
      }, { status: 500 })
    }
    
    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        isEmpty: true,
        count: 0,
        products: [],
        recommendation: 'Tabulka liming_products je prázdná. Spusťte insert_liming_products.sql nebo create_liming_products_complete.sql (který obsahuje i data).'
      })
    }
    
    return NextResponse.json({
      success: true,
      isEmpty: false,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        cao_content: p.cao_content,
        mgo_content: p.mgo_content,
        is_active: p.is_active
      })),
      fullProducts: products
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Neočekávaná chyba',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}



