-- Migration: 20260112135100_advanced_analytics_predictive_insights.sql
-- Description: Advanced Analytics with Predictive Insights Feature
-- Author: database-agent
-- 
-- This migration implements comprehensive analytics capabilities including:
-- - Viral score predictions with ML confidence tracking
-- - Optimal posting time analysis
-- - Audience demographics and insights
-- - Competitor benchmarking
-- - Custom reports and scheduling
-- - Performance alerts and notifications
--
-- Dependencies: Requires core schema (workspaces, content, analytics, published_posts)

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE public.prediction_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE public.alert_severity AS ENUM (
  'info',
  'warning',
  'critical'
);

CREATE TYPE public.alert_status AS ENUM (
  'active',
  'acknowledged',
  'resolved',
  'muted'
);

CREATE TYPE public.report_status AS ENUM (
  'scheduled',
  'generating',
  'completed',
  'failed'
);

CREATE TYPE public.report_format AS ENUM (
  'pdf',
  'csv',
  'json',
  'html'
);

-- ============================================
-- VIRAL SCORE PREDICTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.viral_score_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.published_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- Prediction data
  predicted_score DECIMAL(5,2) NOT NULL CHECK (predicted_score >= 0 AND predicted_score <= 100),
  confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  prediction_factors JSONB DEFAULT '{}'::jsonb,
  
  -- Model information
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL DEFAULT 'viral_score',
  
  -- Timing
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Status
  status public.prediction_status DEFAULT 'pending',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT viral_score_content_or_post CHECK (content_id IS NOT NULL OR post_id IS NOT NULL)
);

COMMENT ON TABLE public.viral_score_predictions IS 'Stores ML-based predictions for content viral potential with confidence scores';
COMMENT ON COLUMN public.viral_score_predictions.predicted_score IS 'Predicted viral score from 0-100';
COMMENT ON COLUMN public.viral_score_predictions.confidence_score IS 'Model confidence in prediction from 0-100';
COMMENT ON COLUMN public.viral_score_predictions.prediction_factors IS 'JSON object with factors influencing the prediction';

-- ============================================
-- PREDICTION ACCURACY TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.prediction_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES public.viral_score_predictions(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.published_posts(id) ON DELETE CASCADE,
  
  -- Predicted vs Actual
  predicted_score DECIMAL(5,2) NOT NULL,
  actual_score DECIMAL(5,2) NOT NULL,
  accuracy_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    100 - ABS(predicted_score - actual_score)
  ) STORED,
  
  -- Performance metrics at time of measurement
  actual_views INTEGER DEFAULT 0,
  actual_likes INTEGER DEFAULT 0,
  actual_shares INTEGER DEFAULT 0,
  actual_comments INTEGER DEFAULT 0,
  actual_engagement_rate DECIMAL(5,2),
  
  -- Timing
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hours_since_publish INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(prediction_id, measured_at)
);

COMMENT ON TABLE public.prediction_accuracy IS 'Tracks prediction accuracy for model learning and improvement';
COMMENT ON COLUMN public.prediction_accuracy.accuracy_percentage IS 'Automatically calculated accuracy percentage';

-- ============================================
-- OPTIMAL POSTING TIMES
-- ============================================

CREATE TABLE IF NOT EXISTS public.optimal_posting_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- Time data
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Engagement metrics
  avg_engagement_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  avg_views INTEGER DEFAULT 0,
  avg_likes INTEGER DEFAULT 0,
  avg_shares INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  
  -- Statistical data
  sample_size INTEGER NOT NULL DEFAULT 0,
  confidence_level DECIMAL(5,2) DEFAULT 0,
  
  -- Score and ranking
  optimization_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (optimization_score >= 0 AND optimization_score <= 100),
  rank_in_week INTEGER,
  
  -- Period data
  calculation_period_start TIMESTAMPTZ NOT NULL,
  calculation_period_end TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, platform, day_of_week, hour_of_day, timezone, calculation_period_end)
);

COMMENT ON TABLE public.optimal_posting_times IS 'Platform-specific optimal posting times based on historical engagement';
COMMENT ON COLUMN public.optimal_posting_times.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN public.optimal_posting_times.optimization_score IS 'Composite score for ranking best posting times';

-- ============================================
-- ENGAGEMENT BY TIME
-- ============================================

CREATE TABLE IF NOT EXISTS public.engagement_by_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.published_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- Time information
  posted_at TIMESTAMPTZ NOT NULL,
  day_of_week INTEGER NOT NULL,
  hour_of_day INTEGER NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Engagement metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Time-based analysis
  hours_since_publish INTEGER NOT NULL,
  engagement_velocity DECIMAL(10,2), -- Engagement per hour
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id, hours_since_publish)
);

