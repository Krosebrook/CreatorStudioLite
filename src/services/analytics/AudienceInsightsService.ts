import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import type {
  AudienceDemographics,
  AudienceInterest,
  AudienceGrowth,
  Database,
} from '../../types/analytics-database.types';

export interface AudienceReport {
  demographics: AudienceDemographics | null;
  interests: AudienceInterest[];
  growth: AudienceGrowth[];
  insights: AudienceInsight[];
  recommendations: string[];
}

export interface AudienceInsight {
  type: 'demographic' | 'interest' | 'growth' | 'behavior';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics: Record<string, number>;
}

export interface GrowthOpportunity {
  category: string;
  potential: number;
  confidence: number;
  targetAudience: string;
  suggestedActions: string[];
  estimatedReach: number;
}

export interface AudienceSegment {
  name: string;
  size: number;
  percentage: number;
  characteristics: Record<string, any>;
  engagementRate: number;
  growth: number;
}

/**
 * AudienceInsightsService
 * 
 * Tracks and analyzes audience demographics, interests, and behaviors.
 * Provides actionable insights for audience growth and engagement.
 */
class AudienceInsightsService {
  private static instance: AudienceInsightsService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AudienceInsightsService {
    if (!AudienceInsightsService.instance) {
      AudienceInsightsService.instance = new AudienceInsightsService();
    }
    return AudienceInsightsService.instance;
  }

