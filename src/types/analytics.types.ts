import { UUID, Timestamp, Platform } from './common.types';

export interface ContentAnalytics {
  id: UUID;
  workspace_id: UUID;
  content_id: UUID;
  platform: Platform;
  views: number;
  impressions: number;
  reach: number;
  engagement_count: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagement_rate: number;
  click_through_rate: number;
  save_rate: number;
  share_rate: number;
  viral_coefficient: number;
  revenue_generated: number;
  revenue_source?: RevenueSource;
  cost_per_engagement: number;
  roi: number;
  audience_demographics: AudienceDemographics;
  top_locations: Location[];
  device_breakdown: DeviceBreakdown;
  traffic_sources: TrafficSources;
  performance_by_hour: Record<string, number>;
  performance_by_day: Record<string, number>;
  peak_engagement_time?: Timestamp;
  snapshot_date: string;
  collected_at: Timestamp;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type RevenueSource = 'ads' | 'affiliate' | 'sponsorship' | 'product';

export interface AudienceDemographics {
  age_groups: Record<string, number>;
  gender: Record<string, number>;
  interests: Record<string, number>;
}

export interface Location {
  country: string;
  city?: string;
  percentage: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface TrafficSources {
  organic: number;
  paid: number;
  direct: number;
  referral: number;
  social: number;
}

export interface RevenueInsight {
  id: UUID;
  workspace_id: UUID;
  content_id?: UUID;
  revenue_amount: number;
  revenue_type: RevenueType;
  revenue_date: string;
  platform: Platform;
  brand_partner?: string;
  campaign_id?: string;
  content_creation_cost: number;
  platform_fees: number;
  other_costs: number;
  net_revenue: number;
  forecasted_amount?: number;
  forecast_confidence?: number;
  actual_vs_forecast?: number;
  attributed_views: number;
  attributed_clicks: number;
  conversion_rate: number;
  tax_category?: string;
  tax_amount: number;
  invoice_id?: string;
  payment_status: PaymentStatus;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type RevenueType = 'sponsorship' | 'affiliate' | 'ads' | 'product' | 'tip';

export type PaymentStatus = 'pending' | 'received' | 'processing';

export interface AnalyticsSummary {
  total_views: number;
  total_engagement: number;
  total_revenue: number;
  avg_engagement_rate: number;
  top_platform: Platform;
  growth_rate: number;
  period: DatePeriod;
}

export type DatePeriod = '24h' | '7d' | '30d' | '90d' | 'all';

export interface PerformanceMetrics {
  content_count: number;
  total_views: number;
  total_impressions: number;
  total_reach: number;
  total_engagement: number;
  avg_engagement_rate: number;
  total_revenue: number;
  top_performing_content: ContentAnalytics[];
  platform_breakdown: Record<Platform, PlatformMetrics>;
}

export interface PlatformMetrics {
  views: number;
  engagement: number;
  revenue: number;
  follower_count: number;
  growth_rate: number;
}
