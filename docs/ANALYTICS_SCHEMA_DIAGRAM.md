# Advanced Analytics Database Schema Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ADVANCED ANALYTICS SCHEMA                            │
│                                                                          │
│  Core Tables: 15 | Views: 4 | Materialized Views: 3 | Enums: 5         │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        PREDICTIVE ANALYTICS                             │
└────────────────────────────────────────────────────────────────────────┘

    workspaces                content               published_posts
         │                       │                         │
         │                       │                         │
         └───────────┬───────────┴──────────┬──────────────┘
                     │                      │
                     ▼                      ▼
         ┌─────────────────────┐  ┌─────────────────────┐
         │ viral_score_        │  │ prediction_         │
         │ predictions         │──│ accuracy            │
         │                     │  │                     │
         │ • predicted_score   │  │ • predicted_score   │
         │ • confidence_score  │  │ • actual_score      │
         │ • prediction_factors│  │ • accuracy_%        │
         │ • model_version     │  │ • actual_metrics    │
         └─────────────────────┘  └─────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                     OPTIMAL POSTING TIMES                               │
└────────────────────────────────────────────────────────────────────────┘

    workspaces                  connectors
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌─────────────────────┐         ┌─────────────────────┐
         │ optimal_posting_    │         │ engagement_by_      │
         │ times               │◄────────│ time                │
         │                     │         │                     │
         │ • day_of_week (0-6) │         │ • day_of_week       │
         │ • hour_of_day (0-23)│         │ • hour_of_day       │
         │ • optimization_score│         │ • engagement_rate   │
         │ • avg_engagement    │         │ • engagement_velocity│
         └─────────────────────┘         └─────────────────────┘
                                                   ▲
                                                   │
                                          published_posts

┌────────────────────────────────────────────────────────────────────────┐
│                    AUDIENCE INSIGHTS                                    │
└────────────────────────────────────────────────────────────────────────┘

    workspaces                  connectors
         │                           │
         └───────────┬───────────────┴───────────────┐
                     │                               │
                     ▼                               ▼
         ┌─────────────────────┐         ┌─────────────────────┐
         │ audience_           │         │ audience_           │
         │ demographics        │         │ interests           │
         │                     │         │                     │
         │ • age_ranges (JSONB)│         │ • interest_category │
         │ • gender_dist (JSON)│         │ • affinity_score    │
         │ • top_countries     │         │ • audience_%        │
         │ • total_followers   │         │ • engagement_rate   │
         └─────────────────────┘         └─────────────────────┘
                     │
                     │
                     ▼
         ┌─────────────────────┐
         │ audience_growth     │
         │                     │
         │ • follower_count    │
         │ • follower_change   │
         │ • growth_rate       │
         │ • retention_rate    │
         └─────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                   COMPETITOR BENCHMARKING                               │
└────────────────────────────────────────────────────────────────────────┘

    workspaces
         │
         ├───────────┬────────────────────────┐
         │           │                        │
         ▼           ▼                        ▼
┌──────────────┐  ┌──────────────┐   ┌──────────────┐
│ competitor_  │  │ competitor_  │   │ benchmark_   │
│ profiles     │──│ metrics      │   │ comparisons  │
│              │  │              │   │              │
│ • name       │  │ • followers  │   │ • user_*     │
│ • platform   │  │ • engagement │   │ • industry_* │
│ • handle     │  │ • posts/week │   │ • competitor*│
│ • is_active  │  │ • recorded_  │   │ • percentiles│
└──────────────┘  │   date       │   └──────────────┘
                  └──────────────┘            │
                                              ▼
                                         connectors

