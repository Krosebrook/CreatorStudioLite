/*
  # AI Content Generation & Analytics System

  1. New Tables
    - `ai_content_ideas`
      - Stores AI-generated content ideas with viral prediction scores
      - Tracks niche, audience insights, and platform optimization

    - `ai_captions`
      - Generated captions with brand voice profiles
      - Platform-specific variations
      - Engagement prediction scores

    - `ai_hashtags`
      - Trending hashtags with analytics
      - Niche-specific tags
      - Performance tracking

    - `brand_voice_profiles`
      - User brand voice configurations
      - Tone, style, keywords
      - Learning from past content

    - `content_analytics`
      - Real-time performance data
      - Cross-platform metrics
      - Revenue attribution

    - `publishing_schedule`
      - Scheduled posts with optimal timing
      - Bulk operations support
      - Auto-optimization settings

    - `revenue_insights`
      - Revenue tracking per content
      - Brand partnership data
      - Forecasting models

    - `viral_predictions`
      - AI predictions for content performance
      - Historical accuracy tracking
      - Platform-specific models

  2. Security
    - Enable RLS on all tables
    - Workspace-scoped access policies
    - User-based read/write permissions
*/

-- AI Content Ideas Table
CREATE TABLE IF NOT EXISTS ai_content_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content Details
  title text NOT NULL,
  description text NOT NULL,
  content_type text NOT NULL, -- 'post', 'reel', 'video', 'story', 'carousel'
  niche text NOT NULL,
  target_audience jsonb DEFAULT '{}',

  -- AI Analysis
  viral_score integer CHECK (viral_score >= 0 AND viral_score <= 100),
  engagement_prediction decimal(5,2),
  optimal_platforms text[] DEFAULT ARRAY[]::text[],
  trending_topics text[] DEFAULT ARRAY[]::text[],

  -- SEO & Keywords
  keywords text[] DEFAULT ARRAY[]::text[],
  search_volume integer DEFAULT 0,
  competition_level text, -- 'low', 'medium', 'high'

  -- Status
  status text DEFAULT 'draft', -- 'draft', 'approved', 'used', 'archived'
  used_in_content_id uuid,

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Captions Table
CREATE TABLE IF NOT EXISTS ai_captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_idea_id uuid REFERENCES ai_content_ideas(id) ON DELETE SET NULL,

  -- Caption Content
  caption text NOT NULL,
  platform text NOT NULL, -- 'instagram', 'tiktok', 'youtube', 'linkedin', 'twitter'
  language text DEFAULT 'en',

  -- Brand Voice
  brand_voice_id uuid REFERENCES brand_voice_profiles(id) ON DELETE SET NULL,
  tone text, -- 'professional', 'casual', 'funny', 'inspirational', 'educational'
  style text, -- 'storytelling', 'direct', 'question', 'listicle'

  -- Optimization
  character_count integer,
  word_count integer,
  emoji_count integer,
  hashtag_count integer,
  mention_count integer,

  -- AI Predictions
  engagement_score integer CHECK (engagement_score >= 0 AND engagement_score <= 100),
  click_through_prediction decimal(5,2),
  save_rate_prediction decimal(5,2),
  share_rate_prediction decimal(5,2),

  -- Performance (after posting)
  actual_engagement_rate decimal(5,2),
  actual_clicks integer DEFAULT 0,
  actual_saves integer DEFAULT 0,
  actual_shares integer DEFAULT 0,

  -- Status
  status text DEFAULT 'generated', -- 'generated', 'approved', 'used', 'archived'
  used_at timestamptz,

  -- Metadata
  variants jsonb DEFAULT '[]', -- Alternative caption variations
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Hashtags Table
CREATE TABLE IF NOT EXISTS ai_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Hashtag Details
  tag text NOT NULL,
  platform text NOT NULL,
  niche text,

  -- Trend Data
  trending_score integer CHECK (trending_score >= 0 AND trending_score <= 100),
  volume_24h integer DEFAULT 0,
  volume_7d integer DEFAULT 0,
  volume_30d integer DEFAULT 0,
  growth_rate decimal(5,2),

  -- Performance
  avg_engagement_rate decimal(5,2),
  avg_reach integer DEFAULT 0,
  competition_level text, -- 'low', 'medium', 'high'

  -- Recommendations
  recommended_for_niches text[] DEFAULT ARRAY[]::text[],
  best_time_to_use time,
  complementary_tags text[] DEFAULT ARRAY[]::text[],

  -- Metadata
  last_analyzed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(tag, platform, workspace_id)
);

