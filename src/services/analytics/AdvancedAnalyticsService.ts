import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { viralScorePredictionService } from './ViralScorePredictionService';
import { postingTimeAnalyzer } from './PostingTimeAnalyzer';
import { audienceInsightsService } from './AudienceInsightsService';
import { competitorBenchmarkingService } from './CompetitorBenchmarkingService';
import { customReportService } from './CustomReportService';
import { alertService } from './AlertService';

export interface AnalyticsDashboard {
  summary: {
    totalPredictions: number;
    avgPredictionAccuracy: number;
    optimalTimesIdentified: number;
    activeAlerts: number;
    customReports: number;
    competitorsTracked: number;
  };
  recentPredictions: any[];
  topPerformingTimes: any[];
  audienceSummary: any;
  competitorSummary: any;
  recentAlerts: any[];
}

export interface AnalyticsInsights {
  predictions: {
    topPredictions: any[];
    accuracyTrend: any[];
  };
  timing: {
    bestTimes: any[];
    engagementPatterns: any;
  };
  audience: {
    demographics: any;
    interests: any[];
    growth: any[];
  };
  competitors: {
    topCompetitors: any[];
    benchmarks: any;
  };
  alerts: {
    active: any[];
    recentTriggers: any[];
  };
}

export interface PredictiveAnalytics {
  viralPrediction: any;
  optimalPostingTime: any;
  audienceGrowthForecast: any;
  engagementForecast: any;
}

/**
 * AdvancedAnalyticsService
 * 
 * Main orchestrator for all advanced analytics features.
 * Provides unified API and coordinates multiple analytics services.
 */
class AdvancedAnalyticsService {
  private static instance: AdvancedAnalyticsService;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AdvancedAnalyticsService {
    if (!AdvancedAnalyticsService.instance) {
      AdvancedAnalyticsService.instance = new AdvancedAnalyticsService();
    }
    return AdvancedAnalyticsService.instance;
  }

