import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export interface AuditLogEntry {
  id: string;
  workspaceId?: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'invite'
  | 'remove'
  | 'login'
  | 'logout'
  | 'settings_change'
  | 'subscription_change';

class AuditLogService {
  private static instance: AuditLogService;

  private constructor() {}

  static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService();
    }
    return AuditLogService.instance;
  }

  async log(
    action: AuditAction,
    options: {
      workspaceId?: string;
      userId?: string;
      resourceType?: string;
      resourceId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      logger.info('Logging audit event', { action, ...options });

      const { error } = await supabase.from('audit_logs').insert({
        workspace_id: options.workspaceId,
        user_id: options.userId,
        action,
        resource_type: options.resourceType,
        resource_id: options.resourceId,
        old_values: options.oldValues,
        new_values: options.newValues,
        ip_address: options.ipAddress,
        user_agent: options.userAgent,
      });

      if (error) {
        logger.error('Failed to write audit log', { error });
      }
    } catch (error) {
      logger.error('Audit log failed', { error });
    }
  }

  async getWorkspaceLogs(
    workspaceId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*, user:profiles(display_name)', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (options?.action) {
        query = query.eq('action', options.action);
      }

      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const logs: AuditLogEntry[] = (data || []).map((log: any) => ({
        id: log.id,
        workspaceId: log.workspace_id,
        userId: log.user_id,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: new Date(log.created_at),
      }));

      return { logs, total: count || 0 };
    } catch (error) {
      logger.error('Failed to get workspace logs', { error, workspaceId });
      throw new AppError('Failed to retrieve audit logs', 'AUDIT_LOGS_FAILED');
    }
  }

  async getUserLogs(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((log: any) => ({
        id: log.id,
        workspaceId: log.workspace_id,
        userId: log.user_id,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: new Date(log.created_at),
      }));
    } catch (error) {
      logger.error('Failed to get user logs', { error, userId });
      throw new AppError('Failed to retrieve user logs', 'USER_LOGS_FAILED');
    }
  }

  async searchLogs(
    workspaceId: string,
    searchTerm: string,
    options?: {
      limit?: number;
    }
  ): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 100);

      if (error) throw error;

      return (data || []).map((log: any) => ({
        id: log.id,
        workspaceId: log.workspace_id,
        userId: log.user_id,
        action: log.action,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: new Date(log.created_at),
      }));
    } catch (error) {
      logger.error('Failed to search logs', { error, workspaceId, searchTerm });
      throw new AppError('Failed to search logs', 'LOG_SEARCH_FAILED');
    }
  }

  async exportLogs(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.getWorkspaceLogs(workspaceId, {
        startDate,
        endDate,
        limit: 10000,
      });

      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      }

      const csv = this.convertLogsToCSV(logs);
      return csv;
    } catch (error) {
      logger.error('Failed to export logs', { error, workspaceId });
      throw new AppError('Failed to export logs', 'LOG_EXPORT_FAILED');
    }
  }

  async getActionSummary(
    workspaceId: string,
    days: number = 30
  ): Promise<Record<string, number>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action')
        .eq('workspace_id', workspaceId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const summary: Record<string, number> = {};

      data?.forEach((log: any) => {
        summary[log.action] = (summary[log.action] || 0) + 1;
      });

      return summary;
    } catch (error) {
      logger.error('Failed to get action summary', { error, workspaceId });
      throw new AppError('Failed to get action summary', 'ACTION_SUMMARY_FAILED');
    }
  }

  private convertLogsToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Resource Type',
      'Resource ID',
      'IP Address',
    ];

    const rows = logs.map(log => [
      log.createdAt.toISOString(),
      log.userId || '',
      log.action,
      log.resourceType || '',
      log.resourceId || '',
      log.ipAddress || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}

export const auditLogService = AuditLogService.getInstance();
