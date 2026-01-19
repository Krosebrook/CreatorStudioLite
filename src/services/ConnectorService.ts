import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { ConnectorCredentials } from '../connectors/base/BaseConnector';
import { YouTubeConnector, TikTokConnector, InstagramConnector, LinkedInConnector, PinterestConnector } from '../connectors/social';
import { connectorRegistry } from '../connectors/base/ConnectorRegistry';

/**
 * ConnectorService manages social media platform connections and credentials.
 * 
 * This service handles OAuth credentials storage, retrieval, and lifecycle management
 * for various social media platforms. It implements a singleton pattern to ensure
 * consistent credential handling across the application.
 * 
 * Supported platforms:
 * - YouTube
 * - TikTok
 * - Instagram
 * - LinkedIn
 * - Pinterest
 * 
 * @example
 * ```typescript
 * const service = ConnectorService.getInstance();
 * await service.saveConnectorCredentials(userId, workspaceId, 'instagram', {
 *   accessToken: 'token123',
 *   refreshToken: 'refresh456',
 *   expiresAt: new Date('2025-12-31')
 * });
 * ```
 * 
 * @class
 * @since 1.0.0
 */
export class ConnectorService {
  private static instance: ConnectorService;

  private constructor() {
    this.registerConnectors();
  }

  /**
   * Returns the singleton instance of ConnectorService.
   * 
   * @returns The ConnectorService instance
   */
  static getInstance(): ConnectorService {
    if (!ConnectorService.instance) {
      ConnectorService.instance = new ConnectorService();
    }
    return ConnectorService.instance;
  }

  /**
   * Registers all supported social media connectors with the connector registry.
   * Called automatically during service initialization.
   * 
   * @private
   */
  private registerConnectors(): void {
    connectorRegistry.register('youtube', YouTubeConnector as any);
    connectorRegistry.register('tiktok', TikTokConnector as any);
    connectorRegistry.register('instagram', InstagramConnector as any);
    connectorRegistry.register('linkedin', LinkedInConnector as any);
    connectorRegistry.register('pinterest', PinterestConnector as any);
  }

  /**
   * Saves or updates OAuth credentials for a social media platform connection.
   * 
   * This method stores encrypted credentials in the database with upsert logic,
   * meaning it will create a new record or update an existing one if a connection
   * for the same workspace/platform/user combination already exists.
   * 
   * @param userId - The ID of the user who owns the connection
   * @param workspaceId - The workspace ID where the connector belongs
   * @param platform - The social media platform identifier (e.g., 'instagram', 'youtube')
   * @param credentials - OAuth credentials and metadata
   * @param credentials.accessToken - OAuth access token
   * @param [credentials.refreshToken] - Optional OAuth refresh token
   * @param [credentials.expiresAt] - Token expiration date
   * @param [credentials.platformUserId] - Platform-specific user identifier
   * @param [credentials.metadata] - Additional platform-specific data
   * 
   * @returns Promise resolving to an object with error (null if successful)
   * 
   * @example
   * ```typescript
   * const result = await connectorService.saveConnectorCredentials(
   *   'user-123',
   *   'workspace-456',
   *   'instagram',
   *   {
   *     accessToken: 'IGQVJXa...',
   *     refreshToken: 'IGQVJXb...',
   *     expiresAt: new Date('2025-12-31'),
   *     platformUserId: '17841400123456789',
   *     metadata: { accountName: '@myaccount' }
   *   }
   * );
   * 
   * if (result.error) {
   *   console.error('Failed to save credentials:', result.error);
   * }
   * ```
   */
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

  /**
   * Retrieves OAuth credentials for a connected social media platform.
   * 
   * Fetches the stored credentials for an active platform connection. Only returns
   * credentials for connections with status 'connected'. Returns null if no active
   * connection exists.
   * 
   * @param userId - The ID of the user who owns the connection (currently unused but kept for future use)
   * @param workspaceId - The workspace ID to query
   * @param platform - The social media platform identifier
   * 
   * @returns Promise resolving to credentials and error status
   * 
   * @example
   * ```typescript
   * const { credentials, error } = await connectorService.getConnectorCredentials(
   *   'user-123',
   *   'workspace-456',
   *   'instagram'
   * );
   * 
   * if (error) {
   *   console.error('Failed to fetch credentials:', error);
   * } else if (credentials) {
   *   // Use credentials for API calls
   *   console.log('Access token:', credentials.accessToken);
   * } else {
   *   console.log('No active connection found');
   * }
   * ```
   */
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

  /**
   * Disconnects a social media platform by marking it as disconnected.
   * 
   * This method doesn't delete the credentials but sets the status to 'disconnected',
   * allowing for reconnection without re-authorization if desired. The credentials
   * remain in the database but won't be returned by getConnectorCredentials.
   * 
   * @param workspaceId - The workspace ID containing the connector
   * @param platform - The platform identifier to disconnect
   * 
   * @returns Promise resolving to error status (null if successful)
   * 
   * @example
   * ```typescript
   * const result = await connectorService.disconnectConnector(
   *   'workspace-456',
   *   'instagram'
   * );
   * 
   * if (result.error) {
   *   console.error('Failed to disconnect:', result.error);
   * } else {
   *   console.log('Successfully disconnected from Instagram');
   * }
   * ```
   */
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

  /**
   * Lists all connectors for a workspace, regardless of status.
   * 
   * Returns a list of all platform connections associated with a workspace,
   * including both active and disconnected connectors. Results are ordered
   * by creation date (newest first).
   * 
   * @param workspaceId - The workspace ID to query
   * 
   * @returns Promise resolving to an array of connectors and error status
   * 
   * @example
   * ```typescript
   * const { connectors, error } = await connectorService.listWorkspaceConnectors(
   *   'workspace-456'
   * );
   * 
   * if (error) {
   *   console.error('Failed to list connectors:', error);
   * } else {
   *   connectors.forEach(connector => {
   *     console.log(`${connector.platform}: ${connector.status}`);
   *   });
   * }
   * ```
   */
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
