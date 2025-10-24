import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { DEFAULT_TIMEZONE } from '../../config/constants';

export interface ScheduleOptions {
  contentId: string;
  workspaceId: string;
  scheduledFor: Date;
  timezone: string;
  platforms: string[];
  userId: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  workspaceId: string;
  scheduledFor: Date;
  timezone: string;
  status: 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';
  platforms: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SchedulingService {
  private static instance: SchedulingService;

  private constructor() {
    this.startScheduleProcessor();
  }

  static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService();
    }
    return SchedulingService.instance;
  }

  async schedulePost(options: ScheduleOptions): Promise<{
    scheduleId?: string;
    error: Error | null
  }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          content_id: options.contentId,
          workspace_id: options.workspaceId,
          scheduled_for: options.scheduledFor.toISOString(),
          timezone: options.timezone,
          status: 'pending',
          platforms: options.platforms,
          created_by: options.userId
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create schedule', error);
        return { error };
      }

      logger.info('Post scheduled', {
        scheduleId: data.id,
        scheduledFor: options.scheduledFor
      });

      return { scheduleId: data.id, error: null };
    } catch (error) {
      logger.error('Error scheduling post', error as Error);
      return { error: error as Error };
    }
  }

  async cancelSchedule(scheduleId: string): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .eq('status', 'pending');

      if (error) {
        logger.error('Failed to cancel schedule', error);
        return { error };
      }

      logger.info('Schedule cancelled', { scheduleId });
      return { error: null };
    } catch (error) {
      logger.error('Error cancelling schedule', error as Error);
      return { error: error as Error };
    }
  }

  async updateSchedule(
    scheduleId: string,
    updates: {
      scheduledFor?: Date;
      timezone?: string;
      platforms?: string[];
    }
  ): Promise<{ error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.scheduledFor) {
        updateData.scheduled_for = updates.scheduledFor.toISOString();
      }

      if (updates.timezone) {
        updateData.timezone = updates.timezone;
      }

      if (updates.platforms) {
        updateData.platforms = updates.platforms;
      }

      const { error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', scheduleId)
        .eq('status', 'pending');

      if (error) {
        logger.error('Failed to update schedule', error);
        return { error };
      }

      logger.info('Schedule updated', { scheduleId });
      return { error: null };
    } catch (error) {
      logger.error('Error updating schedule', error as Error);
      return { error: error as Error };
    }
  }

  async getScheduledPosts(
    workspaceId: string,
    options?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<{ schedules: ScheduledPost[]; error: Error | null }> {
    if (!supabase) {
      return { schedules: [], error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('scheduled_for', { ascending: true });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.startDate) {
        query = query.gte('scheduled_for', options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte('scheduled_for', options.endDate.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch schedules', error);
        return { schedules: [], error };
      }

      const schedules: ScheduledPost[] = (data || []).map(s => ({
        id: s.id,
        contentId: s.content_id,
        workspaceId: s.workspace_id,
        scheduledFor: new Date(s.scheduled_for),
        timezone: s.timezone,
        status: s.status,
        platforms: s.platforms,
        createdBy: s.created_by,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at)
      }));

      return { schedules, error: null };
    } catch (error) {
      logger.error('Error fetching schedules', error as Error);
      return { schedules: [], error: error as Error };
    }
  }

  async getOptimalPostingTimes(
    workspaceId: string,
    platform: string
  ): Promise<{ times: Date[]; error: Error | null }> {
    const optimalHours: Record<string, number[]> = {
      instagram: [9, 11, 13, 19],
      tiktok: [12, 15, 18, 21],
      youtube: [14, 17, 20],
      twitter: [8, 12, 17, 21],
      linkedin: [8, 10, 12, 17],
      pinterest: [9, 14, 20]
    };

    const hours = optimalHours[platform] || [9, 12, 15, 18];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const times = hours.map(hour => {
      const time = new Date(tomorrow);
      time.setHours(hour, 0, 0, 0);
      return time;
    });

    return { times, error: null };
  }

  private startScheduleProcessor(): void {
    if (typeof window === 'undefined') return;

    setInterval(async () => {
      await this.processSchedules();
    }, 60000);
  }

  private async processSchedules(): Promise<void> {
    if (!supabase) return;

    try {
      const now = new Date();

      const { data: duePosts, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISOString())
        .limit(10);

      if (error || !duePosts || duePosts.length === 0) {
        return;
      }

      logger.info(`Processing ${duePosts.length} scheduled posts`);

      for (const post of duePosts) {
        await this.publishScheduledPost(post);
      }
    } catch (error) {
      logger.error('Error processing schedules', error as Error);
    }
  }

  private async publishScheduledPost(schedule: any): Promise<void> {
    logger.info('Publishing scheduled post', { scheduleId: schedule.id });

    await supabase
      ?.from('schedules')
      .update({
        status: 'publishing',
        updated_at: new Date().toISOString()
      })
      .eq('id', schedule.id);
  }
}

export const schedulingService = SchedulingService.getInstance();
