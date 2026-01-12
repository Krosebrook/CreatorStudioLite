# Advanced Analytics Implementation Guide

## Overview

This guide provides a quick reference for implementing features using the Advanced Analytics database schema.

## Migration Applied

✅ **File**: `20260112135100_advanced_analytics_predictive_insights.sql`
✅ **Lines**: 1,623 lines of SQL
✅ **Tables**: 15 new tables
✅ **Views**: 4 standard views
✅ **Materialized Views**: 3 aggregated views
✅ **RLS Policies**: Complete workspace isolation
✅ **Indexes**: 60+ performance indexes
✅ **Types File**: `src/types/analytics-database.types.ts`

## Quick Start

### 1. Apply Migration

```bash
# Using Supabase CLI
npx supabase db push

# Or manually in Supabase Studio
# Copy the contents of the migration file to the SQL editor
```

### 2. Generate TypeScript Types

```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

### 3. Import Types in Your Code

```typescript
import { Database } from './types/analytics-database.types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

## Feature Implementation Guides

### 🎯 Viral Score Predictions

**Backend: Generate Prediction**
```typescript
// In your ML service or Edge Function
const { data, error } = await supabase
  .from('viral_score_predictions')
  .insert({
    workspace_id: workspaceId,
    content_id: contentId,
    platform: 'instagram',
    predicted_score: 78.5,
    confidence_score: 85.2,
    model_version: 'v2.1.0',
    model_type: 'viral_score',
    prediction_factors: {
      hashtags: 10,
      optimal_time: true,
      image_quality: 0.9,
      caption_length: 150
    },
    status: 'completed'
  })
  .select()
  .single();
```

**Frontend: Display Predictions**
```typescript
// Fetch predictions for content
const { data: predictions } = await supabase
  .from('viral_score_predictions')
  .select('*, content(*)')
  .eq('workspace_id', workspaceId)
  .eq('status', 'completed')
  .order('created_at', { ascending: false })
  .limit(10);

// Display with confidence indicator
predictions?.forEach(pred => {
  console.log(`Score: ${pred.predicted_score}/100`);
  console.log(`Confidence: ${pred.confidence_score}%`);
  console.log(`Factors:`, pred.prediction_factors);
});
```

**Track Accuracy**
```typescript
// After post is published and has engagement data
const { data } = await supabase
  .from('prediction_accuracy')
  .insert({
    workspace_id: workspaceId,
    prediction_id: predictionId,
    post_id: postId,
    predicted_score: 78.5,
    actual_score: 82.3, // Calculate from actual metrics
    actual_views: 15420,
    actual_likes: 1234,
    actual_shares: 89,
    actual_comments: 156,
    actual_engagement_rate: 9.7,
    hours_since_publish: 24
  });
```

### ⏰ Optimal Posting Times

**Backend: Calculate Optimal Times**
```typescript
// Run this as a scheduled job (e.g., daily)
async function calculateOptimalTimes(workspaceId: string, platform: string) {
  // This would typically be done in an Edge Function or background job
  const { data: engagementData } = await supabase
    .from('engagement_by_time')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('platform', platform)
    .gte('posted_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  // Group by day_of_week and hour_of_day, calculate averages
  // This is simplified - in production, use more sophisticated analysis
  const grouped = groupAndCalculate(engagementData);

  // Insert optimal times
  for (const slot of grouped) {
    await supabase
      .from('optimal_posting_times')
      .upsert({
        workspace_id: workspaceId,
        platform: platform,
        day_of_week: slot.day_of_week,
        hour_of_day: slot.hour_of_day,
        timezone: 'UTC',
        avg_engagement_rate: slot.avg_engagement_rate,
        avg_views: slot.avg_views,
        avg_likes: slot.avg_likes,
        sample_size: slot.sample_size,
        optimization_score: slot.optimization_score,
        calculation_period_start: startDate,
        calculation_period_end: endDate
      });
  }
}
```

