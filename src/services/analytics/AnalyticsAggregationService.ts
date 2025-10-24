import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export interface AggregatedMetrics {
  workspaceId: string;
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  totalImpressions: number;
  avgEngagementRate: number;
  postCount: number;
  platformBreakdown: Record<string, {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    posts: number;
  }>;
}

export interface ContentInsights {
  bestPostingTime: string;
  topPerformingPlatform: string;
  avgViewsPerPost: number;
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
  contentTypePerformance: Record<string, number>;
}

export interface ComparisonMetrics {
  current: AggregatedMetrics;
  previous: AggregatedMetrics;
  growth: {
    views: number;
    likes: number;
    engagement: number;
  };
}

class AnalyticsAggregationService {
  private static instance: AnalyticsAggregationService;

  private constructor() {}

  static getInstance(): AnalyticsAggregationService {
    if (!AnalyticsAggregationService.instance) {
      AnalyticsAggregationService.instance = new AnalyticsAggregationService();
    }
    return AnalyticsAggregationService.instance;
  }

  async aggregateMetrics(
    workspaceId: string,
    period: 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date
  ): Promise<AggregatedMetrics> {
    try {
      logger.info('Aggregating analytics metrics', { workspaceId, period });

      const { data: analyticsData, error } = await supabase
        .from('analytics')
        .select(`
          *,
          post:published_posts!inner(
            platform,
            content:content!inner(
              workspace_id,
              type
            )
          )
        `)
        .eq('post.content.workspace_id', workspaceId)
        .gte('fetched_at', startDate.toISOString())
        .lte('fetched_at', endDate.toISOString());

      if (error) throw error;

      const metrics: AggregatedMetrics = {
        workspaceId,
        period,
        startDate,
        endDate,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalReach: 0,
        totalImpressions: 0,
        avgEngagementRate: 0,
        postCount: 0,
        platformBreakdown: {},
      };

      const platformMap = new Map<string, any>();
      const postIds = new Set<string>();

      analyticsData?.forEach((item: any) => {
        metrics.totalViews += item.views || 0;
        metrics.totalLikes += item.likes || 0;
        metrics.totalComments += item.comments || 0;
        metrics.totalShares += item.shares || 0;
        metrics.totalReach += item.reach || 0;
        metrics.totalImpressions += item.impressions || 0;

        postIds.add(item.post_id);

        const platform = item.post?.platform || 'unknown';
        const existing = platformMap.get(platform) || {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          posts: new Set(),
        };

        existing.views += item.views || 0;
        existing.likes += item.likes || 0;
        existing.comments += item.comments || 0;
        existing.shares += item.shares || 0;
        existing.posts.add(item.post_id);

        platformMap.set(platform, existing);
      });

      metrics.postCount = postIds.size;

      platformMap.forEach((value, platform) => {
        metrics.platformBreakdown[platform] = {
          views: value.views,
          likes: value.likes,
          comments: value.comments,
          shares: value.shares,
          posts: value.posts.size,
        };
      });

      if (metrics.totalViews > 0) {
        const totalEngagements = metrics.totalLikes + metrics.totalComments + metrics.totalShares;
        metrics.avgEngagementRate = (totalEngagements / metrics.totalViews) * 100;
      }

      return metrics;
    } catch (error) {
      logger.error('Failed to aggregate metrics', { error, workspaceId });
      throw new AppError('Failed to aggregate analytics', 'AGGREGATION_FAILED');
    }
  }

