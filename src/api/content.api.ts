import { apiClient } from './client';
import { Content, PublishingSchedule } from '../types';

class ContentApi {
  private static instance: ContentApi;

  private constructor() {}

  public static getInstance(): ContentApi {
    if (!ContentApi.instance) {
      ContentApi.instance = new ContentApi();
    }
    return ContentApi.instance;
  }

  async getContent(workspaceId: string, filters?: Record<string, any>): Promise<Content[]> {
    return apiClient.query<Content>('content', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  async getContentById(id: string): Promise<Content | null> {
    return apiClient.queryOne<Content>('content', { id });
  }

  async createContent(content: Partial<Content>): Promise<Content> {
    const [result] = await apiClient.insert<Content>('content', content);
    return result;
  }

  async updateContent(id: string, data: Partial<Content>): Promise<Content> {
    return apiClient.update<Content>('content', id, data);
  }

  async deleteContent(id: string): Promise<void> {
    await apiClient.delete('content', { id });
  }

  async getScheduledContent(workspaceId: string, filters?: Record<string, any>): Promise<PublishingSchedule[]> {
    return apiClient.query<PublishingSchedule>('publishing_schedule', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'scheduled_time', ascending: true }
    });
  }

  async scheduleContent(schedule: Partial<PublishingSchedule>): Promise<PublishingSchedule> {
    const [result] = await apiClient.insert<PublishingSchedule>('publishing_schedule', schedule);
    return result;
  }

  async updateSchedule(id: string, data: Partial<PublishingSchedule>): Promise<PublishingSchedule> {
    return apiClient.update<PublishingSchedule>('publishing_schedule', id, data);
  }

  async cancelSchedule(id: string): Promise<void> {
    await apiClient.update<PublishingSchedule>('publishing_schedule', id, { status: 'cancelled' });
  }
}

export const contentApi = ContentApi.getInstance();
