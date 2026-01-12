import {
  AIProvider,
  AIModel,
  AIProviderConfig,
  AIProviderResponse,
  AIProviderError,
  AIOperation,
  AI_COSTS,
} from '../../types/ai-provider.types';
import { getAIConfig } from '../../config/ai.config';
import AICache from './AICache';
import AIUsageTracker from './AIUsageTracker';

/**
 * AI Provider Service
 * Manages communication with AI providers (OpenAI, Anthropic)
 * Includes caching, rate limiting, cost tracking, and fallback mechanisms
 */
class AIProviderService {
  private static instance: AIProviderService;
  private config = getAIConfig();

  private constructor() {}

  public static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  /**
   * Generate AI completion with automatic provider selection and fallback
   */
  async generate(
    prompt: string,
    options: {
      workspaceId: string;
      userId: string;
      operation: AIOperation;
      provider?: AIProvider;
      model?: AIModel;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
      useCache?: boolean;
    }
  ): Promise<AIProviderResponse> {
    const {
      workspaceId,
      userId,
      operation,
      provider = this.config.defaultProvider,
      model = this.config.defaultModel,
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt,
      useCache = true,
    } = options;

    const startTime = Date.now();

    try {
      // Check rate limits
      const rateLimitStatus = await AIUsageTracker.checkRateLimit(
        workspaceId,
        userId,
        this.config.rateLimit
      );

      if (rateLimitStatus.limited) {
        throw this.createError(
          provider,
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded. Please try again later.',
          false
        );
      }

      // Check cache if enabled
      if (useCache && this.config.cache.enabled) {
        const cached = AICache.get<string>(prompt, provider, model, temperature);
        if (cached) {
          const cost = this.calculateCost(model, 0, cached.length / 4); // Approximate tokens
          
          // Track cached usage
          await AIUsageTracker.track({
            workspace_id: workspaceId,
            user_id: userId,
            provider,
            model,
            operation,
            tokens_used: 0,
            cost: 0,
            response_time_ms: Date.now() - startTime,
            success: true,
            cached: true,
          });

          return {
            content: cached,
            tokensUsed: 0,
            cost: 0,
            provider,
            model,
            finishReason: 'stop',
            cached: true,
          };
        }
      }

      // Generate with provider
      let response: AIProviderResponse;
      try {
        response = await this.generateWithProvider(
          prompt,
          provider,
          model,
          maxTokens,
          temperature,
          systemPrompt
        );
      } catch (error) {
        // Try fallback provider if enabled
        if (this.config.fallback.enabled && this.config.fallback.providers.length > 1) {
          const fallbackProvider = this.config.fallback.providers.find((p) => p !== provider);
          if (fallbackProvider) {
            console.warn(`Primary provider ${provider} failed, trying fallback: ${fallbackProvider}`);
            response = await this.generateWithProvider(
              prompt,
              fallbackProvider,
              this.getFallbackModel(fallbackProvider),
              maxTokens,
              temperature,
              systemPrompt
            );
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      // Cache response if enabled
      if (useCache && this.config.cache.enabled) {
        AICache.set(
          prompt,
          response.content,
          response.provider,
          response.model,
          response.tokensUsed,
          response.cost,
          this.config.cache.ttlMinutes,
          temperature
        );
      }

      // Track usage
      await AIUsageTracker.track({
        workspace_id: workspaceId,
        user_id: userId,
        provider: response.provider,
        model: response.model,
        operation,
        tokens_used: response.tokensUsed,
        cost: response.cost,
        response_time_ms: Date.now() - startTime,
        success: true,
        cached: false,
      });

      return response;
    } catch (error) {
      // Track failed request
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await AIUsageTracker.track({
        workspace_id: workspaceId,
        user_id: userId,
        provider,
        model,
        operation,
        tokens_used: 0,
        cost: 0,
        response_time_ms: Date.now() - startTime,
        success: false,
        error_message: errorMessage,
        cached: false,
      });

      throw error;
    }
  }

  /**
   * Generate with specific provider
   */
  private async generateWithProvider(
    prompt: string,
    provider: AIProvider,
    model: AIModel,
    maxTokens: number,
    temperature: number,
    systemPrompt?: string
  ): Promise<AIProviderResponse> {
    if (provider === 'openai') {
      return this.generateWithOpenAI(prompt, model, maxTokens, temperature, systemPrompt);
    } else if (provider === 'anthropic') {
      return this.generateWithAnthropic(prompt, model, maxTokens, temperature, systemPrompt);
    } else {
      throw this.createError(provider, 'INVALID_PROVIDER', `Unsupported provider: ${provider}`, false);
    }
  }

  /**
   * Generate with OpenAI
   */
  private async generateWithOpenAI(
    prompt: string,
    model: AIModel,
    maxTokens: number,
    temperature: number,
    systemPrompt?: string
  ): Promise<AIProviderResponse> {
    const apiKey = this.config.openai.apiKey;
    if (!apiKey) {
      throw this.createError('openai', 'MISSING_API_KEY', 'OpenAI API key not configured', false);
    }

    try {
      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          'openai',
          error.error?.code || 'API_ERROR',
          error.error?.message || `OpenAI API error: ${response.status}`,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;
      const cost = this.calculateCost(
        model,
        data.usage?.prompt_tokens || 0,
        data.usage?.completion_tokens || 0
      );

      return {
        content,
        tokensUsed,
        cost,
        provider: 'openai',
        model,
        finishReason: data.choices[0]?.finish_reason || 'stop',
        cached: false,
      };
    } catch (error) {
      if (error instanceof Error && 'provider' in error) {
        throw error;
      }
      throw this.createError('openai', 'NETWORK_ERROR', `Failed to call OpenAI: ${error}`, true);
    }
  }

  /**
   * Generate with Anthropic Claude
   */
  private async generateWithAnthropic(
    prompt: string,
    model: AIModel,
    maxTokens: number,
    temperature: number,
    systemPrompt?: string
  ): Promise<AIProviderResponse> {
    const apiKey = this.config.anthropic.apiKey;
    if (!apiKey) {
      throw this.createError('anthropic', 'MISSING_API_KEY', 'Anthropic API key not configured', false);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw this.createError(
          'anthropic',
          error.error?.type || 'API_ERROR',
          error.error?.message || `Anthropic API error: ${response.status}`,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json();
      const content = data.content[0]?.text || '';
      const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      const cost = this.calculateCost(
        model,
        data.usage?.input_tokens || 0,
        data.usage?.output_tokens || 0
      );

      return {
        content,
        tokensUsed,
        cost,
        provider: 'anthropic',
        model,
        finishReason: data.stop_reason || 'stop',
        cached: false,
      };
    } catch (error) {
      if (error instanceof Error && 'provider' in error) {
        throw error;
      }
      throw this.createError('anthropic', 'NETWORK_ERROR', `Failed to call Anthropic: ${error}`, true);
    }
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    const costs = AI_COSTS[model];
    if (!costs) return 0;

    const inputCost = (inputTokens / 1000) * costs.input;
    const outputCost = (outputTokens / 1000) * costs.output;

    return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Get fallback model for provider
   */
  private getFallbackModel(provider: AIProvider): AIModel {
    if (provider === 'openai') {
      return 'gpt-3.5-turbo';
    } else if (provider === 'anthropic') {
      return 'claude-3-haiku';
    }
    return this.config.defaultModel;
  }

  /**
   * Create standardized error
   */
  private createError(
    provider: AIProvider,
    code: string,
    message: string,
    retryable: boolean,
    details?: Record<string, unknown>
  ): AIProviderError {
    const error = new Error(message) as Error & AIProviderError;
    error.provider = provider;
    error.code = code;
    error.message = message;
    error.retryable = retryable;
    error.details = details;
    return error as AIProviderError;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return AICache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    AICache.clear();
  }
}

export default AIProviderService.getInstance();