**Frontend: Get Best Times**
```typescript
// Fetch top posting times
const { data: bestTimes } = await supabase
  .from('optimal_posting_times')
  .select('*')
  .eq('workspace_id', workspaceId)
  .eq('platform', 'instagram')
  .order('optimization_score', { ascending: false })
  .limit(5);

// Display recommendations
bestTimes?.forEach(time => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  console.log(`${dayNames[time.day_of_week]} at ${time.hour_of_day}:00`);
  console.log(`Score: ${time.optimization_score}/100`);
  console.log(`Avg Engagement: ${time.avg_engagement_rate}%`);
});
```

### 👥 Audience Demographics

**Backend: Store Demographics**
```typescript
// Fetch from platform API and store
async function updateAudienceDemographics(connectorId: string) {
  // Fetch from Instagram/TikTok/Twitter API
  const demographicsData = await fetchFromPlatformAPI(connectorId);

  await supabase
    .from('audience_demographics')
    .insert({
      workspace_id: workspaceId,
      connector_id: connectorId,
      platform: 'instagram',
      age_ranges: {
        '18-24': 25.5,
        '25-34': 40.2,
        '35-44': 20.1,
        '45-54': 10.2,
        '55+': 4.0
      },
      gender_distribution: {
        male: 45.5,
        female: 52.3,
        other: 2.2
      },
      top_countries: [
        { country: 'US', percentage: 35.5 },
        { country: 'UK', percentage: 15.2 },
        { country: 'CA', percentage: 10.8 }
      ],
      total_followers: 125000,
      total_reach: 450000,
      period_start: startDate,
      period_end: endDate
    });
}
```

**Frontend: Display Demographics**
```typescript
// Use the view for latest demographics
const { data: demographics } = await supabase
  .from('audience_demographics_latest')
  .select('*')
  .eq('workspace_id', workspaceId);

// Render charts
demographics?.forEach(demo => {
  console.log(`Platform: ${demo.platform}`);
  console.log('Age Distribution:', demo.age_ranges);
  console.log('Gender Distribution:', demo.gender_distribution);
  console.log('Top Countries:', demo.top_countries);
});
```

### 🏆 Competitor Benchmarking

**Add Competitor**
```typescript
const { data: competitor } = await supabase
  .from('competitor_profiles')
  .insert({
    workspace_id: workspaceId,
    competitor_name: 'Competitor Name',
    platform: 'instagram',
    platform_handle: '@competitor',
    category: 'Tech Influencer',
    follower_count: 500000,
    is_active: true
  })
  .select()
  .single();
```

**Store Daily Metrics**
```typescript
// Run daily to track competitors
async function trackCompetitorMetrics(competitorId: string) {
  const metrics = await fetchCompetitorMetrics(competitorId);

  await supabase
    .from('competitor_metrics')
    .insert({
      workspace_id: workspaceId,
      competitor_id: competitorId,
      follower_count: metrics.follower_count,
      follower_change: metrics.follower_change,
      avg_likes: metrics.avg_likes,
      avg_comments: metrics.avg_comments,
      avg_engagement_rate: metrics.avg_engagement_rate,
      posts_per_week: metrics.posts_per_week,
      recorded_date: new Date().toISOString().split('T')[0]
    });
}
```

**Display Benchmark**
```typescript
// Use the view for easy access
const { data: benchmarks } = await supabase
  .from('competitor_benchmark_summary')
  .select('*')
  .eq('workspace_id', workspaceId)
  .eq('platform', 'instagram');

// Show comparison
benchmarks?.forEach(comp => {
  console.log(`${comp.competitor_name}: ${comp.current_follower_count} followers`);
  console.log(`Engagement: ${comp.avg_engagement_rate}%`);
});
```

### 📊 Custom Reports

**Create Report**
```typescript
const { data: report } = await supabase
  .from('custom_reports')
  .insert({
    workspace_id: workspaceId,
    created_by: userId,
    name: 'Weekly Performance Report',
    description: 'Engagement metrics by platform',
    report_type: 'performance',
    query_config: {
      date_range: 'last_7_days',
      group_by: ['platform'],
      filters: { status: 'published' }
    },
    metrics: ['views', 'likes', 'engagement_rate'],
    dimensions: ['platform', 'date'],
    is_active: true
  })
  .select()
  .single();
```

