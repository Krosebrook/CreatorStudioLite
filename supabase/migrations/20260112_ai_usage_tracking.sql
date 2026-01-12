-- Enhanced AI Content Generation Database Schema
-- Required tables for AI usage tracking and analytics

-- ============================================
-- AI Usage Logs Table
-- ============================================

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic')),
  model TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN (
    'content_idea_generation',
    'caption_generation',
    'hashtag_research',
    'brand_voice_analysis',
    'viral_prediction',
    'content_optimization',
    'ab_test_generation'
  )),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 4) NOT NULL DEFAULT 0,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  cached BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_usage_workspace ON ai_usage_logs(workspace_id, created_at DESC);
CREATE INDEX idx_ai_usage_user ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_provider ON ai_usage_logs(provider, created_at DESC);
CREATE INDEX idx_ai_usage_operation ON ai_usage_logs(operation, created_at DESC);
CREATE INDEX idx_ai_usage_success ON ai_usage_logs(success, created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI usage logs"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Extend Existing Tables
-- ============================================

-- Add missing columns to ai_hashtags table if they don't exist
ALTER TABLE ai_hashtags 
  ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to brand_voice_profiles if they don't exist
ALTER TABLE brand_voice_profiles
  ADD COLUMN IF NOT EXISTS engagement_patterns JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audience_response JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add missing columns to viral_predictions if they don't exist
ALTER TABLE viral_predictions
  ADD COLUMN IF NOT EXISTS views_confidence INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_confidence INTEGER DEFAULT 0;

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get AI usage summary for a workspace
CREATE OR REPLACE FUNCTION get_ai_usage_summary(
  p_workspace_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_requests BIGINT,
  total_tokens BIGINT,
  total_cost DECIMAL,
  success_rate DECIMAL,
  cache_hit_rate DECIMAL,
  by_provider JSONB,
  by_operation JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH usage_stats AS (
    SELECT 
      COUNT(*) as req_count,
      SUM(tokens_used) as token_sum,
      SUM(cost) as cost_sum,
      SUM(CASE WHEN success THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) as success_rt,
      SUM(CASE WHEN cached THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) as cache_rt,
      provider,
      operation
    FROM ai_usage_logs
    WHERE workspace_id = p_workspace_id
      AND created_at BETWEEN p_start_date AND p_end_date
    GROUP BY provider, operation
  )
  SELECT
    SUM(req_count)::BIGINT,
    SUM(token_sum)::BIGINT,
    SUM(cost_sum)::DECIMAL(10, 4),
    AVG(success_rt)::DECIMAL(5, 4),
    AVG(cache_rt)::DECIMAL(5, 4),
    jsonb_object_agg(
      provider,
      jsonb_build_object(
        'requests', SUM(req_count),
        'tokens', SUM(token_sum),
        'cost', SUM(cost_sum)
      )
    ) FILTER (WHERE provider IS NOT NULL) as by_provider,
    jsonb_object_agg(
      operation,
      jsonb_build_object(
        'requests', SUM(req_count),
        'tokens', SUM(token_sum),
        'cost', SUM(cost_sum)
      )
    ) FILTER (WHERE operation IS NOT NULL) as by_operation
  FROM usage_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to check workspace AI rate limits
CREATE OR REPLACE FUNCTION check_workspace_rate_limit(
  p_workspace_id UUID,
  p_max_requests_per_minute INTEGER DEFAULT 60,
  p_max_cost_per_day DECIMAL DEFAULT 100.00
)
RETURNS TABLE (
  limited BOOLEAN,
  reason TEXT,
  requests_remaining INTEGER,
  cost_remaining DECIMAL
) AS $$
DECLARE
  v_requests_last_minute INTEGER;
  v_cost_today DECIMAL;
BEGIN
  -- Count requests in last minute
  SELECT COUNT(*) INTO v_requests_last_minute
  FROM ai_usage_logs
  WHERE workspace_id = p_workspace_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Sum cost today
  SELECT COALESCE(SUM(cost), 0) INTO v_cost_today
  FROM ai_usage_logs
  WHERE workspace_id = p_workspace_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  RETURN QUERY
  SELECT
    (v_requests_last_minute >= p_max_requests_per_minute OR v_cost_today >= p_max_cost_per_day),
    CASE
      WHEN v_requests_last_minute >= p_max_requests_per_minute THEN 'Request rate limit exceeded'
      WHEN v_cost_today >= p_max_cost_per_day THEN 'Daily cost limit exceeded'
      ELSE NULL
    END,
    p_max_requests_per_minute - v_requests_last_minute,
    p_max_cost_per_day - v_cost_today;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Data Retention Policy
-- ============================================

-- Function to cleanup old AI usage logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_usage_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM ai_usage_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-ai-logs', '0 2 * * *', 'SELECT cleanup_old_ai_usage_logs()');

-- ============================================
-- Grants
-- ============================================

-- Grant necessary permissions
GRANT SELECT ON ai_usage_logs TO authenticated;
GRANT INSERT ON ai_usage_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_usage_summary TO authenticated;
GRANT EXECUTE ON FUNCTION check_workspace_rate_limit TO authenticated;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE ai_usage_logs IS 'Tracks all AI API usage for cost monitoring and analytics';
COMMENT ON COLUMN ai_usage_logs.provider IS 'AI provider used (openai or anthropic)';
COMMENT ON COLUMN ai_usage_logs.model IS 'Specific AI model used';
COMMENT ON COLUMN ai_usage_logs.operation IS 'Type of AI operation performed';
COMMENT ON COLUMN ai_usage_logs.tokens_used IS 'Total tokens consumed (input + output)';
COMMENT ON COLUMN ai_usage_logs.cost IS 'Cost in USD for this request';
COMMENT ON COLUMN ai_usage_logs.cached IS 'Whether response was served from cache';

COMMENT ON FUNCTION get_ai_usage_summary IS 'Get aggregated AI usage statistics for a workspace';
COMMENT ON FUNCTION check_workspace_rate_limit IS 'Check if workspace has exceeded rate limits';
