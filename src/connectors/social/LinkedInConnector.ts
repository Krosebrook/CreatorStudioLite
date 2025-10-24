import { z } from 'zod';
import { SocialConnector, PostData, PostResult, MediaUploadResult, PlatformMetrics } from '../base/SocialConnector';
import { ConnectorStatus, ConnectorCredentials, ConnectorHealthCheck } from '../base/BaseConnector';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const linkedinCredentialsSchema = z.object({
  accessToken: z.string().min(1)
});

export class LinkedInConnector extends SocialConnector {
  private readonly API_BASE = 'https://api.linkedin.com/v2';

  constructor() {
    super({
      id: 'linkedin',
      name: 'LinkedIn',
      requiresOAuth: true,
      requiresApiKey: false,
      scopes: ['w_member_social', 'r_liteprofile', 'r_emailaddress'],
      apiEndpoint: 'https://api.linkedin.com/v2'
    });
  }

  async validateCredentials(credentials: ConnectorCredentials): Promise<boolean> {
    try {
      this.validateEnv(linkedinCredentialsSchema);
      return true;
    } catch (error) {
      logger.error('LinkedIn credentials validation failed', error as Error);
      return false;
    }
  }

  async connect(credentials: ConnectorCredentials): Promise<void> {
    this.setCredentials(credentials);
    const healthCheck = await this.healthCheck();
    if (healthCheck.status !== ConnectorStatus.CONNECTED) {
      throw new Error(healthCheck.message || 'Failed to connect to LinkedIn');
    }
    logger.info('LinkedIn connector connected');
  }

  async disconnect(): Promise<void> {
    this.clearCredentials();
    this.updateHealthCheck({
      status: ConnectorStatus.DISCONNECTED,
      lastChecked: new Date()
    });
  }

  async healthCheck(): Promise<ConnectorHealthCheck> {
    if (!this.credentials?.accessToken) {
      return { status: ConnectorStatus.DISCONNECTED, lastChecked: new Date() };
    }

    try {
      const response = await fetch(`${this.API_BASE}/me`, {
        headers: { 'Authorization': `Bearer ${this.credentials.accessToken}` }
      });

      if (response.status === 401) {
        return { status: ConnectorStatus.EXPIRED, lastChecked: new Date() };
      }

      return response.ok
        ? { status: ConnectorStatus.CONNECTED, lastChecked: new Date() }
        : { status: ConnectorStatus.ERROR, lastChecked: new Date() };
    } catch (error) {
      return { status: ConnectorStatus.ERROR, lastChecked: new Date() };
    }
  }

  async refreshToken(): Promise<void> {
    throw new Error('LinkedIn tokens must be refreshed through OAuth flow');
  }

  async post(data: PostData): Promise<PostResult> {
    if (!this.isConnected()) {
      return { success: false, error: 'LinkedIn connector not connected' };
    }

    try {
      const personId = await this.getPersonId();

      const response = await fetch(`${this.API_BASE}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials!.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: `urn:li:person:${personId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: data.content },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        })
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to post to LinkedIn' };
      }

      const result = await response.json();
      return { success: true, postId: result.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async getPersonId(): Promise<string> {
    const response = await fetch(`${this.API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${this.credentials!.accessToken}` }
    });
    const data = await response.json();
    return data.id;
  }

  async uploadMedia(): Promise<MediaUploadResult> {
    return { success: false, error: 'Media upload requires UGC asset registration' };
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
