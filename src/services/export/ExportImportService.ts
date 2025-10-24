import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export interface ExportOptions {
  includeContent?: boolean;
  includeMedia?: boolean;
  includeAnalytics?: boolean;
  includeSettings?: boolean;
  format?: 'json' | 'csv';
}

export interface ExportData {
  version: string;
  exportedAt: string;
  workspace: any;
  content?: any[];
  media?: any[];
  analytics?: any[];
  settings?: any;
}

export interface ImportResult {
  success: boolean;
  imported: {
    content: number;
    media: number;
    analytics: number;
  };
  errors: string[];
}

class ExportImportService {
  private static instance: ExportImportService;
  private readonly VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): ExportImportService {
    if (!ExportImportService.instance) {
      ExportImportService.instance = new ExportImportService();
    }
    return ExportImportService.instance;
  }

  async exportWorkspace(
    workspaceId: string,
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      logger.info('Exporting workspace', { workspaceId, options });

      const exportData: ExportData = {
        version: this.VERSION,
        exportedAt: new Date().toISOString(),
        workspace: {},
      };

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .maybeSingle();

      if (!workspace) {
        throw new AppError('Workspace not found', 'WORKSPACE_NOT_FOUND');
      }

      exportData.workspace = workspace;

      if (options.includeContent !== false) {
        const { data: content } = await supabase
          .from('content')
          .select('*')
          .eq('workspace_id', workspaceId);

        exportData.content = content || [];
      }

      if (options.includeMedia !== false) {
        const { data: media } = await supabase
          .from('media')
          .select('*')
          .eq('workspace_id', workspaceId);

        exportData.media = media || [];
      }

      if (options.includeAnalytics !== false) {
        const { data: posts } = await supabase
          .from('published_posts')
          .select('id, content!inner(workspace_id)')
          .eq('content.workspace_id', workspaceId);

        if (posts && posts.length > 0) {
          const postIds = posts.map(p => p.id);
          const { data: analytics } = await supabase
            .from('analytics')
            .select('*')
            .in('post_id', postIds);

          exportData.analytics = analytics || [];
        }
      }

      if (options.includeSettings !== false) {
        exportData.settings = workspace.settings;
      }

      if (options.format === 'csv') {
        return this.convertToCSV(exportData);
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logger.error('Failed to export workspace', { error, workspaceId });
      throw new AppError('Failed to export workspace', 'EXPORT_FAILED');
    }
  }

  async importWorkspace(
    workspaceId: string,
    data: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<ImportResult> {
    try {
      logger.info('Importing workspace data', { workspaceId, format });

      let importData: ExportData;

      if (format === 'json') {
        importData = JSON.parse(data);
      } else {
        throw new AppError('CSV import not yet supported', 'UNSUPPORTED_FORMAT');
      }

      const result: ImportResult = {
        success: true,
        imported: {
          content: 0,
          media: 0,
          analytics: 0,
        },
        errors: [],
      };

      if (importData.content && importData.content.length > 0) {
        try {
          const contentToImport = importData.content.map(item => ({
            ...item,
            id: undefined,
            workspace_id: workspaceId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const { error } = await supabase
            .from('content')
            .insert(contentToImport);

          if (error) throw error;

          result.imported.content = contentToImport.length;
        } catch (error) {
          result.errors.push(`Content import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (importData.media && importData.media.length > 0) {
        try {
          const mediaToImport = importData.media.map(item => ({
            ...item,
            id: undefined,
            workspace_id: workspaceId,
            created_at: new Date().toISOString(),
          }));

          const { error } = await supabase
            .from('media')
            .insert(mediaToImport);

          if (error) throw error;

          result.imported.media = mediaToImport.length;
        } catch (error) {
          result.errors.push(`Media import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error) {
      logger.error('Failed to import workspace', { error, workspaceId });
      throw new AppError('Failed to import workspace', 'IMPORT_FAILED');
    }
  }

  async exportContent(contentId: string, format: 'json' | 'markdown' = 'json'): Promise<string> {
    try {
      const { data: content } = await supabase
        .from('content')
        .select('*, media:content_media(media:media(*))')
        .eq('id', contentId)
        .maybeSingle();

      if (!content) {
        throw new AppError('Content not found', 'CONTENT_NOT_FOUND');
      }

      if (format === 'markdown') {
        return this.convertToMarkdown(content);
      }

      return JSON.stringify(content, null, 2);
    } catch (error) {
      logger.error('Failed to export content', { error, contentId });
      throw new AppError('Failed to export content', 'CONTENT_EXPORT_FAILED');
    }
  }

  async duplicateContent(contentId: string, newWorkspaceId?: string): Promise<string> {
    try {
      const { data: content } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .maybeSingle();

      if (!content) {
        throw new AppError('Content not found', 'CONTENT_NOT_FOUND');
      }

      const newContent = {
        ...content,
        id: undefined,
        workspace_id: newWorkspaceId || content.workspace_id,
        title: `${content.title} (Copy)`,
        status: 'draft',
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from('content')
        .insert(newContent)
        .select()
        .maybeSingle();

      if (error) throw error;

      return inserted.id;
    } catch (error) {
      logger.error('Failed to duplicate content', { error, contentId });
      throw new AppError('Failed to duplicate content', 'DUPLICATE_FAILED');
    }
  }

  async backupWorkspace(workspaceId: string): Promise<string> {
    try {
      const exportData = await this.exportWorkspace(workspaceId, {
        includeContent: true,
        includeMedia: true,
        includeAnalytics: true,
        includeSettings: true,
      });

      const { data, error } = await supabase.storage
        .from('backups')
        .upload(
          `${workspaceId}/backup-${Date.now()}.json`,
          exportData,
          {
            contentType: 'application/json',
          }
        );

      if (error) throw error;

      return data.path;
    } catch (error) {
      logger.error('Failed to backup workspace', { error, workspaceId });
      throw new AppError('Failed to backup workspace', 'BACKUP_FAILED');
    }
  }

  async restoreWorkspace(workspaceId: string, backupPath: string): Promise<ImportResult> {
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .download(backupPath);

      if (error) throw error;

      const backupData = await data.text();
      return await this.importWorkspace(workspaceId, backupData);
    } catch (error) {
      logger.error('Failed to restore workspace', { error, workspaceId });
      throw new AppError('Failed to restore workspace', 'RESTORE_FAILED');
    }
  }

  private convertToCSV(data: ExportData): string {
    if (!data.content || data.content.length === 0) {
      return 'No content to export';
    }

    const headers = Object.keys(data.content[0]);
    const rows = data.content.map(item =>
      headers.map(header => {
        const value = item[header];
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      })
    );

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  private convertToMarkdown(content: any): string {
    let markdown = `# ${content.title}\n\n`;

    if (content.body) {
      markdown += `${content.body}\n\n`;
    }

    if (content.metadata) {
      markdown += `## Metadata\n\n`;
      markdown += `- **Status**: ${content.status}\n`;
      markdown += `- **Type**: ${content.type}\n`;
      markdown += `- **Created**: ${new Date(content.created_at).toLocaleDateString()}\n`;
    }

    return markdown;
  }
}

export const exportImportService = ExportImportService.getInstance();
