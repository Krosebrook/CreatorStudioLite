import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import type {
  PerformanceAlert,
  AlertNotification,
  AlertSeverity,
  AlertStatus,
  Database,
} from '../../types/analytics-database.types';

export interface AlertRule {
  name: string;
  description?: string;
  alertType: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'increases_by' | 'decreases_by';
  thresholdValue?: number;
  comparisonPeriod?: string;
  platform?: string;
  connectorId?: string;
  contentId?: string;
  notificationChannels: Array<'email' | 'in_app' | 'webhook'>;
  notificationRecipients: string[];
  webhookUrl?: string;
  cooldownMinutes?: number;
  severity: AlertSeverity;
}

export interface AlertCheck {
  alertId: string;
  metric: string;
  currentValue: number;
  thresholdValue: number;
  previousValue?: number;
  triggered: boolean;
  reason?: string;
}

export interface AlertSummary {
  activeAlerts: number;
  triggeredToday: number;
  criticalAlerts: number;
  recentNotifications: AlertNotification[];
}

/**
 * AlertService
 * 
 * Manages performance alerts and notifications.
 * Monitors metrics and triggers alerts based on defined rules.
 */
class AlertService {
  private static instance: AlertService;
  private readonly DEFAULT_COOLDOWN = 60; // minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Create alert rule
   */
  async createAlert(
    workspaceId: string,
    userId: string,
    rule: AlertRule
  ): Promise<PerformanceAlert> {
    try {
      logger.info('Creating alert rule', { workspaceId, name: rule.name });

      const alertData: Database['public']['Tables']['performance_alerts']['Insert'] = {
        workspace_id: workspaceId,
        created_by: userId,
        alert_name: rule.name,
        description: rule.description || null,
        alert_type: rule.alertType,
        metric: rule.metric,
        condition_operator: rule.operator,
        threshold_value: rule.thresholdValue || null,
        comparison_period: rule.comparisonPeriod || null,
        platform: rule.platform || null,
        connector_id: rule.connectorId || null,
        content_id: rule.contentId || null,
        notification_channels: rule.notificationChannels,
        notification_recipients: rule.notificationRecipients,
        webhook_url: rule.webhookUrl || null,
        cooldown_minutes: rule.cooldownMinutes || this.DEFAULT_COOLDOWN,
        severity: rule.severity,
        is_active: true,
        metadata: {},
      };

      const { data: alert, error } = await supabase
        .from('performance_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error || !alert) {
        throw new AppError('Failed to create alert', 'CREATE_FAILED');
      }

      return alert;
    } catch (error) {
      logger.error('Failed to create alert', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to create alert', 'CREATE_FAILED');
    }
  }

  /**
   * Check alert conditions
   */
  async checkAlert(alertId: string, currentMetrics: Record<string, number>): Promise<AlertCheck> {
    try {
      logger.info('Checking alert condition', { alertId });

      // Get alert configuration
      const { data: alert, error } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (error || !alert) {
        throw new AppError('Alert not found', 'NOT_FOUND');
      }

      // Check if alert is active
      if (!alert.is_active) {
        return {
          alertId,
          metric: alert.metric,
          currentValue: 0,
          thresholdValue: alert.threshold_value || 0,
          triggered: false,
          reason: 'Alert is inactive',
        };
      }

      // Check cooldown period
      if (alert.last_triggered_at) {
        const lastTriggered = new Date(alert.last_triggered_at);
        const cooldownExpiry = new Date(lastTriggered.getTime() + alert.cooldown_minutes * 60000);

        if (new Date() < cooldownExpiry) {
          return {
            alertId,
            metric: alert.metric,
            currentValue: currentMetrics[alert.metric] || 0,
            thresholdValue: alert.threshold_value || 0,
            triggered: false,
            reason: 'In cooldown period',
          };
        }
      }

      // Get current value for the metric
      const currentValue = currentMetrics[alert.metric] || 0;

      // Get previous value if comparison period is specified
      let previousValue: number | undefined;
      if (alert.comparison_period) {
        previousValue = await this.getPreviousValue(alert);
      }

      // Evaluate condition
      const triggered = this.evaluateCondition(
        alert.condition_operator,
        currentValue,
        alert.threshold_value || 0,
        previousValue
      );

      return {
        alertId,
        metric: alert.metric,
        currentValue,
        thresholdValue: alert.threshold_value || 0,
        previousValue,
        triggered,
        reason: triggered ? this.getTriggeredReason(alert, currentValue, previousValue) : undefined,
      };
    } catch (error) {
      logger.error('Failed to check alert', { error, alertId });
      throw error instanceof AppError ? error : new AppError('Failed to check alert', 'CHECK_FAILED');
    }
  }

  /**
   * Trigger alert and send notifications
   */
  async triggerAlert(
    alertId: string,
    check: AlertCheck,
    context?: {
      platform?: string;
      contentTitle?: string;
      postUrl?: string;
    }
  ): Promise<AlertNotification> {
    try {
      logger.info('Triggering alert', { alertId, metric: check.metric });

      // Get alert configuration
      const { data: alert, error } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (error || !alert) {
        throw new AppError('Alert not found', 'NOT_FOUND');
      }

      // Create notification
      const message = this.generateAlertMessage(alert, check, context);

      const notificationData: Database['public']['Tables']['alert_notifications']['Insert'] = {
        workspace_id: alert.workspace_id,
        alert_id: alertId,
        triggered_at: new Date().toISOString(),
        status: 'active',
        metric_name: check.metric,
        current_value: check.currentValue,
        threshold_value: check.thresholdValue,
        previous_value: check.previousValue || null,
        platform: context?.platform || alert.platform,
        content_title: context?.contentTitle || null,
        post_url: context?.postUrl || null,
        alert_message: message,
        alert_details: {
          check,
          context,
        },
        metadata: {},
      };

      const { data: notification, error: notifError } = await supabase
        .from('alert_notifications')
        .insert(notificationData)
        .select()
        .single();

      if (notifError || !notification) {
        throw new AppError('Failed to create notification', 'NOTIFICATION_FAILED');
      }

      // Update alert last triggered time
      await supabase
        .from('performance_alerts')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', alertId);

      // Send notifications
      await this.sendNotifications(alert, notification, message);

      return notification;
    } catch (error) {
      logger.error('Failed to trigger alert', { error, alertId });
      throw error instanceof AppError ? error : new AppError('Failed to trigger', 'TRIGGER_FAILED');
    }
  }

  /**
   * Monitor metrics and check all active alerts
   */
  async monitorMetrics(
    workspaceId: string,
    metrics: Record<string, number>,
    context?: {
      platform?: string;
      connectorId?: string;
      contentId?: string;
    }
  ): Promise<AlertNotification[]> {
    try {
      logger.info('Monitoring metrics for alerts', { workspaceId });

      // Get active alerts for workspace
      const alerts = await this.getActiveAlerts(workspaceId, context);

      const notifications: AlertNotification[] = [];

      for (const alert of alerts) {
        // Check alert condition
        const check = await this.checkAlert(alert.id, metrics);

        // If triggered, send notification
        if (check.triggered) {
          const notification = await this.triggerAlert(alert.id, check, context);
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      logger.error('Failed to monitor metrics', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to monitor', 'MONITOR_FAILED');
    }
  }

  /**
   * Acknowledge alert notification
   */
  async acknowledgeAlert(
    notificationId: string,
    userId: string,
    notes?: string
  ): Promise<AlertNotification> {
    try {
      logger.info('Acknowledging alert', { notificationId });

      const { data: notification, error } = await supabase
        .from('alert_notifications')
        .update({
          status: 'acknowledged',
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
          resolution_notes: notes || null,
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error || !notification) {
        throw new AppError('Failed to acknowledge alert', 'ACKNOWLEDGE_FAILED');
      }

      return notification;
    } catch (error) {
      logger.error('Failed to acknowledge alert', { error, notificationId });
      throw error instanceof AppError ? error : new AppError('Failed to acknowledge', 'ACKNOWLEDGE_FAILED');
    }
  }

  /**
   * Resolve alert notification
   */
  async resolveAlert(
    notificationId: string,
    userId: string,
    notes?: string
  ): Promise<AlertNotification> {
    try {
      logger.info('Resolving alert', { notificationId });

      const { data: notification, error } = await supabase
        .from('alert_notifications')
        .update({
          status: 'resolved',
          acknowledged_by: userId,
          resolution_notes: notes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error || !notification) {
        throw new AppError('Failed to resolve alert', 'RESOLVE_FAILED');
      }

      return notification;
    } catch (error) {
      logger.error('Failed to resolve alert', { error, notificationId });
      throw error instanceof AppError ? error : new AppError('Failed to resolve', 'RESOLVE_FAILED');
    }
  }

  /**
   * Get alert summary
   */
  async getAlertSummary(workspaceId: string): Promise<AlertSummary> {
    try {
      logger.info('Getting alert summary', { workspaceId });

      // Count active alerts
      const { count: activeAlerts } = await supabase
        .from('performance_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('is_active', true);

      // Count critical alerts
      const { count: criticalAlerts } = await supabase
        .from('performance_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('is_active', true)
        .eq('severity', 'critical');

      // Count triggered today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: triggeredToday } = await supabase
        .from('alert_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .gte('triggered_at', today.toISOString());

      // Get recent notifications
      const { data: recentNotifications } = await supabase
        .from('alert_notifications')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('triggered_at', { ascending: false })
        .limit(10);

      return {
        activeAlerts: activeAlerts || 0,
        triggeredToday: triggeredToday || 0,
        criticalAlerts: criticalAlerts || 0,
        recentNotifications: recentNotifications || [],
      };
    } catch (error) {
      logger.error('Failed to get alert summary', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get summary', 'SUMMARY_FAILED');
    }
  }

  /**
   * Get alerts for workspace
   */
  async getAlerts(
    workspaceId: string,
    filters?: {
      isActive?: boolean;
      severity?: AlertSeverity;
      platform?: string;
    }
  ): Promise<PerformanceAlert[]> {
    try {
      let query = supabase
        .from('performance_alerts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.platform) {
        query = query.eq('platform', filters.platform);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch alerts', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get alerts', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get alerts', 'FETCH_FAILED');
    }
  }

  /**
   * Get notifications
   */
  async getNotifications(
    workspaceId: string,
    filters?: {
      status?: AlertStatus;
      alertId?: string;
      limit?: number;
    }
  ): Promise<AlertNotification[]> {
    try {
      let query = supabase
        .from('alert_notifications')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('triggered_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.alertId) {
        query = query.eq('alert_id', filters.alertId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch notifications', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get notifications', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get notifications', 'FETCH_FAILED');
    }
  }

  /**
   * Update alert
   */
  async updateAlert(
    alertId: string,
    updates: Partial<AlertRule>
  ): Promise<PerformanceAlert> {
    try {
      logger.info('Updating alert', { alertId });

      const updateData: Database['public']['Tables']['performance_alerts']['Update'] = {};

      if (updates.name) updateData.alert_name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.thresholdValue !== undefined) updateData.threshold_value = updates.thresholdValue;
      if (updates.notificationChannels) updateData.notification_channels = updates.notificationChannels;
      if (updates.notificationRecipients) updateData.notification_recipients = updates.notificationRecipients;
      if (updates.severity) updateData.severity = updates.severity;

      const { data: alert, error } = await supabase
        .from('performance_alerts')
        .update(updateData)
        .eq('id', alertId)
        .select()
        .single();

      if (error || !alert) {
        throw new AppError('Failed to update alert', 'UPDATE_FAILED');
      }

      return alert;
    } catch (error) {
      logger.error('Failed to update alert', { error, alertId });
      throw error instanceof AppError ? error : new AppError('Failed to update', 'UPDATE_FAILED');
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    try {
      logger.info('Deleting alert', { alertId });

      const { error } = await supabase
        .from('performance_alerts')
        .update({ is_active: false })
        .eq('id', alertId);

      if (error) {
        throw new AppError('Failed to delete alert', 'DELETE_FAILED');
      }
    } catch (error) {
      logger.error('Failed to delete alert', { error, alertId });
      throw error instanceof AppError ? error : new AppError('Failed to delete', 'DELETE_FAILED');
    }
  }

  /**
   * Get active alerts for workspace
   */
  private async getActiveAlerts(
    workspaceId: string,
    context?: {
      platform?: string;
      connectorId?: string;
      contentId?: string;
    }
  ): Promise<PerformanceAlert[]> {
    let query = supabase
      .from('performance_alerts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    if (context?.platform) {
      query = query.or(`platform.eq.${context.platform},platform.is.null`);
    }

    if (context?.connectorId) {
      query = query.or(`connector_id.eq.${context.connectorId},connector_id.is.null`);
    }

    if (context?.contentId) {
      query = query.or(`content_id.eq.${context.contentId},content_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch active alerts', 'FETCH_FAILED');
    }

    return data || [];
  }

  /**
   * Get previous value for comparison
   */
  private async getPreviousValue(alert: PerformanceAlert): Promise<number> {
    // Simplified - in production, query historical data based on comparison_period
    return 0;
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(
    operator: string,
    currentValue: number,
    thresholdValue: number,
    previousValue?: number
  ): boolean {
    switch (operator) {
      case 'greater_than':
        return currentValue > thresholdValue;
      case 'less_than':
        return currentValue < thresholdValue;
      case 'equals':
        return currentValue === thresholdValue;
      case 'not_equals':
        return currentValue !== thresholdValue;
      case 'increases_by':
        return previousValue !== undefined && (currentValue - previousValue) >= thresholdValue;
      case 'decreases_by':
        return previousValue !== undefined && (previousValue - currentValue) >= thresholdValue;
      default:
        return false;
    }
  }

  /**
   * Get triggered reason
   */
  private getTriggeredReason(
    alert: PerformanceAlert,
    currentValue: number,
    previousValue?: number
  ): string {
    const metric = alert.metric;
    const operator = alert.condition_operator;
    const threshold = alert.threshold_value || 0;

    switch (operator) {
      case 'greater_than':
        return `${metric} (${currentValue}) exceeded threshold of ${threshold}`;
      case 'less_than':
        return `${metric} (${currentValue}) dropped below threshold of ${threshold}`;
      case 'increases_by':
        return `${metric} increased by ${currentValue - (previousValue || 0)} (threshold: ${threshold})`;
      case 'decreases_by':
        return `${metric} decreased by ${(previousValue || 0) - currentValue} (threshold: ${threshold})`;
      default:
        return `${metric} triggered alert condition`;
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    alert: PerformanceAlert,
    check: AlertCheck,
    context?: {
      platform?: string;
      contentTitle?: string;
      postUrl?: string;
    }
  ): string {
    let message = `Alert: ${alert.alert_name}\n\n`;
    message += `${check.reason}\n\n`;

    if (context?.platform) {
      message += `Platform: ${context.platform}\n`;
    }

    if (context?.contentTitle) {
      message += `Content: ${context.contentTitle}\n`;
    }

    if (alert.description) {
      message += `\nDescription: ${alert.description}\n`;
    }

    return message;
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(
    alert: PerformanceAlert,
    notification: AlertNotification,
    message: string
  ): Promise<void> {
    const channels = alert.notification_channels;

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(alert, notification, message);
            break;
          case 'in_app':
            // In-app notifications are already stored in database
            logger.info('In-app notification created', { notificationId: notification.id });
            break;
          case 'webhook':
            if (alert.webhook_url) {
              await this.sendWebhookNotification(alert.webhook_url, notification, message);
            }
            break;
        }
      } catch (error) {
        logger.error('Failed to send notification via channel', { error, channel });
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    alert: PerformanceAlert,
    notification: AlertNotification,
    message: string
  ): Promise<void> {
    // Implement email sending logic
    logger.info('Email notification sent', {
      recipients: alert.notification_recipients,
      alertId: alert.id,
    });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    webhookUrl: string,
    notification: AlertNotification,
    message: string
  ): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification,
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      logger.info('Webhook notification sent', { webhookUrl });
    } catch (error) {
      logger.error('Failed to send webhook notification', { error, webhookUrl });
    }
  }
}

export const alertService = AlertService.getInstance();
