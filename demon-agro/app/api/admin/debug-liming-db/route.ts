import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DEBUG ENDPOINT: Diagnostika databázového problému s liming
 * 
 * GET /api/admin/debug-liming-db
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: []
    }
    
    // -------------------------------------------------
    // 1. KONTROLA TABULKY liming_products
    // -------------------------------------------------
    
    console.log('🔍 Kontroluji tabulku liming_products...')
    
    const { data: products, error: productsError } = await supabase
      .from('liming_products')
      .select('id, name, cao_content, mgo_content')
      .limit(5)
    
    diagnostics.checks.push({
      name: 'liming_products',
      exists: !productsError,
      error: productsError?.message || null,
      sampleData: products || null,
      count: products?.length || 0
    })
    
    // -------------------------------------------------
    // 2. KONTROLA TABULKY liming_plans
    // -------------------------------------------------
    
    console.log('🔍 Kontroluji tabulku liming_plans...')
    
    const { data: plans, error: plansError } = await supabase
      .from('liming_plans')
      .select('id, parcel_id, current_ph, target_ph')
      .limit(5)
    
    diagnostics.checks.push({
      name: 'liming_plans',
      exists: !plansError,
      error: plansError?.message || null,
      sampleData: plans || null,
      count: plans?.length || 0
    })
    
    // -------------------------------------------------
    // 3. KONTROLA TABULKY liming_applications
    // -------------------------------------------------
    
    console.log('🔍 Kontroluji tabulku liming_applications...')
    
    const { data: applications, error: applicationsError } = await supabase
      .from('liming_applications')
      .select('id, liming_plan_id, year, product_name, lime_product_id')
      .limit(5)
    
    diagnostics.checks.push({
      name: 'liming_applications',
      exists: !applicationsError,
      error: applicationsError?.message || null,
      sampleData: applications || null,
      count: applications?.length || 0
    })
    
    // -------------------------------------------------
    // 4. ZKUSIT INSERT DO liming_applications (TEST)
    // -------------------------------------------------
    
    // Nebudeme dělat skutečný insert, jen testovací query
    
    // -------------------------------------------------
    // 5. SOUHRN
    // -------------------------------------------------
    
    const allTablesExist = diagnostics.checks.every((c: any) => c.exists)
    
    diagnostics.summary = {
      allTablesExist,
      missingTables: diagnostics.checks
        .filter((c: any) => !c.exists)
        .map((c: any) => c.name),
      recommendation: allTablesExist
        ? 'Všechny tabulky existují. Problém je pravděpodobně v foreign key constraintu.'
        : 'Některé tabulky chybí. Spusťte SQL migrace.'
    }
    
    if (!allTablesExist) {
      diagnostics.sqlFiles = {
        liming_products: 'lib/supabase/sql/create_liming_products_complete.sql',
        liming_plans: 'lib/supabase/sql/create_liming_plans.sql'
      }
    } else {
      // Pokud všechny tabulky existují, problém je v constraintu
      diagnostics.fix = {
        problem: 'Foreign key constraint "liming_applications_lime_product_id_fkey" odkazuje na neexistující tabulku "lime_products"',
        solution: 'Spusťte SQL opravu v Supabase SQL Editoru',
        sqlFile: 'lib/supabase/sql/fix_liming_applications_constraint.sql',
        sqlCode: `
-- Oprava foreign key constraint
ALTER TABLE liming_applications 
DROP CONSTRAINT IF EXISTS liming_applications_lime_product_id_fkey;

ALTER TABLE liming_applications
ADD CONSTRAINT liming_applications_liming_product_id_fkey
FOREIGN KEY (lime_product_id) 
REFERENCES liming_products(id) 
ON DELETE SET NULL;
        `.trim()
      }
    }
    
    return NextResponse.json(diagnostics, { status: 200 })
    
  } catch (error) {
    console.error('❌ Chyba při diagnostice:', error)
    return NextResponse.json({
      error: 'Chyba při diagnostice',
      details: error instanceof Error ? error.message : 'Neznámá chyba'
    }, { status: 500 })
  }
}




