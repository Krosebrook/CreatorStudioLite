import { BaseConnector, ConnectorType } from './BaseConnector';

export interface PostData {
  content: string;
  mediaUrls?: string[];
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  platformResponse?: any;
}

export interface MediaUploadResult {
  success: boolean;
  mediaId?: string;
  url?: string;
  error?: string;
}

export interface PlatformMetrics {
  followers?: number;
  following?: number;
  posts?: number;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  reach?: number;
  impressions?: number;
}

export abstract class SocialConnector extends BaseConnector {
  constructor(config: any) {
    super({ ...config, type: ConnectorType.SOCIAL });
  }

  abstract post(data: PostData): Promise<PostResult>;

  abstract uploadMedia(file: File | Blob, type: 'image' | 'video'): Promise<MediaUploadResult>;

  abstract deletePost(postId: string): Promise<boolean>;

  abstract getMetrics(): Promise<PlatformMetrics>;

  abstract getPostMetrics(postId: string): Promise<any>;

  protected validatePostData(data: PostData): void {
    if (!data.content && (!data.mediaUrls || data.mediaUrls.length === 0)) {
      throw new Error('Post must contain either content or media');
    }
  }

  protected async retryOnFailure<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, i)));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}
