import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { connectorRegistry } from '../../connectors/base/ConnectorRegistry';
import { SocialConnector } from '../../connectors/base/SocialConnector';
import { contentAdaptationService } from '../content/ContentAdaptationService';
import { connectorService } from '../ConnectorService';
import { jobQueue, JobType, JobPriority } from '../../workflows';

export interface PublishOptions {
  contentId: string;
  workspaceId: string;
  userId: string;
  platforms: string[];
  scheduledFor?: Date;
}

export interface PublishResult {
  success: boolean;
  publishedTo: string[];
  failed: Array<{ platform: string; error: string }>;
  jobIds: string[];
}

export class PublishingService {
  private static instance: PublishingService;

  private constructor() {}

  static getInstance(): PublishingService {
    if (!PublishingService.instance) {
      PublishingService.instance = new PublishingService();
    }
    return PublishingService.instance;
  }

  async publishContent(options: PublishOptions): Promise<PublishResult> {
    const result: PublishResult = {
      success: false,
      publishedTo: [],
      failed: [],
      jobIds: []
    };

    if (!supabase) {
      result.failed = options.platforms.map(p => ({
        platform: p,
        error: 'Supabase not configured'
      }));
      return result;
    }

    try {
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('id', options.contentId)
        .single();

      if (contentError || !content) {
        result.failed = options.platforms.map(p => ({
          platform: p,
          error: 'Content not found'
        }));
        return result;
      }

      for (const platform of options.platforms) {
        try {
          const { credentials, error: credError } = await connectorService.getConnectorCredentials(
            options.userId,
            options.workspaceId,
            platform
          );

          if (credError || !credentials) {
            result.failed.push({
              platform,
              error: `Platform not connected: ${platform}`
            });
            continue;
          }

          const adapted = contentAdaptationService.adaptForPlatform(
            {
              title: content.title,
              body: content.body,
              hashtags: content.metadata?.hashtags,
              mediaUrls: content.metadata?.mediaUrls
            },
            platform as any
          );

          const job = await jobQueue.addJob(
            JobType.POST_CONTENT,
            {
              connectorId: platform,
              postData: {
                content: adapted.content,
                mediaUrls: adapted.mediaUrls,
                metadata: adapted.metadata,
                scheduledAt: options.scheduledFor
              }
            },
            {
              userId: options.userId,
              connectorId: platform,
              priority: options.scheduledFor ? JobPriority.NORMAL : JobPriority.HIGH,
              scheduledFor: options.scheduledFor,
              metadata: {
                contentId: options.contentId,
                workspaceId: options.workspaceId,
                platform
              }
            }
          );

          result.jobIds.push(job.id);
          result.publishedTo.push(platform);

          logger.info('Publish job queued', {
            contentId: options.contentId,
            platform,
            jobId: job.id
          });
        } catch (error) {
          result.failed.push({
            platform,
            error: (error as Error).message
          });
        }
      }

      result.success = result.publishedTo.length > 0;

      if (result.success) {
        await supabase
          .from('content')
          .update({
            status: options.scheduledFor ? 'scheduled' : 'published',
            published_at: options.scheduledFor ? null : new Date().toISOString(),
            scheduled_for: options.scheduledFor?.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', options.contentId);
      }

      return result;
    } catch (error) {
      logger.error('Publishing error', error as Error);
      result.failed = options.platforms.map(p => ({
        platform: p,
        error: (error as Error).message
      }));
      return result;
    }
  }

  async batchPublish(
    contentIds: string[],
    options: {
      workspaceId: string;
      userId: string;
      platforms: string[];
      scheduledFor?: Date;
    }
  ): Promise<{
    results: Array<{ contentId: string; result: PublishResult }>;
    error: Error | null;
  }> {
    const results: Array<{ contentId: string; result: PublishResult }> = [];

    for (const contentId of contentIds) {
      const result = await this.publishContent({
        contentId,
        workspaceId: options.workspaceId,
        userId: options.userId,
        platforms: options.platforms,
        scheduledFor: options.scheduledFor
      });

      results.push({ contentId, result });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { results, error: null };
  }

  async getPublishedPosts(
    workspaceId: string,
    options?: {
      platform?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<{ posts: any[]; error: Error | null }> {
    if (!supabase) {
      return { posts: [], error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase
        .from('published_posts')
        .select(`
          *,
          content:content_id (
            id,
            title,
            body,
            created_by
          ),
          connector:connector_id (
            id,
            platform
          )
        `)
        .eq('content.workspace_id', workspaceId)
        .order('published_at', { ascending: false });

      if (options?.platform) {
        query = query.eq('platform', options.platform);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch published posts', error);
        return { posts: [], error };
      }

      return { posts: data || [], error: null };
    } catch (error) {
      logger.error('Error fetching published posts', error as Error);
      return { posts: [], error: error as Error };
    }
  }

  async retryFailedPost(
    postId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data: post, error: fetchError } = await supabase
        .from('published_posts')
        .select('*, content:content_id(*)')
        .eq('id', postId)
        .single();

      if (fetchError || !post) {
        return { success: false, error: 'Post not found' };
      }

      await supabase
        .from('published_posts')
        .update({
          status: 'retrying',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      const job = await jobQueue.addJob(
        JobType.POST_CONTENT,
        {
          connectorId: post.platform,
          postData: {
            content: post.content.body,
            metadata: post.metadata
          }
        },
        {
          userId: post.content.created_by,
          connectorId: post.platform,
          priority: JobPriority.HIGH,
          metadata: {
            contentId: post.content_id,
            postId: post.id,
            isRetry: true
          }
        }
      );

      logger.info('Retry job queued', { postId, jobId: job.id });

      return { success: true };
    } catch (error) {
      logger.error('Error retrying post', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async deletePublishedPost(
    postId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data: post, error: fetchError } = await supabase
        .from('published_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (fetchError || !post) {
        return { success: false, error: 'Post not found' };
      }

      const connector = connectorRegistry.getActiveConnector(post.platform);
      if (connector && connector instanceof SocialConnector) {
        await connector.deletePost(post.platform_post_id);
      }

      await supabase
        .from('published_posts')
        .update({ status: 'deleted' })
        .eq('id', postId);

      logger.info('Post deleted', { postId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting post', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export const publishingService = PublishingService.getInstance();
