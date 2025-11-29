export type ViewSize = 'sm' | 'md' | 'lg' | 'xl';
export type ViewVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type ViewMode = 'landing' | 'dashboard' | 'studio' | 'demo';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: unknown;
}
