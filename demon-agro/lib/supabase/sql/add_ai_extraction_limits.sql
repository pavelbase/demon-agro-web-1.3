-- Migration: Add AI extraction limits to profiles table
-- Date: 2025-12-20
-- Description: Adds daily extraction limits and tracking for AI-powered PDF extraction feature

-- Add AI extraction limit fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_extractions_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_extractions_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS ai_extractions_reset_date DATE DEFAULT CURRENT_DATE;

COMMENT ON COLUMN profiles.ai_extractions_today IS 'Number of AI extractions performed today';
COMMENT ON COLUMN profiles.ai_extractions_limit IS 'Daily limit for AI extractions (default: 10)';
COMMENT ON COLUMN profiles.ai_extractions_reset_date IS 'Date when the daily counter was last reset';

-- Create function to reset daily extraction counter
CREATE OR REPLACE FUNCTION reset_daily_extraction_counter()
RETURNS void AS $$
BEGIN
  -- Reset counter for all users if the date has changed
  UPDATE profiles
  SET 
    ai_extractions_today = 0,
    ai_extractions_reset_date = CURRENT_DATE
  WHERE ai_extractions_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_daily_extraction_counter() IS 'Resets the daily AI extraction counter for all users';

-- Create function to increment extraction counter
CREATE OR REPLACE FUNCTION increment_extraction_counter(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  current_limit INTEGER;
  reset_date DATE;
BEGIN
  -- Get current values
  SELECT 
    ai_extractions_today,
    ai_extractions_limit,
    ai_extractions_reset_date
  INTO current_count, current_limit, reset_date
  FROM profiles
  WHERE id = user_uuid;

  -- Reset counter if date has changed
  IF reset_date < CURRENT_DATE THEN
    current_count := 0;
    reset_date := CURRENT_DATE;
  END IF;

  -- Check if limit reached
  IF current_count >= current_limit THEN
    RAISE EXCEPTION 'Daily extraction limit reached (% of %)', current_count, current_limit;
  END IF;

  -- Increment counter
  UPDATE profiles
  SET 
    ai_extractions_today = current_count + 1,
    ai_extractions_reset_date = CURRENT_DATE
  WHERE id = user_uuid;

  -- Return new count
  RETURN current_count + 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_extraction_counter(UUID) IS 'Increments the extraction counter for a user and enforces daily limit';

-- Create function to get remaining extractions
CREATE OR REPLACE FUNCTION get_remaining_extractions(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  current_limit INTEGER;
  reset_date DATE;
BEGIN
  -- Get current values
  SELECT 
    ai_extractions_today,
    ai_extractions_limit,
    ai_extractions_reset_date
  INTO current_count, current_limit, reset_date
  FROM profiles
  WHERE id = user_uuid;

  -- Reset counter if date has changed
  IF reset_date < CURRENT_DATE THEN
    current_count := 0;
  END IF;

  -- Return remaining count
  RETURN GREATEST(0, current_limit - current_count);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_remaining_extractions(UUID) IS 'Returns the number of remaining AI extractions for a user today';

-- Create index for faster limit checks
CREATE INDEX IF NOT EXISTS idx_profiles_extraction_limits
ON profiles(id, ai_extractions_today, ai_extractions_limit, ai_extractions_reset_date);

COMMENT ON INDEX idx_profiles_extraction_limits IS 'Optimizes queries for checking extraction limits';

-- Initialize existing users with default values
UPDATE profiles
SET 
  ai_extractions_today = 0,
  ai_extractions_limit = 10,
  ai_extractions_reset_date = CURRENT_DATE
WHERE ai_extractions_today IS NULL
   OR ai_extractions_limit IS NULL
   OR ai_extractions_reset_date IS NULL;

-- Create a scheduled function to reset counters at midnight (requires pg_cron extension)
-- Note: This is optional and requires the pg_cron extension to be enabled in Supabase
-- Uncomment if pg_cron is available:
/*
SELECT cron.schedule(
  'reset-daily-extraction-counters',
  '0 0 * * *', -- Run at midnight every day
  $$SELECT reset_daily_extraction_counter();$$
);
*/

-- Alternative: Add a comment for manual execution
COMMENT ON FUNCTION reset_daily_extraction_counter() IS 
'Should be called daily at midnight to reset extraction counters. 
Can be scheduled using pg_cron or called manually: SELECT reset_daily_extraction_counter();';

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION increment_extraction_counter(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_remaining_extractions(UUID) TO authenticated;

-- Create view for admin to monitor extraction usage
CREATE OR REPLACE VIEW extraction_usage_stats AS
SELECT 
  p.id,
  p.email,
  p.company_name,
  p.ai_extractions_today,
  p.ai_extractions_limit,
  p.ai_extractions_reset_date,
  (p.ai_extractions_limit - p.ai_extractions_today) as remaining_today,
  COUNT(sa.id) FILTER (WHERE sa.ai_extracted = true AND sa.created_at >= CURRENT_DATE) as extractions_today_actual
FROM profiles p
LEFT JOIN soil_analyses sa ON sa.user_id = p.id
GROUP BY p.id, p.email, p.company_name, p.ai_extractions_today, p.ai_extractions_limit, p.ai_extractions_reset_date;

COMMENT ON VIEW extraction_usage_stats IS 'Admin view to monitor AI extraction usage across all users';

-- Grant select on view to admins only
-- Note: Adjust role name based on your RLS policies
-- GRANT SELECT ON extraction_usage_stats TO admin_role;
