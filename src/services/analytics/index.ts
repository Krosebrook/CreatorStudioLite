// Existing analytics services
export { analyticsAggregationService } from './AnalyticsAggregationService';
export type { AggregatedMetrics, ContentInsights, ComparisonMetrics } from './AnalyticsAggregationService';

// Advanced Analytics Services
export { viralScorePredictionService } from './ViralScorePredictionService';
export type { 
  PredictionRequest, 
  PredictionResult, 
  AccuracyMetrics 
} from './ViralScorePredictionService';

export { postingTimeAnalyzer } from './PostingTimeAnalyzer';
export type { 
  TimeRecommendation, 
  PostingSchedule, 
  EngagementPattern 
} from './PostingTimeAnalyzer';

export { audienceInsightsService } from './AudienceInsightsService';
export type { 
  AudienceReport, 
  AudienceInsight, 
  GrowthOpportunity, 
  AudienceSegment 
} from './AudienceInsightsService';

export { competitorBenchmarkingService } from './CompetitorBenchmarkingService';
export type { 
  CompetitorInsight, 
  BenchmarkReport, 
  CompetitorComparison 
} from './CompetitorBenchmarkingService';

export { customReportService } from './CustomReportService';
export type { 
  ReportConfig, 
  ScheduleConfig, 
  ReportData 
} from './CustomReportService';

export { alertService } from './AlertService';
export type { 
  AlertRule, 
  AlertCheck, 
  AlertSummary 
} from './AlertService';

export { advancedAnalyticsService } from './AdvancedAnalyticsService';
export type { 
  AnalyticsDashboard, 
  AnalyticsInsights, 
  PredictiveAnalytics 
} from './AdvancedAnalyticsService';
