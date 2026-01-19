import { apiClient } from './client';
import { ContentAnalytics, RevenueInsight, PerformanceMetrics } from '../types';

/**
 * Analytics API client for managing analytics data and metrics.
 * 
 * Provides methods for retrieving content analytics, revenue insights,
 * and performance metrics across all platforms.
 * 
 * @example
 * ```typescript
 * import { analyticsApi } from './api';
 * 
 * // Get content analytics
 * const analytics = await analyticsApi.getContentAnalytics('workspace-123', {
 *   platform: 'instagram',
 *   startDate: '2025-01-01'
 * });
 * 
 * // Get performance metrics
 * const metrics = await analyticsApi.getPerformanceMetrics('workspace-123', {
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31'
 * });
 * ```
 * 
 * @class
 * @since 1.0.0
 */
class AnalyticsApi {
  private static instance: AnalyticsApi;

  private constructor() {}

  /**
   * Returns the singleton instance of AnalyticsApi.
   * 
   * @returns The AnalyticsApi instance
   */
  public static getInstance(): AnalyticsApi {
    if (!AnalyticsApi.instance) {
      AnalyticsApi.instance = new AnalyticsApi();
    }
    return AnalyticsApi.instance;
  }

  /**
   * Retrieves content analytics for a workspace with optional filtering.
   * 
   * @param workspaceId - The workspace ID to query
   * @param [filters] - Additional filter criteria (platform, date range, etc.)
   * 
   * @returns Promise resolving to an array of analytics snapshots
   * 
   * @example
   * ```typescript
   * // Get all analytics
   * const all = await analyticsApi.getContentAnalytics('workspace-123');
   * 
   * // Filter by platform
   * const instagram = await analyticsApi.getContentAnalytics('workspace-123', {
   *   platform: 'instagram'
   * });
   * 
   * // Filter by date range
   * const recent = await analyticsApi.getContentAnalytics('workspace-123', {
   *   snapshot_date: { gte: '2025-01-01' }
   * });
   * ```
   */
  async getContentAnalytics(workspaceId: string, filters?: Record<string, any>): Promise<ContentAnalytics[]> {
    return apiClient.query<ContentAnalytics>('content_analytics', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'snapshot_date', ascending: false }
    });
  }

  /**
   * Retrieves all analytics snapshots for a specific content item.
   * 
   * @param contentId - The content ID to query
   * 
   * @returns Promise resolving to analytics history for the content
   * 
   * @example
   * ```typescript
   * const contentHistory = await analyticsApi.getAnalyticsByContentId('content-123');
   * console.log(`Content has ${contentHistory.length} snapshots`);
   * ```
   */
  async getAnalyticsByContentId(contentId: string): Promise<ContentAnalytics[]> {
    return apiClient.query<ContentAnalytics>('content_analytics', {
      filters: { content_id: contentId },
      orderBy: { column: 'snapshot_date', ascending: false }
    });
  }

  /**
   * Creates a new analytics snapshot for content.
   * 
   * @param analytics - Partial analytics object with metrics
   * 
   * @returns Promise resolving to the created analytics snapshot
   * 
   * @example
   * ```typescript
   * const snapshot = await analyticsApi.createAnalyticsSnapshot({
   *   content_id: 'content-123',
   *   workspace_id: 'workspace-456',
   *   platform: 'instagram',
   *   views: 1500,
   *   likes: 120,
   *   comments: 15,
   *   shares: 8,
   *   snapshot_date: new Date().toISOString()
   * });
   * ```
   */
  async createAnalyticsSnapshot(analytics: Partial<ContentAnalytics>): Promise<ContentAnalytics> {
    const [result] = await apiClient.insert<ContentAnalytics>('content_analytics', analytics);
    return result;
  }

  /**
   * Retrieves revenue insights for a workspace.
   * 
   * @param workspaceId - The workspace ID to query
   * @param [filters] - Additional filter criteria
   * 
   * @returns Promise resolving to an array of revenue insights
   * 
   * @example
   * ```typescript
   * const insights = await analyticsApi.getRevenueInsights('workspace-123', {
   *   revenue_date: { gte: '2025-01-01' }
   * });
   * ```
   */
  async getRevenueInsights(workspaceId: string, filters?: Record<string, any>): Promise<RevenueInsight[]> {
    return apiClient.query<RevenueInsight>('revenue_insights', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'revenue_date', ascending: false }
    });
  }

  /**
   * Creates a new revenue insight entry.
   * 
   * @param insight - Partial revenue insight object
   * 
   * @returns Promise resolving to the created insight
   * 
   * @example
   * ```typescript
   * const insight = await analyticsApi.createRevenueInsight({
   *   workspace_id: 'workspace-123',
   *   revenue_date: '2025-01-15',
   *   total_revenue: 1250.50,
   *   source: 'subscription',
   *   currency: 'USD'
   * });
   * ```
   */
  async createRevenueInsight(insight: Partial<RevenueInsight>): Promise<RevenueInsight> {
    const [result] = await apiClient.insert<RevenueInsight>('revenue_insights', insight);
    return result;
  }

  /**
   * Retrieves aggregated performance metrics for a workspace.
   * 
   * This method calls a database function that aggregates analytics data
   * across all platforms and content items.
   * 
   * @param workspaceId - The workspace ID to query
   * @param [dateRange] - Optional date range for metrics
   * @param dateRange.startDate - Start date (ISO string)
   * @param dateRange.endDate - End date (ISO string)
   * 
   * @returns Promise resolving to aggregated performance metrics
   * 
   * @example
   * ```typescript
   * // Get overall metrics
   * const allTime = await analyticsApi.getPerformanceMetrics('workspace-123');
   * 
   * // Get metrics for specific period
   * const monthly = await analyticsApi.getPerformanceMetrics('workspace-123', {
   *   startDate: '2025-01-01',
   *   endDate: '2025-01-31'
   * });
   * 
   * console.log(`Total views: ${monthly.totalViews}`);
   * console.log(`Engagement rate: ${monthly.engagementRate}%`);
   * ```
   */
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
