import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  body: string;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

export class ContentVersionService {
  private static instance: ContentVersionService;

  private constructor() {}

  static getInstance(): ContentVersionService {
    if (!ContentVersionService.instance) {
      ContentVersionService.instance = new ContentVersionService();
    }
    return ContentVersionService.instance;
  }

  async createVersion(
    contentId: string,
    data: {
      title: string;
      body: string;
      metadata?: Record<string, any>;
      userId: string;
    }
  ): Promise<{ versionId?: string; version?: number; error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { data: content, error: fetchError } = await supabase
        .from('content')
        .select('version')
        .eq('id', contentId)
        .single();

      if (fetchError) {
        logger.error('Failed to fetch content', fetchError);
        return { error: fetchError };
      }

      const newVersion = (content.version || 0) + 1;

      const { error: updateError } = await supabase
        .from('content')
        .update({
          title: data.title,
          body: data.body,
          metadata: data.metadata,
          version: newVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (updateError) {
        logger.error('Failed to update content version', updateError);
        return { error: updateError };
      }

      logger.info('Content version created', { contentId, version: newVersion });

      return { version: newVersion, error: null };
    } catch (error) {
      logger.error('Error creating version', error as Error);
      return { error: error as Error };
    }
  }

  async getVersionHistory(
    contentId: string
  ): Promise<{ versions: ContentVersion[]; error: Error | null }> {
    if (!supabase) {
      return { versions: [], error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .order('version', { ascending: false });

      if (error) {
        logger.error('Failed to fetch version history', error);
        return { versions: [], error };
      }

      const versions: ContentVersion[] = (data || []).map(v => ({
        id: v.id,
        contentId: v.id,
        version: v.version,
        title: v.title,
        body: v.body,
        metadata: v.metadata,
        createdBy: v.created_by,
        createdAt: new Date(v.created_at)
      }));

      return { versions, error: null };
    } catch (error) {
      logger.error('Error fetching version history', error as Error);
      return { versions: [], error: error as Error };
    }
  }

  async revertToVersion(
    contentId: string,
    version: number
  ): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { data: targetVersion, error: fetchError } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .eq('version', version)
        .single();

      if (fetchError || !targetVersion) {
        return { error: new Error('Version not found') };
      }

      const { data: currentContent, error: currentError } = await supabase
        .from('content')
        .select('version')
        .eq('id', contentId)
        .single();

      if (currentError) {
        return { error: currentError };
      }

      const newVersion = (currentContent.version || 0) + 1;

      const { error: updateError } = await supabase
        .from('content')
        .update({
          title: targetVersion.title,
          body: targetVersion.body,
          metadata: targetVersion.metadata,
          version: newVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (updateError) {
        logger.error('Failed to revert version', updateError);
        return { error: updateError };
      }

      logger.info('Content reverted to version', { contentId, version });
      return { error: null };
    } catch (error) {
      logger.error('Error reverting version', error as Error);
      return { error: error as Error };
    }
  }

  async compareVersions(
    contentId: string,
    version1: number,
    version2: number
  ): Promise<{
    differences: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    error: Error | null;
  }> {
    const { versions, error } = await this.getVersionHistory(contentId);

    if (error) {
      return { differences: [], error };
    }

    const v1 = versions.find(v => v.version === version1);
    const v2 = versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      return { differences: [], error: new Error('Version not found') };
    }

    const differences: any[] = [];

    if (v1.title !== v2.title) {
      differences.push({
        field: 'title',
        oldValue: v1.title,
        newValue: v2.title
      });
    }

    if (v1.body !== v2.body) {
      differences.push({
        field: 'body',
        oldValue: v1.body,
        newValue: v2.body
      });
    }

    return { differences, error: null };
  }
}

export const contentVersionService = ContentVersionService.getInstance();
