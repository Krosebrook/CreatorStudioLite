import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import type {
  CustomReport,
  ReportSchedule,
  ReportExecution,
  ReportStatus,
  ReportFormat,
  Database,
} from '../../types/analytics-database.types';

export interface ReportConfig {
  name: string;
  description?: string;
  reportType: string;
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  chartConfigs?: Record<string, any>;
  layoutConfig?: Record<string, any>;
}

export interface ScheduleConfig {
  scheduleName: string;
  cronExpression: string;
  timezone: string;
  deliveryMethod: 'email' | 'webhook' | 'storage';
  recipients: string[];
  webhookUrl?: string;
  exportFormat: ReportFormat;
  includeRawData: boolean;
}

export interface ReportData {
  report: CustomReport;
  data: any[];
  summary: Record<string, number>;
  charts: any[];
  generatedAt: Date;
}

/**
 * CustomReportService
 * 
 * Creates and manages custom analytics reports.
 * Supports scheduling, automated delivery, and multiple export formats.
 */
class CustomReportService {
  private static instance: CustomReportService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): CustomReportService {
    if (!CustomReportService.instance) {
      CustomReportService.instance = new CustomReportService();
    }
    return CustomReportService.instance;
  }

  /**
   * Create custom report
   */
  async createReport(
    workspaceId: string,
    userId: string,
    config: ReportConfig
  ): Promise<CustomReport> {
    try {
      logger.info('Creating custom report', { workspaceId, name: config.name });

      const reportData: Database['public']['Tables']['custom_reports']['Insert'] = {
        workspace_id: workspaceId,
        created_by: userId,
        name: config.name,
        description: config.description || null,
        report_type: config.reportType,
        query_config: config.filters,
        filters: config.filters,
        metrics: config.metrics,
        dimensions: config.dimensions,
        chart_configs: config.chartConfigs || {},
        layout_config: config.layoutConfig || {},
        is_public: false,
        shared_with: [],
        is_active: true,
        is_favorite: false,
        metadata: {},
      };

      const { data: report, error } = await supabase
        .from('custom_reports')
        .insert(reportData)
        .select()
        .single();

      if (error || !report) {
        throw new AppError('Failed to create report', 'CREATE_FAILED');
      }

      return report;
    } catch (error) {
      logger.error('Failed to create report', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to create report', 'CREATE_FAILED');
    }
  }

  /**
   * Execute report and generate data
   */
  async executeReport(
    reportId: string,
    scheduleId?: string
  ): Promise<ReportData> {
    try {
      logger.info('Executing report', { reportId });

      const startTime = Date.now();

      // Get report configuration
      const { data: report, error: reportError } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        throw new AppError('Report not found', 'NOT_FOUND');
      }

      // Create execution record
      const execution = await this.createExecution(report.workspace_id, reportId, scheduleId);

      try {
        // Execute query based on report type
        const data = await this.executeQuery(report);

        // Generate summary statistics
        const summary = this.generateSummary(data, report.metrics);

        // Generate charts
        const charts = this.generateCharts(data, report.chart_configs as Record<string, any>);

        // Update execution as completed
        const duration = Date.now() - startTime;
        await this.completeExecution(execution.id, data.length, duration);

        return {
          report,
          data,
          summary,
          charts,
          generatedAt: new Date(),
        };
      } catch (error) {
        // Update execution as failed
        await this.failExecution(execution.id, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    } catch (error) {
      logger.error('Failed to execute report', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to execute report', 'EXECUTION_FAILED');
    }
  }

  /**
   * Export report to specified format
   */
  async exportReport(
    reportId: string,
    format: ReportFormat,
    includeRawData: boolean = true
  ): Promise<{ url: string; format: ReportFormat; sizeBytes: number }> {
    try {
      logger.info('Exporting report', { reportId, format });

      // Execute report to get data
      const reportData = await this.executeReport(reportId);

      // Generate export based on format
      let exportedData: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          exportedData = JSON.stringify(reportData, null, 2);
          mimeType = 'application/json';
          break;
        case 'csv':
          exportedData = this.convertToCSV(reportData.data);
          mimeType = 'text/csv';
          break;
        case 'html':
          exportedData = this.convertToHTML(reportData);
          mimeType = 'text/html';
          break;
        case 'pdf':
          throw new AppError('PDF export not yet implemented', 'NOT_IMPLEMENTED');
        default:
          throw new AppError('Unsupported format', 'INVALID_FORMAT');
      }

      // Upload to storage
      const fileName = `reports/${reportId}_${Date.now()}.${format}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exports')
        .upload(fileName, exportedData, {
          contentType: mimeType,
          cacheControl: '3600',
        });

      if (uploadError) {
        throw new AppError('Failed to upload export', 'UPLOAD_FAILED');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exports')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        format,
        sizeBytes: new Blob([exportedData]).size,
      };
    } catch (error) {
      logger.error('Failed to export report', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to export', 'EXPORT_FAILED');
    }
  }

  /**
   * Schedule report for automated execution
   */
  async scheduleReport(
    workspaceId: string,
    userId: string,
    reportId: string,
    scheduleConfig: ScheduleConfig
  ): Promise<ReportSchedule> {
    try {
      logger.info('Scheduling report', { reportId, schedule: scheduleConfig.cronExpression });

      // Calculate next run time
      const nextRunAt = this.calculateNextRun(scheduleConfig.cronExpression, scheduleConfig.timezone);

      const scheduleData: Database['public']['Tables']['report_schedules']['Insert'] = {
        workspace_id: workspaceId,
        report_id: reportId,
        created_by: userId,
        schedule_name: scheduleConfig.scheduleName,
        cron_expression: scheduleConfig.cronExpression,
        timezone: scheduleConfig.timezone,
        delivery_method: scheduleConfig.deliveryMethod,
        recipients: scheduleConfig.recipients,
        webhook_url: scheduleConfig.webhookUrl || null,
        export_format: scheduleConfig.exportFormat,
        include_raw_data: scheduleConfig.includeRawData,
        is_active: true,
        last_run_at: null,
        next_run_at: nextRunAt.toISOString(),
        metadata: {},
      };

      const { data: schedule, error } = await supabase
        .from('report_schedules')
        .insert(scheduleData)
        .select()
        .single();

      if (error || !schedule) {
        throw new AppError('Failed to create schedule', 'SCHEDULE_FAILED');
      }

      return schedule;
    } catch (error) {
      logger.error('Failed to schedule report', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to schedule', 'SCHEDULE_FAILED');
    }
  }

  /**
   * Get user's custom reports
   */
  async getReports(
    workspaceId: string,
    filters?: {
      isActive?: boolean;
      isFavorite?: boolean;
      reportType?: string;
    }
  ): Promise<CustomReport[]> {
    try {
      let query = supabase
        .from('custom_reports')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.isFavorite !== undefined) {
        query = query.eq('is_favorite', filters.isFavorite);
      }

      if (filters?.reportType) {
        query = query.eq('report_type', filters.reportType);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch reports', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get reports', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get reports', 'FETCH_FAILED');
    }
  }

  /**
   * Get report schedules
   */
  async getSchedules(
    workspaceId: string,
    reportId?: string
  ): Promise<ReportSchedule[]> {
    try {
      let query = supabase
        .from('report_schedules')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (reportId) {
        query = query.eq('report_id', reportId);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('Failed to fetch schedules', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get schedules', { error, workspaceId });
      throw error instanceof AppError ? error : new AppError('Failed to get schedules', 'FETCH_FAILED');
    }
  }

  /**
   * Get report execution history
   */
  async getExecutions(
    reportId: string,
    limit: number = 20
  ): Promise<ReportExecution[]> {
    try {
      const { data, error } = await supabase
        .from('report_executions')
        .select('*')
        .eq('report_id', reportId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new AppError('Failed to fetch executions', 'FETCH_FAILED');
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get executions', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to get executions', 'FETCH_FAILED');
    }
  }

  /**
   * Update report
   */
  async updateReport(
    reportId: string,
    updates: Partial<ReportConfig>
  ): Promise<CustomReport> {
    try {
      logger.info('Updating report', { reportId });

      const updateData: Database['public']['Tables']['custom_reports']['Update'] = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.metrics) updateData.metrics = updates.metrics;
      if (updates.dimensions) updateData.dimensions = updates.dimensions;
      if (updates.filters) updateData.filters = updates.filters;
      if (updates.chartConfigs) updateData.chart_configs = updates.chartConfigs;
      if (updates.layoutConfig) updateData.layout_config = updates.layoutConfig;

      const { data: report, error } = await supabase
        .from('custom_reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();

      if (error || !report) {
        throw new AppError('Failed to update report', 'UPDATE_FAILED');
      }

      return report;
    } catch (error) {
      logger.error('Failed to update report', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to update', 'UPDATE_FAILED');
    }
  }

  /**
   * Delete report
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      logger.info('Deleting report', { reportId });

      const { error } = await supabase
        .from('custom_reports')
        .update({ is_active: false })
        .eq('id', reportId);

      if (error) {
        throw new AppError('Failed to delete report', 'DELETE_FAILED');
      }
    } catch (error) {
      logger.error('Failed to delete report', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to delete', 'DELETE_FAILED');
    }
  }

  /**
   * Share report with users
   */
  async shareReport(
    reportId: string,
    userIds: string[],
    isPublic: boolean = false
  ): Promise<CustomReport> {
    try {
      logger.info('Sharing report', { reportId, userCount: userIds.length });

      const { data: report, error } = await supabase
        .from('custom_reports')
        .update({
          shared_with: userIds,
          is_public: isPublic,
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error || !report) {
        throw new AppError('Failed to share report', 'SHARE_FAILED');
      }

      return report;
    } catch (error) {
      logger.error('Failed to share report', { error, reportId });
      throw error instanceof AppError ? error : new AppError('Failed to share', 'SHARE_FAILED');
    }
  }

  /**
   * Execute query based on report configuration
   */
  private async executeQuery(report: CustomReport): Promise<any[]> {
    const { report_type, filters, metrics, dimensions } = report;

    // Build query based on report type
    switch (report_type) {
      case 'engagement':
        return this.executeEngagementQuery(filters, metrics, dimensions);
      case 'audience':
        return this.executeAudienceQuery(filters, metrics, dimensions);
      case 'growth':
        return this.executeGrowthQuery(filters, metrics, dimensions);
      case 'performance':
        return this.executePerformanceQuery(filters, metrics, dimensions);
      default:
        return this.executeGenericQuery(report_type, filters, metrics, dimensions);
    }
  }

  /**
   * Execute engagement query
   */
  private async executeEngagementQuery(
    filters: any,
    metrics: string[],
    dimensions: string[]
  ): Promise<any[]> {
    let query = supabase
      .from('analytics_aggregated_daily')
      .select('*');

    if (filters.workspace_id) {
      query = query.eq('workspace_id', filters.workspace_id);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Query execution failed', 'QUERY_FAILED');
    }

    return data || [];
  }

  /**
   * Execute audience query
   */
  private async executeAudienceQuery(
    filters: any,
    metrics: string[],
    dimensions: string[]
  ): Promise<any[]> {
    let query = supabase
      .from('audience_demographics_latest')
      .select('*');

    if (filters.workspace_id) {
      query = query.eq('workspace_id', filters.workspace_id);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Query execution failed', 'QUERY_FAILED');
    }

    return data || [];
  }

  /**
   * Execute growth query
   */
  private async executeGrowthQuery(
    filters: any,
    metrics: string[],
    dimensions: string[]
  ): Promise<any[]> {
    let query = supabase
      .from('audience_growth')
      .select('*');

    if (filters.workspace_id) {
      query = query.eq('workspace_id', filters.workspace_id);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.startDate) {
      query = query.gte('recorded_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('recorded_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Query execution failed', 'QUERY_FAILED');
    }

    return data || [];
  }

  /**
   * Execute performance query
   */
  private async executePerformanceQuery(
    filters: any,
    metrics: string[],
    dimensions: string[]
  ): Promise<any[]> {
    let query = supabase
      .from('platform_performance_summary')
      .select('*');

    if (filters.workspace_id) {
      query = query.eq('workspace_id', filters.workspace_id);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Query execution failed', 'QUERY_FAILED');
    }

    return data || [];
  }

  /**
   * Execute generic query
   */
  private async executeGenericQuery(
    tableName: string,
    filters: any,
    metrics: string[],
    dimensions: string[]
  ): Promise<any[]> {
    // Fallback to a safe default table
    const { data, error } = await supabase
      .from('analytics_aggregated_daily')
      .select('*')
      .eq('workspace_id', filters.workspace_id)
      .limit(1000);

    if (error) {
      throw new AppError('Query execution failed', 'QUERY_FAILED');
    }

    return data || [];
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(data: any[], metrics: string[]): Record<string, number> {
    const summary: Record<string, number> = {};

    metrics.forEach((metric) => {
      const values = data.map((row) => row[metric] || 0);
      summary[`${metric}_sum`] = values.reduce((sum, val) => sum + val, 0);
      summary[`${metric}_avg`] = values.length > 0 ? summary[`${metric}_sum`] / values.length : 0;
      summary[`${metric}_max`] = Math.max(...values, 0);
      summary[`${metric}_min`] = Math.min(...values, 0);
    });

    return summary;
  }

  /**
   * Generate charts configuration
   */
  private generateCharts(data: any[], chartConfigs: Record<string, any>): any[] {
    const charts: any[] = [];

    Object.entries(chartConfigs).forEach(([chartId, config]) => {
      charts.push({
        id: chartId,
        type: config.type || 'line',
        data: this.prepareChartData(data, config),
        options: config.options || {},
      });
    });

    return charts;
  }

  /**
   * Prepare chart data
   */
  private prepareChartData(data: any[], config: any): any {
    const { xAxis, yAxis, groupBy } = config;

    return {
      labels: data.map((row) => row[xAxis]),
      datasets: [{
        label: yAxis,
        data: data.map((row) => row[yAxis]),
      }],
    };
  }

  /**
   * Create execution record
   */
  private async createExecution(
    workspaceId: string,
    reportId: string,
    scheduleId?: string
  ): Promise<ReportExecution> {
    const executionData: Database['public']['Tables']['report_executions']['Insert'] = {
      workspace_id: workspaceId,
      report_id: reportId,
      schedule_id: scheduleId || null,
      status: 'generating',
      started_at: new Date().toISOString(),
      rows_processed: 0,
      metadata: {},
    };

    const { data, error } = await supabase
      .from('report_executions')
      .insert(executionData)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to create execution', 'EXECUTION_FAILED');
    }

    return data;
  }

  /**
   * Complete execution
   */
  private async completeExecution(
    executionId: string,
    rowsProcessed: number,
    durationMs: number
  ): Promise<void> {
    await supabase
      .from('report_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
        rows_processed: rowsProcessed,
      })
      .eq('id', executionId);
  }

  /**
   * Fail execution
   */
  private async failExecution(executionId: string, errorMessage: string): Promise<void> {
    await supabase
      .from('report_executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', executionId);
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(cronExpression: string, timezone: string): Date {
    // Simplified - in production use a cron parser library
    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + 24);
    return nextRun;
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || '')).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert data to HTML format
   */
  private convertToHTML(reportData: ReportData): string {
    const { report, data, summary } = reportData;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>${report.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${report.name}</h1>
  <p>${report.description || ''}</p>
  <h2>Summary</h2>
  <pre>${JSON.stringify(summary, null, 2)}</pre>
  <h2>Data</h2>
  <table>
    <thead>
      <tr>${Object.keys(data[0] || {}).map((k) => `<th>${k}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.map((row) => `<tr>${Object.values(row).map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;
  }
}

export const customReportService = CustomReportService.getInstance();
