# Advanced Analytics with Predictive Insights - Database Schema

## Overview

This document describes the database schema for the Advanced Analytics with Predictive Insights feature. The schema is designed to support ML-powered predictions, audience insights, competitor benchmarking, custom reporting, and performance monitoring.

## Migration File

- **File**: `20260112135100_advanced_analytics_predictive_insights.sql`
- **Size**: ~55KB
- **Tables**: 15 new tables
- **Views**: 4 standard views
- **Materialized Views**: 3 for aggregations
- **ENUMs**: 5 custom types
- **Indexes**: 60+ optimized indexes
- **RLS Policies**: Complete workspace-based isolation

## Database Architecture

### Core Design Principles

1. **Multi-tenancy**: All tables include `workspace_id` with RLS policies for data isolation
2. **Performance**: Extensive indexing on foreign keys and query patterns
3. **Flexibility**: JSONB metadata columns for extensibility
4. **Audit Trail**: `created_at` and `updated_at` timestamps on all mutable tables
5. **Data Integrity**: Foreign key constraints with cascade deletes where appropriate
6. **Security**: Row Level Security policies enforce workspace membership

## Table Descriptions

### 1. Viral Score Predictions (`viral_score_predictions`)

Stores ML-based predictions for content viral potential before and after publishing.

**Key Columns:**
- `predicted_score`: Viral score prediction (0-100)
- `confidence_score`: Model confidence level (0-100)
- `prediction_factors`: JSONB with factors influencing prediction
- `model_version`: Track which ML model generated the prediction
- `content_id` OR `post_id`: Can predict for drafts or published content

**Use Cases:**
- Predict viral potential of draft content
- Track predictions vs actual performance
- A/B test different ML models
- Improve content strategy based on predictions

**Example Query:**
```sql
-- Get latest predictions for workspace content
SELECT 
  vsp.*,
  c.title,
  c.status
FROM viral_score_predictions vsp
JOIN content c ON vsp.content_id = c.id
WHERE vsp.workspace_id = 'workspace-uuid'
  AND vsp.status = 'completed'
ORDER BY vsp.predicted_score DESC
LIMIT 10;
```

### 2. Prediction Accuracy (`prediction_accuracy`)

Tracks actual performance vs predictions for model learning and improvement.

**Key Columns:**
- `predicted_score` vs `actual_score`: Compare prediction to reality
- `accuracy_percentage`: Auto-calculated accuracy (generated column)
- `hours_since_publish`: Track accuracy over time
- Performance metrics snapshot

**Use Cases:**
- Train and improve ML models
- Report model accuracy to users
- Identify which predictions work best
- Adjust confidence scoring

**Example Query:**
```sql
-- Calculate model accuracy over time
SELECT 
  DATE_TRUNC('week', measured_at) as week,
  AVG(accuracy_percentage) as avg_accuracy,
  COUNT(*) as prediction_count,
  AVG(ABS(predicted_score - actual_score)) as avg_error
FROM prediction_accuracy
WHERE workspace_id = 'workspace-uuid'
  AND measured_at >= NOW() - INTERVAL '3 months'
GROUP BY DATE_TRUNC('week', measured_at)
ORDER BY week DESC;
```

### 3. Optimal Posting Times (`optimal_posting_times`)

Platform-specific optimal posting times based on historical engagement data.

**Key Columns:**
- `day_of_week`: 0=Sunday, 1=Monday, ..., 6=Saturday
- `hour_of_day`: 0-23 in specified timezone
- `optimization_score`: Composite ranking score (0-100)
- `avg_engagement_rate`: Average engagement for this time slot
- Statistical confidence metrics

**Use Cases:**
- Recommend best posting times to users
- Schedule content automatically at optimal times
- Compare performance across time slots
- Timezone-aware scheduling

**Example Query:**
```sql
-- Get top 5 posting times for Instagram
SELECT 
  day_of_week,
  hour_of_day,
  optimization_score,
  avg_engagement_rate,
  sample_size
FROM optimal_posting_times
WHERE workspace_id = 'workspace-uuid'
  AND platform = 'instagram'
ORDER BY optimization_score DESC
LIMIT 5;
```

### 4. Engagement by Time (`engagement_by_time`)

Granular engagement metrics by time of day for pattern analysis.

**Key Columns:**
- `posted_at`, `day_of_week`, `hour_of_day`: Time dimensions
- `hours_since_publish`: Track engagement decay
- `engagement_velocity`: Engagement rate per hour
- All standard engagement metrics

