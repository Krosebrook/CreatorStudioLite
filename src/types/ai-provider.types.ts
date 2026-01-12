import { z } from 'zod';

// ============================================
// AI Provider Types
// ============================================

export type AIProvider = 'openai' | 'anthropic';

export type AIModel = 
  | 'gpt-4' 
  | 'gpt-4-turbo' 
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku';

export interface AIProviderConfig {
  provider: AIProvider;
  model: AIModel;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIProviderResponse {
  content: string;
  tokensUsed: number;
  cost: number;
  provider: AIProvider;
  model: AIModel;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  cached?: boolean;
}

export interface AIProviderError {
  provider: AIProvider;
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

// ============================================
// Usage Tracking Types
// ============================================

export interface AIUsageRecord {
  id?: string;
  workspace_id: string;
  user_id: string;
  provider: AIProvider;
  model: AIModel;
  operation: AIOperation;
  tokens_used: number;
  cost: number;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  cached: boolean;
  created_at?: string;
}

export type AIOperation = 
  | 'content_idea_generation'
  | 'caption_generation'
  | 'hashtag_research'
  | 'brand_voice_analysis'
  | 'viral_prediction'
  | 'content_optimization'
  | 'ab_test_generation';

// ============================================
// Caching Types
// ============================================

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  provider: AIProvider;
  model: AIModel;
  tokens: number;
  cost: number;
  expiresAt: number;
  hitCount: number;
  createdAt: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSavings: number;
  avgResponseTime: number;
}

// ============================================
// Rate Limiting Types
// ============================================

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
  maxCostPerDay: number;
  burstLimit?: number;
}

export interface RateLimitStatus {
  requestsRemaining: number;
  tokensRemaining: number;
  costRemaining: number;
  resetAt: number;
  limited: boolean;
}

// ============================================
// Cost Configuration
// ============================================

export const AI_COSTS: Record<AIModel, { input: number; output: number }> = {
  'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
};

// ============================================
// Zod Schemas for Validation
// ============================================

export const aiProviderConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  model: z.enum([
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku',
  ]),
  apiKey: z.string().min(1),
  maxTokens: z.number().min(1).max(8000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

export const aiUsageRecordSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  provider: z.enum(['openai', 'anthropic']),
  model: z.string(),
  operation: z.string(),
  tokens_used: z.number().min(0),
  cost: z.number().min(0),
  response_time_ms: z.number().min(0),
  success: z.boolean(),
  error_message: z.string().optional(),
  cached: z.boolean(),
});

export const rateLimitConfigSchema = z.object({
  maxRequestsPerMinute: z.number().min(1).default(60),
  maxTokensPerMinute: z.number().min(1000).default(100000),
  maxCostPerDay: z.number().min(0).default(100),
  burstLimit: z.number().min(1).optional(),
});
