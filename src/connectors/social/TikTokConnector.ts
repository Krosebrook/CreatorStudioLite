import { z } from 'zod';
import { SocialConnector, PostData, PostResult, MediaUploadResult, PlatformMetrics } from '../base/SocialConnector';
import { ConnectorStatus, ConnectorCredentials, ConnectorHealthCheck } from '../base/BaseConnector';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const tiktokCredentialsSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional()
});

export class TikTokConnector extends SocialConnector {
  private readonly API_BASE = 'https://open.tiktokapis.com/v2';

  constructor() {
    super({
      id: 'tiktok',
      name: 'TikTok',
      requiresOAuth: true,
      requiresApiKey: false,
      scopes: [
        'user.info.basic',
        'video.upload',
        'video.publish',
        'video.list'
      ],
      apiEndpoint: 'https://open.tiktokapis.com/v2',
      rateLimit: {
        requests: 1000,
        period: 86400000
      }
    });
  }

  async validateCredentials(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      this.validateEnv(tiktokCredentialsSchema);
      return true;
    } catch (error) {
      logger.error('TikTok credentials validation failed', error as Error);
      return false;
    }
  }

  async connect(credentials: ConnectorCredentials): Promise<void> {
    if (!await this.validateCredentials(credentials)) {
      throw new Error('Invalid TikTok credentials');
    }

    this.setCredentials(credentials);

    const healthCheck = await this.healthCheck();
    if (healthCheck.status !== ConnectorStatus.CONNECTED) {
      throw new Error(healthCheck.message || 'Failed to connect to TikTok');
    }

    logger.info('TikTok connector connected', { userId: credentials.userId });
  }

  async disconnect(): Promise<void> {
    this.clearCredentials();
    this.updateHealthCheck({
      status: ConnectorStatus.DISCONNECTED,
      lastChecked: new Date(),
      message: 'Disconnected from TikTok'
    });

    logger.info('TikTok connector disconnected');
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
      const response = await fetch(`${this.API_BASE}/user/info/`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
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
          message: `TikTok API error: ${response.statusText}`
        };
      }

      const data = await response.json();

      return {
        status: ConnectorStatus.CONNECTED,
        lastChecked: new Date(),
        message: `Connected to: ${data.data?.user?.display_name || 'Unknown'}`
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

    config.requireConnector('tiktok');

    try {
      const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_key: config.get('VITE_TIKTOK_CLIENT_KEY')!,
          client_secret: config.get('VITE_TIKTOK_CLIENT_SECRET')!,
          refresh_token: this.credentials.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh TikTok token');
      }

      const data = await response.json();

      this.setCredentials({
        ...this.credentials,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      });

      logger.info('TikTok access token refreshed');
    } catch (error) {
      logger.error('Failed to refresh TikTok token', error as Error);
      throw error;
    }
  }

  async post(data: PostData): Promise<PostResult> {
    this.validatePostData(data);

    if (!this.isConnected()) {
      return {
        success: false,
        error: 'TikTok connector not connected'
      };
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      if (!data.mediaUrls || data.mediaUrls.length === 0) {
        return {
          success: false,
          error: 'TikTok requires video media for posting'
        };
      }

      const initResponse = await fetch(`${this.API_BASE}/post/publish/video/init/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials!.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_info: {
            title: data.content.substring(0, 150),
            privacy_level: data.metadata?.privacy || 'PUBLIC_TO_EVERYONE',
            disable_comment: data.metadata?.disableComments || false,
            disable_duet: data.metadata?.disableDuet || false,
            disable_stitch: data.metadata?.disableStitch || false,
            video_cover_timestamp_ms: data.metadata?.coverTimestamp || 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: data.metadata?.videoSize || 0,
            chunk_size: 10485760,
            total_chunk_count: Math.ceil((data.metadata?.videoSize || 0) / 10485760)
          }
        })
      });

      if (initResponse.status === 429) {
        await this.handleRateLimit(3600);
        return {
          success: false,
          error: 'TikTok rate limit exceeded'
        };
      }

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to initialize TikTok upload'
        };
      }

      const initData = await initResponse.json();

      return {
        success: true,
        postId: initData.data?.publish_id,
        url: undefined,
        platformResponse: {
          ...initData,
          message: 'Video upload initialized. User must complete upload in TikTok Creator inbox.'
        }
      };
    } catch (error) {
      logger.error('TikTok post failed', error as Error);
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
        error: 'TikTok only supports video uploads'
      };
    }

    if (!this.isConnected()) {
      return {
        success: false,
        error: 'TikTok connector not connected'
      };
    }

    return {
      success: false,
      error: 'Use post() method for TikTok video uploads'
    };
  }

  async deletePost(postId: string): Promise<boolean> {
    logger.warn('TikTok does not support programmatic post deletion');
    return false;
  }

  async getMetrics(): Promise<PlatformMetrics> {
    if (!this.isConnected()) {
      throw new Error('TikTok connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const response = await fetch(`${this.API_BASE}/user/info/`, {
        headers: {
          'Authorization': `Bearer ${this.credentials!.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TikTok user metrics');
      }

      const data = await response.json();
      const user = data.data?.user;

      return {
        followers: user?.follower_count || 0,
        following: user?.following_count || 0,
        posts: user?.video_count || 0,
        engagement: {
          likes: user?.likes_count || 0,
          comments: 0,
          shares: 0,
          views: 0
        }
      };
    } catch (error) {
      logger.error('Failed to fetch TikTok metrics', error as Error);
      throw error;
    }
  }

  async getPostMetrics(postId: string): Promise<any> {
    if (!this.isConnected()) {
      throw new Error('TikTok connector not connected');
    }

    logger.warn('TikTok post metrics require separate API access');

    return {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      message: 'TikTok post metrics not available'
    };
  }
}
