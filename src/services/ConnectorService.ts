import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { ConnectorCredentials } from '../connectors/base/BaseConnector';
import { YouTubeConnector, TikTokConnector, InstagramConnector, LinkedInConnector, PinterestConnector } from '../connectors/social';
import { connectorRegistry } from '../connectors/base/ConnectorRegistry';

export class ConnectorService {
  private static instance: ConnectorService;

  private constructor() {
    this.registerConnectors();
  }

  static getInstance(): ConnectorService {
    if (!ConnectorService.instance) {
      ConnectorService.instance = new ConnectorService();
    }
    return ConnectorService.instance;
  }

  private registerConnectors(): void {
    connectorRegistry.register('youtube', YouTubeConnector as any);
    connectorRegistry.register('tiktok', TikTokConnector as any);
    connectorRegistry.register('instagram', InstagramConnector as any);
    connectorRegistry.register('linkedin', LinkedInConnector as any);
    connectorRegistry.register('pinterest', PinterestConnector as any);
  }

  async saveConnectorCredentials(
    userId: string,
    workspaceId: string,
    platform: string,
    credentials: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
      platformUserId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('connectors')
        .upsert({
          user_id: userId,
          workspace_id: workspaceId,
          platform,
          platform_user_id: credentials.platformUserId,
          access_token: credentials.accessToken,
          refresh_token: credentials.refreshToken,
          token_expires_at: credentials.expiresAt?.toISOString(),
          status: 'connected',
          metadata: credentials.metadata || {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'workspace_id,platform,platform_user_id'
        });

      if (error) {
        logger.error('Failed to save connector credentials', error);
        return { error };
      }

      logger.info('Connector credentials saved', { platform, workspaceId });
      return { error: null };
    } catch (error) {
      logger.error('Error saving connector credentials', error as Error);
      return { error: error as Error };
    }
  }

  async getConnectorCredentials(
    userId: string,
    workspaceId: string,
    platform: string
  ): Promise<{ credentials: ConnectorCredentials | null; error: Error | null }> {
    if (!supabase) {
      return { credentials: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('connectors')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('platform', platform)
        .eq('status', 'connected')
        .maybeSingle();

      if (error) {
        logger.error('Failed to fetch connector credentials', error);
        return { credentials: null, error };
      }

      if (!data) {
        return { credentials: null, error: null };
      }

      const credentials: ConnectorCredentials = {
        userId: data.user_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        platformUserId: data.platform_user_id,
        expiresAt: data.token_expires_at ? new Date(data.token_expires_at) : undefined,
        metadata: data.metadata
      };

      return { credentials, error: null };
    } catch (error) {
      logger.error('Error fetching connector credentials', error as Error);
      return { credentials: null, error: error as Error };
    }
  }

  async disconnectConnector(
    workspaceId: string,
    platform: string
  ): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('connectors')
        .update({ status: 'disconnected', updated_at: new Date().toISOString() })
        .eq('workspace_id', workspaceId)
        .eq('platform', platform);

      if (error) {
        logger.error('Failed to disconnect connector', error);
        return { error };
      }

      logger.info('Connector disconnected', { platform, workspaceId });
      return { error: null };
    } catch (error) {
      logger.error('Error disconnecting connector', error as Error);
      return { error: error as Error };
    }
  }

  async listWorkspaceConnectors(workspaceId: string): Promise<{
    connectors: Array<{
      id: string;
      platform: string;
      status: string;
      platformUserId?: string;
      lastSync?: Date;
    }>;
    error: Error | null;
  }> {
    if (!supabase) {
      return { connectors: [], error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('connectors')
        .select('id, platform, status, platform_user_id, updated_at')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to list connectors', error);
        return { connectors: [], error };
      }

      const connectors = data.map(c => ({
        id: c.id,
        platform: c.platform,
        status: c.status,
        platformUserId: c.platform_user_id,
        lastSync: c.updated_at ? new Date(c.updated_at) : undefined
      }));

      return { connectors, error: null };
    } catch (error) {
      logger.error('Error listing connectors', error as Error);
      return { connectors: [], error: error as Error };
    }
  }
}

export const connectorService = ConnectorService.getInstance();