┌────────────────────────────────────────────────────────────────────────┐
│                      CUSTOM REPORTS                                     │
└────────────────────────────────────────────────────────────────────────┘

    workspaces           user_profiles
         │                     │
         └─────────┬───────────┴────────────┐
                   │                        │
                   ▼                        ▼
         ┌─────────────────┐      ┌─────────────────┐
         │ custom_reports  │      │ report_         │
         │                 │──────│ schedules       │
         │ • name          │      │                 │
         │ • report_type   │      │ • cron_expr     │
         │ • query_config  │      │ • delivery_     │
         │ • metrics[]     │      │   method        │
         │ • dimensions[]  │      │ • recipients[]  │
         │ • is_public     │      │ • next_run_at   │
         └─────────────────┘      └─────────────────┘
                   │                        │
                   └─────────┬──────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │ report_         │
                   │ executions      │
                   │                 │
                   │ • status        │
                   │ • output_url    │
                   │ • duration_ms   │
                   │ • error_message │
                   └─────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE ALERTS                                   │
└────────────────────────────────────────────────────────────────────────┘

    workspaces                  user_profiles
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │ performance_alerts  │
         │                     │
         │ • alert_name        │
         │ • alert_type        │
         │ • metric            │
         │ • condition_op      │
         │ • threshold_value   │
         │ • notification_ch[] │
         │ • severity          │
         └─────────────────────┘
                     │
                     │ triggers
                     ▼
         ┌─────────────────────┐
         │ alert_notifications │
         │                     │
         │ • triggered_at      │
         │ • status            │
         │ • current_value     │
         │ • alert_message     │
         │ • acknowledged_by   │
         │ • resolved_at       │
         └─────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                           VIEWS                                         │
└────────────────────────────────────────────────────────────────────────┘

Standard Views:
┌─────────────────────────┐  ┌─────────────────────────┐
│ engagement_summary_     │  │ engagement_summary_     │
│ by_hour                 │  │ by_day                  │
│                         │  │                         │
│ Aggregates by hour of   │  │ Aggregates by day of    │
│ day across platforms    │  │ week across platforms   │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ audience_demographics_  │  │ competitor_benchmark_   │
│ latest                  │  │ summary                 │
│                         │  │                         │
│ Latest demo snapshot    │  │ Current competitor      │
│ per connector/platform  │  │ status with metrics     │
└─────────────────────────┘  └─────────────────────────┘

Materialized Views (for performance):
┌─────────────────────────┐  ┌─────────────────────────┐
│ analytics_aggregated_   │  │ analytics_aggregated_   │
│ daily                   │  │ weekly                  │
│                         │  │                         │
│ Pre-aggregated daily    │  │ Pre-aggregated weekly   │
│ analytics (90 days)     │  │ analytics (1 year)      │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐
│ platform_performance_   │
│ summary                 │
│                         │
│ Platform-level summary  │
│ with percentiles        │
└─────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                          CUSTOM TYPES                                   │
└────────────────────────────────────────────────────────────────────────┘

prediction_status:          alert_severity:
┌─────────────┐            ┌─────────────┐
│ • pending   │            │ • info      │
│ • processing│            │ • warning   │
│ • completed │            │ • critical  │
│ • failed    │            └─────────────┘
└─────────────┘

alert_status:               report_status:         report_format:
┌─────────────┐            ┌─────────────┐       ┌─────────────┐
│ • active    │            │ • scheduled │       │ • pdf       │
│ • acknowledged│          │ • generating│       │ • csv       │
│ • resolved  │            │ • completed │       │ • json      │
│ • muted     │            │ • failed    │       │ • html      │
└─────────────┘            └─────────────┘       └─────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                         KEY RELATIONSHIPS                               │
└────────────────────────────────────────────────────────────────────────┘

1. workspaces → All tables (workspace isolation)
2. content → viral_score_predictions (predict before publish)
3. published_posts → viral_score_predictions (predict after publish)
4. viral_score_predictions → prediction_accuracy (track accuracy)
5. connectors → optimal_posting_times (platform-specific)
6. published_posts → engagement_by_time (granular tracking)
7. connectors → audience_demographics (platform audience)
8. connectors → audience_interests (interest data)
9. connectors → audience_growth (growth tracking)
10. competitor_profiles → competitor_metrics (daily metrics)
11. connectors → benchmark_comparisons (user vs competitors)
12. custom_reports → report_schedules (scheduled generation)
13. report_schedules → report_executions (execution history)
14. performance_alerts → alert_notifications (triggered alerts)

