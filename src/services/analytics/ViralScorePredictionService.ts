import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import type {
  ViralScorePrediction,
  PredictionAccuracy,
  PredictionStatus,
  Database,
} from '../../types/analytics-database.types';

export interface PredictionRequest {
  workspaceId: string;
  contentId?: string;
  postId?: string;
  platform: string;
  contentData?: {
    title?: string;
    description?: string;
    hashtags?: string[];
    mediaType?: string;
    contentLength?: number;
  };
}

export interface PredictionResult {
  prediction: ViralScorePrediction;
  factors: {
    contentQuality: number;
    timingScore: number;
    platformFit: number;
    trendAlignment: number;
    audienceMatch: number;
  };
  recommendations: string[];
}

export interface AccuracyMetrics {
  averageAccuracy: number;
  totalPredictions: number;
  successfulPredictions: number;
  modelPerformance: {
    byPlatform: Record<string, number>;
    byTimeRange: Record<string, number>;
  };
}

/**
 * ViralScorePredictionService
 * 
 * Generates viral score predictions using hybrid AI + statistical analysis.
 * Tracks prediction accuracy and continuously improves models.
 */
class ViralScorePredictionService {
  private static instance: ViralScorePredictionService;
  private readonly MODEL_VERSION = 'v1.0.0';
  private readonly CONFIDENCE_THRESHOLD = 60;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ViralScorePredictionService {
    if (!ViralScorePredictionService.instance) {
      ViralScorePredictionService.instance = new ViralScorePredictionService();
    }
    return ViralScorePredictionService.instance;
  }

  /**
   * Generate viral score prediction for content
   */
  async generatePrediction(request: PredictionRequest): Promise<PredictionResult> {
    try {
      logger.info('Generating viral score prediction', { request });

      if (!request.contentId && !request.postId) {
        throw new AppError('Either contentId or postId must be provided', 'INVALID_REQUEST');
      }

      // Calculate prediction factors
      const factors = await this.calculatePredictionFactors(request);

      // Calculate weighted viral score
      const predictedScore = this.calculateViralScore(factors);

      // Calculate confidence based on data quality and historical accuracy
      const confidenceScore = await this.calculateConfidence(request, factors);

      // Generate recommendations
      const recommendations = this.generateRecommendations(factors, predictedScore);

      // Store prediction
      const prediction = await this.storePrediction({
        workspaceId: request.workspaceId,
        contentId: request.contentId,
        postId: request.postId,
        platform: request.platform,
        predictedScore,
        confidenceScore,
        factors,
      });

      return {
        prediction,
        factors,
        recommendations,
      };
    } catch (error) {
      logger.error('Failed to generate viral score prediction', { error, request });
      throw error instanceof AppError ? error : new AppError('Failed to generate prediction', 'PREDICTION_FAILED');
    }
  }

  /**
   * Update prediction with actual performance data
   */
  async updatePredictionAccuracy(
    predictionId: string,
    actualMetrics: {
      views: number;
      likes: number;
      shares: number;
      comments: number;
      engagementRate: number;
    }
  ): Promise<PredictionAccuracy> {
    try {
      logger.info('Updating prediction accuracy', { predictionId });

      // Get original prediction
      const { data: prediction, error: predError } = await supabase
        .from('viral_score_predictions')
        .select('*')
        .eq('id', predictionId)
        .single();

      if (predError || !prediction) {
        throw new AppError('Prediction not found', 'NOT_FOUND');
      }

      // Calculate actual viral score based on metrics
      const actualScore = this.calculateActualViralScore(actualMetrics);

      // Calculate accuracy percentage (generated column in DB will compute this)
      const accuracyData: Database['public']['Tables']['prediction_accuracy']['Insert'] = {
        workspace_id: prediction.workspace_id,
        prediction_id: predictionId,
        post_id: prediction.post_id!,
        predicted_score: prediction.predicted_score,
        actual_score: actualScore,
        actual_views: actualMetrics.views,
        actual_likes: actualMetrics.likes,
        actual_shares: actualMetrics.shares,
        actual_comments: actualMetrics.comments,
        actual_engagement_rate: actualMetrics.engagementRate,
        measured_at: new Date().toISOString(),
        metadata: {},
      };

      const { data: accuracy, error: accError } = await supabase
        .from('prediction_accuracy')
        .insert(accuracyData)
        .select()
        .single();

      if (accError || !accuracy) {
        throw new AppError('Failed to store accuracy metrics', 'STORE_FAILED');
      }

      // Update prediction status
      await supabase
        .from('viral_score_predictions')
        .update({ status: 'completed' as PredictionStatus })
        .eq('id', predictionId);

      return accuracy;
    } catch (error) {
      logger.error('Failed to update prediction accuracy', { error, predictionId });
      throw error instanceof AppError ? error : new AppError('Failed to update accuracy', 'UPDATE_FAILED');
    }
  }

