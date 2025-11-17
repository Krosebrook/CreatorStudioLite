import { UUID, Timestamp, Platform, ContentType, Status } from './common.types';

export interface Content {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  title: string;
  description: string;
  content_type: ContentType;
  platforms: Platform[];
  status: Status;
  published_at?: Timestamp;
  scheduled_for?: Timestamp;
  media_urls: string[];
  thumbnail_url?: string;
  captions: Record<Platform, string>;
  hashtags: string[];
  mentions: string[];
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface MediaFile {
  id: UUID;
  content_id: UUID;
  file_url: string;
  file_type: MediaFileType;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
  processing_status: ProcessingStatus;
  metadata: Record<string, any>;
  created_at: Timestamp;
}

export type MediaFileType = 'image' | 'video' | 'audio' | 'document';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PublishingSchedule {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  content_id?: UUID;
  scheduled_time: Timestamp;
  timezone: string;
  platforms: Platform[];
  title: string;
  caption?: string;
  media_urls: string[];
  hashtags: string[];
  mentions: string[];
  optimal_time_suggested?: Timestamp;
  optimal_time_confidence?: number;
  auto_optimize: boolean;
  batch_id?: UUID;
  batch_position?: number;
  status: PublishingStatus;
  published_at?: Timestamp;
  error_message?: string;
  retry_count: number;
  platform_post_ids: Record<Platform, string>;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type PublishingStatus = 'scheduled' | 'processing' | 'published' | 'failed' | 'cancelled';

export interface ContentTemplate {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  name: string;
  description?: string;
  content_type: ContentType;
  platforms: Platform[];
  template_structure: Record<string, any>;
  thumbnail_url?: string;
  usage_count: number;
  is_public: boolean;
  tags: string[];
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}
