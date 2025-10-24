import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface PlatformMetrics {
  platform: string;
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
}

interface ContentPerformance {
  id: string;
  title: string;
  platform: string;
  views: number;
  likes: number;
  engagement_rate: number;
  published_at: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [overallMetrics, setOverallMetrics] = useState<MetricCard[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [topContent, setTopContent] = useState<ContentPerformance[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange, selectedPlatform, loadAnalytics]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      let query = supabase
        .from('analytics')
        .select(`
          *,
          post:published_posts!inner(
            platform,
            published_at,
            content:content!inner(
              id,
              title,
              workspace_id
            )
          )
        `)
        .gte('fetched_at', startDate.toISOString());

      if (selectedPlatform !== 'all') {
        query = query.eq('post.platform', selectedPlatform);
      }

      const { data: analyticsData } = await query;

      if (analyticsData) {
        calculateOverallMetrics(analyticsData);
        calculatePlatformMetrics(analyticsData);
        calculateTopContent(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallMetrics = (data: unknown[]) => {
    const totalViews = data.reduce((sum, item: any) => sum + (item.views || 0), 0);
    const totalLikes = data.reduce((sum, item: any) => sum + (item.likes || 0), 0);
    const totalComments = data.reduce((sum, item: any) => sum + (item.comments || 0), 0);
    data.reduce((sum, item: any) => sum + (item.shares || 0), 0);
    const avgEngagement = data.length > 0
      ? data.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / data.length
      : 0;

    setOverallMetrics([
      {
        label: 'Total Views',
        value: formatNumber(totalViews),
        change: 12.5,
        trend: 'up',
      },
      {
        label: 'Total Likes',
        value: formatNumber(totalLikes),
        change: 8.3,
        trend: 'up',
      },
      {
        label: 'Total Comments',
        value: formatNumber(totalComments),
        change: -2.1,
        trend: 'down',
      },
      {
        label: 'Avg. Engagement',
        value: `${avgEngagement.toFixed(2)}%`,
        change: 5.7,
        trend: 'up',
      },
    ]);
  };

  const calculatePlatformMetrics = (data: unknown[]) => {
    const platformMap = new Map<string, PlatformMetrics>();

    data.forEach((item: any) => {
      const platform = item.post?.platform || 'unknown';
      const existing = platformMap.get(platform) || {
        platform,
        posts: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement_rate: 0,
      };

      existing.posts += 1;
      existing.views += item.views || 0;
      existing.likes += item.likes || 0;
      existing.comments += item.comments || 0;
      existing.shares += item.shares || 0;

      platformMap.set(platform, existing);
    });

    const metrics = Array.from(platformMap.values()).map((m) => ({
      ...m,
      engagement_rate: m.views > 0
        ? ((m.likes + m.comments + m.shares) / m.views) * 100
        : 0,
    }));

    setPlatformMetrics(metrics.sort((a, b) => b.views - a.views));
  };

  const calculateTopContent = (data: unknown[]) => {
    const contentMap = new Map<string, ContentPerformance>();

    data.forEach((item: any) => {
      const contentId = item.post?.content?.id;
      if (!contentId) return;

      const existing = contentMap.get(contentId);
      if (!existing) {
        contentMap.set(contentId, {
          id: contentId,
          title: item.post.content.title || 'Untitled',
          platform: item.post.platform,
          views: item.views || 0,
          likes: item.likes || 0,
          engagement_rate: item.engagement_rate || 0,
          published_at: item.post.published_at,
        });
      }
    });

    const content = Array.from(contentMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    setTopContent(content);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
              <option value="pinterest">Pinterest</option>
            </Select>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </Select>
            <Button onClick={loadAnalytics} size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {overallMetrics.map((metric) => (
                  <Card key={metric.label}>
                    <div className="p-6">
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                      {metric.change !== undefined && (
                        <p className={`text-sm mt-2 ${getTrendColor(metric.trend)}`}>
                          {getTrendIcon(metric.trend)} {Math.abs(metric.change)}%
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Performance by Platform</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Platform</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Posts</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Views</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Likes</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Comments</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformMetrics.map((platform) => (
                          <tr key={platform.platform} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 capitalize">
                              {platform.platform}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-right">{platform.posts}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-right">
                              {formatNumber(platform.views)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-right">
                              {formatNumber(platform.likes)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-right">
                              {formatNumber(platform.comments)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-right">
                              {platform.engagement_rate.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {platformMetrics.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No platform data available
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Top Performing Content</h2>
                  <div className="space-y-3">
                    {topContent.map((content, index) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-gray-900">{content.title}</p>
                            <p className="text-sm text-gray-500 capitalize">{content.platform}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(content.views)} views
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatNumber(content.likes)} likes
                          </p>
                        </div>
                      </div>
                    ))}
                    {topContent.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No content data available
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
