export enum JobType {
  UPLOAD_MEDIA = 'upload_media',
  POST_CONTENT = 'post_content',
  SCHEDULE_CONTENT = 'schedule_content',
  FETCH_METRICS = 'fetch_metrics',
  SYNC_PLATFORM = 'sync_platform',
  PROCESS_MEDIA = 'process_media',
  DELETE_CONTENT = 'delete_content'
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled'
}

export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3
}

export interface Job<T = any> {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  data: T;
  userId: string;
  connectorId?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  metadata?: Record<string, any>;
}

export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  shouldRetry?: boolean;
}

export interface JobHandler<T = any, R = any> {
  handle(job: Job<T>): Promise<JobResult<R>>;
  onSuccess?(job: Job<T>, result: JobResult<R>): Promise<void>;
  onFailure?(job: Job<T>, error: Error): Promise<void>;
}