┌────────────────────────────────────────────────────────────────────────┐
│                      SECURITY & PERFORMANCE                             │
└────────────────────────────────────────────────────────────────────────┘

Row Level Security (RLS):
✓ All tables have workspace-based RLS policies
✓ Users can only access workspaces they're members of
✓ Role-based permissions (owner, admin, editor, viewer)
✓ Service role bypass for backend operations
✓ Force RLS enabled on all tables

Indexes:
✓ 60+ indexes for optimal query performance
✓ All foreign keys indexed
✓ workspace_id indexed on all tables
✓ Time-series columns indexed DESC for recent-first queries
✓ Composite indexes for common query patterns
✓ Partial indexes for filtered queries (is_active, status, etc.)

Triggers:
✓ Auto-update updated_at timestamps
✓ All mutable tables have update triggers

Functions:
✓ update_updated_at() - Timestamp maintenance
✓ refresh_analytics_materialized_views() - View refresh

┌────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW EXAMPLES                              │
└────────────────────────────────────────────────────────────────────────┘

1. Viral Score Prediction Flow:
   User creates content → ML model generates prediction →
   Store in viral_score_predictions → Content published →
   Track actual performance → Store in prediction_accuracy →
   Use for model training

2. Optimal Time Calculation:
   Posts published → Track in engagement_by_time →
   Analyze patterns → Calculate optimal times →
   Store in optimal_posting_times → Recommend to user

3. Competitor Tracking:
   User adds competitor → Store in competitor_profiles →
   Daily job fetches metrics → Store in competitor_metrics →
   Calculate benchmarks → Store in benchmark_comparisons →
   Display to user

4. Alert System:
   User creates alert → Store in performance_alerts →
   Monitor metrics continuously → Condition met →
   Create alert_notifications → Send notifications →
   User acknowledges → Update status

5. Custom Reports:
   User creates report → Store in custom_reports →
   User schedules delivery → Store in report_schedules →
   Cron triggers generation → Execute query →
   Store in report_executions → Deliver report

┌────────────────────────────────────────────────────────────────────────┐
│                      MAINTENANCE SCHEDULE                               │
└────────────────────────────────────────────────────────────────────────┘

Hourly:
  • Refresh materialized views
  • Check and trigger alerts

Daily:
  • Fetch competitor metrics
  • Calculate audience growth
  • Archive old alert notifications

Weekly:
  • Calculate optimal posting times
  • Generate benchmark comparisons
  • Cleanup old report executions

Monthly:
  • Analyze prediction accuracy trends
  • Update ML models
  • Archive old engagement_by_time data
  • Performance optimization review

┌────────────────────────────────────────────────────────────────────────┐
│                        STORAGE ESTIMATES                                │
└────────────────────────────────────────────────────────────────────────┘

Per Workspace (1 year estimates):
• viral_score_predictions: ~10KB per prediction × 1,000 = ~10MB
• engagement_by_time: ~2KB per record × 10,000 = ~20MB
• audience_demographics: ~5KB per snapshot × 365 = ~1.8MB
• competitor_metrics: ~1KB per record × 10 competitors × 365 = ~3.6MB
• alert_notifications: ~2KB per alert × 500 = ~1MB
• report_executions: ~2KB per execution × 1,000 = ~2MB

Total estimated per workspace per year: ~40-50MB

For 1,000 active workspaces: ~40-50GB/year (very manageable)

┌────────────────────────────────────────────────────────────────────────┐
│                           LEGEND                                        │
└────────────────────────────────────────────────────────────────────────┘

│  = One-to-one relationship
├─ = One-to-many relationship
▼  = Foreign key reference
◄─ = Data flow direction
→  = Relationship direction
[]  = Array/List field
*  = Generated/computed column
