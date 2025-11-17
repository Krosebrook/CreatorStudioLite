import { useAsync } from './useAsync';
import { analyticsApi } from '../api';
import { ContentAnalytics, RevenueInsight, PerformanceMetrics } from '../types';

export function useContentAnalytics(workspaceId: string, filters?: Record<string, any>) {
  const { data, loading, error, execute } = useAsync<ContentAnalytics[]>(
    () => analyticsApi.getContentAnalytics(workspaceId, filters),
    [workspaceId, JSON.stringify(filters)]
  );

  return {
    analytics: data || [],
    loading,
    error,
    refresh: execute
  };
}

export function useRevenueInsights(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<RevenueInsight[]>(
    () => analyticsApi.getRevenueInsights(workspaceId),
    [workspaceId]
  );

  const totalRevenue = data?.reduce((sum, insight) => sum + insight.revenue_amount, 0) || 0;
  const totalNet = data?.reduce((sum, insight) => sum + insight.net_revenue, 0) || 0;

  return {
    insights: data || [],
    loading,
    error,
    totalRevenue,
    totalNet,
    refresh: execute
  };
}

export function usePerformanceMetrics(workspaceId: string, dateRange?: { startDate: string; endDate: string }) {
  const { data, loading, error, execute } = useAsync<PerformanceMetrics>(
    () => analyticsApi.getPerformanceMetrics(workspaceId, dateRange),
    [workspaceId, JSON.stringify(dateRange)]
  );

  return {
    metrics: data,
    loading,
    error,
    refresh: execute
  };
}