**Schedule Report**
```typescript
const { data: schedule } = await supabase
  .from('report_schedules')
  .insert({
    workspace_id: workspaceId,
    report_id: reportId,
    created_by: userId,
    schedule_name: 'Weekly Email Report',
    cron_expression: '0 9 * * 1', // Every Monday at 9 AM
    timezone: 'America/New_York',
    delivery_method: 'email',
    recipients: ['user@example.com'],
    export_format: 'pdf',
    is_active: true
  })
  .select()
  .single();
```

**Execute Report**
```typescript
async function executeReport(reportId: string) {
  const execution = await supabase
    .from('report_executions')
    .insert({
      workspace_id: workspaceId,
      report_id: reportId,
      status: 'generating',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  try {
    // Generate report (your logic here)
    const reportData = await generateReport(reportId);
    const outputUrl = await uploadReportToStorage(reportData);

    // Update execution
    await supabase
      .from('report_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_url: outputUrl,
        output_format: 'pdf',
        rows_processed: reportData.rows
      })
      .eq('id', execution.data.id);
  } catch (error) {
    await supabase
      .from('report_executions')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', execution.data.id);
  }
}
```

### 🚨 Performance Alerts

**Create Alert**
```typescript
const { data: alert } = await supabase
  .from('performance_alerts')
  .insert({
    workspace_id: workspaceId,
    created_by: userId,
    alert_name: 'Low Engagement Alert',
    description: 'Alert when engagement rate drops below 2%',
    alert_type: 'threshold',
    metric: 'engagement_rate',
    condition_operator: 'lt',
    threshold_value: 2.0,
    platform: 'instagram',
    notification_channels: ['email', 'in_app'],
    notification_recipients: [userId],
    severity: 'warning',
    cooldown_minutes: 60,
    is_active: true
  })
  .select()
  .single();
```

**Trigger Alert**
```typescript
// Check metrics and trigger alerts
async function checkAndTriggerAlerts(workspaceId: string) {
  // Get active alerts
  const { data: alerts } = await supabase
    .from('performance_alerts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true);

  for (const alert of alerts || []) {
    // Check cooldown
    if (alert.last_triggered_at) {
      const cooldownEnd = new Date(alert.last_triggered_at);
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + alert.cooldown_minutes);
      if (new Date() < cooldownEnd) continue;
    }

    // Check condition (simplified)
    const currentValue = await getMetricValue(alert.metric, alert.platform);
    
    if (shouldTrigger(currentValue, alert.threshold_value, alert.condition_operator)) {
      // Create notification
      await supabase
        .from('alert_notifications')
        .insert({
          workspace_id: workspaceId,
          alert_id: alert.id,
          status: 'active',
          metric_name: alert.metric,
          current_value: currentValue,
          threshold_value: alert.threshold_value,
          alert_message: `${alert.alert_name}: ${alert.metric} is ${currentValue}, threshold is ${alert.threshold_value}`
        });

      // Update last triggered
      await supabase
        .from('performance_alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alert.id);

      // Send notifications (email, webhook, etc.)
      await sendNotifications(alert);
    }
  }
}
```

**Acknowledge Alert**
```typescript
async function acknowledgeAlert(notificationId: string, userId: string, notes?: string) {
  await supabase
    .from('alert_notifications')
    .update({
      status: 'acknowledged',
      acknowledged_by: userId,
      acknowledged_at: new Date().toISOString(),
      resolution_notes: notes
    })
    .eq('id', notificationId);
}
```

## Real-Time Subscriptions

### Subscribe to New Predictions
```typescript
const subscription = supabase
  .channel('predictions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'viral_score_predictions',
      filter: `workspace_id=eq.${workspaceId}`
    },
    (payload) => {
      console.log('New prediction:', payload.new);
      // Update UI
    }
  )
  .subscribe();
```

### Subscribe to Alerts
```typescript
const alertSubscription = supabase
  .channel('alerts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'alert_notifications',
      filter: `workspace_id=eq.${workspaceId}`
    },
    (payload) => {
      console.log('New alert:', payload.new);
      // Show notification toast
    }
  )
  .subscribe();
```

