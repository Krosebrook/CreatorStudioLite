# Monitoring and Observability Guide

This guide provides instructions for setting up monitoring, logging, and observability for the Amplify Creator Platform.

## Table of Contents

- [Overview](#overview)
- [Logging](#logging)
- [Error Tracking](#error-tracking)
- [Performance Monitoring](#performance-monitoring)
- [Infrastructure Monitoring](#infrastructure-monitoring)
- [Alerting](#alerting)
- [Dashboards](#dashboards)

## Overview

A production-ready application requires comprehensive monitoring to:
- Track application health and performance
- Detect and diagnose issues quickly
- Understand user behavior and experience
- Plan for capacity and scaling

## Logging

### Application Logs

The application uses a centralized logging system. Configure log levels in your environment:

```env
VITE_LOG_LEVEL=info  # debug, info, warn, error
VITE_LOG_TO_CONSOLE=true
```

### Log Structure

All logs follow a structured format:

```json
{
  "timestamp": "2024-12-15T10:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": {
    "userId": "user_123",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Supabase Logs

Access Supabase logs through the dashboard:
1. Navigate to https://app.supabase.com
2. Select your project
3. Go to "Logs Explorer"

**Key Log Types:**
- **API Logs**: HTTP requests to your database
- **Auth Logs**: Authentication events
- **Storage Logs**: File upload/download events
- **Realtime Logs**: Websocket connections

### Log Aggregation

#### Option 1: Cloudwatch Logs (AWS)

```bash
# Install AWS CLI
aws configure

# Create log group
aws logs create-log-group --log-group-name /amplify-creator-platform/production

# Stream logs
aws logs tail /amplify-creator-platform/production --follow
```

#### Option 2: Google Cloud Logging

```bash
# Install gcloud CLI
gcloud init

# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

#### Option 3: ELK Stack (Self-hosted)

Deploy Elasticsearch, Logstash, and Kibana for centralized logging:

```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
  
  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
  
  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## Error Tracking

### Sentry Integration

1. **Install Sentry**:
   ```bash
   npm install @sentry/react @sentry/vite-plugin
   ```

2. **Configure Sentry**:
   ```typescript
   // src/lib/sentry.ts
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay()
     ],
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```

3. **Add to main.tsx**:
   ```typescript
   import './lib/sentry';
   ```

4. **Set environment variables**:
   ```env
   VITE_SENTRY_DSN=https://...@sentry.io/...
   VITE_SENTRY_ENVIRONMENT=production
   ```

### Error Boundaries

Implement error boundaries to catch React errors:

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    return this.props.children;
  }
}

export default Sentry.withErrorBoundary(ErrorBoundary);
```

## Performance Monitoring

### Web Vitals

Track Core Web Vitals for user experience:

```typescript
// src/lib/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics provider
  console.log(metric);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### Lighthouse CI

Automate Lighthouse audits:

1. **Install Lighthouse CI**:
   ```bash
   npm install -g @lhci/cli
   ```

2. **Create configuration**:
   ```json
   // lighthouserc.json
   {
     "ci": {
       "collect": {
         "startServerCommand": "npm run preview",
         "url": ["http://localhost:4173"]
       },
       "assert": {
         "assertions": {
           "categories:performance": ["warn", {"minScore": 0.9}],
           "categories:accessibility": ["error", {"minScore": 0.9}],
           "categories:best-practices": ["warn", {"minScore": 0.9}],
           "categories:seo": ["warn", {"minScore": 0.9}]
         }
       }
     }
   }
   ```

3. **Run audits**:
   ```bash
   npm run build
   lhci autorun
   ```

### Real User Monitoring (RUM)

#### Google Analytics 4

```typescript
// src/lib/analytics.ts
import ReactGA from 'react-ga4';

ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
```

#### LogRocket

```bash
npm install logrocket
```

```typescript
import LogRocket from 'logrocket';

if (import.meta.env.PROD) {
  LogRocket.init('your-app-id');
  
  // Identify users
  LogRocket.identify('user_123', {
    name: 'John Doe',
    email: 'john@example.com',
  });
}
```

## Infrastructure Monitoring

### Uptime Monitoring

#### UptimeRobot

1. Sign up at https://uptimerobot.com
2. Add monitors for:
   - Main application URL
   - API endpoints
   - Database health check
   - Supabase status

#### Pingdom

1. Sign up at https://www.pingdom.com
2. Configure uptime checks
3. Set up alert contacts
4. Monitor from multiple locations

### Server Monitoring

#### Option 1: Datadog

```bash
# Install Datadog agent
DD_API_KEY=<your-key> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# Configure agent
sudo vi /etc/datadog-agent/datadog.yaml

# Start agent
sudo systemctl start datadog-agent
```

#### Option 2: New Relic

```bash
# Install New Relic agent
npm install newrelic

# Create configuration
cp node_modules/newrelic/newrelic.js .
```

#### Option 3: Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Database Monitoring

Monitor Supabase performance:

1. **Supabase Dashboard**:
   - Database size
   - Active connections
   - Query performance
   - Storage usage

2. **Custom Metrics**:
   ```typescript
   // Track slow queries
   const { data, error, duration } = await supabase
     .from('content')
     .select('*');
   
   if (duration > 1000) {
     console.warn(`Slow query: ${duration}ms`);
   }
   ```

## Alerting

### Slack Integration

```typescript
// src/lib/alerts.ts
const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL;

export async function sendSlackAlert(message: string) {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}

// Usage
try {
  // ... code that might fail
} catch (error) {
  await sendSlackAlert(`🚨 Error in production: ${error.message}`);
  throw error;
}
```

### PagerDuty Integration

For critical alerts:

```typescript
const PAGERDUTY_API_KEY = import.meta.env.VITE_PAGERDUTY_API_KEY;

async function triggerPagerDutyAlert(severity: string, summary: string) {
  await fetch('https://api.pagerduty.com/incidents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token token=${PAGERDUTY_API_KEY}`,
      'From': 'alerts@yourapp.com',
    },
    body: JSON.stringify({
      incident: {
        type: 'incident',
        title: summary,
        urgency: severity,
      },
    }),
  });
}
```

### Alert Rules

Set up alerts for:

1. **Application Errors**:
   - Error rate > 1% for 5 minutes
   - Any critical error

2. **Performance**:
   - Response time > 3s for 5 minutes
   - Core Web Vitals below threshold

3. **Infrastructure**:
   - CPU usage > 80% for 10 minutes
   - Memory usage > 90% for 5 minutes
   - Disk usage > 90%

4. **Business Metrics**:
   - Failed payments
   - Failed content publications
   - High rate of user signups (potential spam)

## Dashboards

### Grafana Dashboard

Example dashboard configuration:

```json
{
  "dashboard": {
    "title": "Amplify Creator Platform",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_errors[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      }
    ]
  }
}
```

### Key Metrics to Monitor

#### Application Metrics
- Request rate (requests/second)
- Error rate (%)
- Response time (ms) - p50, p95, p99
- Active users
- Content published count
- Failed publications

#### Infrastructure Metrics
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O
- Database connections

#### Business Metrics
- New user signups
- Active subscriptions
- Revenue (MRR)
- Content creation rate
- Platform engagement

#### User Experience Metrics
- Page load time
- Time to interactive
- First contentful paint
- Largest contentful paint
- Cumulative layout shift

## Health Checks

Implement health check endpoints:

```typescript
// api/health.ts
export async function healthCheck() {
  const checks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    cache: await checkCache(),
  };

  const healthy = Object.values(checks).every(c => c.status === 'ok');

  return {
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
}

async function checkDatabase() {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    
    return { status: error ? 'error' : 'ok' };
  } catch {
    return { status: 'error' };
  }
}
```

## Monitoring Checklist

Before going to production:

- [ ] Set up error tracking (Sentry)
- [ ] Configure application logging
- [ ] Set up uptime monitoring
- [ ] Create monitoring dashboards
- [ ] Configure alerting rules
- [ ] Test alert notifications
- [ ] Document on-call procedures
- [ ] Set up log retention policies
- [ ] Configure backup monitoring
- [ ] Test disaster recovery procedures

## Best Practices

1. **Log Responsibly**:
   - Never log sensitive data (passwords, tokens)
   - Use appropriate log levels
   - Include context for debugging
   - Implement log rotation

2. **Monitor Proactively**:
   - Set up alerts before issues occur
   - Monitor trends, not just current state
   - Review dashboards regularly
   - Conduct post-mortems for incidents

3. **Optimize Costs**:
   - Use log sampling for high-volume logs
   - Set appropriate retention periods
   - Use tiered storage for old logs
   - Monitor monitoring costs

4. **Security**:
   - Protect monitoring endpoints
   - Use secure channels for alerts
   - Regularly review access logs
   - Audit monitoring permissions

## Support

For monitoring setup assistance:
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Check [SECURITY.md](SECURITY.md) for security guidelines
- See [README.md](README.md) for general setup

---

**Last Updated**: 2025
**Version**: 1.0.0
