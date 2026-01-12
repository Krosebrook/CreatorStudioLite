import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import type {
  OptimalPostingTime,
  EngagementByTime,
  Database,
} from '../../types/analytics-database.types';

export interface TimeRecommendation {
  dayOfWeek: number;
  hourOfDay: number;
  timezone: string;
  score: number;
  confidence: number;
  avgEngagementRate: number;
  expectedViews: number;
  reasoning: string;
}

export interface PostingSchedule {
  platform: string;
  recommendations: TimeRecommendation[];
  timezone: string;
  bestDays: number[];
  bestHours: number[];
  worstTimes: { day: number; hour: number }[];
}

export interface EngagementPattern {
  platform: string;
  peakHours: number[];
  peakDays: number[];
  lowEngagementPeriods: { day: number; hour: number }[];
  avgEngagementByHour: Record<number, number>;
  avgEngagementByDay: Record<number, number>;
}

/**
 * PostingTimeAnalyzer
 * 
 * Analyzes engagement patterns by time to determine optimal posting times.
 * Considers timezone, audience behavior, and historical performance.
 */
class PostingTimeAnalyzer {
  private static instance: PostingTimeAnalyzer;
  private readonly MIN_SAMPLE_SIZE = 10;
  private readonly CONFIDENCE_THRESHOLD = 70;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): PostingTimeAnalyzer {
    if (!PostingTimeAnalyzer.instance) {
      PostingTimeAnalyzer.instance = new PostingTimeAnalyzer();
    }
    return PostingTimeAnalyzer.instance;
  }

  /**
   * Analyze and calculate optimal posting times
   */
  async analyzeOptimalTimes(
    workspaceId: string,
    platform: string,
    timezone: string = 'UTC',
    periodDays: number = 30
  ): Promise<PostingSchedule> {
    try {
      logger.info('Analyzing optimal posting times', { workspaceId, platform, timezone });

      // Get engagement data
      const engagementData = await this.getEngagementData(workspaceId, platform, periodDays);

      if (engagementData.length < this.MIN_SAMPLE_SIZE) {
        throw new AppError(
          `Insufficient data: Need at least ${this.MIN_SAMPLE_SIZE} posts for analysis`,
          'INSUFFICIENT_DATA'
        );
      }

      // Calculate optimal times
      const optimalTimes = this.calculateOptimalTimes(engagementData, timezone);

      // Store or update optimal posting times
      await this.storeOptimalTimes(workspaceId, platform, optimalTimes, periodDays);

      // Generate recommendations
      const recommendations = this.generateRecommendations(optimalTimes);

      // Identify best and worst times
      const bestDays = this.getBestDays(optimalTimes);
      const bestHours = this.getBestHours(optimalTimes);
      const worstTimes = this.getWorstTimes(optimalTimes);

      return {
        platform,
        recommendations,
        timezone,
        bestDays,
        bestHours,
        worstTimes,
      };
    } catch (error) {
      logger.error('Failed to analyze optimal posting times', { error, workspaceId, platform });
      throw error instanceof AppError ? error : new AppError('Failed to analyze times', 'ANALYSIS_FAILED');
    }
  }

  /**
   * Get engagement patterns for a platform
   */
  async getEngagementPatterns(
    workspaceId: string,
    platform: string,
    periodDays: number = 30
  ): Promise<EngagementPattern> {
    try {
      logger.info('Getting engagement patterns', { workspaceId, platform });

      // Get hourly summary
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('engagement_summary_by_hour')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('platform', platform);

      if (hourlyError) {
        throw new AppError('Failed to fetch hourly data', 'FETCH_FAILED');
      }

      // Get daily summary
      const { data: dailyData, error: dailyError } = await supabase
        .from('engagement_summary_by_day')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('platform', platform);

      if (dailyError) {
        throw new AppError('Failed to fetch daily data', 'FETCH_FAILED');
      }

      // Process patterns
      const avgEngagementByHour = this.processHourlyEngagement(hourlyData || []);
      const avgEngagementByDay = this.processDailyEngagement(dailyData || []);

      // Identify peaks
      const peakHours = this.identifyPeakHours(avgEngagementByHour);
      const peakDays = this.identifyPeakDays(avgEngagementByDay);

      // Identify low periods
      const lowEngagementPeriods = this.identifyLowPeriods(avgEngagementByHour, avgEngagementByDay);

      return {
        platform,
        peakHours,
        peakDays,
        lowEngagementPeriods,
        avgEngagementByHour,
        avgEngagementByDay,
      };
    } catch (error) {
      logger.error('Failed to get engagement patterns', { error, workspaceId, platform });
      throw error instanceof AppError ? error : new AppError('Failed to get patterns', 'PATTERNS_FAILED');
    }
  }

  /**
   * Record engagement by time for analysis
   */
  async recordEngagement(
    workspaceId: string,
    postId: string,
    platform: string,
    postedAt: Date,
    metrics: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }
  ): Promise<EngagementByTime> {
    try {
      logger.info('Recording engagement by time', { postId, platform });

      const dayOfWeek = postedAt.getDay();
      const hourOfDay = postedAt.getHours();
      const engagementRate = this.calculateEngagementRate(metrics);
      const hoursSincePublish = (Date.now() - postedAt.getTime()) / (1000 * 60 * 60);

      const engagementData: Database['public']['Tables']['engagement_by_time']['Insert'] = {
        workspace_id: workspaceId,
        post_id: postId,
        platform,
        posted_at: postedAt.toISOString(),
        day_of_week: dayOfWeek,
        hour_of_day: hourOfDay,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
        engagement_rate: engagementRate,
        hours_since_publish: hoursSincePublish,
        engagement_velocity: engagementRate / Math.max(1, hoursSincePublish),
        metadata: {},
      };

      const { data, error } = await supabase
        .from('engagement_by_time')
        .insert(engagementData)
        .select()
        .single();

      if (error || !data) {
        throw new AppError('Failed to record engagement', 'RECORD_FAILED');
      }

      return data;
    } catch (error) {
      logger.error('Failed to record engagement', { error, postId });
      throw error instanceof AppError ? error : new AppError('Failed to record', 'RECORD_FAILED');
    }
  }

  /**
   * Get optimal posting times from cache
   */
  async getOptimalTimes(
    workspaceId: string,
    platform?: string
  ): Promise<OptimalPostingTime[]> {
    try {
      let query = supabase
        .from('optimal_posting_times')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('optimization_score', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch optimal times', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get optimal times', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get times', 'FETCH_FAILED');
    }
  }

  /**
   * Get engagement data for analysis
   */
  private async getEngagementData(
    workspaceId: string,
    platform: string,
    periodDays: number
  ): Promise<EngagementByTime[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const { data, error } = await supabase
      .from('engagement_by_time')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .gte('posted_at', startDate.toISOString());

    if (error) {
      throw new AppError('Failed to fetch engagement data', 'FETCH_FAILED');
    }

    return data || [];
  }

  /**
   * Calculate optimal times from engagement data
   */
  private calculateOptimalTimes(
    data: EngagementByTime[],
    timezone: string
  ): Map<string, {
    dayOfWeek: number;
    hourOfDay: number;
    avgEngagementRate: number;
    avgViews: number;
    avgLikes: number;
    avgShares: number;
    avgComments: number;
    sampleSize: number;
  }> {
    const timeSlots = new Map();

    // Group by day and hour
    data.forEach((record) => {
      const key = `${record.day_of_week}-${record.hour_of_day}`;

      if (!timeSlots.has(key)) {
        timeSlots.set(key, {
          dayOfWeek: record.day_of_week,
          hourOfDay: record.hour_of_day,
          engagementRates: [],
          views: [],
          likes: [],
          shares: [],
          comments: [],
        });
      }

      const slot = timeSlots.get(key);
      slot.engagementRates.push(record.engagement_rate);
      slot.views.push(record.views);
      slot.likes.push(record.likes);
      slot.shares.push(record.shares);
      slot.comments.push(record.comments);
    });

    // Calculate averages
    const results = new Map();
    timeSlots.forEach((slot, key) => {
      results.set(key, {
        dayOfWeek: slot.dayOfWeek,
        hourOfDay: slot.hourOfDay,
        avgEngagementRate: this.average(slot.engagementRates),
        avgViews: this.average(slot.views),
        avgLikes: this.average(slot.likes),
        avgShares: this.average(slot.shares),
        avgComments: this.average(slot.comments),
        sampleSize: slot.engagementRates.length,
      });
    });

    return results;
  }

  /**
   * Store optimal times in database
   */
  private async storeOptimalTimes(
    workspaceId: string,
    platform: string,
    optimalTimes: Map<string, any>,
    periodDays: number
  ): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Calculate rank within each week
    const sortedTimes = Array.from(optimalTimes.values())
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);

    const records: Database['public']['Tables']['optimal_posting_times']['Insert'][] = sortedTimes.map((time, index) => {
      const optimizationScore = this.calculateOptimizationScore(time);
      const confidenceLevel = this.calculateConfidenceLevel(time.sampleSize);

      return {
        workspace_id: workspaceId,
        platform,
        day_of_week: time.dayOfWeek,
        hour_of_day: time.hourOfDay,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avg_engagement_rate: time.avgEngagementRate,
        avg_views: time.avgViews,
        avg_likes: time.avgLikes,
        avg_shares: time.avgShares,
        avg_comments: time.avgComments,
        sample_size: time.sampleSize,
        confidence_level: confidenceLevel,
        optimization_score: optimizationScore,
        rank_in_week: index + 1,
        calculation_period_start: startDate.toISOString(),
        calculation_period_end: endDate.toISOString(),
        metadata: {},
      };
    });

    // Delete old records and insert new ones
    await supabase
      .from('optimal_posting_times')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('platform', platform);

    const { error } = await supabase
      .from('optimal_posting_times')
      .insert(records);

    if (error) {
      throw new AppError('Failed to store optimal times', 'STORE_FAILED');
    }
  }

  /**
   * Generate time recommendations
   */
  private generateRecommendations(
    optimalTimes: Map<string, any>
  ): TimeRecommendation[] {
    const recommendations: TimeRecommendation[] = [];
    const sortedTimes = Array.from(optimalTimes.values())
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 10); // Top 10 times

    sortedTimes.forEach((time) => {
      const score = this.calculateOptimizationScore(time);
      const confidence = this.calculateConfidenceLevel(time.sampleSize);
      const reasoning = this.generateReasoning(time);

      recommendations.push({
        dayOfWeek: time.dayOfWeek,
        hourOfDay: time.hourOfDay,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        score,
        confidence,
        avgEngagementRate: time.avgEngagementRate,
        expectedViews: time.avgViews,
        reasoning,
      });
    });

    return recommendations;
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(time: any): number {
    // Weighted combination of metrics
    const engagementWeight = 0.40;
    const viewsWeight = 0.30;
    const interactionWeight = 0.30;

    const engagementScore = Math.min(100, time.avgEngagementRate * 10);
    const viewsScore = Math.min(100, (time.avgViews / 1000) * 10);
    const interactionScore = Math.min(100, ((time.avgLikes + time.avgComments + time.avgShares) / 100) * 10);

    return (
      engagementScore * engagementWeight +
      viewsScore * viewsWeight +
      interactionScore * interactionWeight
    );
  }

  /**
   * Calculate confidence level based on sample size
   */
  private calculateConfidenceLevel(sampleSize: number): number {
    if (sampleSize >= 30) return 95;
    if (sampleSize >= 20) return 85;
    if (sampleSize >= 10) return 75;
    return 60;
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(time: any): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[time.dayOfWeek];
    const hour = time.hourOfDay;
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    return `${dayName} at ${hour}:00 (${period}) shows ${time.avgEngagementRate.toFixed(2)}% engagement rate with ${Math.round(time.avgViews)} average views based on ${time.sampleSize} posts`;
  }

  /**
   * Process hourly engagement data
   */
  private processHourlyEngagement(data: any[]): Record<number, number> {
    const hourlyEngagement: Record<number, number> = {};

    data.forEach((record) => {
      hourlyEngagement[record.hour_of_day] = record.avg_engagement_rate;
    });

    return hourlyEngagement;
  }

  /**
   * Process daily engagement data
   */
  private processDailyEngagement(data: any[]): Record<number, number> {
    const dailyEngagement: Record<number, number> = {};

    data.forEach((record) => {
      dailyEngagement[record.day_of_week] = record.avg_engagement_rate;
    });

    return dailyEngagement;
  }

  /**
   * Identify peak hours
   */
  private identifyPeakHours(hourlyData: Record<number, number>): number[] {
    const sorted = Object.entries(hourlyData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted.map(([hour]) => parseInt(hour));
  }

  /**
   * Identify peak days
   */
  private identifyPeakDays(dailyData: Record<number, number>): number[] {
    const sorted = Object.entries(dailyData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([day]) => parseInt(day));
  }

  /**
   * Identify low engagement periods
   */
  private identifyLowPeriods(
    hourlyData: Record<number, number>,
    dailyData: Record<number, number>
  ): { day: number; hour: number }[] {
    const lowPeriods: { day: number; hour: number }[] = [];

    const lowHours = Object.entries(hourlyData)
      .filter(([_, rate]) => rate < 2.0)
      .map(([hour]) => parseInt(hour));

    const lowDays = Object.entries(dailyData)
      .filter(([_, rate]) => rate < 2.5)
      .map(([day]) => parseInt(day));

    lowDays.forEach((day) => {
      lowHours.slice(0, 3).forEach((hour) => {
        lowPeriods.push({ day, hour });
      });
    });

    return lowPeriods.slice(0, 10);
  }

  /**
   * Get best days from optimal times
   */
  private getBestDays(optimalTimes: Map<string, any>): number[] {
    const dayScores = new Map<number, number>();

    optimalTimes.forEach((time) => {
      const currentScore = dayScores.get(time.dayOfWeek) || 0;
      dayScores.set(time.dayOfWeek, currentScore + time.avgEngagementRate);
    });

    return Array.from(dayScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);
  }

  /**
   * Get best hours from optimal times
   */
  private getBestHours(optimalTimes: Map<string, any>): number[] {
    const hourScores = new Map<number, number>();

    optimalTimes.forEach((time) => {
      const currentScore = hourScores.get(time.hourOfDay) || 0;
      hourScores.set(time.hourOfDay, currentScore + time.avgEngagementRate);
    });

    return Array.from(hourScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => hour);
  }

  /**
   * Get worst times from optimal times
   */
  private getWorstTimes(optimalTimes: Map<string, any>): { day: number; hour: number }[] {
    return Array.from(optimalTimes.values())
      .sort((a, b) => a.avgEngagementRate - b.avgEngagementRate)
      .slice(0, 5)
      .map((time) => ({ day: time.dayOfWeek, hour: time.hourOfDay }));
  }

  /**
   * Calculate engagement rate
   */
  private calculateEngagementRate(metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }): number {
    if (metrics.views === 0) return 0;
    const totalEngagement = metrics.likes + metrics.comments + metrics.shares;
    return (totalEngagement / metrics.views) * 100;
  }

  /**
   * Calculate average of array
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}

export const postingTimeAnalyzer = PostingTimeAnalyzer.getInstance();