COMMENT ON TABLE public.engagement_by_time IS 'Granular engagement data by time for pattern analysis';
COMMENT ON COLUMN public.engagement_by_time.engagement_velocity IS 'Rate of engagement growth per hour';

-- ============================================
-- AUDIENCE DEMOGRAPHICS
-- ============================================

CREATE TABLE IF NOT EXISTS public.audience_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- Age ranges (stored as JSONB for flexibility)
  age_ranges JSONB DEFAULT '{}'::jsonb, -- {"18-24": 25.5, "25-34": 40.2, ...}
  
  -- Gender distribution
  gender_distribution JSONB DEFAULT '{}'::jsonb, -- {"male": 45.5, "female": 52.3, "other": 2.2}
  
  -- Geographic data
  top_countries JSONB DEFAULT '[]'::jsonb, -- [{"country": "US", "percentage": 35.5}, ...]
  top_cities JSONB DEFAULT '[]'::jsonb,
  top_regions JSONB DEFAULT '[]'::jsonb,
  
  -- Language data
  languages JSONB DEFAULT '[]'::jsonb,
  
  -- Total audience size
  total_followers INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  
  -- Period data
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(connector_id, platform, period_end)
);

COMMENT ON TABLE public.audience_demographics IS 'Audience demographic data from social platforms';
COMMENT ON COLUMN public.audience_demographics.age_ranges IS 'Age distribution as percentage per range';
COMMENT ON COLUMN public.audience_demographics.gender_distribution IS 'Gender distribution as percentages';

-- ============================================
-- AUDIENCE INTERESTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.audience_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- Interest categories
  interest_category TEXT NOT NULL,
  interest_subcategory TEXT,
  affinity_score DECIMAL(5,2) CHECK (affinity_score >= 0 AND affinity_score <= 100),
  
  -- Audience segment
  audience_percentage DECIMAL(5,2) CHECK (audience_percentage >= 0 AND audience_percentage <= 100),
  audience_count INTEGER DEFAULT 0,
  
  -- Behavioral data
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  behaviors JSONB DEFAULT '{}'::jsonb,
  
  -- Period data
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(connector_id, platform, interest_category, interest_subcategory, period_end)
);

COMMENT ON TABLE public.audience_interests IS 'Audience interest categories and behavioral patterns';
COMMENT ON COLUMN public.audience_interests.affinity_score IS 'How strongly the audience relates to this interest';

-- ============================================
-- AUDIENCE GROWTH
-- ============================================

CREATE TABLE IF NOT EXISTS public.audience_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.connectors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- Growth metrics
  follower_count INTEGER NOT NULL DEFAULT 0,
  follower_change INTEGER DEFAULT 0,
  follower_growth_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement metrics
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  
  -- Quality metrics
  engagement_quality_score DECIMAL(5,2) DEFAULT 0,
  audience_retention_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Date
  recorded_date DATE NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(connector_id, platform, recorded_date)
);

COMMENT ON TABLE public.audience_growth IS 'Daily audience growth tracking and trends';
COMMENT ON COLUMN public.audience_growth.follower_growth_rate IS 'Percentage growth rate compared to previous period';

-- ============================================
-- COMPETITOR PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS public.competitor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Competitor identification
  competitor_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_handle TEXT NOT NULL,
  platform_user_id TEXT,
  
  -- Profile data
  profile_url TEXT,
  avatar_url TEXT,
  bio TEXT,
  category TEXT,
  
  -- Current stats
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Tracking
  added_by UUID REFERENCES public.user_profiles(id),
  last_updated_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, platform, platform_handle)
);

COMMENT ON TABLE public.competitor_profiles IS 'Competitor accounts to track for benchmarking';

-- ============================================
-- COMPETITOR METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS public.competitor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  competitor_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,
  
  -- Growth metrics
  follower_count INTEGER NOT NULL DEFAULT 0,
  follower_change INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Content metrics
  post_count INTEGER DEFAULT 0,
  posts_per_week DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement metrics
  avg_likes INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  avg_shares INTEGER DEFAULT 0,
  avg_views INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Performance indicators
  engagement_quality_score DECIMAL(5,2) DEFAULT 0,
  content_consistency_score DECIMAL(5,2) DEFAULT 0,
  
  -- Top performing content
  top_post_url TEXT,
  top_post_engagement INTEGER DEFAULT 0,
  
  -- Date
  recorded_date DATE NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(competitor_id, recorded_date)
);

