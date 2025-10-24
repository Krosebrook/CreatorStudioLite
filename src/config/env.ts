import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().min(1, 'Supabase URL is required'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),

  VITE_APP_NAME: z.string().default('SparkLabs'),
  VITE_APP_URL: z.string().url().optional(),

  VITE_YOUTUBE_CLIENT_ID: z.string().optional(),
  VITE_YOUTUBE_CLIENT_SECRET: z.string().optional(),

  VITE_INSTAGRAM_CLIENT_ID: z.string().optional(),
  VITE_INSTAGRAM_CLIENT_SECRET: z.string().optional(),

  VITE_TIKTOK_CLIENT_KEY: z.string().optional(),
  VITE_TIKTOK_CLIENT_SECRET: z.string().optional(),

  VITE_LINKEDIN_CLIENT_ID: z.string().optional(),
  VITE_LINKEDIN_CLIENT_SECRET: z.string().optional(),

  VITE_PINTEREST_CLIENT_ID: z.string().optional(),
  VITE_PINTEREST_CLIENT_SECRET: z.string().optional(),

  VITE_OPENAI_API_KEY: z.string().optional(),
  VITE_ANTHROPIC_API_KEY: z.string().optional(),

  VITE_STRIPE_PUBLIC_KEY: z.string().optional(),

  VITE_AWS_S3_BUCKET: z.string().optional(),
  VITE_AWS_REGION: z.string().optional(),

  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

export type Env = z.infer<typeof envSchema>;

class Config {
  private static instance: Config;
  private env: Env;
  private validated: boolean = false;

  private constructor() {
    this.env = this.loadEnv();
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadEnv(): Env {
    const rawEnv = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_URL: import.meta.env.VITE_APP_URL,
      VITE_YOUTUBE_CLIENT_ID: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
      VITE_YOUTUBE_CLIENT_SECRET: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET,
      VITE_INSTAGRAM_CLIENT_ID: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
      VITE_INSTAGRAM_CLIENT_SECRET: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET,
      VITE_TIKTOK_CLIENT_KEY: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
      VITE_TIKTOK_CLIENT_SECRET: import.meta.env.VITE_TIKTOK_CLIENT_SECRET,
      VITE_LINKEDIN_CLIENT_ID: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
      VITE_LINKEDIN_CLIENT_SECRET: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET,
      VITE_PINTEREST_CLIENT_ID: import.meta.env.VITE_PINTEREST_CLIENT_ID,
      VITE_PINTEREST_CLIENT_SECRET: import.meta.env.VITE_PINTEREST_CLIENT_SECRET,
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
      VITE_ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
      VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
      VITE_AWS_S3_BUCKET: import.meta.env.VITE_AWS_S3_BUCKET,
      VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL
    };

    try {
      const parsed = envSchema.parse(rawEnv);
      this.validated = true;
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Environment validation failed:', error.errors);
        throw new Error(`Invalid environment configuration: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  getAll(): Env {
    return { ...this.env };
  }

  isValidated(): boolean {
    return this.validated;
  }

  has(key: keyof Env): boolean {
    return this.env[key] !== undefined;
  }

  requireConnector(connector: string): void {
    const requiredEnvVars: Record<string, (keyof Env)[]> = {
      youtube: ['VITE_YOUTUBE_CLIENT_ID', 'VITE_YOUTUBE_CLIENT_SECRET'],
      instagram: ['VITE_INSTAGRAM_CLIENT_ID', 'VITE_INSTAGRAM_CLIENT_SECRET'],
      tiktok: ['VITE_TIKTOK_CLIENT_KEY', 'VITE_TIKTOK_CLIENT_SECRET'],
      linkedin: ['VITE_LINKEDIN_CLIENT_ID', 'VITE_LINKEDIN_CLIENT_SECRET'],
      pinterest: ['VITE_PINTEREST_CLIENT_ID', 'VITE_PINTEREST_CLIENT_SECRET']
    };

    const required = requiredEnvVars[connector];
    if (!required) return;

    const missing = required.filter(key => !this.has(key));
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for ${connector}: ${missing.join(', ')}`);
    }
  }
}

export const config = Config.getInstance();
