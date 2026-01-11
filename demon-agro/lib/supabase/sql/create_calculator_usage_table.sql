-- Migration: Create calculator_usage table for tracking public calculator usage
-- Date: 2026-01-06
-- Description: Tracks usage of public calculator to prevent abuse and enforce one calculation per user

-- Create calculator_usage table
CREATE TABLE IF NOT EXISTS public.calculator_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  calculation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments
COMMENT ON TABLE public.calculator_usage IS 'Tracks usage of public calculator to prevent abuse';
COMMENT ON COLUMN public.calculator_usage.email IS 'Email address provided by user';
COMMENT ON COLUMN public.calculator_usage.ip_address IS 'IP address of the request';
COMMENT ON COLUMN public.calculator_usage.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN public.calculator_usage.calculation_data IS 'JSON data of the calculation (for analytics)';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_calculator_usage_email 
ON public.calculator_usage(email);

CREATE INDEX IF NOT EXISTS idx_calculator_usage_ip 
ON public.calculator_usage(ip_address);

CREATE INDEX IF NOT EXISTS idx_calculator_usage_created_at 
ON public.calculator_usage(created_at DESC);

-- Composite index for checking recent usage by email
CREATE INDEX IF NOT EXISTS idx_calculator_usage_email_created 
ON public.calculator_usage(email, created_at DESC);

-- Composite index for checking recent usage by IP
CREATE INDEX IF NOT EXISTS idx_calculator_usage_ip_created 
ON public.calculator_usage(ip_address, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.calculator_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read calculator usage data
CREATE POLICY "Admins can read calculator usage"
  ON public.calculator_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Service role can insert (API endpoint will use service role)
-- No policy needed for service role as it bypasses RLS

-- Function to check if email has been used recently (within last 30 days)
CREATE OR REPLACE FUNCTION check_calculator_email_usage(
  user_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM public.calculator_usage
  WHERE 
    LOWER(email) = LOWER(user_email)
    AND created_at > NOW() - INTERVAL '30 days';
  
  RETURN usage_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_calculator_email_usage(TEXT) IS 'Checks if email has been used for calculator in last 30 days';

-- Function to check if IP has exceeded rate limit (max 3 per day)
CREATE OR REPLACE FUNCTION check_calculator_ip_rate_limit(
  user_ip TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM public.calculator_usage
  WHERE 
    ip_address = user_ip
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Return TRUE if limit exceeded (3 or more uses in 24 hours)
  RETURN usage_count >= 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_calculator_ip_rate_limit(TEXT) IS 'Checks if IP has exceeded rate limit (3 per 24 hours)';

-- Function to record calculator usage
CREATE OR REPLACE FUNCTION record_calculator_usage(
  user_email TEXT,
  user_ip TEXT,
  user_agent_string TEXT DEFAULT NULL,
  calc_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.calculator_usage (
    email,
    ip_address,
    user_agent,
    calculation_data
  )
  VALUES (
    user_email,
    user_ip,
    user_agent_string,
    calc_data
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION record_calculator_usage(TEXT, TEXT, TEXT, JSONB) IS 'Records a calculator usage event';

-- Grant execute permissions to authenticated users (API will use service role)
GRANT EXECUTE ON FUNCTION check_calculator_email_usage(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_calculator_ip_rate_limit(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_calculator_usage(TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- Grant to anon role for public calculator
GRANT EXECUTE ON FUNCTION check_calculator_email_usage(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_calculator_ip_rate_limit(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION record_calculator_usage(TEXT, TEXT, TEXT, JSONB) TO anon;


