import { z } from 'zod';
import { SocialConnector, PostData, PostResult, MediaUploadResult, PlatformMetrics } from '../base/SocialConnector';
import { ConnectorStatus, ConnectorCredentials, ConnectorHealthCheck } from '../base/BaseConnector';
import { logger } from '../../utils/logger';

const pinterestCredentialsSchema = z.object({
  accessToken: z.string().min(1)
});

export class PinterestConnector extends SocialConnector {
  private readonly API_BASE = 'https://api.pinterest.com/v5';

  constructor() {
    super({
      id: 'pinterest',
      name: 'Pinterest',
      requiresOAuth: true,
      requiresApiKey: false,
      scopes: ['pins:read', 'pins:write', 'boards:read'],
      apiEndpoint: 'https://api.pinterest.com/v5'
    });
  }

  async validateCredentials(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      this.validateEnv(pinterestCredentialsSchema);
      return true;
    } catch (error) {
      return false;
    }
  }

  async connect(credentials: ConnectorCredentials): Promise<void> {
    this.setCredentials(credentials);
    logger.info('Pinterest connector connected');
  }

  async disconnect(): Promise<void> {
    this.clearCredentials();
  }

  async healthCheck(): Promise<ConnectorHealthCheck> {
    if (!this.credentials?.accessToken) {
      return { status: ConnectorStatus.DISCONNECTED, lastChecked: new Date() };
    }
    return { status: ConnectorStatus.CONNECTED, lastChecked: new Date() };
  }

  async refreshToken(): Promise<void> {
    throw new Error('Pinterest tokens must be refreshed through OAuth flow');
  }

  async post(data: PostData): Promise<PostResult> {
    if (!this.isConnected()) {
      return { success: false, error: 'Pinterest connector not connected' };
    }

    try {
      const response = await fetch(`${this.API_BASE}/pins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials!.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          board_id: data.metadata?.boardId,
          title: data.content.substring(0, 100),
          description: data.content,
          link: data.metadata?.link,
          media_source: { source_type: 'image_url', url: data.mediaUrls?.[0] }
        })
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to create Pinterest pin' };
      }

      const result = await response.json();
      return { success: true, postId: result.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async uploadMedia(): Promise<MediaUploadResult> {
    return { success: false, error: 'Use image URL for Pinterest pins' };
  }

  async deletePost(): Promise<boolean> {
    return false;
  }

  async getMetrics(): Promise<PlatformMetrics> {
    return { followers: 0, posts: 0, engagement: { likes: 0, comments: 0, shares: 0, views: 0 } };
  }

  async getPostMetrics(): Promise<any> {
    return {};
  }
}