**Use Cases:**
- Identify engagement patterns
- Calculate optimal posting times
- Analyze engagement decay curves
- Feed ML models for predictions

**Example Query:**
```sql
-- Analyze engagement velocity in first 24 hours
SELECT 
  hours_since_publish,
  AVG(engagement_velocity) as avg_velocity,
  AVG(engagement_rate) as avg_engagement
FROM engagement_by_time
WHERE workspace_id = 'workspace-uuid'
  AND platform = 'twitter'
  AND hours_since_publish <= 24
GROUP BY hours_since_publish
ORDER BY hours_since_publish;
```

### 5. Audience Demographics (`audience_demographics`)

Comprehensive audience demographic data from social platforms.

**Key Columns:**
- `age_ranges`: JSONB with age distribution percentages
- `gender_distribution`: JSONB with gender percentages
- `top_countries`, `top_cities`, `top_regions`: Geographic arrays
- `languages`: Language distribution array
- `total_followers`, `total_reach`: Audience size

**Use Cases:**
- Understand audience composition
- Target content to demographics
- Track demographic shifts over time
- Compare audiences across platforms

**Example Schema:**
```json
{
  "age_ranges": {
    "18-24": 25.5,
    "25-34": 40.2,
    "35-44": 20.1,
    "45-54": 10.2,
    "55+": 4.0
  },
  "gender_distribution": {
    "male": 45.5,
    "female": 52.3,
    "other": 2.2
  },
  "top_countries": [
    {"country": "US", "percentage": 35.5},
    {"country": "UK", "percentage": 15.2},
    {"country": "CA", "percentage": 10.8}
  ]
}
```

**Example Query:**
```sql
-- Get latest demographics for all connected platforms
SELECT 
  platform,
  age_ranges,
  gender_distribution,
  top_countries,
  total_followers,
  period_end
FROM audience_demographics_latest
WHERE workspace_id = 'workspace-uuid';
```

### 6. Audience Interests (`audience_interests`)

Audience interest categories and behavioral patterns.

**Key Columns:**
- `interest_category`, `interest_subcategory`: Hierarchical interests
- `affinity_score`: How strongly audience relates (0-100)
- `audience_percentage`: % of audience with this interest
- `engagement_rate`: Engagement from this segment
- `behaviors`: JSONB with behavioral data

**Use Cases:**
- Content topic recommendations
- Audience segmentation
- Interest-based targeting
- Content strategy optimization

**Example Query:**
```sql
-- Top interests for audience
SELECT 
  interest_category,
  interest_subcategory,
  affinity_score,
  audience_percentage,
  engagement_rate
FROM audience_interests
WHERE workspace_id = 'workspace-uuid'
  AND platform = 'instagram'
ORDER BY affinity_score DESC
LIMIT 10;
```

### 7. Audience Growth (`audience_growth`)

Daily tracking of audience growth and quality metrics.

**Key Columns:**
- `follower_count`, `follower_change`, `follower_growth_rate`
- `engagement_quality_score`: Quality of engagement
- `audience_retention_rate`: How well you retain followers
- `recorded_date`: Daily snapshots

**Use Cases:**
- Track growth trends
- Identify growth anomalies
- Calculate growth velocity
- Report on audience health

**Example Query:**
```sql
-- 30-day growth trend
SELECT 
  recorded_date,
  follower_count,
  follower_change,
  follower_growth_rate,
  avg_engagement_rate
FROM audience_growth
WHERE workspace_id = 'workspace-uuid'
  AND connector_id = 'connector-uuid'
  AND recorded_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY recorded_date;
```

### 8. Competitor Profiles (`competitor_profiles`)

Competitor accounts to track for benchmarking.

**Key Columns:**
- `competitor_name`, `platform`, `platform_handle`
- `follower_count`, `following_count`, `post_count`
- `is_active`, `is_verified`: Status flags
- `category`: Competitor category/niche

**Use Cases:**
- Track competitors manually added by users
- Store competitor metadata
- Enable/disable tracking
- Organize competitors by category

**Example Query:**
```sql
-- Active competitors on Instagram
SELECT 
  competitor_name,
  platform_handle,
  follower_count,
  category,
  last_updated_at
FROM competitor_profiles
WHERE workspace_id = 'workspace-uuid'
  AND platform = 'instagram'
  AND is_active = true
ORDER BY follower_count DESC;
```

### 9. Competitor Metrics (`competitor_metrics`)

Daily performance metrics for competitor accounts.

