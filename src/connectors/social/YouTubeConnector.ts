import { z } from 'zod';
import { SocialConnector, PostData, PostResult, MediaUploadResult, PlatformMetrics } from '../base/SocialConnector';
import { ConnectorStatus, ConnectorCredentials, ConnectorHealthCheck } from '../base/BaseConnector';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const youtubeCredentialsSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  apiKey: z.string().optional()
});

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;
  };
  status: {
    privacyStatus: 'public' | 'private' | 'unlisted';
  };
}

export class YouTubeConnector extends SocialConnector {
  private readonly API_BASE = 'https://www.googleapis.com/youtube/v3';
  private readonly UPLOAD_API_BASE = 'https://www.googleapis.com/upload/youtube/v3';

  constructor() {
    super({
      id: 'youtube',
      name: 'YouTube',
      requiresOAuth: true,
      requiresApiKey: false,
      scopes: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
      ],
      apiEndpoint: 'https://www.googleapis.com/youtube/v3',
      rateLimit: {
        requests: 10000,
        period: 86400000
      }
    });
  }

  async validateCredentials(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      this.validateEnv(youtubeCredentialsSchema);
      return true;
    } catch (error) {
      logger.error('YouTube credentials validation failed', error as Error);
      return false;
    }
  }

  async connect(credentials: ConnectorCredentials): Promise<void> {
    if (!await this.validateCredentials(credentials)) {
      throw new Error('Invalid YouTube credentials');
    }

    this.setCredentials(credentials);

    const healthCheck = await this.healthCheck();
    if (healthCheck.status !== ConnectorStatus.CONNECTED) {
      throw new Error(healthCheck.message || 'Failed to connect to YouTube');
    }

    logger.info('YouTube connector connected', { userId: credentials.userId });
  }

  async disconnect(): Promise<void> {
    this.clearCredentials();
    this.updateHealthCheck({
      status: ConnectorStatus.DISCONNECTED,
      lastChecked: new Date(),
      message: 'Disconnected from YouTube'
    });

    logger.info('YouTube connector disconnected');
  }

  async healthCheck(): Promise<ConnectorHealthCheck> {
    if (!this.credentials?.accessToken) {
      return {
        status: ConnectorStatus.DISCONNECTED,
        lastChecked: new Date(),
        message: 'No access token available'
      };
    }

    try {
      const response = await fetch(`${this.API_BASE}/channels?part=snippet&mine=true`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        return {
          status: ConnectorStatus.EXPIRED,
          lastChecked: new Date(),
          message: 'Access token expired'
        };
      }

      if (!response.ok) {
        return {
          status: ConnectorStatus.ERROR,
          lastChecked: new Date(),
          message: `YouTube API error: ${response.statusText}`
        };
      }

      const data = await response.json();

      return {
        status: ConnectorStatus.CONNECTED,
        lastChecked: new Date(),
        message: `Connected to channel: ${data.items?.[0]?.snippet?.title || 'Unknown'}`
      };
    } catch (error) {
      return {
        status: ConnectorStatus.ERROR,
        lastChecked: new Date(),
        message: (error as Error).message
      };
    }
  }

  async refreshToken(): Promise<void> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available');
    }

    config.requireConnector('youtube');

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: config.get('VITE_YOUTUBE_CLIENT_ID')!,
          client_secret: config.get('VITE_YOUTUBE_CLIENT_SECRET')!,
          refresh_token: this.credentials.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh YouTube token');
      }

      const data = await response.json();

      this.setCredentials({
        ...this.credentials,
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      });

      logger.info('YouTube access token refreshed');
    } catch (error) {
      logger.error('Failed to refresh YouTube token', error as Error);
      throw error;
    }
  }

  async post(data: PostData): Promise<PostResult> {
    this.validatePostData(data);

    if (!this.isConnected()) {
      return {
        success: false,
        error: 'YouTube connector not connected'
      };
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      if (!data.mediaUrls || data.mediaUrls.length === 0) {
        return {
          success: false,
          error: 'YouTube requires video media for posting'
        };
      }

      const videoMetadata: YouTubeVideo = {
        id: '',
        snippet: {
          title: data.metadata?.title || data.content.substring(0, 100),
          description: data.content,
          tags: data.metadata?.tags || [],
          categoryId: data.metadata?.categoryId || '22'
        },
        status: {
          privacyStatus: data.metadata?.privacyStatus || 'public'
        }
      };

      const response = await fetch(`${this.UPLOAD_API_BASE}/videos?part=snippet,status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials!.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoMetadata)
      });

      if (response.status === 429) {
        await this.handleRateLimit(3600);
        return {
          success: false,
          error: 'YouTube rate limit exceeded'
        };
      }

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to upload video to YouTube'
        };
      }

      const result = await response.json();

      return {
        success: true,
        postId: result.id,
        url: `https://www.youtube.com/watch?v=${result.id}`,
        platformResponse: result
      };
    } catch (error) {
      logger.error('YouTube post failed', error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  async uploadMedia(file: File | Blob, type: 'image' | 'video'): Promise<MediaUploadResult> {
    if (type !== 'video') {
      return {
        success: false,
        error: 'YouTube only supports video uploads'
      };
    }

    if (!this.isConnected()) {
      return {
        success: false,
        error: 'YouTube connector not connected'
      };
    }

    return {
      success: false,
      error: 'Direct video upload not implemented. Use resumable upload flow.'
    };
  }

  async deletePost(postId: string): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('YouTube connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const response = await fetch(`${this.API_BASE}/videos?id=${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.credentials!.accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to delete YouTube video', error as Error);
      return false;
    }
  }

  async getMetrics(): Promise<PlatformMetrics> {
    if (!this.isConnected()) {
      throw new Error('YouTube connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const channelResponse = await fetch(
        `${this.API_BASE}/channels?part=statistics,snippet&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${this.credentials!.accessToken}`
          }
        }
      );

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch YouTube channel metrics');
      }

      const channelData = await channelResponse.json();
      const stats = channelData.items?.[0]?.statistics;

      return {
        followers: parseInt(stats?.subscriberCount || '0'),
        posts: parseInt(stats?.videoCount || '0'),
        engagement: {
          likes: 0,
          comments: parseInt(stats?.commentCount || '0'),
          shares: 0,
          views: parseInt(stats?.viewCount || '0')
        }
      };
    } catch (error) {
      logger.error('Failed to fetch YouTube metrics', error as Error);
      throw error;
    }
  }

  async getPostMetrics(postId: string): Promise<any> {
    if (!this.isConnected()) {
      throw new Error('YouTube connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/videos?part=statistics,snippet&id=${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.credentials!.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch YouTube video metrics');
      }

      const data = await response.json();
      const video = data.items?.[0];

      if (!video) {
        throw new Error('Video not found');
      }

      return {
        views: parseInt(video.statistics?.viewCount || '0'),
        likes: parseInt(video.statistics?.likeCount || '0'),
        comments: parseInt(video.statistics?.commentCount || '0'),
        shares: 0,
        title: video.snippet?.title,
        publishedAt: video.snippet?.publishedAt
      };
    } catch (error) {
      logger.error('Failed to fetch YouTube post metrics', error as Error);
      throw error;
    }
  }
}
