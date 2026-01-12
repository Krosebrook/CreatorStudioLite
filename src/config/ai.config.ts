import { AIProvider, AIModel, RateLimitConfig } from '../types/ai-provider.types';
import { config } from './env';

/**
 * AI Configuration
 * Central configuration for AI providers, models, and usage limits
 */

export interface AIConfig {
  defaultProvider: AIProvider;
  defaultModel: AIModel;
  openai: {
    apiKey: string;
    models: AIModel[];
  };
  anthropic: {
    apiKey: string;
    models: AIModel[];
  };
  rateLimit: RateLimitConfig;
  cache: {
    enabled: boolean;
    ttlMinutes: number;
    maxSize: number;
  };
  fallback: {
    enabled: boolean;
    providers: AIProvider[];
  };
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
}

/**
 * Get AI configuration with environment variables
 */
export function getAIConfig(): AIConfig {
  const openaiKey = config.get('VITE_OPENAI_API_KEY');
  const anthropicKey = config.get('VITE_ANTHROPIC_API_KEY');

  // Determine default provider based on available keys
  let defaultProvider: AIProvider = 'openai';
  let defaultModel: AIModel = 'gpt-3.5-turbo';

  if (openaiKey) {
    defaultProvider = 'openai';
    defaultModel = 'gpt-3.5-turbo'; // Cost-effective default
  } else if (anthropicKey) {
    defaultProvider = 'anthropic';
    defaultModel = 'claude-3-haiku'; // Cost-effective default
  }

  return {
    defaultProvider,
    defaultModel,
    openai: {
      apiKey: openaiKey || '',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    },
    anthropic: {
      apiKey: anthropicKey || '',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    },
    rateLimit: {
      maxRequestsPerMinute: 60,
      maxTokensPerMinute: 100000,
      maxCostPerDay: 100, // $100 per day limit
      burstLimit: 10,
    },
    cache: {
      enabled: true,
      ttlMinutes: 60, // Cache for 1 hour
      maxSize: 1000, // Max 1000 cached entries
    },
    fallback: {
      enabled: true,
      providers: openaiKey && anthropicKey ? ['openai', 'anthropic'] : [],
    },
    retry: {
      maxAttempts: 3,
      backoffMs: 1000,
    },
  };
}

/**
 * Validate AI configuration
 */
export function validateAIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const openaiKey = config.get('VITE_OPENAI_API_KEY');
  const anthropicKey = config.get('VITE_ANTHROPIC_API_KEY');

  if (!openaiKey && !anthropicKey) {
    errors.push('At least one AI provider API key is required (OpenAI or Anthropic)');
  }

  if (openaiKey && !openaiKey.startsWith('sk-')) {
    errors.push('Invalid OpenAI API key format');
  }

  if (anthropicKey && !anthropicKey.startsWith('sk-ant-')) {
    errors.push('Invalid Anthropic API key format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  const openaiKey = config.get('VITE_OPENAI_API_KEY');
  const anthropicKey = config.get('VITE_ANTHROPIC_API_KEY');
  return !!(openaiKey || anthropicKey);
}

/**
 * Get available AI providers
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  
  if (config.get('VITE_OPENAI_API_KEY')) {
    providers.push('openai');
  }
  
  if (config.get('VITE_ANTHROPIC_API_KEY')) {
    providers.push('anthropic');
  }
  
  return providers;
}