**Key Columns:**
- `follower_count`, `follower_change`: Growth tracking
- `posts_per_week`: Content frequency
- `avg_likes`, `avg_comments`, `avg_shares`, `avg_views`
- `avg_engagement_rate`: Overall engagement
- `engagement_quality_score`, `content_consistency_score`

**Use Cases:**
- Track competitor performance over time
- Identify trending competitors
- Benchmark against competitors
- Alert on competitor milestones

**Example Query:**
```sql
-- Competitor performance last 30 days
SELECT 
  cp.competitor_name,
  cm.follower_count,
  cm.follower_change,
  cm.avg_engagement_rate,
  cm.posts_per_week,
  cm.recorded_date
FROM competitor_metrics cm
JOIN competitor_profiles cp ON cm.competitor_id = cp.id
WHERE cm.workspace_id = 'workspace-uuid'
  AND cm.recorded_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY cm.recorded_date DESC;
```

### 10. Benchmark Comparisons (`benchmark_comparisons`)

Comparative analysis: user vs industry vs competitors.

**Key Columns:**
- `user_*`: User's metrics
- `industry_avg_*`: Industry averages
- `competitor_avg_*`: Competitor averages
- Percentile rankings (0-100)
- `overall_performance_score`: Composite score

**Use Cases:**
- Show user's competitive position
- Identify strengths and weaknesses
- Track improvement over time
- Provide context for metrics

**Example Query:**
```sql
-- Latest benchmark comparison
SELECT 
  platform,
  user_engagement_rate,
  industry_avg_engagement_rate,
  competitor_avg_engagement_rate,
  engagement_percentile,
  overall_performance_score
FROM benchmark_comparisons
WHERE workspace_id = 'workspace-uuid'
ORDER BY period_end DESC
LIMIT 5;
```

### 11. Custom Reports (`custom_reports`)

User-defined report configurations and saved queries.

**Key Columns:**
- `name`, `description`, `report_type`
- `query_config`: JSONB with query definition
- `filters`, `metrics`, `dimensions`: Report structure
- `chart_configs`, `layout_config`: Visualization
- `is_public`, `shared_with`: Sharing settings

**Use Cases:**
- Save frequently used reports
- Share reports with team members
- Create custom dashboards
- Export report definitions

**Example Query:**
```sql
-- User's favorite reports
SELECT 
  id,
  name,
  description,
  report_type,
  created_at
FROM custom_reports
WHERE workspace_id = 'workspace-uuid'
  AND is_active = true
  AND is_favorite = true
ORDER BY name;
```

### 12. Report Schedules (`report_schedules`)

Scheduled report generation and delivery.

**Key Columns:**
- `schedule_name`, `cron_expression`, `timezone`
- `delivery_method`: email, webhook, storage
- `recipients`, `webhook_url`: Delivery targets
- `export_format`: pdf, csv, json, html
- `is_active`, `last_run_at`, `next_run_at`

**Use Cases:**
- Automated report delivery
- Email reports to stakeholders
- Webhook integration for BI tools
- Scheduled exports to storage

**Example Query:**
```sql
-- Active schedules with next run time
SELECT 
  schedule_name,
  cron_expression,
  next_run_at,
  delivery_method,
  export_format,
  recipients
FROM report_schedules
WHERE workspace_id = 'workspace-uuid'
  AND is_active = true
ORDER BY next_run_at;
```

### 13. Report Executions (`report_executions`)

History of report generation runs.

**Key Columns:**
- `status`: scheduled, generating, completed, failed
- `started_at`, `completed_at`, `duration_ms`
- `output_url`, `output_format`, `file_size_bytes`
- `rows_processed`, `error_message`

**Use Cases:**
- Track report generation history
- Debug failed reports
- Monitor report performance
- Access generated report files

**Example Query:**
```sql
-- Recent report executions
SELECT 
  re.id,
  cr.name as report_name,
  re.status,
  re.started_at,
  re.duration_ms,
  re.output_url
FROM report_executions re
JOIN custom_reports cr ON re.report_id = cr.id
WHERE re.workspace_id = 'workspace-uuid'
ORDER BY re.started_at DESC
LIMIT 20;
```

### 14. Performance Alerts (`performance_alerts`)

Configurable performance monitoring alerts.

**Key Columns:**
- `alert_name`, `description`, `alert_type`
- `metric`, `condition_operator`, `threshold_value`
- `notification_channels`: email, sms, webhook, in_app
- `notification_recipients`, `webhook_url`
- `cooldown_minutes`: Prevent spam
- `severity`: info, warning, critical

