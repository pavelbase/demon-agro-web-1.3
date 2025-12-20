// Test if @supabase/ssr can be imported
try {
  const ssr = require('@supabase/ssr');
  console.log('✅ @supabase/ssr imported successfully!');
  console.log('Available exports:', Object.keys(ssr));
} catch (err) {
  console.log('❌ Failed to import @supabase/ssr:', err.message);
}
