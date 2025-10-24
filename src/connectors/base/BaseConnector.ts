import { z } from 'zod';

export enum ConnectorStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  EXPIRED = 'expired',
  RATE_LIMITED = 'rate_limited'
}

export enum ConnectorType {
  SOCIAL = 'social',
  DESIGN = 'design',
  STORAGE = 'storage',
  ANALYTICS = 'analytics',
  EMAIL = 'email',
  ECOMMERCE = 'ecommerce',
  COMMUNITY = 'community',
  AI = 'ai'
}

export interface ConnectorConfig {
  id: string;
  name: string;
  type: ConnectorType;
  requiresOAuth: boolean;
  requiresApiKey: boolean;
  scopes?: string[];
  apiEndpoint?: string;
  rateLimit?: {
    requests: number;
    period: number;
  };
}

export interface ConnectorCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  expiresAt?: Date;
  userId: string;
  platformUserId?: string;
  metadata?: Record<string, any>;
}

export interface ConnectorHealthCheck {
  status: ConnectorStatus;
  lastChecked: Date;
  message?: string;
  quotaUsed?: number;
  quotaLimit?: number;
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected credentials: ConnectorCredentials | null = null;
  protected lastHealthCheck: ConnectorHealthCheck | null = null;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  abstract validateCredentials(credentials: ConnectorCredentials): Promise<boolean>;

  abstract connect(credentials: ConnectorCredentials): Promise<void>;

  abstract disconnect(): Promise<void>;

  abstract healthCheck(): Promise<ConnectorHealthCheck>;

  abstract refreshToken(): Promise<void>;

  getConfig(): ConnectorConfig {
    return this.config;
  }

  getStatus(): ConnectorStatus {
    return this.lastHealthCheck?.status || ConnectorStatus.DISCONNECTED;
  }

  isConnected(): boolean {
    return this.credentials !== null && this.getStatus() === ConnectorStatus.CONNECTED;
  }

  getCredentials(): ConnectorCredentials | null {
    return this.credentials;
  }

  protected setCredentials(credentials: ConnectorCredentials): void {
    this.credentials = credentials;
  }

  protected clearCredentials(): void {
    this.credentials = null;
  }

  protected updateHealthCheck(healthCheck: ConnectorHealthCheck): void {
    this.lastHealthCheck = healthCheck;
  }

  protected isTokenExpired(): boolean {
    if (!this.credentials?.expiresAt) return false;
    return new Date() >= this.credentials.expiresAt;
  }

  protected async handleRateLimit(retryAfter?: number): Promise<void> {
    this.updateHealthCheck({
      status: ConnectorStatus.RATE_LIMITED,
      lastChecked: new Date(),
      message: `Rate limit exceeded. Retry after ${retryAfter || 'unknown'} seconds`
    });

    if (retryAfter) {
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }
  }

  protected validateEnv(schema: z.ZodObject<any>): void {
    try {
      schema.parse({
        accessToken: this.credentials?.accessToken,
        refreshToken: this.credentials?.refreshToken,
        apiKey: this.credentials?.apiKey
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Connector validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }
}