**Use Cases:**
- Monitor key metrics automatically
- Get notified of anomalies
- Track competitor changes
- Alert on thresholds or trends

**Example Alert Types:**
- Threshold: "Alert if engagement rate < 2%"
- Anomaly: "Alert if views drop > 50% vs yesterday"
- Trend: "Alert if follower growth negative for 7 days"
- Competitor: "Alert if competitor gains 10k+ followers"

**Example Query:**
```sql
-- Active alerts for workspace
SELECT 
  alert_name,
  alert_type,
  metric,
  condition_operator,
  threshold_value,
  notification_channels,
  last_triggered_at
FROM performance_alerts
WHERE workspace_id = 'workspace-uuid'
  AND is_active = true
ORDER BY severity DESC, alert_name;
```

### 15. Alert Notifications (`alert_notifications`)

History of triggered alerts and acknowledgements.

**Key Columns:**
- `triggered_at`, `status`: active, acknowledged, resolved, muted
- `metric_name`, `current_value`, `threshold_value`, `previous_value`
- `alert_message`, `alert_details`: Notification content
- `acknowledged_by`, `acknowledged_at`, `resolution_notes`

**Use Cases:**
- Alert notification history
- Track acknowledgements
- Measure alert response time
- Report on alert patterns

**Example Query:**
```sql
-- Unacknowledged alerts
SELECT 
  an.id,
  pa.alert_name,
  an.alert_message,
  an.current_value,
  an.threshold_value,
  an.triggered_at,
  pa.severity
FROM alert_notifications an
JOIN performance_alerts pa ON an.alert_id = pa.id
WHERE an.workspace_id = 'workspace-uuid'
  AND an.status = 'active'
ORDER BY pa.severity DESC, an.triggered_at DESC;
```

## Views

### 1. `engagement_summary_by_hour`

Aggregated engagement metrics by hour of day across all platforms.

### 2. `engagement_summary_by_day`

Aggregated engagement metrics by day of week across all platforms.

### 3. `audience_demographics_latest`

Latest demographic snapshot for each connected platform (DISTINCT ON view).

### 4. `competitor_benchmark_summary`

Current competitor status with latest metrics joined.

## Materialized Views

### 1. `analytics_aggregated_daily`

Pre-aggregated daily analytics for the last 90 days. Significantly improves dashboard performance.

**Refresh**: Run `SELECT public.refresh_analytics_materialized_views();` or use a cron job.

### 2. `analytics_aggregated_weekly`

Pre-aggregated weekly analytics for the last year. Used for long-term trend analysis.

### 3. `platform_performance_summary`

Platform-level performance summary for the last 90 days with percentile calculations.

## Custom Types (ENUMs)

### `prediction_status`
- `pending`: Prediction queued
- `processing`: ML model running
- `completed`: Prediction ready
- `failed`: Prediction failed

### `alert_severity`
- `info`: Informational alert
- `warning`: Warning level
- `critical`: Critical alert requiring attention

### `alert_status`
- `active`: Alert triggered, not acknowledged
- `acknowledged`: User has seen the alert
- `resolved`: Issue resolved
- `muted`: Alert muted by user

### `report_status`
- `scheduled`: Report queued for generation
- `generating`: Report being generated
- `completed`: Report ready
- `failed`: Generation failed

### `report_format`
- `pdf`: PDF document
- `csv`: CSV spreadsheet
- `json`: JSON data
- `html`: HTML document

## Row Level Security (RLS)

All tables enforce workspace-based RLS:

1. **SELECT**: Users can read data from workspaces they are members of
2. **INSERT**: Users can create data in workspaces where they are editors/admins/owners
3. **UPDATE**: Users can update data they created or in workspaces where they are admins/owners
4. **DELETE**: Usually restricted to creators and admins/owners
5. **Service Role**: Bypass RLS for backend operations

### Special RLS Cases

- **Custom Reports**: Can be public or shared with specific users
- **Competitor Profiles**: Members can view, editors+ can manage
- **Alert Notifications**: All members can update (for acknowledgement)

## Indexes

### Index Strategy

1. **Foreign Keys**: All foreign keys are indexed
2. **Workspace Isolation**: All `workspace_id` columns indexed
3. **Time Series**: Date/timestamp columns indexed with DESC for recent-first queries
4. **Composite Indexes**: Multi-column indexes for common query patterns
5. **Partial Indexes**: Filtered indexes for common WHERE conditions (e.g., `is_active = true`)