COMMENT ON TABLE public.competitor_metrics IS 'Historical performance metrics for competitors';

-- ============================================
-- BENCHMARK COMPARISONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.benchmark_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  
  -- User metrics
  user_follower_count INTEGER DEFAULT 0,
  user_engagement_rate DECIMAL(5,2) DEFAULT 0,
  user_posts_per_week DECIMAL(5,2) DEFAULT 0,
  user_avg_likes INTEGER DEFAULT 0,
  user_avg_comments INTEGER DEFAULT 0,
  
  -- Industry averages
  industry_avg_follower_count INTEGER DEFAULT 0,
  industry_avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  industry_avg_posts_per_week DECIMAL(5,2) DEFAULT 0,
  
  -- Competitor averages
  competitor_avg_follower_count INTEGER DEFAULT 0,
  competitor_avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  competitor_avg_posts_per_week DECIMAL(5,2) DEFAULT 0,
  
  -- Percentile rankings
  engagement_percentile INTEGER CHECK (engagement_percentile >= 0 AND engagement_percentile <= 100),
  growth_percentile INTEGER CHECK (growth_percentile >= 0 AND growth_percentile <= 100),
  consistency_percentile INTEGER CHECK (consistency_percentile >= 0 AND consistency_percentile <= 100),
  
  -- Overall score
  overall_performance_score DECIMAL(5,2) DEFAULT 0 CHECK (overall_performance_score >= 0 AND overall_performance_score <= 100),
  
  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, platform, connector_id, period_end)
);

COMMENT ON TABLE public.benchmark_comparisons IS 'Comparative analysis of user performance vs industry and competitors';

-- ============================================
-- CUSTOM REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  
  -- Report definition
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'performance', 'audience', 'competitor', 'custom'
  
  -- Query configuration
  query_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  dimensions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Visualization
  chart_configs JSONB DEFAULT '[]'::jsonb,
  layout_config JSONB DEFAULT '{}'::jsonb,
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  shared_with UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.custom_reports IS 'User-defined custom report configurations';
COMMENT ON COLUMN public.custom_reports.query_config IS 'JSON configuration for report data queries';

-- ============================================
-- REPORT SCHEDULES
-- ============================================

CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  
  -- Schedule configuration
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Delivery configuration
  delivery_method TEXT NOT NULL DEFAULT 'email', -- 'email', 'webhook', 'storage'
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  webhook_url TEXT,
  
  -- Format
  export_format public.report_format DEFAULT 'pdf',
  include_raw_data BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.report_schedules IS 'Scheduled report generation and delivery';
COMMENT ON COLUMN public.report_schedules.cron_expression IS 'Cron expression for schedule timing';

-- ============================================
-- REPORT EXECUTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.report_schedules(id) ON DELETE SET NULL,
  
  -- Execution info
  status public.report_status DEFAULT 'generating',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Output
  output_url TEXT,
  output_format public.report_format,
  file_size_bytes BIGINT,
  
  -- Results
  rows_processed INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.report_executions IS 'History of report generation executions';

-- ============================================
-- PERFORMANCE ALERTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  
  -- Alert definition
  alert_name TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL, -- 'threshold', 'anomaly', 'trend', 'competitor'
  
  -- Conditions
  metric TEXT NOT NULL,
  condition_operator TEXT NOT NULL, -- 'gt', 'lt', 'eq', 'gte', 'lte', 'change_gt', 'change_lt'
  threshold_value DECIMAL(15,2),
  comparison_period TEXT, -- 'previous_day', 'previous_week', 'previous_month'
  
  -- Scope
  platform TEXT,
  connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  
  -- Notification settings
  notification_channels TEXT[] DEFAULT ARRAY['in_app']::TEXT[], -- 'email', 'sms', 'webhook', 'in_app'
  notification_recipients UUID[] DEFAULT ARRAY[]::UUID[],
  webhook_url TEXT,
  
  -- Frequency control
  cooldown_minutes INTEGER DEFAULT 60,
  last_triggered_at TIMESTAMPTZ,
  
  -- Severity
  severity public.alert_severity DEFAULT 'info',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.performance_alerts IS 'Configurable performance monitoring alerts';
COMMENT ON COLUMN public.performance_alerts.cooldown_minutes IS 'Minimum minutes between alert triggers';

