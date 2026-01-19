# Architecture Documentation

## Overview

The Amplify Creator Platform is a modern web application built with React, TypeScript, and Supabase. It follows a modular, service-oriented architecture with clear separation of concerns.

## Table of Contents

- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Key Design Patterns](#key-design-patterns)
- [Service Layer](#service-layer)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            React Application (SPA)                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │  Components  │  │    Hooks     │  │  Contexts  │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Services   │  │   API Layer  │  │    Utils   │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS/WebSocket
┌───────────────────────┴─────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  PostgreSQL  │  │     Auth     │  │  Edge Functions │   │
│  │   Database   │  │   Service    │  │                 │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Storage    │  │   Realtime   │  │    Row Level    │   │
│  │   Buckets    │  │   Channels   │  │    Security     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST/OAuth
┌───────────────────────┴─────────────────────────────────────┐
│              External Services & APIs                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Instagram   │  │   Facebook   │  │     YouTube     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │    TikTok    │  │   LinkedIn   │  │    Pinterest    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │    Stripe    │  │   OpenAI     │  │   SendGrid      │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Directory Structure

```
src/
├── api/                    # API client layer
│   ├── client.ts          # Base API client with Result pattern
│   ├── content.api.ts     # Content management endpoints
│   ├── analytics.api.ts   # Analytics endpoints
│   ├── ai.api.ts          # AI service endpoints
│   └── workspace.api.ts   # Workspace management endpoints
│
├── components/            # React components
│   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   ├── content/          # Content-related components
│   ├── analytics/        # Analytics & reporting components
│   └── shared/           # Shared/common components
│
├── connectors/           # Social media platform connectors
│   ├── base/            # Base connector classes and registry
│   └── social/          # Platform-specific implementations
│       ├── InstagramConnector.ts
│       ├── FacebookConnector.ts
│       ├── YouTubeConnector.ts
│       └── ...
│
├── contexts/            # React contexts for global state
│   ├── AuthContext.tsx  # Authentication state
│   ├── WorkspaceContext.tsx
│   └── ThemeContext.tsx
│
├── design-system/       # UI component library
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Composite UI elements
│   └── organisms/      # Complex UI components
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useWorkspace.ts
│   ├── useContent.ts
│   └── ...
│
├── infrastructure/     # Infrastructure layer
│   ├── database/      # Database client abstractions
│   └── cache/         # Caching implementations
│
├── lib/               # External library wrappers
│   ├── supabase.ts   # Supabase client configuration
│   └── stripe.ts     # Stripe client configuration
│
├── pages/            # Page components (routes)
│   ├── Dashboard/
│   ├── Content/
│   ├── Analytics/
│   └── Settings/
│
├── rbac/             # Role-based access control
│   ├── permissions.ts
│   ├── roles.ts
│   └── guards.tsx
│
├── services/         # Business logic services
│   ├── ai/          # AI-related services
│   ├── analytics/   # Analytics services
│   ├── content/     # Content management services
│   ├── media/       # Media processing services
│   ├── payments/    # Payment services
│   └── ...
│
├── shared/          # Shared utilities and patterns
│   ├── result.ts   # Result pattern implementation
│   └── validators.ts
│
├── types/           # TypeScript type definitions
│   ├── ai.types.ts
│   ├── content.types.ts
│   ├── analytics.types.ts
│   └── ...
│
├── utils/           # Utility functions
│   ├── logger.ts   # Logging service
│   ├── errors.ts   # Error classes
│   └── ...
│
└── workflows/       # Background job workflows
    ├── queues/
    └── jobs/
```

### Component Architecture

Components follow atomic design principles:

- **Atoms**: Basic UI elements (Button, Input, Text)
- **Molecules**: Simple component combinations (SearchBar, FormField)
- **Organisms**: Complex components (DataTable, ContentCard, AnalyticsDashboard)
- **Templates**: Page layouts
- **Pages**: Complete pages with data fetching

### State Management

The application uses a hybrid state management approach:

1. **React Context**: Global application state (auth, workspace, theme)
2. **Component State**: Local UI state using `useState`
3. **Server State**: Data from APIs cached and managed by custom hooks
4. **URL State**: Route parameters and query strings for shareable state

### Data Fetching Pattern

```typescript
// Custom hook pattern for data fetching
function useContent(workspaceId: string) {
  const [data, setData] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const content = await contentApi.getContent(workspaceId);
        setData(content);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [workspaceId]);

  return { data, loading, error };
}
```

## Backend Architecture

### Database Schema

The application uses PostgreSQL through Supabase with the following main tables:

#### Core Tables

- **users**: User accounts and profiles
- **workspaces**: Multi-tenant workspace isolation
- **workspace_members**: User-workspace relationships with roles

#### Content Tables

- **content**: Content items (posts, videos, etc.)
- **publishing_schedule**: Scheduled publishing tasks
- **content_templates**: Reusable content templates
- **content_versions**: Version history for content

#### Platform Integration Tables

- **connectors**: Social media platform connections
- **platform_accounts**: Connected social media accounts
- **publishing_results**: Publishing status and results

#### Analytics Tables

- **analytics_events**: Raw analytics events
- **analytics_aggregations**: Pre-aggregated metrics
- **viral_predictions**: AI-powered viral score predictions
- **audience_insights**: Audience demographic data

#### System Tables

- **audit_logs**: System activity audit trail
- **notifications**: User notifications
- **api_keys**: API key management
- **usage_tracking**: Resource usage metrics

### Row Level Security (RLS)

All tables implement RLS policies to ensure data isolation:

```sql
-- Example: Content table RLS policy
CREATE POLICY "Users can only access content in their workspaces"
ON content
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);
```

## Data Flow

### Content Publishing Flow

```
User Action
    ↓
React Component
    ↓
Content API (content.api.ts)
    ↓
API Client (client.ts)
    ↓
Supabase Client
    ↓
PostgreSQL (with RLS)
    ↓
Edge Function (if scheduled)
    ↓
Job Queue
    ↓
Connector Service
    ↓
Platform API (Instagram, etc.)
    ↓
Publishing Result
    ↓
Analytics Event
```

### Authentication Flow

```
Login Form
    ↓
AuthContext
    ↓
Supabase Auth
    ↓
JWT Token
    ↓
Stored in localStorage
    ↓
Auto-attached to requests
    ↓
Validated by RLS
```

## Key Design Patterns

### 1. Singleton Pattern

Used for services to ensure single instance:

```typescript
export class ConnectorService {
  private static instance: ConnectorService;

  private constructor() {}

  static getInstance(): ConnectorService {
    if (!ConnectorService.instance) {
      ConnectorService.instance = new ConnectorService();
    }
    return ConnectorService.instance;
  }
}
```

### 2. Repository Pattern

API layer abstracts data access:

```typescript
class ContentApi {
  async getContent(workspaceId: string): Promise<Content[]> {
    return apiClient.query<Content>('content', {
      filters: { workspace_id: workspaceId }
    });
  }
}
```

### 3. Result Pattern

Error handling using Result type:

```typescript
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchData(): Promise<Result<Data, Error>> {
  try {
    const data = await api.fetch();
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
```

### 4. Factory Pattern

Connector registry creates platform-specific connectors:

```typescript
class ConnectorRegistry {
  register(platform: string, connector: ConnectorClass) {
    this.connectors.set(platform, connector);
  }

  create(platform: string): BaseConnector {
    const ConnectorClass = this.connectors.get(platform);
    return new ConnectorClass();
  }
}
```

### 5. Observer Pattern

React Context for state changes:

```typescript
const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  
  // Components automatically re-render when workspace changes
  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
```

## Service Layer

### Service Organization

Services are organized by domain:

- **AI Services**: Content generation, predictions, brand voice analysis
- **Analytics Services**: Metrics aggregation, insights, reporting
- **Content Services**: Content management, templates, versioning
- **Media Services**: Upload, processing, storage
- **Payment Services**: Stripe integration, subscription management
- **Connector Services**: Platform integration, OAuth management

### Service Communication

Services communicate through:

1. **Direct calls**: Synchronous operations
2. **Event emission**: Loosely coupled notifications
3. **Job queues**: Asynchronous background tasks

### Example Service Structure

```typescript
/**
 * AIContentGenerationService
 * Generates content using AI providers
 */
class AIContentGenerationService {
  private static instance: AIContentGenerationService;
  private cache: AICache;
  private usageTracker: AIUsageTracker;

  async generateContent(params: GenerationParams): Promise<GeneratedContent> {
    // Check cache
    const cached = await this.cache.get(params);
    if (cached) return cached;

    // Generate using AI
    const content = await this.callAI(params);

    // Track usage
    await this.usageTracker.track(params.userId, content.tokens);

    // Cache result
    await this.cache.set(params, content);

    return content;
  }
}
```

## Security Architecture

### Authentication

- **Supabase Auth**: JWT-based authentication
- **Session Management**: Automatic token refresh
- **Password Policy**: Enforced strong passwords
- **MFA Support**: Optional two-factor authentication

### Authorization

- **RBAC**: Role-based access control (Admin, Editor, Viewer)
- **Workspace Isolation**: Multi-tenant data separation
- **RLS Policies**: Database-level security
- **Permission Checks**: Service-level authorization

### Data Protection

- **Encryption at Rest**: Database and storage encryption
- **Encryption in Transit**: TLS 1.3 for all connections
- **Secrets Management**: Environment variables, no hardcoded secrets
- **API Key Rotation**: Automatic key rotation support

### Security Best Practices

1. **Input Validation**: Zod schemas validate all inputs
2. **Output Encoding**: XSS prevention through React's escaping
3. **CSRF Protection**: Token-based protection
4. **Rate Limiting**: API rate limits per user/workspace
5. **Audit Logging**: All sensitive operations logged
6. **Dependency Scanning**: Regular `npm audit` checks

## Scalability Considerations

### Database Optimization

- **Indexes**: Strategic indexes on frequently queried columns
- **Partitioning**: Time-based partitioning for analytics tables
- **Connection Pooling**: Supabase handles connection pooling
- **Query Optimization**: Efficient queries with proper joins

### Caching Strategy

- **Browser Cache**: Static assets cached with long TTLs
- **API Response Cache**: Short-lived caching for expensive queries
- **CDN**: Static content served through CDN
- **Service Worker**: PWA capabilities for offline access

### Performance Optimization

- **Code Splitting**: Lazy loading of routes and components
- **Bundle Optimization**: Tree shaking, minification
- **Image Optimization**: WebP format, lazy loading, responsive images
- **Database Query Optimization**: Efficient queries, proper indexing

### Horizontal Scaling

The architecture supports horizontal scaling:

- **Stateless Frontend**: Can be deployed across multiple instances
- **Managed Backend**: Supabase handles backend scaling
- **Job Queue**: Distributed job processing
- **CDN**: Global content distribution

### Monitoring & Observability

- **Application Logs**: Structured logging with context
- **Error Tracking**: Centralized error reporting
- **Performance Metrics**: Core Web Vitals tracking
- **Usage Analytics**: Feature usage and adoption tracking

## Technology Stack

### Frontend

- **React 18**: UI framework with concurrent rendering
- **TypeScript 5**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Zod**: Runtime type validation

### Backend

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication service
  - Storage buckets
  - Edge Functions
  - Realtime subscriptions

### External Services

- **Stripe**: Payment processing
- **OpenAI**: AI content generation
- **Social Media APIs**: Platform integrations
- **SendGrid**: Email delivery

## Development Principles

1. **Type Safety**: Strict TypeScript throughout
2. **Error Handling**: Consistent error handling patterns
3. **Testing**: Comprehensive test coverage
4. **Documentation**: Code comments and API docs
5. **Code Quality**: ESLint rules enforced
6. **Performance**: Optimize for Core Web Vitals
7. **Accessibility**: WCAG 2.1 AA compliance
8. **Security**: Security-first mindset

## Future Architecture Considerations

### Planned Improvements

1. **GraphQL API**: Consider GraphQL for more flexible queries
2. **Real-time Collaboration**: Live editing with WebSockets
3. **Microservices**: Extract heavy services (AI, analytics) to separate services
4. **Event Sourcing**: For audit trail and analytics
5. **CQRS**: Separate read and write operations
6. **Service Mesh**: For complex service communication
7. **Message Queue**: RabbitMQ or AWS SQS for reliability

### Migration Paths

The current architecture supports gradual migration to:

- **Serverless Functions**: Extract services to AWS Lambda/Vercel Functions
- **Kubernetes**: Container orchestration for complex deployments
- **Multi-Region**: Geographic distribution for global users

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained By**: Engineering Team