### Index Examples

```sql
-- Workspace isolation
CREATE INDEX idx_viral_predictions_workspace ON viral_score_predictions(workspace_id);

-- Time series (recent first)
CREATE INDEX idx_viral_predictions_created ON viral_score_predictions(created_at DESC);

-- Partial index for active records
CREATE INDEX idx_custom_reports_active ON custom_reports(is_active) WHERE is_active = true;

-- Composite index for common queries
CREATE INDEX idx_optimal_times_day_hour ON optimal_posting_times(day_of_week, hour_of_day);
```

## Functions

### `update_updated_at()`

Trigger function that automatically updates the `updated_at` timestamp on row updates.

### `refresh_analytics_materialized_views()`

Refreshes all analytics materialized views. Should be called:
- After bulk data imports
- On a schedule (e.g., every hour)
- After significant analytics updates

**Usage:**
```sql
SELECT public.refresh_analytics_materialized_views();
```

## Triggers

All tables with `updated_at` columns have triggers:
- `set_updated_at_viral_predictions`
- `set_updated_at_optimal_times`
- `set_updated_at_competitor_profiles`
- `set_updated_at_custom_reports`
- `set_updated_at_report_schedules`
- `set_updated_at_performance_alerts`
- `set_updated_at_alert_notifications`

## Usage Examples

### Predictive Analytics Flow

```sql
-- 1. Create prediction for draft content
INSERT INTO viral_score_predictions (
  workspace_id,
  content_id,
  platform,
  predicted_score,
  confidence_score,
  model_version,
  prediction_factors
) VALUES (
  'workspace-uuid',
  'content-uuid',
  'instagram',
  78.5,
  85.2,
  'v2.1.0',
  '{"hashtags": 10, "optimal_time": true, "image_quality": 0.9}'
);

-- 2. After publishing, track accuracy
INSERT INTO prediction_accuracy (
  workspace_id,
  prediction_id,
  post_id,
  predicted_score,
  actual_score,
  actual_views,
  actual_likes,
  hours_since_publish
) VALUES (
  'workspace-uuid',
  'prediction-uuid',
  'post-uuid',
  78.5,
  82.3,
  15420,
  1234,
  24
);

-- 3. Query prediction performance
SELECT 
  AVG(accuracy_percentage) as model_accuracy,
  COUNT(*) as predictions_evaluated
FROM prediction_accuracy
WHERE workspace_id = 'workspace-uuid'
  AND created_at >= NOW() - INTERVAL '30 days';
```

### Optimal Posting Time Analysis

```sql
-- Get best times for Instagram this week
SELECT 
  CASE day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  LPAD(hour_of_day::text, 2, '0') || ':00' as time_slot,
  optimization_score,
  avg_engagement_rate,
  sample_size
FROM optimal_posting_times
WHERE workspace_id = 'workspace-uuid'
  AND platform = 'instagram'
  AND optimization_score > 70
ORDER BY optimization_score DESC
LIMIT 10;
```

### Competitor Benchmarking

```sql
-- Compare performance to competitors
WITH user_metrics AS (
  SELECT 
    AVG(engagement_rate) as user_engagement,
    COUNT(*) as user_posts
  FROM analytics a
  JOIN published_posts pp ON a.post_id = pp.id
  JOIN content c ON pp.content_id = c.id
  WHERE c.workspace_id = 'workspace-uuid'
    AND pp.platform = 'instagram'
    AND pp.published_at >= NOW() - INTERVAL '30 days'
),
competitor_metrics AS (
  SELECT 
    AVG(avg_engagement_rate) as competitor_engagement,
    AVG(posts_per_week * 4.3) as avg_competitor_posts
  FROM competitor_metrics cm
  JOIN competitor_profiles cp ON cm.competitor_id = cp.id
  WHERE cp.workspace_id = 'workspace-uuid'
    AND cp.platform = 'instagram'
    AND cm.recorded_date >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  u.user_engagement,
  c.competitor_engagement,
  u.user_posts,
  c.avg_competitor_posts,
  CASE 
    WHEN u.user_engagement > c.competitor_engagement 
    THEN 'Above Average'
    ELSE 'Below Average'
  END as performance
FROM user_metrics u, competitor_metrics c;
```

### Custom Report with Scheduling