-- ============================================
-- ALERT NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES public.performance_alerts(id) ON DELETE CASCADE,
  
  -- Notification details
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status public.alert_status DEFAULT 'active',
  
  -- Metric values
  metric_name TEXT NOT NULL,
  current_value DECIMAL(15,2),
  threshold_value DECIMAL(15,2),
  previous_value DECIMAL(15,2),
  
  -- Context
  platform TEXT,
  content_title TEXT,
  post_url TEXT,
  
  -- Message
  alert_message TEXT NOT NULL,
  alert_details JSONB DEFAULT '{}'::jsonb,
  
  -- Actions taken
  acknowledged_by UUID REFERENCES public.user_profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.alert_notifications IS 'History of triggered performance alerts';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Viral Score Predictions
CREATE INDEX idx_viral_predictions_workspace ON public.viral_score_predictions(workspace_id);
CREATE INDEX idx_viral_predictions_content ON public.viral_score_predictions(content_id);
CREATE INDEX idx_viral_predictions_post ON public.viral_score_predictions(post_id);
CREATE INDEX idx_viral_predictions_platform ON public.viral_score_predictions(platform);
CREATE INDEX idx_viral_predictions_created ON public.viral_score_predictions(created_at DESC);
CREATE INDEX idx_viral_predictions_status ON public.viral_score_predictions(status) WHERE status = 'pending';

-- Prediction Accuracy
CREATE INDEX idx_prediction_accuracy_workspace ON public.prediction_accuracy(workspace_id);
CREATE INDEX idx_prediction_accuracy_prediction ON public.prediction_accuracy(prediction_id);
CREATE INDEX idx_prediction_accuracy_post ON public.prediction_accuracy(post_id);
CREATE INDEX idx_prediction_accuracy_measured ON public.prediction_accuracy(measured_at DESC);

-- Optimal Posting Times
CREATE INDEX idx_optimal_times_workspace ON public.optimal_posting_times(workspace_id);
CREATE INDEX idx_optimal_times_platform ON public.optimal_posting_times(platform);
CREATE INDEX idx_optimal_times_day_hour ON public.optimal_posting_times(day_of_week, hour_of_day);
CREATE INDEX idx_optimal_times_score ON public.optimal_posting_times(optimization_score DESC);
CREATE INDEX idx_optimal_times_period ON public.optimal_posting_times(calculation_period_end DESC);

-- Engagement by Time
CREATE INDEX idx_engagement_time_workspace ON public.engagement_by_time(workspace_id);
CREATE INDEX idx_engagement_time_post ON public.engagement_by_time(post_id);
CREATE INDEX idx_engagement_time_platform ON public.engagement_by_time(platform);
CREATE INDEX idx_engagement_time_posted ON public.engagement_by_time(posted_at);
CREATE INDEX idx_engagement_time_day_hour ON public.engagement_by_time(day_of_week, hour_of_day);

-- Audience Demographics
CREATE INDEX idx_audience_demo_workspace ON public.audience_demographics(workspace_id);
CREATE INDEX idx_audience_demo_connector ON public.audience_demographics(connector_id);
CREATE INDEX idx_audience_demo_platform ON public.audience_demographics(platform);
CREATE INDEX idx_audience_demo_period ON public.audience_demographics(period_end DESC);

-- Audience Interests
CREATE INDEX idx_audience_interests_workspace ON public.audience_interests(workspace_id);
CREATE INDEX idx_audience_interests_connector ON public.audience_interests(connector_id);
CREATE INDEX idx_audience_interests_category ON public.audience_interests(interest_category);
CREATE INDEX idx_audience_interests_affinity ON public.audience_interests(affinity_score DESC);

-- Audience Growth
CREATE INDEX idx_audience_growth_workspace ON public.audience_growth(workspace_id);
CREATE INDEX idx_audience_growth_connector ON public.audience_growth(connector_id);
CREATE INDEX idx_audience_growth_platform ON public.audience_growth(platform);
CREATE INDEX idx_audience_growth_date ON public.audience_growth(recorded_date DESC);

-- Competitor Profiles
CREATE INDEX idx_competitor_profiles_workspace ON public.competitor_profiles(workspace_id);
CREATE INDEX idx_competitor_profiles_platform ON public.competitor_profiles(platform);
CREATE INDEX idx_competitor_profiles_active ON public.competitor_profiles(is_active) WHERE is_active = true;

-- Competitor Metrics
CREATE INDEX idx_competitor_metrics_workspace ON public.competitor_metrics(workspace_id);
CREATE INDEX idx_competitor_metrics_competitor ON public.competitor_metrics(competitor_id);
CREATE INDEX idx_competitor_metrics_date ON public.competitor_metrics(recorded_date DESC);

