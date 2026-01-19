# Component Documentation

## Overview

This document provides a comprehensive guide to the React components in the Amplify Creator Platform. Components follow atomic design principles and are organized by complexity and purpose.

## Table of Contents

- [Component Structure](#component-structure)
- [Design System Components](#design-system-components)
- [Feature Components](#feature-components)
- [Layout Components](#layout-components)
- [Component Best Practices](#component-best-practices)
- [Component Examples](#component-examples)

## Component Structure

### Directory Organization

```
src/components/
├── layout/              # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── PageLayout.tsx
│
├── content/             # Content management components
│   ├── ContentList.tsx
│   ├── ContentCard.tsx
│   ├── ContentEditor.tsx
│   └── ContentPreview.tsx
│
├── analytics/           # Analytics components
│   ├── Dashboard.tsx
│   ├── MetricsCard.tsx
│   ├── Chart.tsx
│   └── DataTable.tsx
│
├── social/              # Social media components
│   ├── PlatformSelector.tsx
│   ├── ConnectorCard.tsx
│   └── PostScheduler.tsx
│
└── shared/              # Shared/reusable components
    ├── Button.tsx
    ├── Modal.tsx
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

## Design System Components

### Atomic Components (atoms/)

#### Button

```typescript
/**
 * Primary button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
}
```

#### Input

```typescript
/**
 * Text input component with validation support.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 *   required
 * />
 * ```
 */
interface InputProps {
  /** Input label */
  label?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Help text */
  helpText?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Input name */
  name?: string;
}
```

#### Badge

```typescript
/**
 * Badge component for status indicators and labels.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Published</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="error">Failed</Badge>
 * ```
 */
interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Size preset */
  size?: 'sm' | 'md';
}
```

### Molecular Components (molecules/)

#### SearchBar

```typescript
/**
 * Search bar with debounced input and clear button.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search content..."
 *   onSearch={handleSearch}
 * />
 * ```
 */
interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Search submit handler */
  onSearch?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
}
```

#### FormField

```typescript
/**
 * Form field wrapper with label, input, and error display.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Username"
 *   name="username"
 *   value={username}
 *   onChange={setUsername}
 *   error={errors.username}
 *   required
 * />
 * ```
 */
interface FormFieldProps extends InputProps {
  /** Field label */
  label: string;
  /** Field name */
  name: string;
}
```

#### Card

```typescript
/**
 * Content card with header, body, and footer sections.
 *
 * @example
 * ```tsx
 * <Card
 *   header={<h3>Card Title</h3>}
 *   footer={<Button>Action</Button>}
 * >
 *   Card content goes here
 * </Card>
 * ```
 */
interface CardProps {
  /** Card header content */
  header?: React.ReactNode;
  /** Card body content */
  children: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for entire card */
  onClick?: () => void;
}
```

### Organism Components (organisms/)

#### DataTable

```typescript
/**
 * Data table with sorting, filtering, and pagination.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'title', label: 'Title', sortable: true },
 *     { key: 'status', label: 'Status', filterable: true },
 *     { key: 'createdAt', label: 'Created', sortable: true }
 *   ]}
 *   data={contentItems}
 *   onRowClick={handleRowClick}
 *   loading={loading}
 * />
 * ```
 */
interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Table data */
  data: T[];
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Enable pagination */
  pagination?: boolean;
  /** Items per page */
  pageSize?: number;
}

interface ColumnDef<T> {
  /** Column key (data field) */
  key: keyof T;
  /** Display label */
  label: string;
  /** Enable sorting */
  sortable?: boolean;
  /** Enable filtering */
  filterable?: boolean;
  /** Custom render function */
  render?: (value: any, row: T) => React.ReactNode;
  /** Column width */
  width?: string;
}
```

#### Modal

```typescript
/**
 * Modal dialog with backdrop and animations.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 */
interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
}
```

## Feature Components

### Content Components

#### ContentEditor

```typescript
/**
 * Rich text editor for creating and editing content.
 *
 * @example
 * ```tsx
 * <ContentEditor
 *   content={content}
 *   onChange={setContent}
 *   platforms={['instagram', 'facebook']}
 *   onSave={handleSave}
 *   onPublish={handlePublish}
 * />
 * ```
 */
interface ContentEditorProps {
  /** Initial content */
  content: Content;
  /** Content change handler */
  onChange: (content: Content) => void;
  /** Target platforms */
  platforms: Platform[];
  /** Save draft handler */
  onSave?: () => void;
  /** Publish handler */
  onPublish?: () => void;
  /** Auto-save enabled */
  autoSave?: boolean;
  /** Auto-save delay in ms */
  autoSaveDelay?: number;
}
```

#### ContentCard

```typescript
/**
 * Card displaying content preview with actions.
 *
 * @example
 * ```tsx
 * <ContentCard
 *   content={content}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onPublish={handlePublish}
 * />
 * ```
 */
interface ContentCardProps {
  /** Content to display */
  content: Content;
  /** Edit handler */
  onEdit?: (content: Content) => void;
  /** Delete handler */
  onDelete?: (content: Content) => void;
  /** Publish handler */
  onPublish?: (content: Content) => void;
  /** Show actions menu */
  showActions?: boolean;
}
```

### Analytics Components

#### MetricsCard

```typescript
/**
 * Card displaying a metric with trend indicator.
 *
 * @example
 * ```tsx
 * <MetricsCard
 *   title="Total Views"
 *   value={125000}
 *   change={12.5}
 *   trend="up"
 *   icon={<EyeIcon />}
 * />
 * ```
 */
interface MetricsCardProps {
  /** Metric title */
  title: string;
  /** Current value */
  value: number | string;
  /** Change percentage */
  change?: number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Icon component */
  icon?: React.ReactNode;
  /** Value formatter */
  formatter?: (value: number) => string;
  /** Loading state */
  loading?: boolean;
}
```

#### Chart

```typescript
/**
 * Responsive chart component with multiple chart types.
 *
 * @example
 * ```tsx
 * <Chart
 *   type="line"
 *   data={chartData}
 *   xAxis={{ label: 'Date', key: 'date' }}
 *   yAxis={{ label: 'Views', key: 'views' }}
 *   height={400}
 * />
 * ```
 */
interface ChartProps {
  /** Chart type */
  type: 'line' | 'bar' | 'pie' | 'area';
  /** Chart data */
  data: any[];
  /** X-axis configuration */
  xAxis?: AxisConfig;
  /** Y-axis configuration */
  yAxis?: AxisConfig;
  /** Chart height in pixels */
  height?: number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}
```

### Social Media Components

#### PlatformSelector

```typescript
/**
 * Multi-select for choosing social media platforms.
 *
 * @example
 * ```tsx
 * <PlatformSelector
 *   selected={selectedPlatforms}
 *   onChange={setSelectedPlatforms}
 *   available={availablePlatforms}
 * />
 * ```
 */
interface PlatformSelectorProps {
  /** Currently selected platforms */
  selected: Platform[];
  /** Selection change handler */
  onChange: (platforms: Platform[]) => void;
  /** Available platforms */
  available: Platform[];
  /** Allow multiple selection */
  multiple?: boolean;
  /** Disabled state */
  disabled?: boolean;
}
```

#### ConnectorCard

```typescript
/**
 * Card for managing social media platform connection.
 *
 * @example
 * ```tsx
 * <ConnectorCard
 *   platform="instagram"
 *   status="connected"
 *   accountName="@myaccount"
 *   onConnect={handleConnect}
 *   onDisconnect={handleDisconnect}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
interface ConnectorCardProps {
  /** Platform identifier */
  platform: Platform;
  /** Connection status */
  status: 'connected' | 'disconnected' | 'error';
  /** Account name */
  accountName?: string;
  /** Connect handler */
  onConnect?: () => void;
  /** Disconnect handler */
  onDisconnect?: () => void;
  /** Refresh connection handler */
  onRefresh?: () => void;
  /** Last sync time */
  lastSync?: Date;
}
```

## Layout Components

### PageLayout

```typescript
/**
 * Standard page layout with header, sidebar, and content area.
 *
 * @example
 * ```tsx
 * <PageLayout
 *   title="Dashboard"
 *   breadcrumbs={[
 *     { label: 'Home', path: '/' },
 *     { label: 'Dashboard' }
 *   ]}
 *   actions={<Button>New Content</Button>}
 * >
 *   <Dashboard />
 * </PageLayout>
 * ```
 */
interface PageLayoutProps {
  /** Page title */
  title: string;
  /** Breadcrumb navigation */
  breadcrumbs?: Breadcrumb[];
  /** Header actions */
  actions?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Full width layout */
  fullWidth?: boolean;
}
```

### Header

```typescript
/**
 * Application header with navigation and user menu.
 *
 * @example
 * ```tsx
 * <Header
 *   user={currentUser}
 *   workspace={currentWorkspace}
 *   onWorkspaceChange={handleWorkspaceChange}
 * />
 * ```
 */
interface HeaderProps {
  /** Current user */
  user: User;
  /** Current workspace */
  workspace: Workspace;
  /** Workspace change handler */
  onWorkspaceChange?: (workspace: Workspace) => void;
  /** Show notifications */
  showNotifications?: boolean;
}
```

### Sidebar

```typescript
/**
 * Navigation sidebar with collapsible sections.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   items={navigationItems}
 *   collapsed={isSidebarCollapsed}
 *   onToggle={toggleSidebar}
 * />
 * ```
 */
interface SidebarProps {
  /** Navigation items */
  items: NavItem[];
  /** Collapsed state */
  collapsed: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Active item path */
  activePath?: string;
}

interface NavItem {
  /** Item label */
  label: string;
  /** Item path */
  path: string;
  /** Item icon */
  icon?: React.ReactNode;
  /** Child items */
  children?: NavItem[];
  /** Badge content */
  badge?: string | number;
}
```

## Component Best Practices

### 1. TypeScript Props

Always define prop interfaces with JSDoc comments:

```typescript
/**
 * Button component props
 */
interface ButtonProps {
  /** Button label */
  children: React.ReactNode;
  /** Click handler */
  onClick: () => void;
}
```

### 2. Default Props

Use default parameters instead of defaultProps:

```typescript
function Button({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  children 
}: ButtonProps) {
  // Component implementation
}
```

### 3. Composition Over Props

Prefer composition for flexibility:

```typescript
// Good: Composition
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>

// Less flexible: Props
<Card title="Title" content="Content" footer="Actions" />
```

### 4. Controlled Components

Prefer controlled components for forms:

```typescript
function Form() {
  const [value, setValue] = useState('');
  
  return (
    <Input
      value={value}
      onChange={setValue}
    />
  );
}
```

### 5. Error Boundaries

Wrap complex components with error boundaries:

```typescript
function SafeComponent() {
  return (
    <ErrorBoundary fallback={<ErrorDisplay />}>
      <ComplexComponent />
    </ErrorBoundary>
  );
}
```

### 6. Loading States

Always handle loading states:

```typescript
function DataDisplay() {
  const { data, loading, error } = useData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  return <DataTable data={data} />;
}
```

### 7. Memoization

Use memoization for expensive computations:

```typescript
function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  return <Display data={processedData} />;
}
```

### 8. Accessibility

Ensure components are accessible:

```typescript
<button
  onClick={handleClick}
  aria-label="Close dialog"
  aria-pressed={isPressed}
  disabled={disabled}
>
  <CloseIcon aria-hidden="true" />
</button>
```

## Component Examples

### Complete Form Component

```typescript
/**
 * Content creation form with validation.
 */
function ContentForm({ onSubmit, initialData }: ContentFormProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.body) {
      newErrors.body = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: 'Failed to save content' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Title"
        name="title"
        value={formData.title || ''}
        onChange={(value) => handleChange('title', value)}
        error={errors.title}
        required
      />
      
      <FormField
        label="Content"
        name="body"
        value={formData.body || ''}
        onChange={(value) => handleChange('body', value)}
        error={errors.body}
        multiline
        rows={10}
        required
      />
      
      <PlatformSelector
        selected={formData.platforms || []}
        onChange={(platforms) => handleChange('platforms', platforms)}
        available={['instagram', 'facebook', 'twitter']}
        multiple
      />
      
      {errors.submit && (
        <ErrorMessage>{errors.submit}</ErrorMessage>
      )}
      
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained By**: Frontend Team
