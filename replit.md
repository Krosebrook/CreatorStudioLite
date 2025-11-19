# Amplify Creator Platform

## Overview

Amplify is a production-ready, all-in-one creator platform for content creation, multi-platform publishing, and monetization. Built with React, TypeScript, Vite, and Supabase, it enables creators to manage content across Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube, and Pinterest from a single dashboard. The platform features AI-powered content generation, comprehensive analytics, team collaboration with role-based access control, Stripe payment integration, and automated workflow management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite
- **Build Tool**: Vite 7.2.2 with production optimizations (Terser minification, code splitting)
- **Styling**: Tailwind CSS with custom design system tokens in `/src/design-system/`
- **State Management**: React Context API for authentication and global state
- **Routing**: Component-based navigation without external router library
- **Type Safety**: Strict TypeScript with comprehensive type definitions in `/src/types/`

**Component Architecture**:
- Domain-driven design with components organized by feature (Analytics, Auth, Connectors, Admin)
- Custom design system with reusable components (Button, Card, Input, Select, TextArea)
- Responsive layouts with mobile-first approach (breakpoints defined in design tokens)
- Accessibility-focused with WCAG AAA compliance targets

**Code Splitting Strategy**:
- `react-vendor`: Core React libraries
- `supabase`: Supabase client
- `icons`: Lucide React and Heroicons
- Manual chunks for enterprise features to optimize caching

### Backend Architecture

**Database**: Supabase (PostgreSQL with Row Level Security)
- Real-time subscriptions via Supabase channels
- RLS policies enforce data access control
- Database schema includes: user_profiles, workspaces, workspace_members, connectors, projects, content, media, published_posts, analytics, schedules, audit_logs

**Authentication**: Supabase Auth with session management
- Email/password authentication
- Automatic token refresh
- User profile sync on auth events
- Session persistence across reloads

**API Layer**: Type-safe API client abstraction (`/src/api/`)
- Centralized client in `client.ts` with query/mutation methods
- Domain-specific APIs: `ai.api.ts`, `content.api.ts`, `analytics.api.ts`, `workspace.api.ts`
- Error handling with custom error classes (`/src/utils/errors.ts`)

### Data Architecture

**Type System**: Comprehensive TypeScript types organized by domain
- `common.types.ts`: Shared types (UUID, Timestamp, Platform, Status)
- `ai.types.ts`: AI content generation (ContentIdea, Caption, Hashtag, ViralPrediction)
- `content.types.ts`: Content management (Content, MediaFile, PublishingSchedule)
- `analytics.types.ts`: Performance metrics (ContentAnalytics, RevenueInsight)
- `user.types.ts`: User management (User, UserProfile, Subscription)
- `workspace.types.ts`: Team collaboration (Workspace, WorkspaceMember)

**Data Flow**:
1. React hooks (`/src/hooks/`) abstract async operations
2. API layer communicates with Supabase
3. Services layer handles business logic (connectors, workflows, analytics)
4. Context providers manage global state

### Authentication & Authorization

**Authentication Flow**:
- Supabase Auth handles user authentication
- AuthContext (`/src/contexts/AuthContext.tsx`) provides auth state to components
- Session tokens stored securely by Supabase client
- Automatic profile creation in `user_profiles` table on signup

**Authorization**: Role-Based Access Control (RBAC)
- Roles: Owner, Admin, Editor, Contributor, Viewer
- 21 granular permissions across content, connectors, analytics, settings, team, billing
- Scopes: Global, Workspace, Project, Content
- PolicyEngine (`/src/rbac/PolicyEngine.ts`) evaluates permissions with custom rules
- Context-aware policy evaluation with role expiration handling

### Platform Connectors

**Connector Architecture**:
- `BaseConnector`: Abstract class with credential validation, health checks, token refresh, rate limiting
- `SocialConnector`: Specialized for social media platforms with post/upload/metrics capabilities
- `ConnectorRegistry`: Singleton registry managing connector instances
- Platform-specific connectors in `/src/connectors/social/`: YouTube, TikTok, Instagram, LinkedIn, Pinterest

**OAuth Flow**:
1. Platform-specific OAuth 2.0 authentication
2. Credentials stored securely in `connectors` table
3. Automatic token refresh when nearing expiration
4. Rate limit tracking with quota monitoring

**Capabilities**:
- Content publishing across platforms
- Media upload handling
- Metrics fetching (views, likes, comments, engagement)
- Account verification and health checks

### Workflow System

**Job Queue** (`/src/workflows/queue/JobQueue.ts`):
- Priority-based queue (Low, Normal, High, Urgent)
- Concurrent processing (max 5 jobs)
- Automatic retry with exponential backoff (up to 3 attempts)
- Job types: upload_media, post_content, schedule_content, fetch_metrics, sync_platform, process_media, delete_content