-- Benchmark Comparisons
CREATE INDEX idx_benchmark_workspace ON public.benchmark_comparisons(workspace_id);
CREATE INDEX idx_benchmark_platform ON public.benchmark_comparisons(platform);
CREATE INDEX idx_benchmark_connector ON public.benchmark_comparisons(connector_id);
CREATE INDEX idx_benchmark_period ON public.benchmark_comparisons(period_end DESC);

-- Custom Reports
CREATE INDEX idx_custom_reports_workspace ON public.custom_reports(workspace_id);
CREATE INDEX idx_custom_reports_created_by ON public.custom_reports(created_by);
CREATE INDEX idx_custom_reports_type ON public.custom_reports(report_type);
CREATE INDEX idx_custom_reports_active ON public.custom_reports(is_active) WHERE is_active = true;
CREATE INDEX idx_custom_reports_favorite ON public.custom_reports(workspace_id, is_favorite) WHERE is_favorite = true;

-- Report Schedules
CREATE INDEX idx_report_schedules_workspace ON public.report_schedules(workspace_id);
CREATE INDEX idx_report_schedules_report ON public.report_schedules(report_id);
CREATE INDEX idx_report_schedules_next_run ON public.report_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_report_schedules_active ON public.report_schedules(is_active) WHERE is_active = true;

-- Report Executions
CREATE INDEX idx_report_executions_workspace ON public.report_executions(workspace_id);
CREATE INDEX idx_report_executions_report ON public.report_executions(report_id);
CREATE INDEX idx_report_executions_schedule ON public.report_executions(schedule_id);
CREATE INDEX idx_report_executions_status ON public.report_executions(status);
CREATE INDEX idx_report_executions_started ON public.report_executions(started_at DESC);

-- Performance Alerts
CREATE INDEX idx_performance_alerts_workspace ON public.performance_alerts(workspace_id);
CREATE INDEX idx_performance_alerts_created_by ON public.performance_alerts(created_by);
CREATE INDEX idx_performance_alerts_type ON public.performance_alerts(alert_type);
CREATE INDEX idx_performance_alerts_connector ON public.performance_alerts(connector_id);
CREATE INDEX idx_performance_alerts_active ON public.performance_alerts(is_active) WHERE is_active = true;

-- Alert Notifications
CREATE INDEX idx_alert_notifications_workspace ON public.alert_notifications(workspace_id);
CREATE INDEX idx_alert_notifications_alert ON public.alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_status ON public.alert_notifications(status);
CREATE INDEX idx_alert_notifications_triggered ON public.alert_notifications(triggered_at DESC);
CREATE INDEX idx_alert_notifications_unacknowledged ON public.alert_notifications(workspace_id, status) 
  WHERE status = 'active';

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Engagement summary by hour of day
CREATE OR REPLACE VIEW public.engagement_summary_by_hour AS
SELECT 
  workspace_id,
  platform,
  hour_of_day,
  COUNT(*) as post_count,
  AVG(engagement_rate) as avg_engagement_rate,
  AVG(views) as avg_views,
  AVG(likes) as avg_likes,
  AVG(comments) as avg_comments,
  AVG(shares) as avg_shares
FROM public.engagement_by_time
GROUP BY workspace_id, platform, hour_of_day;

-- Engagement summary by day of week
CREATE OR REPLACE VIEW public.engagement_summary_by_day AS
SELECT 
  workspace_id,
  platform,
  day_of_week,
  COUNT(*) as post_count,
  AVG(engagement_rate) as avg_engagement_rate,
  AVG(views) as avg_views,
  AVG(likes) as avg_likes,
  AVG(comments) as avg_comments,
  AVG(shares) as avg_shares
FROM public.engagement_by_time
GROUP BY workspace_id, platform, day_of_week;

-- Latest audience demographics per connector
CREATE OR REPLACE VIEW public.audience_demographics_latest AS
SELECT DISTINCT ON (connector_id, platform)
  id,
  workspace_id,
  connector_id,
  platform,
  age_ranges,
  gender_distribution,
  top_countries,
  top_cities,
  languages,
  total_followers,
  total_reach,
  period_start,
  period_end,
  fetched_at
FROM public.audience_demographics
ORDER BY connector_id, platform, period_end DESC;

-- Competitor benchmark summary
CREATE OR REPLACE VIEW public.competitor_benchmark_summary AS
SELECT 
  cp.workspace_id,
  cp.platform,
  cp.competitor_name,
  cp.platform_handle,
  cp.follower_count as current_follower_count,
  cm.avg_engagement_rate,
  cm.posts_per_week,
  cm.avg_likes,
  cm.avg_comments,
  cm.recorded_date
