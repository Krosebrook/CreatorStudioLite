# Development Guide

## Overview

This guide covers everything you need to know to develop features for the Amplify Creator Platform effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Common Tasks](#common-tasks)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version
- **VS Code**: Recommended editor with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Krosebrook/CreatorStudioLite.git
cd CreatorStudioLite

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# (Get these from your Supabase project dashboard)

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### First Time Database Setup

If this is your first time, you need to set up the database:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push database migrations
supabase db push

# (Optional) Seed with test data
supabase db seed
```

## Development Environment

### Recommended VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true

# Optional: External Services
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_OPENAI_API_KEY=sk-...

# Development
VITE_LOG_LEVEL=debug
VITE_MOCK_API=false
```

### Browser Extensions

For development, install:

- **React Developer Tools**: Debug React components
- **Redux DevTools**: If using Redux (future)
- **Lighthouse**: Performance auditing

## Project Structure

### Key Directories

```
src/
├── api/              # API client layer - HTTP communication
├── components/       # React components - UI building blocks
├── connectors/       # Platform integrations - social media APIs
├── contexts/         # React contexts - global state
├── hooks/           # Custom hooks - reusable logic
├── lib/             # External libraries - configured clients
├── pages/           # Route pages - full page components
├── services/        # Business logic - domain services
├── types/           # TypeScript types - type definitions
└── utils/           # Utilities - helper functions
```

### When to Use Each Directory

| Directory | Use For | Example |
|-----------|---------|---------|
| `api/` | HTTP requests to backend | `contentApi.getContent()` |
| `components/` | Reusable UI components | `<Button />`, `<Card />` |
| `connectors/` | Platform integrations | `InstagramConnector` |
| `hooks/` | Reusable React logic | `useAuth()`, `useContent()` |
| `services/` | Business logic | `AIContentGenerationService` |
| `types/` | Type definitions | `Content`, `User`, `Workspace` |
| `utils/` | Pure helper functions | `formatDate()`, `logger` |

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Proper types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  return apiClient.queryOne('users', { id });
}

// ❌ Bad: Using 'any'
function getUser(id: any): any {
  return apiClient.queryOne('users', { id });
}
```

### Component Structure

```typescript
/**
 * Component description
 */
interface ComponentProps {
  /** Prop description */
  propName: PropType;
}

export function Component({ propName }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState();
  const { data } = useData();
  
  // 2. Derived state
  const derivedValue = useMemo(() => compute(data), [data]);
  
  // 3. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // 5. Early returns
  if (!data) return <Loading />;
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Naming Conventions

```typescript
// Components: PascalCase
function ContentCard() {}

// Hooks: camelCase with 'use' prefix
function useAuth() {}

// Services: PascalCase with 'Service' suffix
class ContentService {}

// Interfaces: PascalCase
interface ContentProps {}

// Types: PascalCase
type Status = 'active' | 'inactive';

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Functions: camelCase
function formatDate() {}

// Files: Match exported name
// ContentCard.tsx exports ContentCard
// useAuth.ts exports useAuth
```

### Import Order

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useRouter } from 'react-router-dom';

// 2. Internal modules
import { contentApi } from '@/api';
import { useAuth } from '@/hooks';
import { logger } from '@/utils';

// 3. Components
import { Button, Card } from '@/components';

// 4. Types
import type { Content, User } from '@/types';

// 5. Styles (if applicable)
import './styles.css';
```

## Common Tasks

### Creating a New Page

```bash
# 1. Create page component
touch src/pages/MyNewPage/MyNewPage.tsx
touch src/pages/MyNewPage/index.ts

# 2. Add route in App.tsx or router config
# 3. Add navigation link in Sidebar
# 4. Add any required API methods
# 5. Add types if needed
```

**Example Page Component:**

```typescript
import { PageLayout } from '@/components/layout';
import { useAuth } from '@/hooks';

export function MyNewPage() {
  const { user } = useAuth();
  
  return (
    <PageLayout title="My New Page">
      <div>
        <h1>Welcome {user?.name}</h1>
      </div>
    </PageLayout>
  );
}
```

### Adding a New API Endpoint

```typescript
// 1. Define types in src/types/
export interface MyResource {
  id: string;
  name: string;
  createdAt: Date;
}

// 2. Create API client in src/api/
class MyResourceApi {
  async getAll(): Promise<MyResource[]> {
    return apiClient.query('my_resources');
  }
  
