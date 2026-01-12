/**
 * Advanced Analytics Database Types
 * 
 * These types represent the database schema for the Advanced Analytics feature.
 * Generated from migration: 20260112135100_advanced_analytics_predictive_insights.sql
 * 
 * Usage with Supabase client:
 * ```typescript
 * import { Database } from './types/analytics-database.types';
 * const supabase = createClient<Database>(url, key);
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PredictionStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted'
export type ReportStatus = 'scheduled' | 'generating' | 'completed' | 'failed'
export type ReportFormat = 'pdf' | 'csv' | 'json' | 'html'

export interface ViralScorePrediction {
  id: string
  workspace_id: string
  content_id: string | null
  post_id: string | null
  platform: string
  predicted_score: number
  confidence_score: number
  prediction_factors: Json
  model_version: string
  model_type: string
  predicted_at: string
  valid_until: string | null
  status: PredictionStatus
  metadata: Json
  created_at: string
  updated_at: string
}

export interface PredictionAccuracy {
  id: string
  workspace_id: string
  prediction_id: string
  post_id: string
  predicted_score: number
  actual_score: number
  accuracy_percentage: number // Generated column
  actual_views: number
  actual_likes: number
  actual_shares: number
  actual_comments: number
  actual_engagement_rate: number | null
  measured_at: string
  hours_since_publish: number | null
  metadata: Json
  created_at: string
}

export interface OptimalPostingTime {
  id: string
  workspace_id: string
  connector_id: string | null
  platform: string
  day_of_week: number // 0-6
  hour_of_day: number // 0-23
  timezone: string
  avg_engagement_rate: number
  avg_views: number
  avg_likes: number
  avg_shares: number
  avg_comments: number
  sample_size: number
  confidence_level: number | null
  optimization_score: number
  rank_in_week: number | null
  calculation_period_start: string
  calculation_period_end: string
  metadata: Json
  created_at: string
  updated_at: string
}

export interface EngagementByTime {
  id: string
  workspace_id: string
  post_id: string
  platform: string
  posted_at: string
  day_of_week: number
  hour_of_day: number
  timezone: string
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number
  hours_since_publish: number
  engagement_velocity: number | null
  metadata: Json
  recorded_at: string
}

export interface AudienceDemographics {
  id: string
  workspace_id: string
  connector_id: string
  platform: string
  age_ranges: Json // {"18-24": 25.5, "25-34": 40.2, ...}
  gender_distribution: Json // {"male": 45.5, "female": 52.3, "other": 2.2}
  top_countries: Json // [{"country": "US", "percentage": 35.5}, ...]
  top_cities: Json
  top_regions: Json
  languages: Json
  total_followers: number
  total_reach: number
  period_start: string
  period_end: string
  metadata: Json
  fetched_at: string
  created_at: string
}

export interface AudienceInterest {
  id: string
  workspace_id: string
  connector_id: string
  platform: string
  interest_category: string
  interest_subcategory: string | null
  affinity_score: number | null
  audience_percentage: number | null
  audience_count: number
  engagement_rate: number
  behaviors: Json
  period_start: string
  period_end: string
  metadata: Json
  fetched_at: string
  created_at: string
}

export interface AudienceGrowth {
  id: string
  workspace_id: string
  connector_id: string
  platform: string
  follower_count: number
  follower_change: number
  follower_growth_rate: number
  avg_engagement_rate: number
  total_reach: number
  total_impressions: number
  engagement_quality_score: number
  audience_retention_rate: number
  recorded_date: string
  metadata: Json
  created_at: string
}

export interface CompetitorProfile {
  id: string
  workspace_id: string
  competitor_name: string
  platform: string
  platform_handle: string
  platform_user_id: string | null
  profile_url: string | null
  avatar_url: string | null
  bio: string | null
  category: string | null
  follower_count: number
  following_count: number
  post_count: number
  is_active: boolean
  is_verified: boolean
  added_by: string | null
  last_updated_at: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface CompetitorMetrics {
  id: string
  workspace_id: string
  competitor_id: string
  follower_count: number
  follower_change: number
  following_count: number
  post_count: number
  posts_per_week: number
  avg_likes: number
  avg_comments: number
  avg_shares: number
  avg_views: number
  avg_engagement_rate: number
  engagement_quality_score: number
  content_consistency_score: number
  top_post_url: string | null
  top_post_engagement: number
  recorded_date: string
  metadata: Json
  fetched_at: string
  created_at: string
}

export interface BenchmarkComparison {
  id: string
  workspace_id: string
  connector_id: string | null
  platform: string
  user_follower_count: number
  user_engagement_rate: number
  user_posts_per_week: number
  user_avg_likes: number
  user_avg_comments: number
  industry_avg_follower_count: number
  industry_avg_engagement_rate: number
  industry_avg_posts_per_week: number
  competitor_avg_follower_count: number
  competitor_avg_engagement_rate: number
  competitor_avg_posts_per_week: number
  engagement_percentile: number | null
  growth_percentile: number | null
  consistency_percentile: number | null
  overall_performance_score: number
  period_start: string
  period_end: string
  metadata: Json
  created_at: string
}

export interface CustomReport {
  id: string
  workspace_id: string
  created_by: string
  name: string
  description: string | null
  report_type: string
  query_config: Json
  filters: Json
  metrics: string[]
  dimensions: string[]
  chart_configs: Json
  layout_config: Json
  is_public: boolean
  shared_with: string[]
  is_active: boolean
  is_favorite: boolean
  metadata: Json
  created_at: string
  updated_at: string
}

export interface ReportSchedule {
  id: string
  workspace_id: string
  report_id: string
  created_by: string
  schedule_name: string
  cron_expression: string
  timezone: string
  delivery_method: string
  recipients: string[]
  webhook_url: string | null
  export_format: ReportFormat
  include_raw_data: boolean
  is_active: boolean
  last_run_at: string | null
  next_run_at: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface ReportExecution {
  id: string
  workspace_id: string
  report_id: string
  schedule_id: string | null
  status: ReportStatus
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  output_url: string | null
  output_format: ReportFormat | null
  file_size_bytes: number | null
  rows_processed: number
  error_message: string | null
  error_details: Json | null
  metadata: Json
  created_at: string
}

export interface PerformanceAlert {
  id: string
  workspace_id: string
  created_by: string
  alert_name: string
  description: string | null
  alert_type: string
  metric: string
  condition_operator: string
  threshold_value: number | null
  comparison_period: string | null
  platform: string | null
  connector_id: string | null
  content_id: string | null
  notification_channels: string[]
  notification_recipients: string[]
  webhook_url: string | null
  cooldown_minutes: number
  last_triggered_at: string | null
  severity: AlertSeverity
  is_active: boolean
  metadata: Json
  created_at: string
  updated_at: string
}

export interface AlertNotification {
  id: string
  workspace_id: string
  alert_id: string
  triggered_at: string
  status: AlertStatus
  metric_name: string
  current_value: number | null
  threshold_value: number | null
  previous_value: number | null
  platform: string | null
  content_title: string | null
  post_url: string | null
  alert_message: string
  alert_details: Json
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolution_notes: string | null
  resolved_at: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

// View Types
export interface EngagementSummaryByHour {
  workspace_id: string
  platform: string
  hour_of_day: number
  post_count: number
  avg_engagement_rate: number
  avg_views: number
  avg_likes: number
  avg_comments: number
  avg_shares: number
}

export interface EngagementSummaryByDay {
  workspace_id: string
  platform: string
  day_of_week: number
  post_count: number
  avg_engagement_rate: number
  avg_views: number
  avg_likes: number
  avg_comments: number
  avg_shares: number
}

export interface AudienceDemographicsLatest {
  id: string
  workspace_id: string
  connector_id: string
  platform: string
  age_ranges: Json
  gender_distribution: Json
  top_countries: Json
  top_cities: Json
  languages: Json
  total_followers: number
  total_reach: number
  period_start: string
  period_end: string
  fetched_at: string
}

export interface CompetitorBenchmarkSummary {
  workspace_id: string
  platform: string
  competitor_name: string
  platform_handle: string
  current_follower_count: number
  avg_engagement_rate: number
  posts_per_week: number
  avg_likes: number
  avg_comments: number
  recorded_date: string
}

// Materialized View Types
export interface AnalyticsAggregatedDaily {
  platform: string
  workspace_id: string
  date: string
  post_count: number
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  avg_engagement_rate: number
  total_reach: number
  total_impressions: number
}

export interface AnalyticsAggregatedWeekly {
  platform: string
  workspace_id: string
  week_start: string
  post_count: number
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  avg_engagement_rate: number
  total_reach: number
  total_impressions: number
}

export interface PlatformPerformanceSummary {
  workspace_id: string
  platform: string
  total_posts: number
  days_active: number
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  avg_engagement_rate: number
  max_engagement_rate: number
  median_engagement_rate: number
  total_reach: number
  total_impressions: number
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      viral_score_predictions: {
        Row: ViralScorePrediction
        Insert: Omit<ViralScorePrediction, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ViralScorePrediction, 'id' | 'created_at'>>
      }
      prediction_accuracy: {
        Row: PredictionAccuracy
        Insert: Omit<PredictionAccuracy, 'id' | 'accuracy_percentage' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<PredictionAccuracy, 'id' | 'accuracy_percentage' | 'created_at'>>
      }
      optimal_posting_times: {
        Row: OptimalPostingTime
        Insert: Omit<OptimalPostingTime, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<OptimalPostingTime, 'id' | 'created_at'>>
      }
      engagement_by_time: {
        Row: EngagementByTime
        Insert: Omit<EngagementByTime, 'id' | 'recorded_at'> & {
          id?: string
          recorded_at?: string
        }
        Update: Partial<Omit<EngagementByTime, 'id' | 'recorded_at'>>
      }
      audience_demographics: {
        Row: AudienceDemographics
        Insert: Omit<AudienceDemographics, 'id' | 'fetched_at' | 'created_at'> & {
          id?: string
          fetched_at?: string
          created_at?: string
        }
        Update: Partial<Omit<AudienceDemographics, 'id' | 'fetched_at' | 'created_at'>>
      }
      audience_interests: {
        Row: AudienceInterest
        Insert: Omit<AudienceInterest, 'id' | 'fetched_at' | 'created_at'> & {
          id?: string
          fetched_at?: string
          created_at?: string
        }
        Update: Partial<Omit<AudienceInterest, 'id' | 'fetched_at' | 'created_at'>>
      }
      audience_growth: {
        Row: AudienceGrowth
        Insert: Omit<AudienceGrowth, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<AudienceGrowth, 'id' | 'created_at'>>
      }
      competitor_profiles: {
        Row: CompetitorProfile
        Insert: Omit<CompetitorProfile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<CompetitorProfile, 'id' | 'created_at'>>
      }
      competitor_metrics: {
        Row: CompetitorMetrics
        Insert: Omit<CompetitorMetrics, 'id' | 'fetched_at' | 'created_at'> & {
          id?: string
          fetched_at?: string
          created_at?: string
        }
        Update: Partial<Omit<CompetitorMetrics, 'id' | 'fetched_at' | 'created_at'>>
      }
      benchmark_comparisons: {
        Row: BenchmarkComparison
        Insert: Omit<BenchmarkComparison, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<BenchmarkComparison, 'id' | 'created_at'>>
      }
      custom_reports: {
        Row: CustomReport
        Insert: Omit<CustomReport, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<CustomReport, 'id' | 'created_at'>>
      }
      report_schedules: {
        Row: ReportSchedule
        Insert: Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ReportSchedule, 'id' | 'created_at'>>
      }
      report_executions: {
        Row: ReportExecution
        Insert: Omit<ReportExecution, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<ReportExecution, 'id' | 'created_at'>>
      }
      performance_alerts: {
        Row: PerformanceAlert
        Insert: Omit<PerformanceAlert, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<PerformanceAlert, 'id' | 'created_at'>>
      }
      alert_notifications: {
        Row: AlertNotification
        Insert: Omit<AlertNotification, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<AlertNotification, 'id' | 'created_at'>>
      }
    }
    Views: {
      engagement_summary_by_hour: {
        Row: EngagementSummaryByHour
      }
      engagement_summary_by_day: {
        Row: EngagementSummaryByDay
      }
      audience_demographics_latest: {
        Row: AudienceDemographicsLatest
      }
      competitor_benchmark_summary: {
        Row: CompetitorBenchmarkSummary
      }
      analytics_aggregated_daily: {
        Row: AnalyticsAggregatedDaily
      }
      analytics_aggregated_weekly: {
        Row: AnalyticsAggregatedWeekly
      }
      platform_performance_summary: {
        Row: PlatformPerformanceSummary
      }
    }
    Functions: {
      update_updated_at: {
        Args: Record<string, never>
        Returns: undefined
      }
      refresh_analytics_materialized_views: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      prediction_status: PredictionStatus
      alert_severity: AlertSeverity
      alert_status: AlertStatus
      report_status: ReportStatus
      report_format: ReportFormat
    }
  }
}