FROM public.competitor_profiles cp
LEFT JOIN LATERAL (
  SELECT *
  FROM public.competitor_metrics
  WHERE competitor_id = cp.id
  ORDER BY recorded_date DESC
  LIMIT 1
) cm ON true
WHERE cp.is_active = true;

-- ============================================
-- MATERIALIZED VIEWS FOR EXPENSIVE AGGREGATIONS
-- ============================================

-- Daily analytics aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS public.analytics_aggregated_daily AS
SELECT 
  pp.platform,
  c.workspace_id,
  DATE(pp.published_at) as date,
  COUNT(DISTINCT pp.id) as post_count,
  SUM(a.views) as total_views,
  SUM(a.likes) as total_likes,
  SUM(a.comments) as total_comments,
  SUM(a.shares) as total_shares,
  AVG(a.engagement_rate) as avg_engagement_rate,
  SUM(a.reach) as total_reach,
  SUM(a.impressions) as total_impressions
FROM public.published_posts pp
JOIN public.content c ON pp.content_id = c.id
LEFT JOIN LATERAL (
  SELECT *
  FROM public.analytics
  WHERE post_id = pp.id
  ORDER BY fetched_at DESC
  LIMIT 1
) a ON true
WHERE pp.published_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY pp.platform, c.workspace_id, DATE(pp.published_at);

CREATE UNIQUE INDEX idx_analytics_daily_unique ON public.analytics_aggregated_daily(workspace_id, platform, date);
CREATE INDEX idx_analytics_daily_date ON public.analytics_aggregated_daily(date DESC);

-- Weekly analytics aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS public.analytics_aggregated_weekly AS
SELECT 
  pp.platform,
  c.workspace_id,
  DATE_TRUNC('week', pp.published_at) as week_start,
  COUNT(DISTINCT pp.id) as post_count,
  SUM(a.views) as total_views,
  SUM(a.likes) as total_likes,
  SUM(a.comments) as total_comments,
  SUM(a.shares) as total_shares,
  AVG(a.engagement_rate) as avg_engagement_rate,
  SUM(a.reach) as total_reach,
  SUM(a.impressions) as total_impressions
FROM public.published_posts pp
JOIN public.content c ON pp.content_id = c.id
LEFT JOIN LATERAL (
  SELECT *
  FROM public.analytics
  WHERE post_id = pp.id
  ORDER BY fetched_at DESC
  LIMIT 1
) a ON true
WHERE pp.published_at >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY pp.platform, c.workspace_id, DATE_TRUNC('week', pp.published_at);

CREATE UNIQUE INDEX idx_analytics_weekly_unique ON public.analytics_aggregated_weekly(workspace_id, platform, week_start);
CREATE INDEX idx_analytics_weekly_date ON public.analytics_aggregated_weekly(week_start DESC);

-- Platform performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.platform_performance_summary AS
SELECT 
  c.workspace_id,
  pp.platform,
  COUNT(DISTINCT pp.id) as total_posts,
  COUNT(DISTINCT DATE(pp.published_at)) as days_active,
  SUM(a.views) as total_views,
  SUM(a.likes) as total_likes,
  SUM(a.comments) as total_comments,
  SUM(a.shares) as total_shares,
  AVG(a.engagement_rate) as avg_engagement_rate,
  MAX(a.engagement_rate) as max_engagement_rate,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY a.engagement_rate) as median_engagement_rate,
  SUM(a.reach) as total_reach,
  SUM(a.impressions) as total_impressions
FROM public.published_posts pp
JOIN public.content c ON pp.content_id = c.id
LEFT JOIN LATERAL (
  SELECT *
  FROM public.analytics
  WHERE post_id = pp.id
  ORDER BY fetched_at DESC
  LIMIT 1
) a ON true
WHERE pp.published_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.workspace_id, pp.platform;

CREATE UNIQUE INDEX idx_platform_perf_unique ON public.platform_performance_summary(workspace_id, platform);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_analytics_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.analytics_aggregated_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.analytics_aggregated_weekly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.platform_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER set_updated_at_viral_predictions
  BEFORE UPDATE ON public.viral_score_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_optimal_times
  BEFORE UPDATE ON public.optimal_posting_times
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_competitor_profiles
  BEFORE UPDATE ON public.competitor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_custom_reports
  BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_report_schedules
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_performance_alerts
  BEFORE UPDATE ON public.performance_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at_alert_notifications
  BEFORE UPDATE ON public.alert_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.viral_score_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimal_posting_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_by_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE public.viral_score_predictions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_accuracy FORCE ROW LEVEL SECURITY;