  /**
   * Get prediction accuracy metrics
   */
  async getAccuracyMetrics(workspaceId: string, days: number = 30): Promise<AccuracyMetrics> {
    try {
      logger.info('Fetching accuracy metrics', { workspaceId, days });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: accuracyRecords, error } = await supabase
        .from('prediction_accuracy')
        .select(`
          *,
          prediction:viral_score_predictions!inner(platform)
        `)
        .eq('workspace_id', workspaceId)
        .gte('measured_at', startDate.toISOString());

      if (error) {
        throw new AppError('Failed to fetch accuracy metrics', 'FETCH_FAILED');
      }

      const totalPredictions = accuracyRecords?.length || 0;
      const successfulPredictions = accuracyRecords?.filter((r: any) => r.accuracy_percentage >= 70).length || 0;

      // Calculate average accuracy
      const averageAccuracy = totalPredictions > 0
        ? accuracyRecords!.reduce((sum: number, r: any) => sum + r.accuracy_percentage, 0) / totalPredictions
        : 0;

      // Group by platform
      const byPlatform: Record<string, number[]> = {};
      accuracyRecords?.forEach((r: any) => {
        const platform = r.prediction?.platform || 'unknown';
        if (!byPlatform[platform]) byPlatform[platform] = [];
        byPlatform[platform].push(r.accuracy_percentage);
      });

      const modelPerformance = {
        byPlatform: Object.entries(byPlatform).reduce((acc, [platform, accuracies]) => {
          acc[platform] = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
          return acc;
        }, {} as Record<string, number>),
        byTimeRange: {
          'last_7_days': this.calculateTimeRangeAccuracy(accuracyRecords || [], 7),
          'last_30_days': this.calculateTimeRangeAccuracy(accuracyRecords || [], 30),
        },
      };

      return {
        averageAccuracy,
        totalPredictions,
        successfulPredictions,
        modelPerformance,
      };
    } catch (error) {
      logger.error('Failed to get accuracy metrics', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get metrics', 'METRICS_FAILED');
    }
  }

