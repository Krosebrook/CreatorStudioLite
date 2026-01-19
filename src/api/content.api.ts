import { apiClient } from './client';
import { Content, PublishingSchedule } from '../types';

/**
 * Content API client for managing content and publishing schedules.
 * 
 * Provides methods for CRUD operations on content items and publishing schedules.
 * Implements singleton pattern for consistent API access across the application.
 * 
 * @example
 * ```typescript
 * import { contentApi } from './api';
 * 
 * // Fetch content
 * const content = await contentApi.getContent('workspace-123', {
 *   status: 'published'
 * });
 * 
 * // Create new content
 * const newContent = await contentApi.createContent({
 *   workspace_id: 'workspace-123',
 *   title: 'My Post',
 *   body: 'Content here...',
 *   status: 'draft'
 * });
 * ```
 * 
 * @class
 * @since 1.0.0
 */
class ContentApi {
  private static instance: ContentApi;

  private constructor() {}

  /**
   * Returns the singleton instance of ContentApi.
   * 
   * @returns The ContentApi instance
   */
  public static getInstance(): ContentApi {
    if (!ContentApi.instance) {
      ContentApi.instance = new ContentApi();
    }
    return ContentApi.instance;
  }

  /**
   * Retrieves content for a workspace with optional filtering.
   * 
   * @param workspaceId - The workspace ID to query
   * @param [filters] - Additional filter criteria (e.g., status, platform)
   * 
   * @returns Promise resolving to an array of content items
   * 
   * @example
   * ```typescript
   * // Get all content
   * const allContent = await contentApi.getContent('workspace-123');
   * 
   * // Get only published content
   * const published = await contentApi.getContent('workspace-123', {
   *   status: 'published'
   * });
   * 
   * // Get Instagram content
   * const instagram = await contentApi.getContent('workspace-123', {
   *   platform: 'instagram'
   * });
   * ```
   */
  async getContent(workspaceId: string, filters?: Record<string, any>): Promise<Content[]> {
    return apiClient.query<Content>('content', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Retrieves a single content item by ID.
   * 
   * @param id - The content ID
   * 
   * @returns Promise resolving to the content item or null if not found
   * 
   * @example
   * ```typescript
   * const content = await contentApi.getContentById('content-123');
   * if (content) {
   *   console.log('Content title:', content.title);
   * }
   * ```
   */
  async getContentById(id: string): Promise<Content | null> {
    return apiClient.queryOne<Content>('content', { id });
  }

  /**
   * Creates new content.
   * 
   * @param content - Partial content object with required fields
   * 
   * @returns Promise resolving to the created content item
   * 
   * @throws {ValidationError} If required fields are missing
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * const newContent = await contentApi.createContent({
   *   workspace_id: 'workspace-123',
   *   title: 'New Blog Post',
   *   body: 'This is the content...',
   *   status: 'draft',
   *   platforms: ['instagram', 'facebook']
   * });
   * ```
   */
  async createContent(content: Partial<Content>): Promise<Content> {
    const [result] = await apiClient.insert<Content>('content', content);
    return result;
  }

  /**
   * Updates existing content.
   * 
   * @param id - The content ID to update
   * @param data - Partial content object with fields to update
   * 
   * @returns Promise resolving to the updated content item
   * 
   * @throws {NotFoundError} If content doesn't exist
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * const updated = await contentApi.updateContent('content-123', {
   *   title: 'Updated Title',
   *   status: 'published'
   * });
   * ```
   */
  async updateContent(id: string, data: Partial<Content>): Promise<Content> {
    return apiClient.update<Content>('content', id, data);
  }

  /**
   * Deletes content by ID.
   * 
   * @param id - The content ID to delete
   * 
   * @returns Promise that resolves when deletion is complete
   * 
   * @throws {NotFoundError} If content doesn't exist
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * await contentApi.deleteContent('content-123');
   * ```
   */
  async deleteContent(id: string): Promise<void> {
    await apiClient.delete('content', { id });
  }

  /**
   * Retrieves scheduled publishing tasks for a workspace.
   * 
   * @param workspaceId - The workspace ID to query
   * @param [filters] - Additional filter criteria
   * 
   * @returns Promise resolving to an array of publishing schedules
   * 
   * @example
   * ```typescript
   * // Get all scheduled posts
   * const scheduled = await contentApi.getScheduledContent('workspace-123');
   * 
   * // Get pending schedules only
   * const pending = await contentApi.getScheduledContent('workspace-123', {
   *   status: 'pending'
   * });
   * ```
   */
  async getScheduledContent(workspaceId: string, filters?: Record<string, any>): Promise<PublishingSchedule[]> {
    return apiClient.query<PublishingSchedule>('publishing_schedule', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'scheduled_time', ascending: true }
    });
  }

  /**
   * Creates a new publishing schedule for content.
   * 
   * @param schedule - Partial publishing schedule object
   * 
   * @returns Promise resolving to the created schedule
   * 
   * @example
   * ```typescript
   * const schedule = await contentApi.scheduleContent({
   *   content_id: 'content-123',
   *   workspace_id: 'workspace-123',
   *   scheduled_time: new Date('2025-12-31T12:00:00Z'),
   *   platforms: ['instagram', 'facebook'],
   *   status: 'pending'
   * });
   * ```
   */
  async scheduleContent(schedule: Partial<PublishingSchedule>): Promise<PublishingSchedule> {
    const [result] = await apiClient.insert<PublishingSchedule>('publishing_schedule', schedule);
    return result;
  }

  /**
   * Updates an existing publishing schedule.
   * 
   * @param id - The schedule ID to update
   * @param data - Partial schedule object with fields to update
   * 
   * @returns Promise resolving to the updated schedule
   * 
   * @example
   * ```typescript
   * const updated = await contentApi.updateSchedule('schedule-123', {
   *   scheduled_time: new Date('2025-12-31T15:00:00Z')
   * });
   * ```
   */
  async updateSchedule(id: string, data: Partial<PublishingSchedule>): Promise<PublishingSchedule> {
    return apiClient.update<PublishingSchedule>('publishing_schedule', id, data);
  }

  /**
   * Cancels a publishing schedule by setting its status to 'cancelled'.
   * 
   * @param id - The schedule ID to cancel
   * 
   * @returns Promise that resolves when cancellation is complete
   * 
   * @example
   * ```typescript
   * await contentApi.cancelSchedule('schedule-123');
   * ```
   */
  async cancelSchedule(id: string): Promise<void> {
    await apiClient.update<PublishingSchedule>('publishing_schedule', id, { status: 'cancelled' });
  }
}

export const contentApi = ContentApi.getInstance();