ALTER TABLE public.optimal_posting_times FORCE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_by_time FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audience_demographics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audience_interests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audience_growth FORCE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_comparisons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules FORCE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications FORCE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: Viral Score Predictions
-- ============================================

CREATE POLICY "viral_predictions_workspace_select"
  ON public.viral_score_predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = viral_score_predictions.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "viral_predictions_workspace_insert"
  ON public.viral_score_predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = viral_score_predictions.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "viral_predictions_workspace_update"
  ON public.viral_score_predictions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = viral_score_predictions.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "viral_predictions_service_role"
  ON public.viral_score_predictions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Prediction Accuracy
-- ============================================

CREATE POLICY "prediction_accuracy_workspace_select"
  ON public.prediction_accuracy FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = prediction_accuracy.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "prediction_accuracy_service_role"
  ON public.prediction_accuracy FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Optimal Posting Times
-- ============================================

CREATE POLICY "optimal_times_workspace_select"
  ON public.optimal_posting_times FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = optimal_posting_times.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "optimal_times_service_role"
  ON public.optimal_posting_times FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Engagement by Time
-- ============================================

CREATE POLICY "engagement_time_workspace_select"
  ON public.engagement_by_time FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = engagement_by_time.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "engagement_time_service_role"
  ON public.engagement_by_time FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Audience Demographics
-- ============================================

CREATE POLICY "audience_demo_workspace_select"
  ON public.audience_demographics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = audience_demographics.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "audience_demo_service_role"
  ON public.audience_demographics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Audience Interests
-- ============================================

CREATE POLICY "audience_interests_workspace_select"
  ON public.audience_interests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = audience_interests.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "audience_interests_service_role"
  ON public.audience_interests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Audience Growth
-- ============================================

CREATE POLICY "audience_growth_workspace_select"
  ON public.audience_growth FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = audience_growth.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "audience_growth_service_role"
  ON public.audience_growth FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Competitor Profiles
-- ============================================

CREATE POLICY "competitor_profiles_workspace_select"
  ON public.competitor_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = competitor_profiles.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "competitor_profiles_workspace_insert"
  ON public.competitor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = competitor_profiles.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "competitor_profiles_workspace_update"
  ON public.competitor_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = competitor_profiles.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "competitor_profiles_workspace_delete"
  ON public.competitor_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = competitor_profiles.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "competitor_profiles_service_role"
  ON public.competitor_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Competitor Metrics
-- ============================================

CREATE POLICY "competitor_metrics_workspace_select"
  ON public.competitor_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = competitor_metrics.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "competitor_metrics_service_role"
  ON public.competitor_metrics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Benchmark Comparisons
-- ============================================

CREATE POLICY "benchmark_workspace_select"
  ON public.benchmark_comparisons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = benchmark_comparisons.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "benchmark_service_role"
  ON public.benchmark_comparisons FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Custom Reports
-- ============================================

CREATE POLICY "custom_reports_workspace_select"
  ON public.custom_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = custom_reports.workspace_id
      AND wm.user_id = auth.uid()
    )
    OR custom_reports.is_public = true
    OR auth.uid() = ANY(custom_reports.shared_with)
  );

CREATE POLICY "custom_reports_workspace_insert"
  ON public.custom_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = custom_reports.workspace_id
      AND wm.user_id = auth.uid()
    )
    AND auth.uid() = custom_reports.created_by
  );

CREATE POLICY "custom_reports_owner_update"
  ON public.custom_reports FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = custom_reports.created_by
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = custom_reports.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "custom_reports_owner_delete"
  ON public.custom_reports FOR DELETE
  TO authenticated
  USING (
    auth.uid() = custom_reports.created_by
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = custom_reports.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "custom_reports_service_role"
  ON public.custom_reports FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Report Schedules
-- ============================================

CREATE POLICY "report_schedules_workspace_select"
  ON public.report_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_schedules.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "report_schedules_workspace_insert"
  ON public.report_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_schedules.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
    AND auth.uid() = report_schedules.created_by
  );

