import { apiClient } from './client';
import { ContentAnalytics, RevenueInsight, PerformanceMetrics } from '../types';

class AnalyticsApi {
  private static instance: AnalyticsApi;

  private constructor() {}

  public static getInstance(): AnalyticsApi {
    if (!AnalyticsApi.instance) {
      AnalyticsApi.instance = new AnalyticsApi();
    }
    return AnalyticsApi.instance;
  }

  async getContentAnalytics(workspaceId: string, filters?: Record<string, any>): Promise<ContentAnalytics[]> {
    return apiClient.query<ContentAnalytics>('content_analytics', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'snapshot_date', ascending: false }
    });
  }

  async getAnalyticsByContentId(contentId: string): Promise<ContentAnalytics[]> {
    return apiClient.query<ContentAnalytics>('content_analytics', {
      filters: { content_id: contentId },
      orderBy: { column: 'snapshot_date', ascending: false }
    });
  }

  async createAnalyticsSnapshot(analytics: Partial<ContentAnalytics>): Promise<ContentAnalytics> {
    const [result] = await apiClient.insert<ContentAnalytics>('content_analytics', analytics);
    return result;
  }

  async getRevenueInsights(workspaceId: string, filters?: Record<string, any>): Promise<RevenueInsight[]> {
    return apiClient.query<RevenueInsight>('revenue_insights', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'revenue_date', ascending: false }
    });
  }

  async createRevenueInsight(insight: Partial<RevenueInsight>): Promise<RevenueInsight> {
    const [result] = await apiClient.insert<RevenueInsight>('revenue_insights', insight);
    return result;
  }

  async getPerformanceMetrics(workspaceId: string, dateRange?: { startDate: string; endDate: string }): Promise<PerformanceMetrics> {
    // This would typically call a database function or aggregate data
    return apiClient.rpc<PerformanceMetrics>('get_performance_metrics', {
      workspace_id: workspaceId,
      start_date: dateRange?.startDate,
      end_date: dateRange?.endDate
    });
  }
}

export const analyticsApi = AnalyticsApi.getInstance();
