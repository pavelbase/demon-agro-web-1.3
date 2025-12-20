/**
 * Test script to verify Supabase connection
 * Run with: npx tsx lib/supabase/test-connection.ts
 */

import { createClient } from '@supabase/supabase-js'

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Make sure .env.local exists with:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  console.log('🔗 Connecting to Supabase...')
  console.log(`   URL: ${supabaseUrl}`)
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test connection by checking auth status
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      process.exit(1)
    }

    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Auth system is working')
    console.log(`   Session: ${data.session ? 'Active' : 'No active session (expected)'}`)
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

testConnection()
