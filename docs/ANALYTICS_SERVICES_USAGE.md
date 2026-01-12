# Advanced Analytics Services - Usage Guide

## Overview

This guide demonstrates how to use the 7 analytics services for the Advanced Analytics with Predictive Insights feature.

## Table of Contents

1. [ViralScorePredictionService](#viralscorePredictionservice)
2. [PostingTimeAnalyzer](#postingtimeanalyzer)
3. [AudienceInsightsService](#audienceinsightsservice)
4. [CompetitorBenchmarkingService](#competitorbenchmarkingservice)
5. [CustomReportService](#customreportservice)
6. [AlertService](#alertservice)
7. [AdvancedAnalyticsService](#advancedanalyticsservice)

---

## ViralScorePredictionService

### Generate Viral Score Prediction

```typescript
import { viralScorePredictionService } from '@/services/analytics';

// Predict viral potential for content before publishing
const prediction = await viralScorePredictionService.generatePrediction({
  workspaceId: 'workspace-123',
  contentId: 'content-456',
  platform: 'instagram',
  contentData: {
    title: 'Amazing New Product Launch',
    description: 'Check out our latest innovation...',
    hashtags: ['tech', 'innovation', 'startup'],
    mediaType: 'video',
    contentLength: 150,
  },
});

console.log('Viral Score:', prediction.prediction.predicted_score);
console.log('Confidence:', prediction.prediction.confidence_score);
console.log('Factors:', prediction.factors);
console.log('Recommendations:', prediction.recommendations);
```

### Update Prediction with Actual Results

```typescript
// After content is published, update with actual metrics
const accuracy = await viralScorePredictionService.updatePredictionAccuracy(
  predictionId,
  {
    views: 15000,
    likes: 1200,
    shares: 85,
    comments: 45,
    engagementRate: 8.2,
  }
);

console.log('Accuracy:', accuracy.accuracy_percentage);
```

### Get Prediction Accuracy Metrics

```typescript
// Analyze prediction model performance
const metrics = await viralScorePredictionService.getAccuracyMetrics(
  'workspace-123',
  30 // last 30 days
);

console.log('Average Accuracy:', metrics.averageAccuracy);
console.log('Total Predictions:', metrics.totalPredictions);
console.log('By Platform:', metrics.modelPerformance.byPlatform);
```

---

## PostingTimeAnalyzer

### Analyze Optimal Posting Times

```typescript
import { postingTimeAnalyzer } from '@/services/analytics';

// Get optimal posting schedule
const schedule = await postingTimeAnalyzer.analyzeOptimalTimes(
  'workspace-123',
  'instagram',
  'America/New_York',
  30 // analyze last 30 days
);

console.log('Best Days:', schedule.bestDays); // [1, 3, 5] (Mon, Wed, Fri)
console.log('Best Hours:', schedule.bestHours); // [9, 12, 18]
console.log('Top Recommendations:', schedule.recommendations.slice(0, 3));
```

### Get Engagement Patterns

```typescript
// Analyze engagement patterns by time
const patterns = await postingTimeAnalyzer.getEngagementPatterns(
  'workspace-123',
  'instagram',
  30
);

console.log('Peak Hours:', patterns.peakHours);
console.log('Peak Days:', patterns.peakDays);
console.log('Hourly Engagement:', patterns.avgEngagementByHour);
```

### Record Engagement Data

```typescript
// Record engagement for a published post
await postingTimeAnalyzer.recordEngagement(
  'workspace-123',
  'post-789',
  'instagram',
  new Date('2024-01-15T14:30:00Z'),
  {
    views: 5000,
    likes: 450,
    comments: 32,
    shares: 18,
  }
);
```

---

## AudienceInsightsService

### Get Comprehensive Audience Report

```typescript
import { audienceInsightsService } from '@/services/analytics';

// Generate full audience report
const report = await audienceInsightsService.getAudienceReport(
  'workspace-123',
  'connector-456',
  'instagram'
);

console.log('Demographics:', report.demographics);
console.log('Top Interests:', report.interests);
console.log('Growth Trend:', report.growth);
console.log('Insights:', report.insights);
console.log('Recommendations:', report.recommendations);
```

### Track Audience Demographics

```typescript
// Store demographic data
await audienceInsightsService.trackDemographics(
  'workspace-123',
  'connector-456',
  'instagram',
  {
    ageRanges: {
      '18-24': 25.5,
      '25-34': 45.2,
      '35-44': 20.1,
      '45+': 9.2,
    },
    genderDistribution: {
      'male': 52.3,
      'female': 45.8,
      'other': 1.9,
    },
    topCountries: [
      { country: 'US', percentage: 42.5 },
      { country: 'UK', percentage: 18.3 },
      { country: 'CA', percentage: 12.7 },
    ],
    topCities: [
      { city: 'New York', percentage: 15.2 },
      { city: 'Los Angeles', percentage: 12.8 },
    ],
    languages: {
      'en': 85.5,
      'es': 8.2,
      'fr': 6.3,
    },
    totalFollowers: 50000,
    totalReach: 150000,
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-01-31'),
  }
);
```

### Identify Growth Opportunities

```typescript
// Find opportunities to grow audience
const opportunities = await audienceInsightsService.identifyGrowthOpportunities(
  'workspace-123',
  'connector-456',
  'instagram'
);

opportunities.forEach((opp) => {
  console.log('Category:', opp.category);
  console.log('Potential:', opp.potential);
  console.log('Target Audience:', opp.targetAudience);
  console.log('Actions:', opp.suggestedActions);
});
```

---

## CompetitorBenchmarkingService

### Add Competitor

```typescript
import { competitorBenchmarkingService } from '@/services/analytics';

// Add a competitor to track
const competitor = await competitorBenchmarkingService.addCompetitor(
  'workspace-123',
  'user-456',
  {
    name: 'CompetitorBrand',
    platform: 'instagram',
    handle: '@competitorbrand',
    profileUrl: 'https://instagram.com/competitorbrand',
    category: 'Fashion',
  }
);
```

### Generate Benchmark Report

```typescript
// Compare performance against competitors and industry
const benchmark = await competitorBenchmarkingService.generateBenchmark(
  'workspace-123',
  'connector-456',
  'instagram',
  {
    followerCount: 50000,
    engagementRate: 4.5,
    postsPerWeek: 5,
    avgLikes: 2250,
    avgComments: 180,
  }
);

console.log('Your Metrics:', benchmark.userMetrics);
console.log('Industry Average:', benchmark.industryAverage);
console.log('Competitor Average:', benchmark.competitorAverage);
console.log('Your Percentiles:', benchmark.percentiles);
console.log('Performance Score:', benchmark.performanceScore);
console.log('Gaps to Address:', benchmark.gaps);
console.log('Opportunities:', benchmark.opportunities);
```

### Compare with Specific Competitor

```typescript
// Head-to-head comparison
const comparison = await competitorBenchmarkingService.compareWithCompetitor(
  'workspace-123',
  'competitor-789'
);

console.log('Competitor:', comparison.competitor.competitor_name);
console.log('Follower Gap:', comparison.comparison.followerGap);
console.log('Engagement Gap:', comparison.comparison.engagementGap);
console.log('Insights:', comparison.insights);
```

---

## CustomReportService

### Create Custom Report

```typescript
import { customReportService } from '@/services/analytics';

// Create a custom engagement report
const report = await customReportService.createReport(
  'workspace-123',
  'user-456',
  {
    name: 'Weekly Engagement Report',
    description: 'Track engagement metrics for the past week',
    reportType: 'engagement',
    metrics: ['views', 'likes', 'comments', 'shares', 'engagement_rate'],
    dimensions: ['date', 'platform'],
    filters: {
      workspace_id: 'workspace-123',
      platform: 'instagram',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    },
    chartConfigs: {
      engagement_trend: {
        type: 'line',
        xAxis: 'date',
        yAxis: 'engagement_rate',
      },
    },
  }
);
```

### Execute Report

```typescript
// Generate report data
const reportData = await customReportService.executeReport(report.id);

console.log('Report:', reportData.report);
console.log('Data:', reportData.data);
console.log('Summary:', reportData.summary);
console.log('Charts:', reportData.charts);
```

### Export Report

```typescript
// Export report to CSV
const exportResult = await customReportService.exportReport(
  report.id,
  'csv',
  true // include raw data
);

console.log('Download URL:', exportResult.url);
console.log('File Size:', exportResult.sizeBytes);
```

### Schedule Automated Report

```typescript
// Schedule weekly email report
const schedule = await customReportService.scheduleReport(
  'workspace-123',
  'user-456',
  report.id,
  {
    scheduleName: 'Weekly Email Report',
    cronExpression: '0 9 * * 1', // Every Monday at 9 AM
    timezone: 'America/New_York',
    deliveryMethod: 'email',
    recipients: ['user@example.com'],
    exportFormat: 'pdf',
    includeRawData: false,
  }
);
```

---

## AlertService

### Create Performance Alert

```typescript
import { alertService } from '@/services/analytics';

// Create low engagement alert
const alert = await alertService.createAlert(
  'workspace-123',
  'user-456',
  {
    name: 'Low Engagement Alert',
    description: 'Notifies when engagement rate drops below threshold',
    alertType: 'engagement',
    metric: 'engagement_rate',
    operator: 'less_than',
    thresholdValue: 2.0,
    platform: 'instagram',
    notificationChannels: ['email', 'in_app'],
    notificationRecipients: ['user@example.com'],
    cooldownMinutes: 60,
    severity: 'warning',
  }
);
```

### Monitor Metrics

```typescript
// Monitor current metrics against all active alerts
const notifications = await alertService.monitorMetrics(
  'workspace-123',
  {
    engagement_rate: 1.5,
    views: 1200,
    follower_count: 49500,
  },
  {
    platform: 'instagram',
    connectorId: 'connector-456',
  }
);

// Notifications will be sent for any triggered alerts
console.log('Triggered Alerts:', notifications.length);
```

### Acknowledge Alert

```typescript
// Mark alert as acknowledged
await alertService.acknowledgeAlert(
  'notification-789',
  'user-456',
  'Investigating the drop in engagement'
);
```

### Resolve Alert

```typescript
// Resolve alert with notes
await alertService.resolveAlert(
  'notification-789',
  'user-456',
  'Posted new content and engagement has recovered'
);
```

### Get Alert Summary

```typescript
// Get overview of alerts
const summary = await alertService.getAlertSummary('workspace-123');

console.log('Active Alerts:', summary.activeAlerts);
console.log('Triggered Today:', summary.triggeredToday);
console.log('Critical Alerts:', summary.criticalAlerts);
console.log('Recent Notifications:', summary.recentNotifications);
```

---

## AdvancedAnalyticsService

The main orchestrator that coordinates all services.

### Get Analytics Dashboard

```typescript
import { advancedAnalyticsService } from '@/services/analytics';

// Get comprehensive dashboard
const dashboard = await advancedAnalyticsService.getDashboard(
  'workspace-123',
  'instagram' // optional platform filter
);

console.log('Summary:', dashboard.summary);
console.log('Recent Predictions:', dashboard.recentPredictions);
console.log('Top Performing Times:', dashboard.topPerformingTimes);
console.log('Audience Summary:', dashboard.audienceSummary);
console.log('Competitor Summary:', dashboard.competitorSummary);
console.log('Recent Alerts:', dashboard.recentAlerts);
```

### Get Comprehensive Insights

```typescript
// Get detailed insights across all services
const insights = await advancedAnalyticsService.getInsights(
  'workspace-123',
  'connector-456',
  'instagram'
);

console.log('Predictions:', insights.predictions);
console.log('Timing:', insights.timing);
console.log('Audience:', insights.audience);
console.log('Competitors:', insights.competitors);
console.log('Alerts:', insights.alerts);
```

### Get Predictive Analytics

```typescript
// Get predictions for future performance
const predictive = await advancedAnalyticsService.getPredictiveAnalytics(
  'workspace-123',
  'connector-456',
  'instagram',
  {
    id: 'content-456',
    title: 'New Product Launch',
    description: 'Exciting announcement...',
    hashtags: ['tech', 'innovation'],
    mediaType: 'video',
  }
);

console.log('Viral Prediction:', predictive.viralPrediction);
console.log('Optimal Posting Time:', predictive.optimalPostingTime);
console.log('Audience Growth Forecast:', predictive.audienceGrowthForecast);
console.log('Engagement Forecast:', predictive.engagementForecast);
```

### Analyze Content Before Publishing

```typescript
// Pre-publish content analysis
const analysis = await advancedAnalyticsService.analyzeContent(
  'workspace-123',
  'instagram',
  {
    title: 'Amazing Product Launch',
    description: 'Check out our latest innovation...',
    hashtags: ['tech', 'innovation', 'startup'],
    mediaType: 'video',
    scheduledTime: new Date('2024-01-20T14:00:00Z'),
  }
);

console.log('Viral Score:', analysis.viralScore);
console.log('Timing Score:', analysis.timingScore);
console.log('Overall Score:', analysis.overallScore);
console.log('Recommendations:', analysis.recommendations);
```

### Setup Default Alerts

```typescript
// Initialize default alerts for a new workspace
await advancedAnalyticsService.setupDefaultAlerts(
  'workspace-123',
  'user-456',
  'instagram',
  'connector-456'
);
// Creates 3 default alerts:
// - Low engagement alert
// - High performance alert
// - Follower drop alert
```

### Clear Cache

```typescript
// Clear cached data for workspace
advancedAnalyticsService.clearCache('workspace-123');
```

---

## Best Practices

### 1. Error Handling

Always wrap service calls in try-catch blocks:

```typescript
try {
  const prediction = await viralScorePredictionService.generatePrediction({
    // ... config
  });
} catch (error) {
  if (error instanceof AppError) {
    console.error('Analytics Error:', error.message, error.code);
  } else {
    console.error('Unexpected Error:', error);
  }
}
```

### 2. Caching

The AdvancedAnalyticsService includes built-in caching (5-minute TTL):

```typescript
// First call - fetches from services
const dashboard1 = await advancedAnalyticsService.getDashboard('workspace-123');

// Second call within 5 minutes - returns cached data
const dashboard2 = await advancedAnalyticsService.getDashboard('workspace-123');

// Clear cache when needed (e.g., after updating data)
advancedAnalyticsService.clearCache('workspace-123');
```

### 3. Pagination

For large datasets, use pagination:

```typescript
const predictions = await viralScorePredictionService.getPredictions(
  'workspace-123',
  {
    platform: 'instagram',
    limit: 20,
    status: 'completed',
  }
);
```

### 4. Batch Operations

For better performance, use Promise.all for independent operations:

```typescript
const [predictions, patterns, insights] = await Promise.all([
  viralScorePredictionService.getPredictions('workspace-123'),
  postingTimeAnalyzer.getEngagementPatterns('workspace-123', 'instagram'),
  audienceInsightsService.getAudienceReport('workspace-123', 'connector-456', 'instagram'),
]);
```

---

## Common Use Cases

### Use Case 1: Pre-Publish Content Optimization

```typescript
// Before publishing content
const analysis = await advancedAnalyticsService.analyzeContent(
  workspaceId,
  platform,
  contentData
);

if (analysis.overallScore < 70) {
  // Show warnings to user
  console.warn('Content may underperform:', analysis.recommendations);
}
```

### Use Case 2: Automated Performance Monitoring

```typescript
// Set up alerts for automated monitoring
await alertService.createAlert(workspaceId, userId, {
  name: 'Viral Content Alert',
  metric: 'views',
  operator: 'greater_than',
  thresholdValue: 100000,
  notificationChannels: ['email', 'webhook'],
  // ... config
});
```

### Use Case 3: Weekly Analytics Email

```typescript
// Create and schedule weekly report
const report = await customReportService.createReport(/* config */);

await customReportService.scheduleReport(workspaceId, userId, report.id, {
  scheduleName: 'Weekly Report',
  cronExpression: '0 9 * * 1',
  deliveryMethod: 'email',
  exportFormat: 'pdf',
  // ... config
});
```

---

## Support

For issues or questions about the analytics services, refer to:
- Database Schema: `supabase/migrations/20260112135100_advanced_analytics_predictive_insights.sql`
- Type Definitions: `src/types/analytics-database.types.ts`
- Implementation Guide: `docs/ANALYTICS_IMPLEMENTATION_GUIDE.md`