  async getContentInsights(workspaceId: string, days: number = 30): Promise<ContentInsights> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: analyticsData } = await supabase
        .from('analytics')
        .select(`
          *,
          post:published_posts!inner(
            platform,
            published_at,
            content:content!inner(
              workspace_id,
              type
            )
          )
        `)
        .eq('post.content.workspace_id', workspaceId)
        .gte('fetched_at', startDate.toISOString());

      const platformViews = new Map<string, number>();
      const postingHours = new Map<number, number>();
      const contentTypes = new Map<string, number>();
      let totalViews = 0;
      let totalPosts = 0;

      analyticsData?.forEach((item: any) => {
        const platform = item.post?.platform || 'unknown';
        const views = item.views || 0;
        platformViews.set(platform, (platformViews.get(platform) || 0) + views);
        totalViews += views;
        totalPosts++;

        if (item.post?.published_at) {
          const hour = new Date(item.post.published_at).getHours();
          postingHours.set(hour, (postingHours.get(hour) || 0) + views);
        }

        const contentType = item.post?.content?.type || 'post';
        contentTypes.set(contentType, (contentTypes.get(contentType) || 0) + views);
      });

      const topPlatform = Array.from(platformViews.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

      const bestHour = Array.from(postingHours.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

      const contentTypePerformance: Record<string, number> = {};
      contentTypes.forEach((views, type) => {
        contentTypePerformance[type] = views;
      });

      return {
        bestPostingTime: `${bestHour}:00`,
        topPerformingPlatform: topPlatform,
        avgViewsPerPost: totalPosts > 0 ? totalViews / totalPosts : 0,
        engagementTrend: 'stable',
        contentTypePerformance,
      };
    } catch (error) {
      logger.error('Failed to get content insights', { error, workspaceId });
      throw new AppError('Failed to get insights', 'INSIGHTS_FAILED');
    }
  }

  async compareMetrics(
    workspaceId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<ComparisonMetrics> {
    try {
      const [current, previous] = await Promise.all([
        this.aggregateMetrics(workspaceId, 'week', currentStart, currentEnd),
        this.aggregateMetrics(workspaceId, 'week', previousStart, previousEnd),
      ]);

      const growth = {
        views: this.calculateGrowth(current.totalViews, previous.totalViews),
        likes: this.calculateGrowth(current.totalLikes, previous.totalLikes),
        engagement: this.calculateGrowth(current.avgEngagementRate, previous.avgEngagementRate),
      };

      return { current, previous, growth };
    } catch (error) {
      logger.error('Failed to compare metrics', { error, workspaceId });
      throw new AppError('Failed to compare metrics', 'COMPARISON_FAILED');
    }
  }

  async exportMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const metrics = await this.aggregateMetrics(workspaceId, 'month', startDate, endDate);

      if (format === 'json') {
        return JSON.stringify(metrics, null, 2);
      }

      const csv = this.convertToCSV(metrics);
      return csv;
    } catch (error) {
      logger.error('Failed to export metrics', { error, workspaceId });
      throw new AppError('Failed to export metrics', 'EXPORT_FAILED');
    }
  }

  async scheduleMetricsCollection(workspaceId: string): Promise<void> {
    try {
      const { data: connectors } = await supabase
        .from('connectors')
        .select('id, platform')
        .eq('workspace_id', workspaceId)
        .eq('status', 'connected');

      if (!connectors || connectors.length === 0) {
        logger.warn('No connectors found for metrics collection', { workspaceId });
        return;
      }

      logger.info('Scheduled metrics collection', { workspaceId, connectorCount: connectors.length });
    } catch (error) {
      logger.error('Failed to schedule metrics collection', { error, workspaceId });
      throw new AppError('Failed to schedule collection', 'SCHEDULE_FAILED');
    }
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private convertToCSV(metrics: AggregatedMetrics): string {
    const headers = [
      'Period',
      'Start Date',
      'End Date',
      'Total Views',
      'Total Likes',
      'Total Comments',
      'Total Shares',
      'Avg Engagement Rate',
      'Post Count',
    ];

    const row = [
      metrics.period,
      metrics.startDate.toISOString(),
      metrics.endDate.toISOString(),
      metrics.totalViews,
      metrics.totalLikes,
      metrics.totalComments,
      metrics.totalShares,
      metrics.avgEngagementRate.toFixed(2),
      metrics.postCount,
    ];

    return `${headers.join(',')}\n${row.join(',')}`;
  }
}

export const analyticsAggregationService = AnalyticsAggregationService.getInstance();
