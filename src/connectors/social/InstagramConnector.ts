import { z } from 'zod';
import { SocialConnector, PostData, PostResult, MediaUploadResult, PlatformMetrics } from '../base/SocialConnector';
import { ConnectorStatus, ConnectorCredentials, ConnectorHealthCheck } from '../base/BaseConnector';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const instagramCredentialsSchema = z.object({
  accessToken: z.string().min(1),
  platformUserId: z.string().optional()
});

export class InstagramConnector extends SocialConnector {
  private readonly API_BASE = 'https://graph.facebook.com/v18.0';

  constructor() {
    super({
      id: 'instagram',
      name: 'Instagram',
      requiresOAuth: true,
      requiresApiKey: false,
      scopes: [
        'instagram_basic',
        'instagram_content_publish',
        'pages_show_list',
        'pages_read_engagement'
      ],
      apiEndpoint: 'https://graph.facebook.com/v18.0',
      rateLimit: {
        requests: 200,
        period: 3600000
      }
    });
  }

  async validateCredentials(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      this.validateEnv(instagramCredentialsSchema);
      return true;
    } catch (error) {
      logger.error('Instagram credentials validation failed', error as Error);
      return false;
    }
  }

  async connect(credentials: ConnectorCredentials): Promise<void> {
    if (!await this.validateCredentials(credentials)) {
      throw new Error('Invalid Instagram credentials');
    }

    this.setCredentials(credentials);

    const healthCheck = await this.healthCheck();
    if (healthCheck.status !== ConnectorStatus.CONNECTED) {
      throw new Error(healthCheck.message || 'Failed to connect to Instagram');
    }

    logger.info('Instagram connector connected', { userId: credentials.userId });
  }

  async disconnect(): Promise<void> {
    this.clearCredentials();
    this.updateHealthCheck({
      status: ConnectorStatus.DISCONNECTED,
      lastChecked: new Date(),
      message: 'Disconnected from Instagram'
    });

    logger.info('Instagram connector disconnected');
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
      const igUserId = await this.getInstagramBusinessAccountId();

      if (!igUserId) {
        return {
          status: ConnectorStatus.ERROR,
          lastChecked: new Date(),
          message: 'No Instagram Business account found'
        };
      }

      const response = await fetch(
        `${this.API_BASE}/${igUserId}?fields=username,profile_picture_url&access_token=${this.credentials.accessToken}`
      );

      if (response.status === 401 || response.status === 190) {
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
          message: `Instagram API error: ${response.statusText}`
        };
      }

      const data = await response.json();

      return {
        status: ConnectorStatus.CONNECTED,
        lastChecked: new Date(),
        message: `Connected to: @${data.username || 'Unknown'}`
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
    if (!this.credentials?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.get('VITE_INSTAGRAM_CLIENT_ID')}&client_secret=${config.get('VITE_INSTAGRAM_CLIENT_SECRET')}&fb_exchange_token=${this.credentials.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to refresh Instagram token');
      }

      const data = await response.json();

      this.setCredentials({
        ...this.credentials,
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      });

      logger.info('Instagram access token refreshed');
    } catch (error) {
      logger.error('Failed to refresh Instagram token', error as Error);
      throw error;
    }
  }

  private async getInstagramBusinessAccountId(): Promise<string | null> {
    if (!this.credentials?.accessToken) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/me/accounts?fields=instagram_business_account&access_token=${this.credentials.accessToken}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data?.[0]?.instagram_business_account?.id || null;
    } catch (error) {
      logger.error('Failed to get Instagram Business Account ID', error as Error);
      return null;
    }
  }

  async post(data: PostData): Promise<PostResult> {
    this.validatePostData(data);

    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Instagram connector not connected'
      };
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const igUserId = await this.getInstagramBusinessAccountId();

      if (!igUserId) {
        return {
          success: false,
          error: 'No Instagram Business account found'
        };
      }

      let containerResponse;

      if (data.mediaUrls && data.mediaUrls.length > 0) {
        const mediaType = data.mediaUrls.length > 1 ? 'CAROUSEL' :
                         data.metadata?.mediaType === 'VIDEO' ? 'REELS' : 'IMAGE';

        const params = new URLSearchParams({
          access_token: this.credentials!.accessToken,
          caption: data.content
        });

        if (mediaType === 'CAROUSEL') {
          params.append('media_type', 'CAROUSEL');

          const children = await Promise.all(
            data.mediaUrls.map(url => this.createMediaContainer(igUserId, url, 'IMAGE'))
          );

          params.append('children', children.join(','));
        } else {
          params.append('media_type', mediaType);
          params.append(mediaType === 'VIDEO' ? 'video_url' : 'image_url', data.mediaUrls[0]);
        }

        containerResponse = await fetch(
          `${this.API_BASE}/${igUserId}/media?${params.toString()}`,
          { method: 'POST' }
        );
      } else {
        return {
          success: false,
          error: 'Instagram requires media for posting'
        };
      }

      if (containerResponse.status === 429) {
        await this.handleRateLimit(3600);
        return {
          success: false,
          error: 'Instagram rate limit exceeded'
        };
      }

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to create Instagram media container'
        };
      }

      const containerData = await containerResponse.json();

      const publishResponse = await fetch(
        `${this.API_BASE}/${igUserId}/media_publish?creation_id=${containerData.id}&access_token=${this.credentials!.accessToken}`,
        { method: 'POST' }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        return {
          success: false,
          error: errorData.error?.message || 'Failed to publish Instagram post'
        };
      }

      const publishData = await publishResponse.json();

      return {
        success: true,
        postId: publishData.id,
        url: `https://www.instagram.com/p/${publishData.id}/`,
        platformResponse: publishData
      };
    } catch (error) {
      logger.error('Instagram post failed', error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async createMediaContainer(igUserId: string, mediaUrl: string, type: string): Promise<string> {
    const params = new URLSearchParams({
      access_token: this.credentials!.accessToken,
      is_carousel_item: 'true'
    });

    params.append(type === 'VIDEO' ? 'video_url' : 'image_url', mediaUrl);

    const response = await fetch(
      `${this.API_BASE}/${igUserId}/media?${params.toString()}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error('Failed to create carousel item');
    }

    const data = await response.json();
    return data.id;
  }

  async uploadMedia(file: File | Blob, type: 'image' | 'video'): Promise<MediaUploadResult> {
    return {
      success: false,
      error: 'Instagram requires media to be hosted on a public URL'
    };
  }

  async deletePost(postId: string): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Instagram connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${postId}?access_token=${this.credentials!.accessToken}`,
        { method: 'DELETE' }
      );

      return response.ok;
    } catch (error) {
      logger.error('Failed to delete Instagram post', error as Error);
      return false;
    }
  }

  async getMetrics(): Promise<PlatformMetrics> {
    if (!this.isConnected()) {
      throw new Error('Instagram connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const igUserId = await this.getInstagramBusinessAccountId();

      if (!igUserId) {
        throw new Error('No Instagram Business account found');
      }

      const response = await fetch(
        `${this.API_BASE}/${igUserId}?fields=followers_count,follows_count,media_count&access_token=${this.credentials!.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Instagram metrics');
      }

      const data = await response.json();

      return {
        followers: data.followers_count || 0,
        following: data.follows_count || 0,
        posts: data.media_count || 0,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        }
      };
    } catch (error) {
      logger.error('Failed to fetch Instagram metrics', error as Error);
      throw error;
    }
  }

  async getPostMetrics(postId: string): Promise<any> {
    if (!this.isConnected()) {
      throw new Error('Instagram connector not connected');
    }

    if (this.isTokenExpired()) {
      await this.refreshToken();
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/${postId}?fields=like_count,comments_count,timestamp,media_type,media_url&access_token=${this.credentials!.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Instagram post metrics');
      }

      const data = await response.json();

      return {
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        shares: 0,
        views: 0,
        mediaType: data.media_type,
        publishedAt: data.timestamp
      };
    } catch (error) {
      logger.error('Failed to fetch Instagram post metrics', error as Error);
      throw error;
    }
  }
}