CREATE POLICY "report_schedules_creator_update"
  ON public.report_schedules FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = report_schedules.created_by
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_schedules.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "report_schedules_creator_delete"
  ON public.report_schedules FOR DELETE
  TO authenticated
  USING (
    auth.uid() = report_schedules.created_by
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_schedules.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "report_schedules_service_role"
  ON public.report_schedules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Report Executions
-- ============================================

CREATE POLICY "report_executions_workspace_select"
  ON public.report_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_executions.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "report_executions_service_role"
  ON public.report_executions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Performance Alerts
-- ============================================

CREATE POLICY "performance_alerts_workspace_select"
  ON public.performance_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = performance_alerts.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "performance_alerts_workspace_insert"
  ON public.performance_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = performance_alerts.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin', 'editor')
    )
    AND auth.uid() = performance_alerts.created_by
  );

CREATE POLICY "performance_alerts_creator_update"
  ON public.performance_alerts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = performance_alerts.created_by
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = performance_alerts.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "performance_alerts_creator_delete"
  ON public.performance_alerts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = performance_alerts.created_by
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = performance_alerts.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "performance_alerts_service_role"
  ON public.performance_alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: Alert Notifications
-- ============================================

CREATE POLICY "alert_notifications_workspace_select"
  ON public.alert_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = alert_notifications.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "alert_notifications_workspace_update"
  ON public.alert_notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = alert_notifications.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "alert_notifications_service_role"
  ON public.alert_notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- GRANTS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant access to views
GRANT SELECT ON public.engagement_summary_by_hour TO authenticated;
GRANT SELECT ON public.engagement_summary_by_day TO authenticated;
GRANT SELECT ON public.audience_demographics_latest TO authenticated;
GRANT SELECT ON public.competitor_benchmark_summary TO authenticated;

-- Grant access to materialized views
GRANT SELECT ON public.analytics_aggregated_daily TO authenticated;
GRANT SELECT ON public.analytics_aggregated_weekly TO authenticated;
GRANT SELECT ON public.platform_performance_summary TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_analytics_materialized_views() TO service_role;

-- ============================================
-- COMMENTS AND DOCUMENTATION
-- ============================================

COMMENT ON SCHEMA public IS 'Advanced Analytics with Predictive Insights schema';
COMMENT ON TYPE public.prediction_status IS 'Status of ML prediction processing';
COMMENT ON TYPE public.alert_severity IS 'Severity level of performance alerts';
COMMENT ON TYPE public.alert_status IS 'Current status of alert notification';
COMMENT ON TYPE public.report_status IS 'Status of report generation';
COMMENT ON TYPE public.report_format IS 'Export format for reports';

-- ============================================
-- DOWN MIGRATION (for rollback)
-- ============================================
-- To rollback this migration, run the following in order:
-- 
-- DROP MATERIALIZED VIEW IF EXISTS public.platform_performance_summary;
-- DROP MATERIALIZED VIEW IF EXISTS public.analytics_aggregated_weekly;
-- DROP MATERIALIZED VIEW IF EXISTS public.analytics_aggregated_daily;
-- 
-- DROP VIEW IF EXISTS public.competitor_benchmark_summary;
-- DROP VIEW IF EXISTS public.audience_demographics_latest;
-- DROP VIEW IF EXISTS public.engagement_summary_by_day;
-- DROP VIEW IF EXISTS public.engagement_summary_by_hour;
-- 
-- DROP TABLE IF EXISTS public.alert_notifications;
-- DROP TABLE IF EXISTS public.performance_alerts;
-- DROP TABLE IF EXISTS public.report_executions;
-- DROP TABLE IF EXISTS public.report_schedules;
-- DROP TABLE IF EXISTS public.custom_reports;
-- DROP TABLE IF EXISTS public.benchmark_comparisons;
-- DROP TABLE IF EXISTS public.competitor_metrics;
-- DROP TABLE IF EXISTS public.competitor_profiles;
-- DROP TABLE IF EXISTS public.audience_growth;
-- DROP TABLE IF EXISTS public.audience_interests;
-- DROP TABLE IF EXISTS public.audience_demographics;
-- DROP TABLE IF EXISTS public.engagement_by_time;
-- DROP TABLE IF EXISTS public.optimal_posting_times;
-- DROP TABLE IF EXISTS public.prediction_accuracy;
-- DROP TABLE IF EXISTS public.viral_score_predictions;
-- 
-- DROP FUNCTION IF EXISTS public.refresh_analytics_materialized_views();
-- DROP FUNCTION IF EXISTS public.update_updated_at();
-- 
-- DROP TYPE IF EXISTS public.report_format;
-- DROP TYPE IF EXISTS public.report_status;
-- DROP TYPE IF EXISTS public.alert_status;
-- DROP TYPE IF EXISTS public.alert_severity;
-- DROP TYPE IF EXISTS public.prediction_status;