```sql
-- Create custom report
INSERT INTO custom_reports (
  workspace_id,
  created_by,
  name,
  description,
  report_type,
  query_config,
  metrics,
  dimensions
) VALUES (
  'workspace-uuid',
  'user-uuid',
  'Weekly Performance Report',
  'Engagement metrics by platform',
  'performance',
  '{
    "date_range": "last_7_days",
    "group_by": ["platform"],
    "filters": {"status": "published"}
  }',
  ARRAY['views', 'likes', 'engagement_rate'],
  ARRAY['platform', 'date']
) RETURNING id;

-- Schedule the report
INSERT INTO report_schedules (
  workspace_id,
  report_id,
  created_by,
  schedule_name,
  cron_expression,
  timezone,
  delivery_method,
  recipients,
  export_format
) VALUES (
  'workspace-uuid',
  'report-uuid',
  'user-uuid',
  'Weekly Email Report',
  '0 9 * * 1', -- Every Monday at 9 AM
  'America/New_York',
  'email',
  ARRAY['user@example.com'],
  'pdf'
);
```

### Performance Alerts

```sql
-- Create engagement rate alert
INSERT INTO performance_alerts (
  workspace_id,
  created_by,
  alert_name,
  description,
  alert_type,
  metric,
  condition_operator,
  threshold_value,
  platform,
  notification_channels,
  severity
) VALUES (
  'workspace-uuid',
  'user-uuid',
  'Low Engagement Alert',
  'Alert when engagement rate drops below 2%',
  'threshold',
  'engagement_rate',
  'lt',
  2.0,
  'instagram',
  ARRAY['email', 'in_app'],
  'warning'
);

-- Query recent alerts
SELECT 
  pa.alert_name,
  an.alert_message,
  an.current_value,
  an.triggered_at,
  an.status
FROM alert_notifications an
JOIN performance_alerts pa ON an.alert_id = pa.id
WHERE an.workspace_id = 'workspace-uuid'
  AND an.triggered_at >= NOW() - INTERVAL '7 days'
ORDER BY an.triggered_at DESC;
```

## Maintenance

### Materialized View Refresh

Schedule this function to run periodically (e.g., hourly):

```sql
SELECT public.refresh_analytics_materialized_views();
```

Or set up a cron job in Supabase:

```sql
SELECT cron.schedule(
  'refresh-analytics-views',
  '0 * * * *', -- Every hour
  $$ SELECT public.refresh_analytics_materialized_views(); $$
);
```

### Data Retention

Consider implementing data retention policies:

```sql
-- Archive old engagement_by_time records (older than 1 year)
DELETE FROM engagement_by_time
WHERE recorded_at < NOW() - INTERVAL '1 year';

-- Archive old competitor_metrics (older than 2 years)
DELETE FROM competitor_metrics
WHERE created_at < NOW() - INTERVAL '2 years';

-- Archive old report_executions (older than 6 months)
DELETE FROM report_executions
WHERE created_at < NOW() - INTERVAL '6 months'
  AND status = 'completed';
```

### Performance Monitoring

Monitor slow queries and add indexes as needed:

```sql
-- Find slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%viral_score_predictions%'
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

## Migration Rollback

If you need to rollback this migration, see the commented rollback commands at the end of the migration file. Execute them in the specified order to safely remove all objects.

## Security Considerations

1. **Service Role Key**: Never expose `service_role` key to clients
2. **RLS Policies**: Always test RLS policies thoroughly
3. **JSONB Validation**: Consider adding CHECK constraints on JSONB columns
4. **Sensitive Data**: Competitor data may be sensitive - ensure proper access control
5. **Rate Limiting**: Consider rate limiting on report generation and alert triggers

## Performance Tips

1. Use materialized views for dashboard queries
2. Leverage partial indexes for filtered queries
3. Use `EXPLAIN ANALYZE` to optimize slow queries
4. Consider partitioning large tables by date if they grow very large
5. Archive old data to keep tables lean

## Future Enhancements

Potential additions for future versions:

- [ ] Partitioning for time-series tables (engagement_by_time, etc.)
- [ ] Sentiment analysis table for comment/caption analysis
- [ ] Content recommendation engine tables
- [ ] A/B testing framework tables
- [ ] Social listening and mention tracking
- [ ] Influencer collaboration tracking
- [ ] Content calendar integration
- [ ] Budget and campaign tracking
- [ ] Team collaboration features
- [ ] API usage and rate limit tracking

## Support

For questions or issues with this schema:
1. Check the migration file comments
2. Review existing RLS policies
3. Test queries in a development environment
4. Consult Supabase documentation for PostgreSQL features
