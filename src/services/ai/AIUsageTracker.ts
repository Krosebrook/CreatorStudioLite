import { supabase } from '../../lib/supabase';
import {
  AIUsageRecord,
  AIProvider,
  AIModel,
  AIOperation,
  RateLimitStatus,
  RateLimitConfig,
} from '../../types/ai-provider.types';

/**
 * AI Usage Tracker Service
 * Tracks AI API usage, costs, and enforces rate limits
 */
class AIUsageTracker {
  private static instance: AIUsageTracker;
  private usageWindow: Map<string, AIUsageRecord[]>;
  private windowDurationMs: number = 60 * 1000; // 1 minute

  private constructor() {
    this.usageWindow = new Map();
    this.startCleanupInterval();
  }

  public static getInstance(): AIUsageTracker {
    if (!AIUsageTracker.instance) {
      AIUsageTracker.instance = new AIUsageTracker();
    }
    return AIUsageTracker.instance;
  }

  /**
   * Track AI API usage
   */
  async track(record: Omit<AIUsageRecord, 'id' | 'created_at'>): Promise<void> {
    try {
      // Save to database
      await supabase.from('ai_usage_logs').insert({
        workspace_id: record.workspace_id,
        user_id: record.user_id,
        provider: record.provider,
        model: record.model,
        operation: record.operation,
        tokens_used: record.tokens_used,
        cost: record.cost,
        response_time_ms: record.response_time_ms,
        success: record.success,
        error_message: record.error_message,
        cached: record.cached,
      });

      // Track in memory for rate limiting
      const key = `${record.workspace_id}:${record.user_id}`;
      const records = this.usageWindow.get(key) || [];
      records.push({
        ...record,
        created_at: new Date().toISOString(),
      });
      this.usageWindow.set(key, records);
    } catch (error) {
      console.error('Failed to track AI usage:', error);
    }
  }

  /**
   * Check if rate limit is exceeded
   */
  async checkRateLimit(
    workspaceId: string,
    userId: string,
    config: RateLimitConfig
  ): Promise<RateLimitStatus> {
    const key = `${workspaceId}:${userId}`;
    const now = Date.now();
    const oneMinuteAgo = now - this.windowDurationMs;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Get recent usage from memory
    const recentRecords = (this.usageWindow.get(key) || []).filter(
      (r) => new Date(r.created_at!).getTime() > oneMinuteAgo
    );

    // Calculate current usage
    const requestsInLastMinute = recentRecords.length;
    const tokensInLastMinute = recentRecords.reduce((sum, r) => sum + r.tokens_used, 0);

    // Get daily cost from database
    const { data: dailyUsage } = await supabase
      .from('ai_usage_logs')
      .select('cost')
      .eq('workspace_id', workspaceId)
      .gte('created_at', new Date(oneDayAgo).toISOString());

    const costToday = (dailyUsage || []).reduce((sum, r) => sum + (r.cost || 0), 0);

    // Check limits
    const requestsRemaining = Math.max(
      0,
      config.maxRequestsPerMinute - requestsInLastMinute
    );
    const tokensRemaining = Math.max(0, config.maxTokensPerMinute - tokensInLastMinute);
    const costRemaining = Math.max(0, config.maxCostPerDay - costToday);

    const limited =
      requestsRemaining === 0 || tokensRemaining === 0 || costRemaining === 0;

    return {
      requestsRemaining,
      tokensRemaining,
      costRemaining,
      resetAt: now + this.windowDurationMs,
      limited,
    };
  }

  /**
   * Get usage statistics for a workspace
   */
  async getUsageStats(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    byProvider: Record<AIProvider, { requests: number; tokens: number; cost: number }>;
    byOperation: Record<AIOperation, { requests: number; tokens: number; cost: number }>;
    avgResponseTime: number;
    successRate: number;
    cacheHitRate: number;
  }> {
    const { data: records } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (!records || records.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        byProvider: {} as any,
        byOperation: {} as any,
        avgResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
      };
    }

    // Calculate totals
    const totalRequests = records.length;
    const totalTokens = records.reduce((sum, r) => sum + r.tokens_used, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const successfulRequests = records.filter((r) => r.success).length;
    const cachedRequests = records.filter((r) => r.cached).length;
    const totalResponseTime = records.reduce((sum, r) => sum + r.response_time_ms, 0);

    // Group by provider
    const byProvider: Record<string, any> = {};
    records.forEach((r) => {
      if (!byProvider[r.provider]) {
        byProvider[r.provider] = { requests: 0, tokens: 0, cost: 0 };
      }
      byProvider[r.provider].requests++;
      byProvider[r.provider].tokens += r.tokens_used;
      byProvider[r.provider].cost += r.cost;
    });

    // Group by operation
    const byOperation: Record<string, any> = {};
    records.forEach((r) => {
      if (!byOperation[r.operation]) {
        byOperation[r.operation] = { requests: 0, tokens: 0, cost: 0 };
      }
      byOperation[r.operation].requests++;
      byOperation[r.operation].tokens += r.tokens_used;
      byOperation[r.operation].cost += r.cost;
    });

    return {
      totalRequests,
      totalTokens,
      totalCost: Math.round(totalCost * 100) / 100,
      byProvider,
      byOperation,
      avgResponseTime: Math.round(totalResponseTime / totalRequests),
      successRate: Math.round((successfulRequests / totalRequests) * 100) / 100,
      cacheHitRate: Math.round((cachedRequests / totalRequests) * 100) / 100,
    };
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(
    workspaceId: string,
    limit: number = 10
  ): Promise<AIUsageRecord[]> {
    const { data: records } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('success', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (records || []) as AIUsageRecord[];
  }

  /**
   * Clean up old in-memory usage records
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - this.windowDurationMs;

      for (const [key, records] of this.usageWindow.entries()) {
        const filtered = records.filter(
          (r) => new Date(r.created_at!).getTime() > oneMinuteAgo
        );

        if (filtered.length === 0) {
          this.usageWindow.delete(key);
        } else {
          this.usageWindow.set(key, filtered);
        }
      }
    }, 30000); // Clean up every 30 seconds
  }

  /**
   * Clear all in-memory usage data
   */
  clearMemory(): void {
    this.usageWindow.clear();
  }
}

export default AIUsageTracker.getInstance();