-- Brand Voice Profiles Table
CREATE TABLE IF NOT EXISTS brand_voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile Details
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,

  -- Voice Characteristics
  tone text[] DEFAULT ARRAY[]::text[], -- ['professional', 'friendly', 'humorous']
  style text[] DEFAULT ARRAY[]::text[], -- ['storytelling', 'educational', 'inspirational']
  personality_traits text[] DEFAULT ARRAY[]::text[],

  -- Language Preferences
  vocabulary_level text DEFAULT 'medium', -- 'simple', 'medium', 'advanced'
  sentence_structure text DEFAULT 'varied', -- 'short', 'medium', 'long', 'varied'
  emoji_usage text DEFAULT 'moderate', -- 'none', 'light', 'moderate', 'heavy'

  -- Brand Guidelines
  key_phrases text[] DEFAULT ARRAY[]::text[],
  avoid_phrases text[] DEFAULT ARRAY[]::text[],
  preferred_hashtags text[] DEFAULT ARRAY[]::text[],
  brand_values text[] DEFAULT ARRAY[]::text[],

  -- Learning Data
  sample_content text[] DEFAULT ARRAY[]::text[],
  engagement_patterns jsonb DEFAULT '{}',
  audience_response jsonb DEFAULT '{}',

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(workspace_id, name)
);

-- Content Analytics Table
CREATE TABLE IF NOT EXISTS content_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  platform text NOT NULL,

  -- Performance Metrics
  views integer DEFAULT 0,
  impressions integer DEFAULT 0,
  reach integer DEFAULT 0,
  engagement_count integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  clicks integer DEFAULT 0,

  -- Calculated Metrics
  engagement_rate decimal(5,2),
  click_through_rate decimal(5,2),
  save_rate decimal(5,2),
  share_rate decimal(5,2),
  viral_coefficient decimal(5,2),

  -- Revenue Data
  revenue_generated decimal(12,2) DEFAULT 0,
  revenue_source text, -- 'ads', 'affiliate', 'sponsorship', 'product'
  cost_per_engagement decimal(8,2),
  roi decimal(8,2),

  -- Audience Insights
  audience_demographics jsonb DEFAULT '{}',
  top_locations jsonb DEFAULT '[]',
  device_breakdown jsonb DEFAULT '{}',
  traffic_sources jsonb DEFAULT '{}',

  -- Time-based Data
  performance_by_hour jsonb DEFAULT '{}',
  performance_by_day jsonb DEFAULT '{}',
  peak_engagement_time timestamptz,

  -- Metadata
  snapshot_date date DEFAULT CURRENT_DATE,
  collected_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(content_id, platform, snapshot_date)
);

-- Publishing Schedule Table
CREATE TABLE IF NOT EXISTS publishing_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid,

  -- Schedule Details
  scheduled_time timestamptz NOT NULL,
  timezone text DEFAULT 'UTC',
  platforms text[] NOT NULL,

  -- Content
  title text NOT NULL,
  caption text,
  media_urls text[] DEFAULT ARRAY[]::text[],
  hashtags text[] DEFAULT ARRAY[]::text[],
  mentions text[] DEFAULT ARRAY[]::text[],

  -- AI Optimization
  optimal_time_suggested timestamptz,
  optimal_time_confidence decimal(5,2),
  auto_optimize boolean DEFAULT false,

  -- Bulk Operation
  batch_id uuid,
  batch_position integer,

  -- Status
  status text DEFAULT 'scheduled', -- 'scheduled', 'processing', 'published', 'failed', 'cancelled'
  published_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,

  -- Platform-specific IDs
  platform_post_ids jsonb DEFAULT '{}',

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Revenue Insights Table
CREATE TABLE IF NOT EXISTS revenue_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_id uuid,

  -- Revenue Details
  revenue_amount decimal(12,2) NOT NULL,
  revenue_type text NOT NULL, -- 'sponsorship', 'affiliate', 'ads', 'product', 'tip'
  revenue_date date DEFAULT CURRENT_DATE,

  -- Source Information
  platform text NOT NULL,
  brand_partner text,
  campaign_id text,

  -- Cost Analysis
  content_creation_cost decimal(12,2) DEFAULT 0,
  platform_fees decimal(12,2) DEFAULT 0,
  other_costs decimal(12,2) DEFAULT 0,
  net_revenue decimal(12,2),

  -- Forecasting
  forecasted_amount decimal(12,2),
  forecast_confidence decimal(5,2),
  actual_vs_forecast decimal(8,2),

  -- Attribution
  attributed_views integer DEFAULT 0,
  attributed_clicks integer DEFAULT 0,
  conversion_rate decimal(5,2),

  -- Tax & Compliance
  tax_category text,
  tax_amount decimal(12,2) DEFAULT 0,
  invoice_id text,
  payment_status text DEFAULT 'pending', -- 'pending', 'received', 'processing'

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Viral Predictions Table
CREATE TABLE IF NOT EXISTS viral_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_id uuid,
  content_idea_id uuid REFERENCES ai_content_ideas(id) ON DELETE CASCADE,

  -- Prediction Details
  platform text NOT NULL,
  predicted_at timestamptz DEFAULT now(),
  prediction_model text NOT NULL, -- 'ml_v1', 'neural_v2', etc.

  -- Predictions
  viral_score integer CHECK (viral_score >= 0 AND viral_score <= 100),
  predicted_views integer,
  predicted_engagement integer,
  predicted_shares integer,
  predicted_reach integer,

  -- Confidence Levels
  overall_confidence decimal(5,2),
  views_confidence decimal(5,2),
  engagement_confidence decimal(5,2),

  -- Factors
  positive_factors text[] DEFAULT ARRAY[]::text[],
  negative_factors text[] DEFAULT ARRAY[]::text[],
  improvement_suggestions text[] DEFAULT ARRAY[]::text[],

  -- Actual Results (after posting)
  actual_views integer,
  actual_engagement integer,
  actual_shares integer,
  actual_reach integer,
  prediction_accuracy decimal(5,2),

  -- Metadata
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ai_content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Content Ideas
CREATE POLICY "Users can view ideas in their workspace"
  ON ai_content_ideas FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ideas in their workspace"
  ON ai_content_ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own ideas"
  ON ai_content_ideas FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own ideas"
  ON ai_content_ideas FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for AI Captions