**Job Handlers**:
- `PostContentJobHandler`: Multi-platform content publishing
- `FetchMetricsJobHandler`: Analytics data collection
- Scheduled job execution with timezone support
- Success/failure callbacks for custom handling

### Analytics & Monitoring

**Analytics Aggregation** (`/src/services/analytics/`):
- Real-time metrics visualization
- Platform comparison and breakdown
- Content performance ranking
- Time-based filtering (7d, 30d, 90d)
- Metric aggregation by period (day/week/month)
- Export functionality (CSV/JSON)

**Audit Logging**:
- All system activities tracked for compliance
- User actions, content changes, connector events logged
- Workspace-level audit trail

**Usage Tracking**:
- Storage usage monitoring
- API quota tracking
- Subscription limits enforcement

### Error Handling & Logging

**Error System** (`/src/utils/errors.ts`):
- Custom error classes with error codes (Authentication, Authorization, Validation, NotFound, etc.)
- Operational vs programming error distinction
- Context-aware error logging
- Error boundaries for graceful React error handling

**Logging** (`/src/utils/logger.ts`):
- Structured logging with levels (DEBUG, INFO, WARN, ERROR)
- Context injection (userId, requestId)
- Log retention with circular buffer (1000 entries)
- Environment-aware log levels (DEBUG in dev, INFO in prod)

### Configuration Management

**Environment Configuration** (`/src/config/`):
- Zod schema validation for environment variables
- Type-safe config access via singleton pattern
- Validation on startup prevents invalid configuration
- Production config in `production.ts` with feature flags, security settings, limits

**Constants** (`/src/config/constants.ts`):
- Platform rate limits (YouTube: 10k/day, Instagram: 200/hr, TikTok: 1k/day)
- Job queue configuration (max concurrent, retry attempts, timeouts)
- Connector health check intervals

## External Dependencies

### Third-Party Services

**Supabase** (Database & Authentication):
- PostgreSQL database with real-time capabilities
- Row Level Security for data access control
- Built-in authentication with session management
- Required environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Stripe** (Payment Processing - Optional):
- Subscription management
- Revenue tracking integration
- Webhook handlers in `/api/webhooks/stripe-webhook.ts`
- Environment variable: `VITE_STRIPE_PUBLISHABLE_KEY`

### Social Platform APIs

**YouTube** (Video Platform):
- OAuth 2.0 authentication
- API quota: 10,000 requests/day
- Environment variables: `VITE_YOUTUBE_CLIENT_ID`, `VITE_YOUTUBE_CLIENT_SECRET`

**Instagram** (Meta Business API):
- Graph API integration
- Rate limit: 200 requests/hour
- Environment variables: `VITE_INSTAGRAM_CLIENT_ID`, `VITE_INSTAGRAM_CLIENT_SECRET`

**TikTok** (Content API):
- OAuth authentication
- Rate limit: 1,000 requests/day
- Environment variables: `VITE_TIKTOK_CLIENT_KEY`, `VITE_TIKTOK_CLIENT_SECRET`

**LinkedIn** (Marketing API):
- OAuth 2.0 flow
- Environment variables: `VITE_LINKEDIN_CLIENT_ID`, `VITE_LINKEDIN_CLIENT_SECRET`

**Pinterest** (API):
- OAuth integration
- Environment variables: `VITE_PINTEREST_CLIENT_ID`, `VITE_PINTEREST_CLIENT_SECRET`

### AI Services (Optional)

**OpenAI** (Content Generation):
- GPT models for caption/hashtag generation
- Environment variable: `VITE_OPENAI_API_KEY`

**Anthropic** (Claude AI):
- Alternative AI provider
- Environment variable: `VITE_ANTHROPIC_API_KEY`

### Infrastructure

**AWS S3** (Media Storage - Optional):
- Media file storage
- Environment variables: `VITE_AWS_S3_BUCKET`, `VITE_AWS_REGION`

### NPM Packages

**Core Dependencies**:
- `react@18.3.1`, `react-dom@18.3.1`: UI framework
- `@supabase/supabase-js@2.56.1`: Database client
- `zod@4.1.12`: Runtime type validation
- `lucide-react@0.344.0`, `@heroicons/react@2.2.0`: Icon libraries
- `tailwind-merge@3.3.1`, `clsx@2.1.1`: Utility functions

**Development Dependencies**:
- `vite@7.2.2`: Build tool
- `typescript@5.5.3`: Type checking
- `eslint@9.9.1`: Code linting
- `tailwindcss@3.4.1`: CSS framework
- `terser@5.44.1`: Production minification

### Security & Compliance

**Security Measures**:
- CSP headers configured in nginx
- HTTPS enforcement
- XSS protection
- Frame options (DENY)
- Environment variable validation on startup
- CodeQL security scanning in CI/CD

**Deployment**:
- Docker support with multi-stage builds
- Docker Compose for local development
- Nginx configuration with security headers
- Health check endpoints (`/scripts/health-check.ts`)
- Smoke tests for critical flows