  /**
   * Get predictions for workspace
   */
  async getPredictions(
    workspaceId: string,
    filters?: {
      platform?: string;
      status?: PredictionStatus;
      limit?: number;
    }
  ): Promise<ViralScorePrediction[]> {
    try {
      let query = supabase
        .from('viral_score_predictions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (filters?.platform) {
        query = query.eq('platform', filters.platform);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch predictions', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get predictions', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get predictions', 'FETCH_FAILED');
    }
  }

  /**
   * Calculate prediction factors based on various signals
   */
  private async calculatePredictionFactors(request: PredictionRequest): Promise<{
    contentQuality: number;
    timingScore: number;
    platformFit: number;
    trendAlignment: number;
    audienceMatch: number;
  }> {
    // Content quality analysis
    const contentQuality = this.analyzeContentQuality(request.contentData);

    // Historical timing analysis
    const timingScore = await this.analyzeTimingScore(request.workspaceId, request.platform);

    // Platform fit score
    const platformFit = this.analyzePlatformFit(request.platform, request.contentData);

    // Trend alignment (simplified - could integrate with trending topics API)
    const trendAlignment = this.analyzeTrendAlignment(request.contentData);

    // Audience match score
    const audienceMatch = await this.analyzeAudienceMatch(request.workspaceId, request.platform);

    return {
      contentQuality,
      timingScore,
      platformFit,
      trendAlignment,
      audienceMatch,
    };
  }

  /**
   * Calculate weighted viral score
   */
  private calculateViralScore(factors: {
    contentQuality: number;
    timingScore: number;
    platformFit: number;
    trendAlignment: number;
    audienceMatch: number;
  }): number {
    const weights = {
      contentQuality: 0.30,
      timingScore: 0.15,
      platformFit: 0.25,
      trendAlignment: 0.15,
      audienceMatch: 0.15,
    };

    const score =
      factors.contentQuality * weights.contentQuality +
      factors.timingScore * weights.timingScore +
      factors.platformFit * weights.platformFit +
      factors.trendAlignment * weights.trendAlignment +
      factors.audienceMatch * weights.audienceMatch;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate confidence score
   */
  private async calculateConfidence(
    request: PredictionRequest,
    factors: any
  ): Promise<number> {
    // Base confidence on factor completeness
    const factorCount = Object.values(factors).filter(v => v > 0).length;
    const completeness = (factorCount / 5) * 100;

    // Get historical accuracy for this platform
    const { data: recentAccuracy } = await supabase
      .from('prediction_accuracy')
      .select('accuracy_percentage')
      .eq('workspace_id', request.workspaceId)
      .order('measured_at', { ascending: false })
      .limit(10);

    const historicalAccuracy = recentAccuracy && recentAccuracy.length > 0
      ? recentAccuracy.reduce((sum, r) => sum + r.accuracy_percentage, 0) / recentAccuracy.length
      : 70; // Default confidence

    // Weighted average
    return Math.min(100, (completeness * 0.4 + historicalAccuracy * 0.6));
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(factors: any, score: number): string[] {
    const recommendations: string[] = [];

    if (factors.contentQuality < 70) {
      recommendations.push('Improve content quality: Add more engaging visuals and compelling copy');
    }

    if (factors.timingScore < 60) {
      recommendations.push('Post at optimal times: Check your audience engagement patterns');
    }

    if (factors.platformFit < 65) {
      recommendations.push('Optimize for platform: Adjust format and style for better platform fit');
    }

    if (factors.trendAlignment < 50) {
      recommendations.push('Align with trends: Include trending topics or hashtags');
    }

    if (factors.audienceMatch < 60) {
      recommendations.push('Target your audience: Tailor content to audience preferences');
    }

    if (score >= 80) {
      recommendations.push('Great potential! Consider boosting this content with paid promotion');
    }

    return recommendations;
  }

  /**
   * Store prediction in database
   */
  private async storePrediction(data: {
    workspaceId: string;
    contentId?: string;
    postId?: string;
    platform: string;
    predictedScore: number;
    confidenceScore: number;
    factors: any;
  }): Promise<ViralScorePrediction> {
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 48); // Valid for 48 hours

    const predictionData: Database['public']['Tables']['viral_score_predictions']['Insert'] = {
      workspace_id: data.workspaceId,
      content_id: data.contentId,
      post_id: data.postId,
      platform: data.platform,
      predicted_score: data.predictedScore,
      confidence_score: data.confidenceScore,
      prediction_factors: data.factors,
      model_version: this.MODEL_VERSION,
      model_type: 'viral_score',
      predicted_at: new Date().toISOString(),
      valid_until: validUntil.toISOString(),
      status: 'completed',
      metadata: {},
    };

    const { data: prediction, error } = await supabase
      .from('viral_score_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error || !prediction) {
      throw new AppError('Failed to store prediction', 'STORE_FAILED');
    }

    return prediction;
  }

  /**
   * Analyze content quality
   */
  private analyzeContentQuality(contentData?: PredictionRequest['contentData']): number {
    if (!contentData) return 60;

    let score = 50;

    if (contentData.title && contentData.title.length > 10) score += 15;
    if (contentData.description && contentData.description.length > 50) score += 15;
    if (contentData.hashtags && contentData.hashtags.length >= 3) score += 10;
    if (contentData.mediaType === 'video') score += 10;

    return Math.min(100, score);
  }

  /**
   * Analyze timing score based on historical data
   */
  private async analyzeTimingScore(workspaceId: string, platform: string): Promise<number> {
    const { data } = await supabase
      .from('engagement_summary_by_hour')
      .select('avg_engagement_rate')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .order('avg_engagement_rate', { ascending: false })
      .limit(1);

    return data && data.length > 0 ? Math.min(100, data[0].avg_engagement_rate * 10) : 60;
  }

  /**
   * Analyze platform fit
   */
  private analyzePlatformFit(platform: string, contentData?: PredictionRequest['contentData']): number {
    if (!contentData) return 60;

    let score = 60;

    // Platform-specific rules
    if (platform === 'tiktok' && contentData.mediaType === 'video') score += 20;
    if (platform === 'instagram' && contentData.mediaType === 'image') score += 15;
    if (platform === 'twitter' && contentData.contentLength && contentData.contentLength <= 280) score += 15;

    return Math.min(100, score);
  }

  /**
   * Analyze trend alignment
   */
  private analyzeTrendAlignment(contentData?: PredictionRequest['contentData']): number {
    if (!contentData?.hashtags || contentData.hashtags.length === 0) return 40;

    // Simple heuristic - more hashtags = better trend alignment
    return Math.min(100, 50 + contentData.hashtags.length * 5);
  }

  /**
   * Analyze audience match
   */
  private async analyzeAudienceMatch(workspaceId: string, platform: string): Promise<number> {
    const { data } = await supabase
      .from('audience_demographics_latest')
      .select('total_followers, total_reach')
      .eq('workspace_id', workspaceId)
      .eq('platform', platform)
      .single();

    if (!data) return 50;

    const engagementPotential = data.total_reach > 0
      ? (data.total_followers / data.total_reach) * 100
      : 50;

    return Math.min(100, engagementPotential);
  }

  /**
   * Calculate actual viral score from metrics
   */
  private calculateActualViralScore(metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  }): number {
    // Weighted score based on engagement metrics
    const viewScore = Math.min(30, (metrics.views / 10000) * 30);
    const likeScore = Math.min(25, (metrics.likes / 1000) * 25);
    const shareScore = Math.min(25, (metrics.shares / 100) * 25);
    const commentScore = Math.min(20, (metrics.comments / 100) * 20);

    return Math.min(100, viewScore + likeScore + shareScore + commentScore);
  }

  /**
   * Calculate accuracy for a time range
   */
  private calculateTimeRangeAccuracy(records: any[], days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = records.filter((r: any) => new Date(r.measured_at) >= cutoff);
    if (filtered.length === 0) return 0;

    return filtered.reduce((sum: number, r: any) => sum + r.accuracy_percentage, 0) / filtered.length;
  }
}

export const viralScorePredictionService = ViralScorePredictionService.getInstance();