CREATE POLICY "Users can view captions in their workspace"
  ON ai_captions FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create captions in their workspace"
  ON ai_captions FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own captions"
  ON ai_captions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for AI Hashtags
CREATE POLICY "Users can view hashtags in their workspace"
  ON ai_hashtags FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create hashtags in their workspace"
  ON ai_hashtags FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Brand Voice Profiles
CREATE POLICY "Users can view brand voices in their workspace"
  ON brand_voice_profiles FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create brand voices in their workspace"
  ON brand_voice_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own brand voices"
  ON brand_voice_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for Content Analytics
CREATE POLICY "Users can view analytics in their workspace"
  ON content_analytics FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics"
  ON content_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Publishing Schedule
CREATE POLICY "Users can view schedule in their workspace"
  ON publishing_schedule FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create schedule in their workspace"
  ON publishing_schedule FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own schedule"
  ON publishing_schedule FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for Revenue Insights
CREATE POLICY "Users can view revenue in their workspace"
  ON revenue_insights FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create revenue records in their workspace"
  ON revenue_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Viral Predictions
CREATE POLICY "Users can view predictions in their workspace"
  ON viral_predictions FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create predictions"
  ON viral_predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Create Indexes for Performance
CREATE INDEX idx_ai_content_ideas_workspace ON ai_content_ideas(workspace_id);
CREATE INDEX idx_ai_content_ideas_status ON ai_content_ideas(status);
CREATE INDEX idx_ai_content_ideas_viral_score ON ai_content_ideas(viral_score DESC);

CREATE INDEX idx_ai_captions_workspace ON ai_captions(workspace_id);
CREATE INDEX idx_ai_captions_platform ON ai_captions(platform);
CREATE INDEX idx_ai_captions_content_idea ON ai_captions(content_idea_id);

CREATE INDEX idx_ai_hashtags_workspace ON ai_hashtags(workspace_id);
CREATE INDEX idx_ai_hashtags_trending ON ai_hashtags(trending_score DESC);
CREATE INDEX idx_ai_hashtags_platform ON ai_hashtags(platform);

CREATE INDEX idx_brand_voice_workspace ON brand_voice_profiles(workspace_id);
CREATE INDEX idx_brand_voice_default ON brand_voice_profiles(workspace_id, is_default);

CREATE INDEX idx_content_analytics_workspace ON content_analytics(workspace_id);
CREATE INDEX idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_platform ON content_analytics(platform);
CREATE INDEX idx_content_analytics_date ON content_analytics(snapshot_date DESC);

CREATE INDEX idx_publishing_schedule_workspace ON publishing_schedule(workspace_id);
CREATE INDEX idx_publishing_schedule_time ON publishing_schedule(scheduled_time);
CREATE INDEX idx_publishing_schedule_status ON publishing_schedule(status);

CREATE INDEX idx_revenue_insights_workspace ON revenue_insights(workspace_id);
CREATE INDEX idx_revenue_insights_date ON revenue_insights(revenue_date DESC);
CREATE INDEX idx_revenue_insights_platform ON revenue_insights(platform);

CREATE INDEX idx_viral_predictions_workspace ON viral_predictions(workspace_id);
CREATE INDEX idx_viral_predictions_content_idea ON viral_predictions(content_idea_id);
