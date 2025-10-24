import { z } from 'zod';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { supabase } from '../../lib/supabase';

const EmailConfigSchema = z.object({
  resendApiKey: z.string().optional(),
});

type EmailConfig = z.infer<typeof EmailConfigSchema>;

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
}

export type NotificationType =
  | 'post_published'
  | 'post_failed'
  | 'analytics_report'
  | 'team_invite'
  | 'subscription_renewed'
  | 'subscription_canceled'
  | 'usage_limit_warning';

class EmailNotificationService {
  private static instance: EmailNotificationService;
  private config: EmailConfig;
  private baseUrl = 'https://api.resend.com';

  private constructor() {
    this.config = EmailConfigSchema.parse({
      resendApiKey: import.meta.env.VITE_RESEND_API_KEY,
    });
  }

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<string> {
    try {
      if (!this.config.resendApiKey) {
        logger.warn('Email service not configured, skipping email');
        return 'skipped';
      }

      logger.info('Sending email', { to: options.to, subject: options.subject });

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SparkLabs <noreply@sparklabs.app>',
          to: recipients.map(r => r.email),
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError(`Email service error: ${error.message}`, 'EMAIL_SEND_FAILED');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      logger.error('Failed to send email', { error, options });
      throw error;
    }
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', userId)
        .maybeSingle();

      const { data: authUser } = await supabase.auth.admin.getUserById(userId);

      if (!authUser?.user?.email) {
        logger.warn('User email not found', { userId });
        return;
      }

      const template = this.getTemplate(type, data);

      await this.sendEmail({
        to: {
          email: authUser.user.email,
          name: userProfile?.display_name,
        },
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      logger.info('Notification sent', { userId, type });
    } catch (error) {
      logger.error('Failed to send notification', { error, userId, type });
    }
  }

  async sendPostPublishedNotification(
    userId: string,
    contentTitle: string,
    platform: string,
    url?: string
  ): Promise<void> {
    await this.sendNotification(userId, 'post_published', {
      contentTitle,
      platform,
      url,
    });
  }

  async sendPostFailedNotification(
    userId: string,
    contentTitle: string,
    platform: string,
    error: string
  ): Promise<void> {
    await this.sendNotification(userId, 'post_failed', {
      contentTitle,
      platform,
      error,
    });
  }

  async sendAnalyticsReport(
    userId: string,
    workspaceId: string,
    period: string
  ): Promise<void> {
    await this.sendNotification(userId, 'analytics_report', {
      workspaceId,
      period,
    });
  }

  async sendTeamInvite(
    email: string,
    workspaceName: string,
    inviterName: string,
    role: string
  ): Promise<void> {
    const template = this.getTemplate('team_invite', {
      workspaceName,
      inviterName,
      role,
    });

    await this.sendEmail({
      to: { email },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendUsageLimitWarning(
    userId: string,
    resourceType: string,
    currentUsage: number,
    limit: number
  ): Promise<void> {
    await this.sendNotification(userId, 'usage_limit_warning', {
      resourceType,
      currentUsage,
      limit,
      percentUsed: Math.round((currentUsage / limit) * 100),
    });
  }

  async sendBulkEmail(recipients: EmailRecipient[], options: Omit<EmailOptions, 'to'>): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(recipient =>
          this.sendEmail({
            ...options,
            to: recipient,
          })
        )
      );
    }
  }

  private getTemplate(type: NotificationType, data: Record<string, any>): EmailTemplate {
    switch (type) {
      case 'post_published':
        return {
          name: 'Post Published',
          subject: `Your post "${data.contentTitle}" was published on ${data.platform}`,
          html: `
            <h1>Post Published Successfully!</h1>
            <p>Your post <strong>${data.contentTitle}</strong> has been published on ${data.platform}.</p>
            ${data.url ? `<p><a href="${data.url}">View Post</a></p>` : ''}
          `,
          text: `Your post "${data.contentTitle}" was published on ${data.platform}. ${data.url || ''}`,
        };

      case 'post_failed':
        return {
          name: 'Post Failed',
          subject: `Failed to publish "${data.contentTitle}" on ${data.platform}`,
          html: `
            <h1>Post Publishing Failed</h1>
            <p>We encountered an error while trying to publish your post <strong>${data.contentTitle}</strong> on ${data.platform}.</p>
            <p>Error: ${data.error}</p>
            <p>Please check your connection settings and try again.</p>
          `,
          text: `Failed to publish "${data.contentTitle}" on ${data.platform}. Error: ${data.error}`,
        };

      case 'analytics_report':
        return {
          name: 'Analytics Report',
          subject: `Your ${data.period} analytics report is ready`,
          html: `
            <h1>Analytics Report Ready</h1>
            <p>Your ${data.period} analytics report is now available.</p>
            <p><a href="https://app.sparklabs.com/analytics">View Report</a></p>
          `,
          text: `Your ${data.period} analytics report is ready. View it at https://app.sparklabs.com/analytics`,
        };

      case 'team_invite':
        return {
          name: 'Team Invite',
          subject: `${data.inviterName} invited you to join ${data.workspaceName}`,
          html: `
            <h1>You've Been Invited!</h1>
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.workspaceName}</strong> as a ${data.role}.</p>
            <p><a href="https://app.sparklabs.com/invite">Accept Invitation</a></p>
          `,
          text: `${data.inviterName} invited you to join ${data.workspaceName} as a ${data.role}. Accept at https://app.sparklabs.com/invite`,
        };

      case 'subscription_renewed':
        return {
          name: 'Subscription Renewed',
          subject: 'Your SparkLabs subscription has been renewed',
          html: `
            <h1>Subscription Renewed</h1>
            <p>Your SparkLabs subscription has been successfully renewed.</p>
            <p>Thank you for being a valued customer!</p>
          `,
          text: 'Your SparkLabs subscription has been renewed.',
        };

      case 'subscription_canceled':
        return {
          name: 'Subscription Canceled',
          subject: 'Your SparkLabs subscription has been canceled',
          html: `
            <h1>Subscription Canceled</h1>
            <p>Your SparkLabs subscription has been canceled.</p>
            <p>You will continue to have access until the end of your billing period.</p>
          `,
          text: 'Your SparkLabs subscription has been canceled. Access continues until billing period ends.',
        };

      case 'usage_limit_warning':
        return {
          name: 'Usage Limit Warning',
          subject: `You've used ${data.percentUsed}% of your ${data.resourceType} limit`,
          html: `
            <h1>Usage Limit Warning</h1>
            <p>You've used <strong>${data.currentUsage}</strong> of your <strong>${data.limit}</strong> ${data.resourceType} limit (${data.percentUsed}%).</p>
            <p>Consider upgrading your plan to avoid service interruption.</p>
            <p><a href="https://app.sparklabs.com/subscription">Upgrade Now</a></p>
          `,
          text: `You've used ${data.currentUsage} of ${data.limit} ${data.resourceType} (${data.percentUsed}%). Consider upgrading.`,
        };

      default:
        return {
          name: 'Notification',
          subject: 'SparkLabs Notification',
          html: '<p>You have a new notification from SparkLabs.</p>',
          text: 'You have a new notification from SparkLabs.',
        };
    }
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();
