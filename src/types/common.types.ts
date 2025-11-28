// Common types used across the application

// Re-export Result types for convenience
export type { Result, Success, Failure } from '../shared/result';
export { success, failure, isSuccess, isFailure } from '../shared/result';

export type UUID = string;
export type Timestamp = string;

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook' | 'pinterest';

export type ContentType = 'post' | 'reel' | 'video' | 'story' | 'carousel';

export type Status = 'draft' | 'scheduled' | 'published' | 'archived' | 'failed';

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Timestamp;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
