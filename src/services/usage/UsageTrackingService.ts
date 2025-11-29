import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export type ResourceType = 'post' | 'storage' | 'ai_credit' | 'team_member' | 'export';

export interface UsageRecord {
  id: string;
  workspaceId: string;
  userId: string;
  resourceType: ResourceType;
  amount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface UsageSummary {
  workspaceId: string;
  period: 'day' | 'week' | 'month';
  posts: number;
  storage: number;
  aiCredits: number;
  teamMembers: number;
  exports: number;
}

export interface UsageLimits {
  posts: number;
  storage: number;
  aiCredits: number;
  teamMembers: number;
}

class UsageTrackingService {
  private static instance: UsageTrackingService;

  private constructor() {}

  static getInstance(): UsageTrackingService {
    if (!UsageTrackingService.instance) {
      UsageTrackingService.instance = new UsageTrackingService();
    }
    return UsageTrackingService.instance;
  }

  async trackUsage(
    workspaceId: string,
    userId: string,
    resourceType: ResourceType,
    amount: number = 1,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      logger.info('Tracking usage', { workspaceId, resourceType, amount });

      const { error } = await supabase.from('usage_tracking').insert({
        workspace_id: workspaceId,
        user_id: userId,
        resource_type: resourceType,
        amount,
        metadata: metadata || {},
      });

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to track usage', { error, workspaceId, resourceType });
      throw new AppError('Failed to track usage', 'USAGE_TRACKING_FAILED');
    }
  }

  async getUsageSummary(
    workspaceId: string,
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<UsageSummary> {
    try {
      const startDate = new Date();

      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('resource_type, amount')
        .eq('workspace_id', workspaceId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const summary: UsageSummary = {
        workspaceId,
        period,
        posts: 0,
        storage: 0,
        aiCredits: 0,
        teamMembers: 0,
        exports: 0,
      };

      data?.forEach((record) => {
        switch (record.resource_type) {
          case 'post':
            summary.posts += record.amount;
            break;
          case 'storage':
            summary.storage += record.amount;
            break;
          case 'ai_credit':
            summary.aiCredits += record.amount;
            break;
          case 'team_member':
            summary.teamMembers = Math.max(summary.teamMembers, record.amount);
            break;
          case 'export':
            summary.exports += record.amount;
            break;
        }
      });

      return summary;
    } catch (error) {
      logger.error('Failed to get usage summary', { error, workspaceId });
      throw new AppError('Failed to get usage summary', 'USAGE_SUMMARY_FAILED');
    }
  }

  async checkUsageLimits(workspaceId: string, planId: string): Promise<{
    withinLimits: boolean;
    usage: UsageSummary;
    limits: UsageLimits;
    exceeded: string[];
  }> {
    try {
      const usage = await this.getUsageSummary(workspaceId, 'month');
      const limits = await this.getLimitsForPlan(planId);

      const exceeded: string[] = [];

      if (limits.posts !== -1 && usage.posts >= limits.posts) {
        exceeded.push('posts');
      }

      if (limits.storage !== -1 && usage.storage >= limits.storage) {
        exceeded.push('storage');
      }

      if (limits.aiCredits !== -1 && usage.aiCredits >= limits.aiCredits) {
        exceeded.push('ai_credits');
      }

      if (limits.teamMembers !== -1 && usage.teamMembers >= limits.teamMembers) {
        exceeded.push('team_members');
      }

      return {
        withinLimits: exceeded.length === 0,
        usage,
        limits,
        exceeded,
      };
    } catch (error) {
      logger.error('Failed to check usage limits', { error, workspaceId });
      throw new AppError('Failed to check limits', 'LIMIT_CHECK_FAILED');
    }
  }

  async canUseResource(
    workspaceId: string,
    resourceType: ResourceType,
    amount: number = 1
  ): Promise<boolean> {
    try {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .maybeSingle();

      if (!workspace) return false;

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', workspace.owner_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subscription) return false;

      const limits = await this.getLimitsForPlan(subscription.plan_id);
      const usage = await this.getUsageSummary(workspaceId, 'month');

      switch (resourceType) {
        case 'post':
          return limits.posts === -1 || usage.posts + amount <= limits.posts;
        case 'storage':
          return limits.storage === -1 || usage.storage + amount <= limits.storage;
        case 'ai_credit':
          return limits.aiCredits === -1 || usage.aiCredits + amount <= limits.aiCredits;
        case 'team_member':
          return limits.teamMembers === -1 || usage.teamMembers + amount <= limits.teamMembers;
        default:
          return true;
      }
    } catch (error) {
      logger.error('Failed to check resource availability', { error, workspaceId, resourceType });
      return false;
    }
  }

  async getUsageHistory(
    workspaceId: string,
    resourceType?: ResourceType,
    days: number = 30
  ): Promise<UsageRecord[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('usage_tracking')
        .select('*')
        .eq('workspace_id', workspaceId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((record) => ({
        id: record.id,
        workspaceId: record.workspace_id,
        userId: record.user_id,
        resourceType: record.resource_type,
        amount: record.amount,
        metadata: record.metadata,
        createdAt: new Date(record.created_at),
      }));
    } catch (error) {
      logger.error('Failed to get usage history', { error, workspaceId });
      throw new AppError('Failed to get usage history', 'USAGE_HISTORY_FAILED');
    }
  }

  async resetMonthlyUsage(workspaceId: string): Promise<void> {
    try {
      logger.info('Resetting monthly usage', { workspaceId });
    } catch (error) {
      logger.error('Failed to reset usage', { error, workspaceId });
      throw new AppError('Failed to reset usage', 'USAGE_RESET_FAILED');
    }
  }

  private async getLimitsForPlan(planId: string): Promise<UsageLimits> {
    const planLimits: Record<string, UsageLimits> = {
      'price_starter': {
        posts: 10,
        storage: 5 * 1024 * 1024 * 1024,
        aiCredits: 100,
        teamMembers: 1,
      },
      'price_professional': {
        posts: -1,
        storage: 50 * 1024 * 1024 * 1024,
        aiCredits: 500,
        teamMembers: 5,
      },
      'price_enterprise': {
        posts: -1,
        storage: 500 * 1024 * 1024 * 1024,
        aiCredits: 2000,
        teamMembers: -1,
      },
    };

    return planLimits[planId] || planLimits['price_starter'];
  }
}

export const usageTrackingService = UsageTrackingService.getInstance();
