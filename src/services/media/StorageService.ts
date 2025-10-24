import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

export interface UploadOptions {
  workspaceId: string;
  userId: string;
  folder?: string;
  makePublic?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export class StorageService {
  private static instance: StorageService;
  private readonly BUCKET_NAME = 'media';

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase not configured'
      };
    }

    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      const folder = options.folder || 'uploads';
      const filePath = `${options.workspaceId}/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        logger.error('File upload failed', error);
        return {
          success: false,
          error: error.message
        };
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      await this.saveMediaRecord(file, filePath, urlData.publicUrl, options);

      logger.info('File uploaded successfully', { path: filePath });

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      logger.error('Upload error', error as Error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async saveMediaRecord(
    file: File,
    path: string,
    url: string,
    options: UploadOptions
  ): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('media')
        .insert({
          workspace_id: options.workspaceId,
          uploaded_by: options.userId,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          storage_path: path,
          url: url,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) {
        logger.error('Failed to save media record', error);
      }
    } catch (error) {
      logger.error('Error saving media record', error as Error);
    }
  }

  async uploadMultiple(
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult[]> {
    return Promise.all(
      files.map(file => this.uploadFile(file, options))
    );
  }

  async deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        logger.error('File deletion failed', error);
        return { success: false, error: error.message };
      }

      await supabase
        .from('media')
        .delete()
        .eq('storage_path', path);

      logger.info('File deleted successfully', { path });
      return { success: true };
    } catch (error) {
      logger.error('Delete error', error as Error);
      return { success: false, error: (error as Error).message };
    }
  }

  async getWorkspaceMedia(
    workspaceId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
    }
  ): Promise<{ media: any[]; error: Error | null }> {
    if (!supabase) {
      return { media: [], error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase
        .from('media')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.like('mime_type', `${options.type}/%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch workspace media', error);
        return { media: [], error };
      }

      return { media: data || [], error: null };
    } catch (error) {
      logger.error('Error fetching workspace media', error as Error);
      return { media: [], error: error as Error };
    }
  }
}

export const storageService = StorageService.getInstance();