  async getById(id: string): Promise<MyResource | null> {
    return apiClient.queryOne('my_resources', { id });
  }
  
  async create(data: Partial<MyResource>): Promise<MyResource> {
    const [result] = await apiClient.insert('my_resources', data);
    return result;
  }
}

export const myResourceApi = new MyResourceApi();

// 3. Create custom hook (optional)
export function useMyResource(id: string) {
  const [data, setData] = useState<MyResource | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    myResourceApi.getById(id).then(setData).finally(() => setLoading(false));
  }, [id]);
  
  return { data, loading };
}
```

### Adding a New Service

```typescript
/**
 * Service description and purpose
 */
class MyService {
  private static instance: MyService;
  
  private constructor() {
    // Initialize service
  }
  
  static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
  
  async doSomething(params: Params): Promise<Result> {
    try {
      logger.info('Doing something', { params });
      
      // Service logic
      const result = await performOperation(params);
      
      logger.info('Operation complete', { result });
      return result;
    } catch (error) {
      logger.error('Operation failed', error as Error);
      throw new AppError('Operation failed', ErrorCode.INTERNAL_ERROR);
    }
  }
}

export const myService = MyService.getInstance();
```

### Adding a Database Table

```sql
-- 1. Create migration file
-- supabase/migrations/YYYYMMDDHHMMSS_create_my_table.sql

-- Create table
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_my_table_workspace ON my_table(workspace_id);

-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their workspace data"
ON my_table FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert into their workspace"
ON my_table FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 2. Push migration
-- supabase db push

-- 3. Update TypeScript types
-- Add interface in src/types/
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run smoke tests only
npm run smoke-test

# Run health checks
npm run health-check

# Run with coverage
npm test -- --coverage
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ContentCard', () => {
  const mockContent = {
    id: '1',
    title: 'Test Content',
    status: 'draft'
  };
  
  it('renders content title', () => {
    render(<ContentCard content={mockContent} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn();
    render(<ContentCard content={mockContent} onEdit={onEdit} />);
    
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockContent);
  });
});
```

## Debugging

### Using the Logger

```typescript
import { logger, LogLevel } from '@/utils/logger';

// Set log level
logger.setLevel(LogLevel.DEBUG);

// Log messages
logger.debug('Debug info', { data });
logger.info('Operation started', { userId });
logger.warn('Approaching limit', { current: 90, max: 100 });
logger.error('Operation failed', error, { context });

// Retrieve logs
const recentErrors = logger.getLogs({
  level: LogLevel.ERROR,
  limit: 50
});
```

### React DevTools

1. Install React DevTools extension
2. Open browser DevTools
3. Go to "Components" or "Profiler" tab
4. Inspect component props, state, and hooks
5. Use Profiler to identify performance issues

### Network Debugging

```typescript
// Enable request logging
const apiClient = new ApiClient({
  onRequest: (config) => {
    console.log('Request:', config);
  },
  onResponse: (response) => {
    console.log('Response:', response);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});
```

## Performance Optimization

### Component Optimization

```typescript
// Memoize expensive computations
const processedData = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

### Code Splitting

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization

```typescript
// Use proper formats and lazy loading
<img
  src="/images/photo.webp"
  alt="Description"
  loading="lazy"
  width={800}
  height={600}
/>
```

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P -> "TypeScript: Restart TS Server"

# Check for type errors
npm run type-check
```

#### Supabase Connection Issues

```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl $VITE_SUPABASE_URL/rest/v1/
```

#### Hot Reload Not Working

```bash
# Check if too many files are being watched
# Increase file watch limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Getting Help

1. **Check Documentation**: Review docs in `/docs` folder
2. **Search Issues**: Look for similar issues on GitHub
3. **Ask Team**: Use GitHub Discussions
4. **Debug**: Enable debug logging and check browser console
5. **Create Issue**: If bug found, create detailed issue report

## Best Practices Summary

✅ **Do:**
- Write TypeScript with proper types
- Add JSDoc comments to exported functions
- Use semantic HTML and ARIA labels
- Handle loading and error states
- Write tests for new features
- Use meaningful variable names
- Keep components small and focused
- Log important operations
- Handle errors gracefully

❌ **Don't:**
- Use `any` type
- Commit secrets or API keys
- Skip error handling
- Ignore TypeScript errors
- Write large monolithic components
- Forget to clean up effects
- Hardcode configuration values
- Skip code review process

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained By**: Engineering Team