  /**
   * Get comprehensive analytics dashboard
   */
  async getDashboard(workspaceId: string, platform?: string): Promise<AnalyticsDashboard> {
    try {
      logger.info('Generating analytics dashboard', { workspaceId, platform });

      const cacheKey = `dashboard:${workspaceId}:${platform || 'all'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Fetch data from all services in parallel
      const [
        predictions,
        optimalTimes,
        audienceReport,
        competitors,
        alertSummary,
        reports,
      ] = await Promise.all([
        viralScorePredictionService.getPredictions(workspaceId, { limit: 10, platform }),
        postingTimeAnalyzer.getOptimalTimes(workspaceId, platform),
        this.getAudienceSummary(workspaceId, platform),
        competitorBenchmarkingService.getCompetitors(workspaceId, platform),
        alertService.getAlertSummary(workspaceId),
        customReportService.getReports(workspaceId, { isActive: true }),
      ]);

      // Calculate accuracy metrics
      const accuracyMetrics = await viralScorePredictionService.getAccuracyMetrics(workspaceId);

      const dashboard: AnalyticsDashboard = {
        summary: {
          totalPredictions: accuracyMetrics.totalPredictions,
          avgPredictionAccuracy: accuracyMetrics.averageAccuracy,
          optimalTimesIdentified: optimalTimes.length,
          activeAlerts: alertSummary.activeAlerts,
          customReports: reports.length,
          competitorsTracked: competitors.length,
        },
        recentPredictions: predictions.slice(0, 5),
        topPerformingTimes: optimalTimes.slice(0, 5),
        audienceSummary: audienceReport,
        competitorSummary: {
          total: competitors.length,
          platforms: this.groupByPlatform(competitors),
        },
        recentAlerts: alertSummary.recentNotifications.slice(0, 5),
      };

      this.setCache(cacheKey, dashboard);
      return dashboard;
    } catch (error) {
      logger.error('Failed to generate dashboard', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to generate dashboard', 'DASHBOARD_FAILED');
    }
  }

  /**
   * Get comprehensive analytics insights
   */
  async getInsights(
    workspaceId: string,
    connectorId: string,
    platform: string
  ): Promise<AnalyticsInsights> {
    try {
      logger.info('Generating analytics insights', { workspaceId, connectorId, platform });

      const cacheKey = `insights:${workspaceId}:${connectorId}:${platform}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Fetch insights from all services
      const [
        predictions,
        accuracyMetrics,
        engagementPatterns,
        audienceReport,
        competitorInsights,
        benchmarkReport,
        activeAlerts,
        recentNotifications,
      ] = await Promise.all([
        viralScorePredictionService.getPredictions(workspaceId, { platform, limit: 10 }),
        viralScorePredictionService.getAccuracyMetrics(workspaceId),
        postingTimeAnalyzer.getEngagementPatterns(workspaceId, platform),
        audienceInsightsService.getAudienceReport(workspaceId, connectorId, platform),
        competitorBenchmarkingService.getCompetitorInsights(workspaceId, platform),
        this.getBenchmarkReport(workspaceId, connectorId, platform),
        alertService.getAlerts(workspaceId, { isActive: true, platform }),
        alertService.getNotifications(workspaceId, { status: 'active', limit: 10 }),
      ]);

      const insights: AnalyticsInsights = {
        predictions: {
          topPredictions: predictions.slice(0, 5),
          accuracyTrend: this.formatAccuracyTrend(accuracyMetrics),
        },
        timing: {
          bestTimes: engagementPatterns.peakHours.map((hour) => ({
            hour,
            engagement: engagementPatterns.avgEngagementByHour[hour] || 0,
          })),
          engagementPatterns,
        },
        audience: {
          demographics: audienceReport.demographics,
          interests: audienceReport.interests.slice(0, 10),
          growth: audienceReport.growth.slice(-30), // Last 30 days
        },
        competitors: {
          topCompetitors: competitorInsights.slice(0, 5),
          benchmarks: benchmarkReport,
        },
        alerts: {
          active: activeAlerts,
          recentTriggers: recentNotifications,
        },
      };

      this.setCache(cacheKey, insights);
      return insights;
    } catch (error) {
      logger.error('Failed to generate insights', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to generate insights', 'INSIGHTS_FAILED');
    }
  }

  /**
   * Get predictive analytics for content
   */
  async getPredictiveAnalytics(
    workspaceId: string,
    connectorId: string,
    platform: string,
    contentData?: any
  ): Promise<PredictiveAnalytics> {
    try {
      logger.info('Generating predictive analytics', { workspaceId, platform });

      // Generate viral score prediction
      const viralPrediction = contentData
        ? await viralScorePredictionService.generatePrediction({
            workspaceId,
            contentId: contentData.id,
            platform,
            contentData,
          })
        : null;

      // Get optimal posting time
      const postingSchedule = await postingTimeAnalyzer.analyzeOptimalTimes(
        workspaceId,
        platform,
        'UTC',
        30
      );

      // Get audience growth opportunities
      const growthOpportunities = await audienceInsightsService.identifyGrowthOpportunities(
        workspaceId,
        connectorId,
        platform
      );

      // Calculate engagement forecast (simplified)
      const engagementForecast = this.calculateEngagementForecast(
        viralPrediction,
        postingSchedule
      );

      return {
        viralPrediction: viralPrediction
          ? {
              score: viralPrediction.prediction.predicted_score,
              confidence: viralPrediction.prediction.confidence_score,
              factors: viralPrediction.factors,
              recommendations: viralPrediction.recommendations,
            }
          : null,
        optimalPostingTime: {
          bestTimes: postingSchedule.recommendations.slice(0, 3),
          timezone: postingSchedule.timezone,
        },
        audienceGrowthForecast: {
          opportunities: growthOpportunities.slice(0, 5),
          estimatedGrowth: this.calculateEstimatedGrowth(growthOpportunities),
        },
        engagementForecast,
      };
    } catch (error) {
      logger.error('Failed to generate predictive analytics', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to generate predictions', 'PREDICTION_FAILED');
    }
  }

  /**
   * Analyze content before publishing
   */
  async analyzeContent(
    workspaceId: string,
    platform: string,
    contentData: {
      title?: string;
      description?: string;
      hashtags?: string[];
      mediaType?: string;
      scheduledTime?: Date;
    }
  ): Promise<{
    viralScore: any;
    timingScore: any;
    recommendations: string[];
    overallScore: number;
  }> {
    try {
      logger.info('Analyzing content', { workspaceId, platform });

      // Generate viral prediction
      const prediction = await viralScorePredictionService.generatePrediction({
        workspaceId,
        platform,
        contentData,
      });

      // Analyze timing if scheduled time is provided
      let timingScore = null;
      if (contentData.scheduledTime) {
        const optimalTimes = await postingTimeAnalyzer.getOptimalTimes(workspaceId, platform);
        timingScore = this.calculateTimingScore(contentData.scheduledTime, optimalTimes);
      }

      // Combine recommendations
      const recommendations = [...prediction.recommendations];

      if (timingScore && timingScore.score < 70) {
        recommendations.push('Consider posting at a more optimal time for better engagement');
      }

      // Calculate overall score
      const overallScore = this.calculateOverallScore(
        prediction.prediction.predicted_score,
        prediction.prediction.confidence_score,
        timingScore?.score
      );

      return {
        viralScore: {
          score: prediction.prediction.predicted_score,
          confidence: prediction.prediction.confidence_score,
          factors: prediction.factors,
        },
        timingScore,
        recommendations,
        overallScore,
      };
    } catch (error) {
      logger.error('Failed to analyze content', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to analyze', 'ANALYSIS_FAILED');
    }
  }

  /**
   * Generate comprehensive report
   */
  async generateComprehensiveReport(
    workspaceId: string,
    connectorId: string,
    platform: string,
    periodDays: number = 30
  ): Promise<{
    report: any;
    exportUrl?: string;
  }> {
    try {
      logger.info('Generating comprehensive report', { workspaceId, platform, periodDays });

      // Create custom report configuration
      const reportConfig = {
        name: `Comprehensive Analytics Report - ${platform}`,
        description: `${periodDays}-day analytics report for ${platform}`,
        reportType: 'comprehensive',
        metrics: ['views', 'likes', 'comments', 'shares', 'engagement_rate'],
        dimensions: ['date', 'platform'],
        filters: {
          workspace_id: workspaceId,
          platform,
          startDate: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
        chartConfigs: {
          engagement_trend: {
            type: 'line',
            xAxis: 'date',
            yAxis: 'engagement_rate',
          },
        },
      };

      // Create report
      const report = await customReportService.createReport(
        workspaceId,
        workspaceId, // Using workspaceId as userId for now
        reportConfig
      );

      // Execute report
      const reportData = await customReportService.executeReport(report.id);

      // Export to JSON
      const exportResult = await customReportService.exportReport(report.id, 'json', true);

      return {
        report: reportData,
        exportUrl: exportResult.url,
      };
    } catch (error) {
      logger.error('Failed to generate comprehensive report', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to generate report', 'REPORT_FAILED');
    }
  }

  /**
   * Setup default alerts for workspace
   */
  async setupDefaultAlerts(
    workspaceId: string,
    userId: string,
    platform: string,
    connectorId: string
  ): Promise<void> {
    try {
      logger.info('Setting up default alerts', { workspaceId, platform });

      const defaultAlerts = [
        {
          name: 'Low Engagement Alert',
          description: 'Triggers when engagement rate drops below 2%',
          alertType: 'engagement',
          metric: 'engagement_rate',
          operator: 'less_than' as const,
          thresholdValue: 2.0,
          platform,
          connectorId,
          notificationChannels: ['in_app', 'email'] as const,
          notificationRecipients: [userId],
          severity: 'warning' as const,
        },
        {
          name: 'High Performance Alert',
          description: 'Triggers when a post exceeds 10,000 views',
          alertType: 'performance',
          metric: 'views',
          operator: 'greater_than' as const,
          thresholdValue: 10000,
          platform,
          connectorId,
          notificationChannels: ['in_app'] as const,
          notificationRecipients: [userId],
          severity: 'info' as const,
        },
        {
          name: 'Follower Drop Alert',
          description: 'Triggers when follower count decreases by more than 100',
          alertType: 'growth',
          metric: 'follower_count',
          operator: 'decreases_by' as const,
          thresholdValue: 100,
          platform,
          connectorId,
          notificationChannels: ['in_app', 'email'] as const,
          notificationRecipients: [userId],
          severity: 'critical' as const,
        },
      ];

      for (const alertConfig of defaultAlerts) {
        await alertService.createAlert(workspaceId, userId, alertConfig);
      }

      logger.info('Default alerts created', { workspaceId, count: defaultAlerts.length });
    } catch (error) {
      logger.error('Failed to setup default alerts', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to setup alerts', 'SETUP_FAILED');
    }
  }

  /**
   * Clear cache for workspace
   */
  clearCache(workspaceId: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.includes(workspaceId)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));

    logger.info('Cache cleared', { workspaceId, keysCleared: keysToDelete.length });
  }

  /**
   * Get cached data
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get audience summary
   */
  private async getAudienceSummary(workspaceId: string, platform?: string): Promise<any> {
    // Simplified audience summary
    return {
      totalFollowers: 0,
      totalReach: 0,
      engagementRate: 0,
      growthRate: 0,
    };
  }

  /**
   * Get benchmark report
   */
  private async getBenchmarkReport(
    workspaceId: string,
    connectorId: string,
    platform: string
  ): Promise<any> {
    try {
      // Try to generate benchmark, fallback to empty if no data
      return await competitorBenchmarkingService.generateBenchmark(
        workspaceId,
        connectorId,
        platform,
        {
          followerCount: 0,
          engagementRate: 0,
          postsPerWeek: 0,
          avgLikes: 0,
          avgComments: 0,
        }
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Group competitors by platform
   */
  private groupByPlatform(competitors: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    competitors.forEach((competitor) => {
      grouped[competitor.platform] = (grouped[competitor.platform] || 0) + 1;
    });

    return grouped;
  }

  /**
   * Format accuracy trend
   */
  private formatAccuracyTrend(metrics: any): any[] {
    return [
      { period: 'Last 7 days', accuracy: metrics.modelPerformance.byTimeRange.last_7_days || 0 },
      { period: 'Last 30 days', accuracy: metrics.modelPerformance.byTimeRange.last_30_days || 0 },
    ];
  }

  /**
   * Calculate engagement forecast
   */
  private calculateEngagementForecast(viralPrediction: any, postingSchedule: any): any {
    if (!viralPrediction) {
      return {
        expectedViews: 0,
        expectedEngagement: 0,
        confidence: 0,
      };
    }

    const baseViews = viralPrediction.prediction.predicted_score * 100;
    const timingBoost = postingSchedule.recommendations[0]?.avgEngagementRate || 1;

    return {
      expectedViews: Math.round(baseViews * (1 + timingBoost / 100)),
      expectedEngagement: viralPrediction.prediction.predicted_score,
      confidence: viralPrediction.prediction.confidence_score,
    };
  }

  /**
   * Calculate estimated growth
   */
  private calculateEstimatedGrowth(opportunities: any[]): number {
    return opportunities.reduce((sum, opp) => sum + opp.estimatedReach, 0);
  }

  /**
   * Calculate timing score
   */
  private calculateTimingScore(scheduledTime: Date, optimalTimes: any[]): any {
    const hour = scheduledTime.getHours();
    const day = scheduledTime.getDay();

    const matchingTime = optimalTimes.find(
      (t) => t.hour_of_day === hour && t.day_of_week === day
    );

    return matchingTime
      ? {
          score: matchingTime.optimization_score,
          isOptimal: matchingTime.rank_in_week <= 5,
          expectedEngagement: matchingTime.avg_engagement_rate,
        }
      : {
          score: 50,
          isOptimal: false,
          expectedEngagement: 0,
        };
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    viralScore: number,
    confidence: number,
    timingScore?: number
  ): number {
    const weights = {
      viral: 0.5,
      confidence: 0.25,
      timing: 0.25,
    };

    let score = viralScore * weights.viral + confidence * weights.confidence;

    if (timingScore) {
      score += timingScore * weights.timing;
    } else {
      // Redistribute timing weight if not available
      score += viralScore * weights.timing;
    }

    return Math.min(100, Math.max(0, score));
  }
}

export const advancedAnalyticsService = AdvancedAnalyticsService.getInstance();
