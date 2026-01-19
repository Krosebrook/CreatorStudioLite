# API Reference - Quick Guide

## Overview

This document provides a quick reference for the internal API structure of the Amplify Creator Platform. For external REST API documentation, see [API.md](../API.md).

## Table of Contents

- [API Client Layer](#api-client-layer)
- [Service Layer](#service-layer)
- [Type System](#type-system)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## API Client Layer

### ApiClient (`src/api/client.ts`)

Base API client that wraps database operations with both legacy (throwing) and modern (Result pattern) methods.

```typescript
import { apiClient } from '@/api';

// Modern approach (Result pattern - recommended)
const result = await apiClient.querySafe<Content>('content', { 
  filters: { workspace_id: 'workspace-123' } 
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// Legacy approach (throws on error)
try {
  const data = await apiClient.query<Content>('content', {
    filters: { workspace_id: 'workspace-123' }
  });
} catch (error) {
  console.error(error);
}
```

### ContentApi (`src/api/content.api.ts`)

Manages content items and publishing schedules.

```typescript
import { contentApi } from '@/api';

// Get content
const content = await contentApi.getContent('workspace-123');

// Create content
const newContent = await contentApi.createContent({
  workspace_id: 'workspace-123',
  title: 'My Post',
  body: 'Content...',
  status: 'draft'
});

// Schedule publishing
const schedule = await contentApi.scheduleContent({
  content_id: newContent.id,
  workspace_id: 'workspace-123',
  scheduled_time: new Date('2025-12-31T12:00:00Z'),
  platforms: ['instagram', 'facebook']
});
```

### AnalyticsApi (`src/api/analytics.api.ts`)

Handles analytics data and metrics.

```typescript
import { analyticsApi } from '@/api';

// Get content analytics
const analytics = await analyticsApi.getContentAnalytics('workspace-123', {
  platform: 'instagram',
  snapshot_date: { gte: '2025-01-01' }
});

// Get performance metrics
const metrics = await analyticsApi.getPerformanceMetrics('workspace-123', {
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

// Create analytics snapshot
await analyticsApi.createAnalyticsSnapshot({
  content_id: 'content-123',
  workspace_id: 'workspace-123',
  platform: 'instagram',
  views: 1500,
  likes: 120
});
```

### WorkspaceApi (`src/api/workspace.api.ts`)

Manages workspaces and team members.

```typescript
import { workspaceApi } from '@/api';

// Get user's workspaces
const workspaces = await workspaceApi.getWorkspaces('user-123');

// Create workspace
const workspace = await workspaceApi.createWorkspace({
  name: 'My Workspace',
  owner_id: 'user-123'
});

// Add team member
await workspaceApi.addWorkspaceMember({
  workspace_id: workspace.id,
  user_id: 'user-456',
  role: 'editor'
});
```

### AIApi (`src/api/ai.api.ts`)

Interfaces with AI services for content generation.

```typescript
import { aiApi } from '@/api';

// Generate content ideas
const ideas = await aiApi.generateContentIdeas({
  workspace_id: 'workspace-123',
  user_id: 'user-123',
  niche: 'tech',
  target_audience: { age: '25-34', interests: ['technology'] }
});

// Generate caption
const caption = await aiApi.generateCaption({
  workspace_id: 'workspace-123',
  user_id: 'user-123',
  content: 'Product launch...',
  platform: 'instagram',
  tone: 'professional'
});
```

## Service Layer

### ConnectorService (`src/services/ConnectorService.ts`)

Manages social media platform connections.

```typescript
import { connectorService } from '@/services';

// Save credentials
await connectorService.saveConnectorCredentials(
  'user-123',
  'workspace-456',
  'instagram',
  {
    accessToken: 'token...',
    refreshToken: 'refresh...',
    expiresAt: new Date('2025-12-31')
  }
);

// Get credentials
const { credentials, error } = await connectorService.getConnectorCredentials(
  'user-123',
  'workspace-456',
  'instagram'
);

// List connectors
const { connectors } = await connectorService.listWorkspaceConnectors('workspace-456');
```

### AIContentGenerationService (`src/services/ai/AIContentGenerationService.ts`)

AI-powered content generation.

```typescript
import { aiContentGenerationService } from '@/services/ai';

// Generate content ideas
const ideas = await aiContentGenerationService.generateContentIdeas({
  workspace_id: 'workspace-123',
  user_id: 'user-123',
  niche: 'fitness',
  target_audience: { demographics: {...} },
  count: 10
});

// Generate caption
const caption = await aiContentGenerationService.generateCaption({
  workspace_id: 'workspace-123',
  user_id: 'user-123',
  content: {...},
  platform: 'instagram',
  tone: 'casual'
});
```

### AdvancedAnalyticsService (`src/services/analytics/AdvancedAnalyticsService.ts`)

Advanced analytics and insights.

```typescript
import { advancedAnalyticsService } from '@/services/analytics';

// Get dashboard
const dashboard = await advancedAnalyticsService.getDashboard('workspace-123');

// Get insights
const insights = await advancedAnalyticsService.getInsights('workspace-123', {
  timeRange: '30d',
  platform: 'instagram'
});

// Get predictions
const predictions = await advancedAnalyticsService.getPredictiveAnalytics(
  'workspace-123',
  'content-123'
);
```

## Type System

### Core Types (`src/types/`)

#### Content Types

```typescript
interface Content {
  id: string;
  workspace_id: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  platforms: Platform[];
  created_at: string;
  updated_at: string;
}

interface PublishingSchedule {
  id: string;
  content_id: string;
  workspace_id: string;
  scheduled_time: string;
  platforms: Platform[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}
```

#### Analytics Types

```typescript
interface ContentAnalytics {
  id: string;
  content_id: string;
  workspace_id: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  snapshot_date: string;
}

interface PerformanceMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  growth: {
    views: number;
    likes: number;
    comments: number;
  };
}
```

#### Workspace Types

```typescript
interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  joined_at: string;
}
```

#### User Types

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Common Types

```typescript
// Result pattern for error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// Standard error format
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## Error Handling

### Error Classes

```typescript
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ConnectorError,
  ExternalAPIError
} from '@/utils/errors';

// Throw appropriate errors
if (!user) {
  throw new AuthenticationError('User not authenticated');
}

if (!hasPermission) {
  throw new AuthorizationError('Insufficient permissions');
}

if (!isValid) {
  throw new ValidationError('Invalid input', { field: 'email' });
}

// Type guard
import { isAppError } from '@/utils/errors';

try {
  await operation();
} catch (error) {
  if (isAppError(error)) {
    console.error(error.code, error.message, error.context);
  }
}
```

### Result Pattern (Recommended)

```typescript
import { isSuccess, isFailure } from '@/shared/result';

const result = await apiClient.querySafe<Content>('content', filters);

if (isSuccess(result)) {
  // Type is narrowed to { success: true; data: Content[] }
  console.log(result.data);
} else {
  // Type is narrowed to { success: false; error: DatabaseError }
  console.error(result.error);
}
```

## Best Practices

### 1. Use TypeScript Types

```typescript
// ✅ Good: Explicit types
async function getContent(id: string): Promise<Content | null> {
  return contentApi.getContentById(id);
}

// ❌ Bad: Any types
async function getContent(id: any): Promise<any> {
  return contentApi.getContentById(id);
}
```

### 2. Handle Errors Properly

```typescript
// ✅ Good: Proper error handling
try {
  const content = await contentApi.createContent(data);
  return content;
} catch (error) {
  if (isAppError(error)) {
    logger.error('Failed to create content', error, { data });
    throw error;
  }
  throw new AppError('Unexpected error', ErrorCode.INTERNAL_ERROR);
}

// ❌ Bad: Silent failures
try {
  const content = await contentApi.createContent(data);
} catch (error) {
  // Silent failure
}
```

### 3. Use Result Pattern for Complex Operations

```typescript
// ✅ Good: Result pattern
async function complexOperation(): Promise<Result<Data, Error>> {
  const step1 = await apiClient.querySafe(...);
  if (!isSuccess(step1)) {
    return step1; // Propagate error
  }
  
  const step2 = await apiClient.insertSafe(...);
  if (!isSuccess(step2)) {
    return step2; // Propagate error
  }
  
  return { success: true, data: step2.data };
}
```

### 4. Log Important Operations

```typescript
import { logger } from '@/utils/logger';

async function publishContent(contentId: string) {
  logger.info('Publishing content', { contentId });
  
  try {
    const result = await publishingService.publish(contentId);
    logger.info('Content published successfully', { contentId, result });
    return result;
  } catch (error) {
    logger.error('Failed to publish content', error as Error, { contentId });
    throw error;
  }
}
```

### 5. Use Custom Hooks for Data Fetching

```typescript
// Create custom hook
function useContent(workspaceId: string) {
  const [data, setData] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    contentApi.getContent(workspaceId)
      .then(content => {
        if (mounted) setData(content);
      })
      .catch(err => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    
    return () => { mounted = false; };
  }, [workspaceId]);

  return { data, loading, error };
}

// Use in component
function ContentList() {
  const { data, loading, error } = useContent('workspace-123');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  return <ContentGrid content={data} />;
}
```

### 6. Validate Input

```typescript
import { z } from 'zod';

// Define schema
const ContentSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  platforms: z.array(z.enum(['instagram', 'facebook', 'twitter'])),
  status: z.enum(['draft', 'scheduled', 'published'])
});

