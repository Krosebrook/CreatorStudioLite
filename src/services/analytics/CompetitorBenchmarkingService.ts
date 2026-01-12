import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import type {
  CompetitorProfile,
  CompetitorMetrics,
  BenchmarkComparison,
  Database,
} from '../../types/analytics-database.types';

export interface CompetitorInsight {
  competitorName: string;
  platform: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  performanceGap: number;
  recommendations: string[];
}

export interface BenchmarkReport {
  userMetrics: {
    followerCount: number;
    engagementRate: number;
    postsPerWeek: number;
    avgLikes: number;
    avgComments: number;
  };
  industryAverage: {
    followerCount: number;
    engagementRate: number;
    postsPerWeek: number;
  };
  competitorAverage: {
    followerCount: number;
    engagementRate: number;
    postsPerWeek: number;
  };
  percentiles: {
    engagement: number;
    growth: number;
    consistency: number;
  };
  performanceScore: number;
  gaps: string[];
  opportunities: string[];
}

export interface CompetitorComparison {
  competitor: CompetitorProfile;
  latestMetrics: CompetitorMetrics | null;
  comparison: {
    followerGap: number;
    engagementGap: number;
    postingFrequencyGap: number;
    qualityGap: number;
  };
  insights: string[];
}

/**
 * CompetitorBenchmarkingService
 * 
 * Tracks competitor performance and provides competitive analysis.
 * Helps users understand their position relative to competitors and industry.
 */