  /**
   * Get comprehensive audience report
   */
  async getAudienceReport(
    workspaceId: string,
    connectorId: string,
    platform: string
  ): Promise<AudienceReport> {
    try {
      logger.info('Generating audience report', { workspaceId, connectorId, platform });

      // Fetch latest demographics
      const demographics = await this.getLatestDemographics(workspaceId, connectorId, platform);

      // Fetch interests
      const interests = await this.getAudienceInterests(workspaceId, connectorId, platform);

      // Fetch growth data
      const growth = await this.getGrowthData(workspaceId, connectorId, platform, 30);

      // Generate insights
      const insights = await this.generateInsights(demographics, interests, growth);

      // Generate recommendations
      const recommendations = this.generateRecommendations(demographics, interests, growth, insights);

      return {
        demographics,
        interests,
        growth,
        insights,
        recommendations,
      };
    } catch (error) {
      logger.error('Failed to generate audience report', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to generate report', 'REPORT_FAILED');
    }
  }

  /**
   * Track audience demographics
   */
  async trackDemographics(
    workspaceId: string,
    connectorId: string,
    platform: string,
    data: {
      ageRanges: Record<string, number>;
      genderDistribution: Record<string, number>;
      topCountries: Array<{ country: string; percentage: number }>;
      topCities: Array<{ city: string; percentage: number }>;
      topRegions?: Array<{ region: string; percentage: number }>;
      languages: Record<string, number>;
      totalFollowers: number;
      totalReach: number;
      periodStart: Date;
      periodEnd: Date;
    }
  ): Promise<AudienceDemographics> {
    try {
      logger.info('Tracking audience demographics', { workspaceId, connectorId, platform });

      const demographicsData: Database['public']['Tables']['audience_demographics']['Insert'] = {
        workspace_id: workspaceId,
        connector_id: connectorId,
        platform,
        age_ranges: data.ageRanges,
        gender_distribution: data.genderDistribution,
        top_countries: data.topCountries,
        top_cities: data.topCities,
        top_regions: data.topRegions || [],
        languages: data.languages,
        total_followers: data.totalFollowers,
        total_reach: data.totalReach,
        period_start: data.periodStart.toISOString(),
        period_end: data.periodEnd.toISOString(),
        metadata: {},
      };

      const { data: demographics, error } = await supabase
        .from('audience_demographics')
        .insert(demographicsData)
        .select()
        .single();

      if (error || !demographics) {
        throw new AppError('Failed to store demographics', 'STORE_FAILED');
      }

      return demographics;
    } catch (error) {
      logger.error('Failed to track demographics', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to track', 'TRACK_FAILED');
    }
  }

  /**
   * Track audience interests
   */
  async trackInterests(
    workspaceId: string,
    connectorId: string,
    platform: string,
    interests: Array<{
      category: string;
      subcategory?: string;
      affinityScore?: number;
      audiencePercentage?: number;
      audienceCount: number;
      engagementRate: number;
      behaviors?: Record<string, any>;
    }>,
    periodStart: Date,
    periodEnd: Date
  ): Promise<AudienceInterest[]> {
    try {
      logger.info('Tracking audience interests', { workspaceId, connectorId, platform });

      const interestRecords: Database['public']['Tables']['audience_interests']['Insert'][] = interests.map((interest) => ({
        workspace_id: workspaceId,
        connector_id: connectorId,
        platform,
        interest_category: interest.category,
        interest_subcategory: interest.subcategory || null,
        affinity_score: interest.affinityScore || null,
        audience_percentage: interest.audiencePercentage || null,
        audience_count: interest.audienceCount,
        engagement_rate: interest.engagementRate,
        behaviors: interest.behaviors || {},
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        metadata: {},
      }));

      const { data, error } = await supabase
        .from('audience_interests')
        .insert(interestRecords)
        .select();

      if (error || !data) {
        throw new AppError('Failed to store interests', 'STORE_FAILED');
      }

      return data;
    } catch (error) {
      logger.error('Failed to track interests', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to track interests', 'TRACK_FAILED');
    }
  }

  /**
   * Track audience growth
   */
  async trackGrowth(
    workspaceId: string,
    connectorId: string,
    platform: string,
    data: {
      followerCount: number;
      followerChange: number;
      followerGrowthRate: number;
      avgEngagementRate: number;
      totalReach: number;
      totalImpressions: number;
      engagementQualityScore: number;
      audienceRetentionRate: number;
      recordedDate: Date;
    }
  ): Promise<AudienceGrowth> {
    try {
      logger.info('Tracking audience growth', { workspaceId, connectorId, platform });

      const growthData: Database['public']['Tables']['audience_growth']['Insert'] = {
        workspace_id: workspaceId,
        connector_id: connectorId,
        platform,
        follower_count: data.followerCount,
        follower_change: data.followerChange,
        follower_growth_rate: data.followerGrowthRate,
        avg_engagement_rate: data.avgEngagementRate,
        total_reach: data.totalReach,
        total_impressions: data.totalImpressions,
        engagement_quality_score: data.engagementQualityScore,
        audience_retention_rate: data.audienceRetentionRate,
        recorded_date: data.recordedDate.toISOString(),
        metadata: {},
      };

      const { data: growth, error } = await supabase
        .from('audience_growth')
        .insert(growthData)
        .select()
        .single();

      if (error || !growth) {
        throw new AppError('Failed to store growth data', 'STORE_FAILED');
      }

      return growth;
    } catch (error) {
      logger.error('Failed to track growth', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to track growth', 'TRACK_FAILED');
    }
  }

  /**
   * Identify growth opportunities
   */
  async identifyGrowthOpportunities(
    workspaceId: string,
    connectorId: string,
    platform: string
  ): Promise<GrowthOpportunity[]> {
    try {
      logger.info('Identifying growth opportunities', { workspaceId, connectorId, platform });

      const demographics = await this.getLatestDemographics(workspaceId, connectorId, platform);
      const interests = await this.getAudienceInterests(workspaceId, connectorId, platform);
      const growth = await this.getGrowthData(workspaceId, connectorId, platform, 30);

      const opportunities: GrowthOpportunity[] = [];

      // Opportunity 1: Underserved interests
      const underservedInterests = this.identifyUnderservedInterests(interests);
      opportunities.push(...underservedInterests);

      // Opportunity 2: Geographic expansion
      if (demographics) {
        const geoOpportunities = this.identifyGeographicOpportunities(demographics);
        opportunities.push(...geoOpportunities);
      }

      // Opportunity 3: Demographic gaps
      if (demographics) {
        const demographicOpportunities = this.identifyDemographicGaps(demographics);
        opportunities.push(...demographicOpportunities);
      }

      // Opportunity 4: Content gaps
      const contentOpportunities = this.identifyContentGaps(interests, growth);
      opportunities.push(...contentOpportunities);

      return opportunities.sort((a, b) => b.potential - a.potential).slice(0, 10);
    } catch (error) {
      logger.error('Failed to identify opportunities', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to identify opportunities', 'OPPORTUNITY_FAILED');
    }
  }

  /**
   * Segment audience
   */
  async segmentAudience(
    workspaceId: string,
    connectorId: string,
    platform: string
  ): Promise<AudienceSegment[]> {
    try {
      logger.info('Segmenting audience', { workspaceId, connectorId, platform });

      const demographics = await this.getLatestDemographics(workspaceId, connectorId, platform);
      const interests = await this.getAudienceInterests(workspaceId, connectorId, platform);

      if (!demographics) {
        throw new AppError('No demographics data available', 'NO_DATA');
      }

      const segments: AudienceSegment[] = [];

      // Segment by age
      const ageSegments = this.segmentByAge(demographics);
      segments.push(...ageSegments);

      // Segment by interest
      const interestSegments = this.segmentByInterest(interests, demographics.total_followers);
      segments.push(...interestSegments);

      // Segment by geography
      const geoSegments = this.segmentByGeography(demographics);
      segments.push(...geoSegments);

      return segments.sort((a, b) => b.size - a.size);
    } catch (error) {
      logger.error('Failed to segment audience', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to segment', 'SEGMENT_FAILED');
    }
  }

  /**
   * Get latest demographics
   */
  private async getLatestDemographics(
    workspaceId: string,
    connectorId: string,
    platform: string
  ): Promise<AudienceDemographics | null> {
    const { data, error } = await supabase
      .from('audience_demographics_latest')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', connectorId)
      .eq('platform', platform)
      .single();

    if (error) {
      logger.warn('No demographics data found', { workspaceId, connectorId, platform });
      return null;
    }

    return data;
  }

  /**
   * Get audience interests
   */
  private async getAudienceInterests(
    workspaceId: string,
    connectorId: string,
    platform: string,
    limit: number = 20
  ): Promise<AudienceInterest[]> {
    const { data, error } = await supabase
      .from('audience_interests')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', connectorId)
      .eq('platform', platform)
      .order('engagement_rate', { ascending: false })
      .limit(limit);

    if (error) {
      logger.warn('No interests data found', { workspaceId, connectorId, platform });
      return [];
    }

    return data || [];
  }

  /**
   * Get growth data
   */
  private async getGrowthData(
    workspaceId: string,
    connectorId: string,
    platform: string,
    days: number
  ): Promise<AudienceGrowth[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('audience_growth')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', connectorId)
      .eq('platform', platform)
      .gte('recorded_date', startDate.toISOString())
      .order('recorded_date', { ascending: true });

    if (error) {
      logger.warn('No growth data found', { workspaceId, connectorId, platform });
      return [];
    }

    return data || [];
  }

  /**
   * Generate insights from data
   */
  private async generateInsights(
    demographics: AudienceDemographics | null,
    interests: AudienceInterest[],
    growth: AudienceGrowth[]
  ): Promise<AudienceInsight[]> {
    const insights: AudienceInsight[] = [];

    // Demographic insights
    if (demographics) {
      const genderInsight = this.analyzeMajorGender(demographics);
      if (genderInsight) insights.push(genderInsight);

      const ageInsight = this.analyzeDominantAge(demographics);
      if (ageInsight) insights.push(ageInsight);

      const geoInsight = this.analyzeTopGeography(demographics);
      if (geoInsight) insights.push(geoInsight);
    }

    // Interest insights
    if (interests.length > 0) {
      const topInterestInsight = this.analyzeTopInterest(interests);
      if (topInterestInsight) insights.push(topInterestInsight);
    }

    // Growth insights
    if (growth.length > 0) {
      const growthTrendInsight = this.analyzeGrowthTrend(growth);
      if (growthTrendInsight) insights.push(growthTrendInsight);

      const engagementInsight = this.analyzeEngagementTrend(growth);
      if (engagementInsight) insights.push(engagementInsight);
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    demographics: AudienceDemographics | null,
    interests: AudienceInterest[],
    growth: AudienceGrowth[],
    insights: AudienceInsight[]
  ): string[] {
    const recommendations: string[] = [];

    // Based on demographics
    if (demographics) {
      const topCountry = (demographics.top_countries as any)[0];
      if (topCountry) {
        recommendations.push(`Focus content for ${topCountry.country} market (${topCountry.percentage}% of audience)`);
      }
    }

    // Based on interests
    if (interests.length > 0) {
      const topInterest = interests[0];
      recommendations.push(`Create more content about ${topInterest.interest_category} (high engagement: ${topInterest.engagement_rate.toFixed(2)}%)`);
    }

    // Based on growth
    if (growth.length >= 2) {
      const recentGrowth = growth[growth.length - 1];
      if (recentGrowth.follower_growth_rate > 0) {
        recommendations.push('Maintain current growth momentum with consistent posting schedule');
      } else {
        recommendations.push('Increase posting frequency and engagement to boost follower growth');
      }
    }

    // Based on insights
    insights.forEach((insight) => {
      if (insight.actionable && insight.impact === 'high') {
        recommendations.push(insight.description);
      }
    });

    return recommendations.slice(0, 5);
  }

  /**
   * Analyze major gender distribution
   */
  private analyzeMajorGender(demographics: AudienceDemographics): AudienceInsight | null {
    const genderDist = demographics.gender_distribution as Record<string, number>;
    const entries = Object.entries(genderDist).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) return null;

    const [majorGender, percentage] = entries[0];

    return {
      type: 'demographic',
      title: 'Gender Distribution',
      description: `${majorGender} represents ${percentage.toFixed(1)}% of your audience`,
      impact: percentage > 70 ? 'high' : 'medium',
      actionable: percentage > 70,
      metrics: { percentage, totalFollowers: demographics.total_followers },
    };
  }

  /**
   * Analyze dominant age group
   */
  private analyzeDominantAge(demographics: AudienceDemographics): AudienceInsight | null {
    const ageRanges = demographics.age_ranges as Record<string, number>;
    const entries = Object.entries(ageRanges).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) return null;

    const [ageRange, percentage] = entries[0];

    return {
      type: 'demographic',
      title: 'Primary Age Group',
      description: `${ageRange} age group is your largest segment at ${percentage.toFixed(1)}%`,
      impact: 'high',
      actionable: true,
      metrics: { percentage, ageRange },
    };
  }

  /**
   * Analyze top geography
   */
  private analyzeTopGeography(demographics: AudienceDemographics): AudienceInsight | null {
    const topCountries = demographics.top_countries as Array<{ country: string; percentage: number }>;

    if (topCountries.length === 0) return null;

    const topCountry = topCountries[0];

    return {
      type: 'demographic',
      title: 'Geographic Concentration',
      description: `${topCountry.country} is your top market with ${topCountry.percentage.toFixed(1)}% of audience`,
      impact: topCountry.percentage > 50 ? 'high' : 'medium',
      actionable: true,
      metrics: { percentage: topCountry.percentage, country: topCountry.country },
    };
  }

  /**
   * Analyze top interest
   */
  private analyzeTopInterest(interests: AudienceInterest[]): AudienceInsight | null {
    if (interests.length === 0) return null;

    const topInterest = interests[0];

    return {
      type: 'interest',
      title: 'Top Audience Interest',
      description: `${topInterest.interest_category} drives ${topInterest.engagement_rate.toFixed(2)}% engagement`,
      impact: 'high',
      actionable: true,
      metrics: { engagementRate: topInterest.engagement_rate, audienceCount: topInterest.audience_count },
    };
  }

  /**
   * Analyze growth trend
   */
  private analyzeGrowthTrend(growth: AudienceGrowth[]): AudienceInsight | null {
    if (growth.length < 2) return null;

    const recentGrowth = growth.slice(-7);
    const avgGrowthRate = recentGrowth.reduce((sum, g) => sum + g.follower_growth_rate, 0) / recentGrowth.length;

    return {
      type: 'growth',
      title: 'Growth Trend',
      description: avgGrowthRate > 0
        ? `Positive growth momentum with ${avgGrowthRate.toFixed(2)}% average growth rate`
        : `Declining growth at ${avgGrowthRate.toFixed(2)}% - action needed`,
      impact: Math.abs(avgGrowthRate) > 5 ? 'high' : 'medium',
      actionable: avgGrowthRate < 0,
      metrics: { avgGrowthRate, period: recentGrowth.length },
    };
  }

  /**
   * Analyze engagement trend
   */
  private analyzeEngagementTrend(growth: AudienceGrowth[]): AudienceInsight | null {
    if (growth.length < 2) return null;

    const recentData = growth.slice(-7);
    const avgEngagement = recentData.reduce((sum, g) => sum + g.avg_engagement_rate, 0) / recentData.length;

    return {
      type: 'behavior',
      title: 'Engagement Health',
      description: avgEngagement > 3
        ? `Strong engagement at ${avgEngagement.toFixed(2)}% - maintain quality`
        : `Low engagement at ${avgEngagement.toFixed(2)}% - improve content quality`,
      impact: avgEngagement < 2 ? 'high' : 'medium',
      actionable: avgEngagement < 3,
      metrics: { avgEngagement, period: recentData.length },
    };
  }

  /**
   * Identify underserved interests
   */
  private identifyUnderservedInterests(interests: AudienceInterest[]): GrowthOpportunity[] {
    return interests
      .filter((i) => i.affinity_score && i.affinity_score > 0.7 && i.engagement_rate < 3)
      .slice(0, 3)
      .map((interest) => ({
        category: interest.interest_category,
        potential: 75,
        confidence: 70,
        targetAudience: `${interest.interest_category} enthusiasts`,
        suggestedActions: [
          `Create content specifically about ${interest.interest_category}`,
          'Engage with influencers in this space',
          'Use relevant hashtags and keywords',
        ],
        estimatedReach: interest.audience_count * 2,
      }));
  }

  /**
   * Identify geographic opportunities
   */
  private identifyGeographicOpportunities(demographics: AudienceDemographics): GrowthOpportunity[] {
    const topCountries = demographics.top_countries as Array<{ country: string; percentage: number }>;

    return topCountries
      .slice(1, 4)
      .map((country) => ({
        category: `Geographic - ${country.country}`,
        potential: 60 + country.percentage,
        confidence: 75,
        targetAudience: `Audience in ${country.country}`,
        suggestedActions: [
          `Post at times optimal for ${country.country} timezone`,
          'Create location-specific content',
          'Use local language and cultural references',
        ],
        estimatedReach: Math.round((demographics.total_followers * country.percentage) / 100),
      }));
  }

  /**
   * Identify demographic gaps
   */
  private identifyDemographicGaps(demographics: AudienceDemographics): GrowthOpportunity[] {
    const ageRanges = demographics.age_ranges as Record<string, number>;
    const underrepresented = Object.entries(ageRanges)
      .filter(([_, percentage]) => percentage < 15)
      .slice(0, 2);

    return underrepresented.map(([ageRange, percentage]) => ({
      category: `Age Group - ${ageRange}`,
      potential: 65,
      confidence: 65,
      targetAudience: `${ageRange} demographic`,
      suggestedActions: [
        `Create content that appeals to ${ageRange} age group`,
        'Research trending topics in this demographic',
        'Collaborate with creators popular in this age group',
      ],
      estimatedReach: Math.round((demographics.total_followers * 0.15)),
    }));
  }

  /**
   * Identify content gaps
   */
  private identifyContentGaps(interests: AudienceInterest[], growth: AudienceGrowth[]): GrowthOpportunity[] {
    const opportunities: GrowthOpportunity[] = [];

    if (interests.length < 5) {
      opportunities.push({
        category: 'Content Diversity',
        potential: 70,
        confidence: 80,
        targetAudience: 'Broader audience',
        suggestedActions: [
          'Expand content topics to cover more interests',
          'Experiment with different content formats',
          'Survey audience for topic preferences',
        ],
        estimatedReach: growth.length > 0 ? growth[growth.length - 1].total_reach * 1.5 : 10000,
      });
    }

    return opportunities;
  }

  /**
   * Segment by age
   */
  private segmentByAge(demographics: AudienceDemographics): AudienceSegment[] {
    const ageRanges = demographics.age_ranges as Record<string, number>;

    return Object.entries(ageRanges).map(([range, percentage]) => ({
      name: `Age ${range}`,
      size: Math.round((demographics.total_followers * percentage) / 100),
      percentage,
      characteristics: { ageRange: range },
      engagementRate: 0,
      growth: 0,
    }));
  }

  /**
   * Segment by interest
   */
  private segmentByInterest(interests: AudienceInterest[], totalFollowers: number): AudienceSegment[] {
    return interests.slice(0, 5).map((interest) => ({
      name: interest.interest_category,
      size: interest.audience_count,
      percentage: (interest.audience_count / totalFollowers) * 100,
      characteristics: {
        category: interest.interest_category,
        subcategory: interest.interest_subcategory,
        affinityScore: interest.affinity_score,
      },
      engagementRate: interest.engagement_rate,
      growth: 0,
    }));
  }

  /**
   * Segment by geography
   */
  private segmentByGeography(demographics: AudienceDemographics): AudienceSegment[] {
    const topCountries = demographics.top_countries as Array<{ country: string; percentage: number }>;

    return topCountries.slice(0, 5).map((country) => ({
      name: country.country,
      size: Math.round((demographics.total_followers * country.percentage) / 100),
      percentage: country.percentage,
      characteristics: { country: country.country },
      engagementRate: 0,
      growth: 0,
    }));
  }
}

export const audienceInsightsService = AudienceInsightsService.getInstance();