// Validate
function createContent(data: unknown) {
  const validated = ContentSchema.parse(data); // Throws on invalid
  return contentApi.createContent(validated);
}

// Safe validation
function createContentSafe(data: unknown) {
  const result = ContentSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Invalid content data', {
      errors: result.error.issues
    });
  }
  return contentApi.createContent(result.data);
}
```

### 7. Use Consistent Naming

```typescript
// API methods: CRUD operations
contentApi.getContent()      // Read
contentApi.createContent()   // Create
contentApi.updateContent()   // Update
contentApi.deleteContent()   // Delete

// Services: Domain actions
publishingService.publish()
analyticsService.trackEvent()
notificationService.send()

// Hooks: use prefix
useAuth()
useContent()
useWorkspace()
```

## Query Patterns

### Basic Query

```typescript
// Get all records
const all = await apiClient.query('content');

// With filters
const filtered = await apiClient.query('content', {
  filters: { status: 'published' }
});

// With ordering
const ordered = await apiClient.query('content', {
  orderBy: { column: 'created_at', ascending: false }
});

// With pagination
const paginated = await apiClient.query('content', {
  limit: 20,
  offset: 0
});
```

### Complex Query

```typescript
const results = await apiClient.query('content', {
  select: 'id, title, status, created_at',
  filters: {
    workspace_id: 'workspace-123',
    status: 'published',
    created_at: { gte: '2025-01-01' }
  },
  orderBy: { column: 'created_at', ascending: false },
  limit: 50
});
```

### RPC (Remote Procedure Call)

```typescript
// Call database function
const metrics = await apiClient.rpc('calculate_engagement_rate', {
  content_id: 'content-123',
  time_range: '30d'
});
```

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained By**: Engineering Team
