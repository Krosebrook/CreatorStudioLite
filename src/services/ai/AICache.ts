import { CacheEntry, CacheStats, AIProvider, AIModel } from '../../types/ai-provider.types';

/**
 * AI Cache Service
 * Caches AI responses to reduce costs and improve performance
 */
class AICacheService {
  private static instance: AICacheService;
  private cache: Map<string, CacheEntry>;
  private stats: {
    hits: number;
    misses: number;
    totalSavings: number;
  };

  private constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalSavings: 0,
    };
  }

  public static getInstance(): AICacheService {
    if (!AICacheService.instance) {
      AICacheService.instance = new AICacheService();
    }
    return AICacheService.instance;
  }

  /**
   * Generate cache key from prompt and config
   */
  private generateKey(
    prompt: string,
    provider: AIProvider,
    model: AIModel,
    temperature?: number
  ): string {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const temp = temperature?.toFixed(1) || '0.7';
    return `${provider}:${model}:${temp}:${this.hashString(normalizedPrompt)}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached response
   */
  get<T = string>(
    prompt: string,
    provider: AIProvider,
    model: AIModel,
    temperature?: number
  ): T | null {
    const key = this.generateKey(prompt, provider, model, temperature);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count and stats
    entry.hitCount++;
    this.stats.hits++;
    this.stats.totalSavings += entry.cost;

    return entry.value as T;
  }

  /**
   * Set cache entry
   */
  set<T = string>(
    prompt: string,
    value: T,
    provider: AIProvider,
    model: AIModel,
    tokens: number,
    cost: number,
    ttlMinutes: number,
    temperature?: number
  ): void {
    const key = this.generateKey(prompt, provider, model, temperature);
    const now = Date.now();

    const entry: CacheEntry<T> = {
      key,
      value,
      provider,
      model,
      tokens,
      cost,
      expiresAt: now + ttlMinutes * 60 * 1000,
      hitCount: 0,
      createdAt: now,
    };

    this.cache.set(key, entry);

    // Cleanup old entries if cache is too large
    this.cleanup();
  }

  /**
   * Check if entry exists and is valid
   */
  has(
    prompt: string,
    provider: AIProvider,
    model: AIModel,
    temperature?: number
  ): boolean {
    const key = this.generateKey(prompt, provider, model, temperature);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalSavings: 0,
    };
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Cleanup cache if it exceeds max size
   * Removes least recently used entries
   */
  private cleanup(maxSize: number = 1000): void {
    if (this.cache.size <= maxSize) return;

    // Sort entries by hit count (ascending) and creation time
    const entries = Array.from(this.cache.entries()).sort((a, b) => {
      if (a[1].hitCount !== b[1].hitCount) {
        return a[1].hitCount - b[1].hitCount;
      }
      return a[1].createdAt - b[1].createdAt;
    });

    // Remove oldest/least used entries
    const toRemove = this.cache.size - maxSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSavings: Math.round(this.stats.totalSavings * 100) / 100,
      avgResponseTime: 0, // Cached responses are instant
    };
  }

  /**
   * Get cache size in entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Delete specific cache entry
   */
  delete(
    prompt: string,
    provider: AIProvider,
    model: AIModel,
    temperature?: number
  ): boolean {
    const key = this.generateKey(prompt, provider, model, temperature);
    return this.cache.delete(key);
  }
}

export default AICacheService.getInstance();