class CompetitorBenchmarkingService {
  private static instance: CompetitorBenchmarkingService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): CompetitorBenchmarkingService {
    if (!CompetitorBenchmarkingService.instance) {
      CompetitorBenchmarkingService.instance = new CompetitorBenchmarkingService();
    }
    return CompetitorBenchmarkingService.instance;
  }

  /**
   * Add competitor to track
   */
  async addCompetitor(
    workspaceId: string,
    userId: string,
    data: {
      name: string;
      platform: string;
      handle: string;
      profileUrl?: string;
      category?: string;
    }
  ): Promise<CompetitorProfile> {
    try {
      logger.info('Adding competitor', { workspaceId, name: data.name, platform: data.platform });

      const profileData: Database['public']['Tables']['competitor_profiles']['Insert'] = {
        workspace_id: workspaceId,
        competitor_name: data.name,
        platform: data.platform,
        platform_handle: data.handle,
        profile_url: data.profileUrl || null,
        category: data.category || null,
        follower_count: 0,
        following_count: 0,
        post_count: 0,
        is_active: true,
        is_verified: false,
        added_by: userId,
        metadata: {},
      };

      const { data: competitor, error } = await supabase
        .from('competitor_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error || !competitor) {
        throw new AppError('Failed to add competitor', 'ADD_FAILED');
      }

      return competitor;
    } catch (error) {
      logger.error('Failed to add competitor', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to add competitor', 'ADD_FAILED');
    }
  }

  /**
   * Update competitor metrics
   */
  async updateCompetitorMetrics(
    workspaceId: string,
    competitorId: string,
    metrics: {
      followerCount: number;
      followerChange: number;
      followingCount: number;
      postCount: number;
      postsPerWeek: number;
      avgLikes: number;
      avgComments: number;
      avgShares: number;
      avgViews: number;
      avgEngagementRate: number;
      topPostUrl?: string;
      topPostEngagement?: number;
      recordedDate: Date;
    }
  ): Promise<CompetitorMetrics> {
    try {
      logger.info('Updating competitor metrics', { workspaceId, competitorId });

      // Calculate quality scores
      const engagementQualityScore = this.calculateEngagementQuality(metrics);
      const contentConsistencyScore = this.calculateConsistencyScore(metrics);

      const metricsData: Database['public']['Tables']['competitor_metrics']['Insert'] = {
        workspace_id: workspaceId,
        competitor_id: competitorId,
        follower_count: metrics.followerCount,
        follower_change: metrics.followerChange,
        following_count: metrics.followingCount,
        post_count: metrics.postCount,
        posts_per_week: metrics.postsPerWeek,
        avg_likes: metrics.avgLikes,
        avg_comments: metrics.avgComments,
        avg_shares: metrics.avgShares,
        avg_views: metrics.avgViews,
        avg_engagement_rate: metrics.avgEngagementRate,
        engagement_quality_score: engagementQualityScore,
        content_consistency_score: contentConsistencyScore,
        top_post_url: metrics.topPostUrl || null,
        top_post_engagement: metrics.topPostEngagement || 0,
        recorded_date: metrics.recordedDate.toISOString(),
        metadata: {},
      };

      const { data: competitorMetrics, error } = await supabase
        .from('competitor_metrics')
        .insert(metricsData)
        .select()
        .single();

      if (error || !competitorMetrics) {
        throw new AppError('Failed to update metrics', 'UPDATE_FAILED');
      }

      // Update competitor profile with latest counts
      await supabase
        .from('competitor_profiles')
        .update({
          follower_count: metrics.followerCount,
          following_count: metrics.followingCount,
          post_count: metrics.postCount,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', competitorId);

      return competitorMetrics;
    } catch (error) {
      logger.error('Failed to update competitor metrics', { error, competitorId });
      throw error instanceof AppError ? error : new AppError('Failed to update', 'UPDATE_FAILED');
    }
  }

  /**
   * Generate benchmark comparison
   */
  async generateBenchmark(
    workspaceId: string,
    connectorId: string,
    platform: string,
    userMetrics: {
      followerCount: number;
      engagementRate: number;
      postsPerWeek: number;
      avgLikes: number;
      avgComments: number;
    }
  ): Promise<BenchmarkReport> {
    try {
      logger.info('Generating benchmark comparison', { workspaceId, platform });

      // Get competitor metrics
      const competitorStats = await this.getCompetitorStats(workspaceId, platform);

      // Calculate industry benchmarks
      const industryBenchmarks = this.calculateIndustryBenchmarks(platform);

      // Calculate percentiles
      const percentiles = this.calculatePercentiles(
        userMetrics,
        competitorStats,
        industryBenchmarks
      );

      // Calculate overall performance score
      const performanceScore = this.calculatePerformanceScore(percentiles);

      // Store benchmark comparison
      await this.storeBenchmarkComparison(
        workspaceId,
        connectorId,
        platform,
        userMetrics,
        competitorStats,
        industryBenchmarks,
        percentiles,
        performanceScore
      );

      // Identify gaps and opportunities
      const gaps = this.identifyGaps(userMetrics, competitorStats, industryBenchmarks);
      const opportunities = this.identifyOpportunities(userMetrics, competitorStats, percentiles);

      return {
        userMetrics,
        industryAverage: industryBenchmarks,
        competitorAverage: competitorStats,
        percentiles,
        performanceScore,
        gaps,
        opportunities,
      };
    } catch (error) {
      logger.error('Failed to generate benchmark', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to generate benchmark', 'BENCHMARK_FAILED');
    }
  }

  /**
   * Compare with specific competitor
   */
  async compareWithCompetitor(
    workspaceId: string,
    competitorId: string
  ): Promise<CompetitorComparison> {
    try {
      logger.info('Comparing with competitor', { workspaceId, competitorId });

      // Get competitor profile
      const { data: competitor, error: profileError } = await supabase
        .from('competitor_profiles')
        .select('*')
        .eq('id', competitorId)
        .single();

      if (profileError || !competitor) {
        throw new AppError('Competitor not found', 'NOT_FOUND');
      }

      // Get latest metrics
      const { data: latestMetrics } = await supabase
        .from('competitor_metrics')
        .select('*')
        .eq('competitor_id', competitorId)
        .order('recorded_date', { ascending: false })
        .limit(1)
        .single();

      // Get user's metrics from latest benchmark
      const { data: userBenchmark } = await supabase
        .from('benchmark_comparisons')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('platform', competitor.platform)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate comparison gaps
      const comparison = this.calculateComparisonGaps(userBenchmark, latestMetrics);

      // Generate insights
      const insights = this.generateCompetitorInsights(competitor, latestMetrics, comparison);

      return {
        competitor,
        latestMetrics,
        comparison,
        insights,
      };
    } catch (error) {
      logger.error('Failed to compare with competitor', { error, competitorId });
      throw error instanceof AppError ? error : new AppError('Failed to compare', 'COMPARE_FAILED');
    }
  }

  /**
   * Get competitor insights
   */
  async getCompetitorInsights(
    workspaceId: string,
    platform: string
  ): Promise<CompetitorInsight[]> {
    try {
      logger.info('Getting competitor insights', { workspaceId, platform });

      const { data: competitors } = await supabase
        .from('competitor_profiles')
        .select(`
          *,
          metrics:competitor_metrics(*)
        `)
        .eq('workspace_id', workspaceId)
        .eq('platform', platform)
        .eq('is_active', true);

      if (!competitors || competitors.length === 0) {
        return [];
      }

      const insights: CompetitorInsight[] = [];

      for (const competitor of competitors) {
        const latestMetrics = competitor.metrics?.[0];
        if (!latestMetrics) continue;

        const insight = await this.analyzeCompetitor(competitor, latestMetrics);
        insights.push(insight);
      }

      return insights.sort((a, b) => b.performanceGap - a.performanceGap);
    } catch (error) {
      logger.error('Failed to get competitor insights', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get insights', 'INSIGHTS_FAILED');
    }
  }

  /**
   * Get competitor list
   */
  async getCompetitors(
    workspaceId: string,
    platform?: string
  ): Promise<CompetitorProfile[]> {
    try {
      let query = supabase
        .from('competitor_profiles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch competitors', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get competitors', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get competitors', 'FETCH_FAILED');
    }
  }

  /**
   * Remove competitor
   */
  async removeCompetitor(competitorId: string): Promise<void> {
    try {
      logger.info('Removing competitor', { competitorId });

      const { error } = await supabase
        .from('competitor_profiles')
        .update({ is_active: false })
        .eq('id', competitorId);

      if (error) {
        throw new AppError('Failed to remove competitor', 'REMOVE_FAILED');
      }
    } catch (error) {
      logger.error('Failed to remove competitor', { error, competitorId });
      throw error instanceof AppError ? error : new AppError('Failed to remove', 'REMOVE_FAILED');
    }
  }

  /**
   * Calculate engagement quality score
   */
  private calculateEngagementQuality(metrics: {
    avgEngagementRate: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
  }): number {
    const engagementScore = Math.min(100, metrics.avgEngagementRate * 10);
    const interactionScore = Math.min(100, ((metrics.avgLikes + metrics.avgComments + metrics.avgShares) / 100) * 10);

    return (engagementScore * 0.6 + interactionScore * 0.4);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(metrics: {
    postsPerWeek: number;
    avgEngagementRate: number;
  }): number {
    // Ideal posting frequency is 4-7 posts per week
    const frequencyScore = metrics.postsPerWeek >= 4 && metrics.postsPerWeek <= 7
      ? 100
      : Math.max(0, 100 - Math.abs(5.5 - metrics.postsPerWeek) * 10);

    // Consistency based on engagement stability (simplified)
    const engagementScore = Math.min(100, metrics.avgEngagementRate * 20);

    return (frequencyScore * 0.5 + engagementScore * 0.5);
  }

  /**
   * Get competitor statistics
   */
  private async getCompetitorStats(
    workspaceId: string,
    platform: string
  ): Promise<{
    followerCount: number;
    engagementRate: number;
    postsPerWeek: number;
  }> {
    const { data } = await supabase
      .from('competitor_benchmark_summary')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform);

    if (!data || data.length === 0) {
      return {
        followerCount: 0,
        engagementRate: 0,
        postsPerWeek: 0,
      };
    }

    const avgFollowers = data.reduce((sum, c) => sum + c.current_follower_count, 0) / data.length;
    const avgEngagement = data.reduce((sum, c) => sum + c.avg_engagement_rate, 0) / data.length;
    const avgPosts = data.reduce((sum, c) => sum + c.posts_per_week, 0) / data.length;

    return {
      followerCount: avgFollowers,
      engagementRate: avgEngagement,
      postsPerWeek: avgPosts,
    };
  }

  /**
   * Calculate industry benchmarks (simplified - could be platform-specific)
   */
  private calculateIndustryBenchmarks(platform: string): {
    followerCount: number;
    engagementRate: number;
    postsPerWeek: number;
  } {
    const benchmarks: Record<string, any> = {
      instagram: { followerCount: 10000, engagementRate: 3.5, postsPerWeek: 4 },
      tiktok: { followerCount: 50000, engagementRate: 5.0, postsPerWeek: 7 },
      youtube: { followerCount: 5000, engagementRate: 4.0, postsPerWeek: 2 },
      twitter: { followerCount: 5000, engagementRate: 2.0, postsPerWeek: 10 },
      facebook: { followerCount: 10000, engagementRate: 2.5, postsPerWeek: 3 },
    };

    return benchmarks[platform] || { followerCount: 10000, engagementRate: 3.0, postsPerWeek: 5 };
  }

  /**
   * Calculate percentiles
   */
  private calculatePercentiles(
    userMetrics: any,
    competitorAvg: any,
    industryAvg: any
  ): {
    engagement: number;
    growth: number;
    consistency: number;
  } {
    const engagementPercentile = this.calculatePercentile(
      userMetrics.engagementRate,
      [competitorAvg.engagementRate, industryAvg.engagementRate]
    );

    const growthPercentile = this.calculatePercentile(
      userMetrics.followerCount,
      [competitorAvg.followerCount, industryAvg.followerCount]
    );

    const consistencyPercentile = this.calculatePercentile(
      userMetrics.postsPerWeek,
      [competitorAvg.postsPerWeek, industryAvg.postsPerWeek]
    );

    return {
      engagement: engagementPercentile,
      growth: growthPercentile,
      consistency: consistencyPercentile,
    };
  }

  /**
   * Calculate single percentile
   */
  private calculatePercentile(value: number, references: number[]): number {
    const allValues = [...references, value].sort((a, b) => a - b);
    const index = allValues.indexOf(value);
    return Math.round((index / (allValues.length - 1)) * 100);
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(percentiles: {
    engagement: number;
    growth: number;
    consistency: number;
  }): number {
    return Math.round(
      percentiles.engagement * 0.4 +
      percentiles.growth * 0.35 +
      percentiles.consistency * 0.25
    );
  }

  /**
   * Store benchmark comparison
   */
  private async storeBenchmarkComparison(
    workspaceId: string,
    connectorId: string,
    platform: string,
    userMetrics: any,
    competitorStats: any,
    industryBenchmarks: any,
    percentiles: any,
    performanceScore: number
  ): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const benchmarkData: Database['public']['Tables']['benchmark_comparisons']['Insert'] = {
      workspace_id: workspaceId,
      connector_id: connectorId,
      platform,
      user_follower_count: userMetrics.followerCount,
      user_engagement_rate: userMetrics.engagementRate,
      user_posts_per_week: userMetrics.postsPerWeek,
      user_avg_likes: userMetrics.avgLikes,
      user_avg_comments: userMetrics.avgComments,
      industry_avg_follower_count: industryBenchmarks.followerCount,
      industry_avg_engagement_rate: industryBenchmarks.engagementRate,
      industry_avg_posts_per_week: industryBenchmarks.postsPerWeek,
      competitor_avg_follower_count: competitorStats.followerCount,
      competitor_avg_engagement_rate: competitorStats.engagementRate,
      competitor_avg_posts_per_week: competitorStats.postsPerWeek,
      engagement_percentile: percentiles.engagement,
      growth_percentile: percentiles.growth,
      consistency_percentile: percentiles.consistency,
      overall_performance_score: performanceScore,
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      metadata: {},
    };

    await supabase.from('benchmark_comparisons').insert(benchmarkData);
  }

  /**
   * Identify performance gaps
   */
  private identifyGaps(userMetrics: any, competitorStats: any, industryAvg: any): string[] {
    const gaps: string[] = [];

    if (userMetrics.followerCount < industryAvg.followerCount * 0.5) {
      gaps.push('Follower count significantly below industry average');
    }

    if (userMetrics.engagementRate < competitorStats.engagementRate * 0.7) {
      gaps.push('Engagement rate lagging behind competitors');
    }

    if (userMetrics.postsPerWeek < industryAvg.postsPerWeek * 0.6) {
      gaps.push('Posting frequency below recommended levels');
    }

    return gaps;
  }

  /**
   * Identify opportunities
   */
  private identifyOpportunities(userMetrics: any, competitorStats: any, percentiles: any): string[] {
    const opportunities: string[] = [];

    if (percentiles.engagement < 50) {
      opportunities.push('Improve content quality to boost engagement rates');
    }

    if (userMetrics.postsPerWeek < competitorStats.postsPerWeek) {
      opportunities.push(`Increase posting frequency to match competitors (${competitorStats.postsPerWeek.toFixed(1)} posts/week)`);
    }

    if (percentiles.growth < 40) {
      opportunities.push('Invest in growth strategies like collaborations and paid promotion');
    }

    return opportunities;
  }

  /**
   * Calculate comparison gaps
   */
  private calculateComparisonGaps(userBenchmark: any, competitorMetrics: any): {
    followerGap: number;
    engagementGap: number;
    postingFrequencyGap: number;
    qualityGap: number;
  } {
    if (!userBenchmark || !competitorMetrics) {
      return {
        followerGap: 0,
        engagementGap: 0,
        postingFrequencyGap: 0,
        qualityGap: 0,
      };
    }

    return {
      followerGap: competitorMetrics.follower_count - userBenchmark.user_follower_count,
      engagementGap: competitorMetrics.avg_engagement_rate - userBenchmark.user_engagement_rate,
      postingFrequencyGap: competitorMetrics.posts_per_week - userBenchmark.user_posts_per_week,
      qualityGap: competitorMetrics.engagement_quality_score - 50, // Simplified
    };
  }

  /**
   * Generate competitor insights
   */
  private generateCompetitorInsights(
    competitor: CompetitorProfile,
    metrics: CompetitorMetrics | null,
    comparison: any
  ): string[] {
    const insights: string[] = [];

    if (!metrics) {
      insights.push('No recent metrics available for comparison');
      return insights;
    }

    if (comparison.followerGap > 1000) {
      insights.push(`${competitor.competitor_name} has ${comparison.followerGap.toLocaleString()} more followers`);
    }

    if (comparison.engagementGap > 1) {
      insights.push(`${competitor.competitor_name} achieves ${comparison.engagementGap.toFixed(2)}% higher engagement`);
    }

    if (comparison.postingFrequencyGap > 2) {
      insights.push(`${competitor.competitor_name} posts ${comparison.postingFrequencyGap.toFixed(1)} times more per week`);
    }

    if (metrics.engagement_quality_score > 80) {
      insights.push(`${competitor.competitor_name} maintains high-quality engagement`);
    }

    return insights;
  }

  /**
   * Analyze competitor
   */
  private async analyzeCompetitor(
    competitor: CompetitorProfile,
    metrics: CompetitorMetrics
  ): Promise<CompetitorInsight> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];

    // Analyze strengths
    if (metrics.avg_engagement_rate > 5) {
      strengths.push('High engagement rate');
    }
    if (metrics.posts_per_week >= 5) {
      strengths.push('Consistent posting schedule');
    }
    if (metrics.engagement_quality_score > 75) {
      strengths.push('Quality content engagement');
    }

    // Analyze weaknesses
    if (metrics.avg_engagement_rate < 2) {
      weaknesses.push('Low engagement rate');
    }
    if (metrics.posts_per_week < 2) {
      weaknesses.push('Infrequent posting');
    }

    // Identify opportunities
    if (metrics.follower_growth_rate > 0 && metrics.follower_growth_rate < 5) {
      opportunities.push('Moderate growth - potential to accelerate');
    }

    const performanceGap = metrics.follower_count;

    const recommendations = this.generateCompetitorRecommendations(strengths, weaknesses);

    return {
      competitorName: competitor.competitor_name,
      platform: competitor.platform,
      strengths,
      weaknesses,
      opportunities,
      performanceGap,
      recommendations,
    };
  }

  /**
   * Generate competitor-based recommendations
   */
  private generateCompetitorRecommendations(strengths: string[], weaknesses: string[]): string[] {
    const recommendations: string[] = [];

    if (strengths.includes('High engagement rate')) {
      recommendations.push('Study their content style and engagement tactics');
    }

    if (strengths.includes('Consistent posting schedule')) {
      recommendations.push('Match or exceed their posting frequency');
    }

    if (weaknesses.includes('Low engagement rate')) {
      recommendations.push('Opportunity to differentiate with better engagement');
    }

    return recommendations;
  }
}

export const competitorBenchmarkingService = CompetitorBenchmarkingService.getInstance();