## Materialized View Maintenance

### Refresh Views
```typescript
// In an Edge Function or scheduled job
async function refreshAnalyticsViews() {
  const { error } = await supabase.rpc('refresh_analytics_materialized_views');
  
  if (error) {
    console.error('Failed to refresh views:', error);
  } else {
    console.log('Views refreshed successfully');
  }
}

// Schedule this to run hourly
```

### Setup Cron Job (Supabase)
```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'refresh-analytics-views',
  '0 * * * *', -- Every hour
  $$ SELECT public.refresh_analytics_materialized_views(); $$
);
```

## Query Performance Tips

### Use Views for Aggregations
```typescript
// Instead of complex joins, use the views
const { data } = await supabase
  .from('analytics_aggregated_daily')
  .select('*')
  .eq('workspace_id', workspaceId)
  .gte('date', '2024-01-01')
  .order('date', { ascending: false });
```

### Use Indexes Wisely
```typescript
// The schema includes indexes for these queries:
// ✅ GOOD - Uses index
.eq('workspace_id', workspaceId)
.eq('platform', 'instagram')
.order('created_at', { ascending: false })

// ❌ BAD - Doesn't use indexes effectively
.ilike('description', '%keyword%') // Full table scan
```

### Batch Operations
```typescript
// Insert multiple records at once
const { data } = await supabase
  .from('engagement_by_time')
  .insert([
    { /* record 1 */ },
    { /* record 2 */ },
    { /* record 3 */ }
  ]);
```

## Security Best Practices

### Never Bypass RLS
```typescript
// ❌ DON'T: Use service_role key in frontend
const supabase = createClient(url, serviceRoleKey); // NEVER!

// ✅ DO: Use anon key with RLS
const supabase = createClient(url, anonKey);
```

### Workspace Isolation
```typescript
// Always filter by workspace_id
const { data } = await supabase
  .from('viral_score_predictions')
  .select('*')
  .eq('workspace_id', workspaceId); // Required!
```

### Validate Permissions
```typescript
// Check user role before operations
const { data: membership } = await supabase
  .from('workspace_members')
  .select('role')
  .eq('workspace_id', workspaceId)
  .eq('user_id', userId)
  .single();

if (membership?.role === 'viewer') {
  throw new Error('Insufficient permissions');
}
```

## Testing

### Test RLS Policies
```typescript
// Test that users can only see their workspace data
const { data, error } = await supabase
  .from('viral_score_predictions')
  .select('*')
  .eq('workspace_id', otherWorkspaceId); // Should return empty or error

expect(data).toEqual([]);
```

### Test Generated Columns
```typescript
// Test accuracy_percentage calculation
const { data } = await supabase
  .from('prediction_accuracy')
  .insert({
    workspace_id: workspaceId,
    prediction_id: predictionId,
    post_id: postId,
    predicted_score: 80,
    actual_score: 75
  })
  .select('accuracy_percentage')
  .single();

expect(data.accuracy_percentage).toBe(95); // 100 - |80 - 75|
```

## Troubleshooting

### Check RLS Policies
```sql
-- In Supabase SQL Editor
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE '%analytics%';
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Monitor Query Performance
```sql
SELECT 
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%viral_score_predictions%'
ORDER BY mean_time DESC
LIMIT 10;
```

## Next Steps

1. ✅ Apply the migration
2. ✅ Generate TypeScript types
3. ⬜ Implement ML prediction service
4. ⬜ Build analytics dashboard
5. ⬜ Create report generation system
6. ⬜ Set up alert monitoring
7. ⬜ Schedule view refreshes
8. ⬜ Test RLS policies
9. ⬜ Add monitoring and logging
10. ⬜ Document API endpoints

## Resources

- **Migration File**: `supabase/migrations/20260112135100_advanced_analytics_predictive_insights.sql`
- **Documentation**: `supabase/migrations/README_ANALYTICS.md`
- **Type Definitions**: `src/types/analytics-database.types.ts`
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
