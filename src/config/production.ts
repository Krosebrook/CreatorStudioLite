/**
 * Production Configuration
 * 
 * This file contains production-ready configuration settings.
 * Override these values with environment variables.
 */

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  app: {
    name: string;
    version: string;
    url: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  features: {
    aiEnabled: boolean;
    teamCollaborationEnabled: boolean;
    analyticsEnabled: boolean;
    paymentsEnabled: boolean;
  };
  limits: {
    maxUploadSize: number; // in bytes
    maxFileNameLength: number;
    maxContentLength: number;
    maxMediaFiles: number;
  };
  security: {
    sessionTimeout: number; // in milliseconds
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableConsoleLogging: boolean;
    enableRemoteLogging: boolean;
    sentryDsn?: string;
  };
  api: {
    timeout: number; // in milliseconds
    retryAttempts: number;
    retryDelay: number; // in milliseconds
  };
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): AppConfig {
  const env = import.meta.env;
  
  return {
    environment: (env.NODE_ENV || 'development') as AppConfig['environment'],
    
    app: {
      name: env.VITE_APP_NAME || 'Amplify Creator Platform',
      version: env.VITE_APP_VERSION || '1.0.0',
      url: env.VITE_APP_URL || 'http://localhost:5173',
    },
    
    supabase: {
      url: env.VITE_SUPABASE_URL || '',
      anonKey: env.VITE_SUPABASE_ANON_KEY || '',
    },
    
    features: {
      aiEnabled: env.VITE_ENABLE_AI_FEATURES === 'true',
      teamCollaborationEnabled: env.VITE_ENABLE_TEAM_COLLABORATION !== 'false',
      analyticsEnabled: env.VITE_ENABLE_ANALYTICS !== 'false',
      paymentsEnabled: env.VITE_ENABLE_PAYMENTS === 'true',
    },
    
    limits: {
      maxUploadSize: parseInt(env.VITE_MAX_UPLOAD_SIZE || '10485760', 10), // 10MB default
      maxFileNameLength: 255,
      maxContentLength: 10000,
      maxMediaFiles: 50,
    },
    
    security: {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: env.NODE_ENV === 'production',
    },
    
    monitoring: {
      logLevel: (env.VITE_LOG_LEVEL || 'info') as AppConfig['monitoring']['logLevel'],
      enableConsoleLogging: env.VITE_LOG_TO_CONSOLE !== 'false',
      enableRemoteLogging: env.NODE_ENV === 'production',
      sentryDsn: env.VITE_SENTRY_DSN,
    },
    
    api: {
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
    },
  };
}

/**
 * Validate that required configuration values are present
 */
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  // Validate URLs
  if (config.supabase.url) {
    try {
      new URL(config.supabase.url);
    } catch {
      errors.push('VITE_SUPABASE_URL must be a valid URL');
    }
  }
  
  // Validate limits
  if (config.limits.maxUploadSize < 0) {
    errors.push('maxUploadSize must be positive');
  }
  
  if (config.limits.maxUploadSize > 100 * 1024 * 1024) {
    errors.push('maxUploadSize cannot exceed 100MB');
  }
  
  // Production-specific validations
  if (config.environment === 'production') {
    if (!config.app.url.startsWith('https://')) {
      errors.push('Production app URL must use HTTPS');
    }
    
    if (!config.supabase.url.startsWith('https://')) {
      errors.push('Production Supabase URL must use HTTPS');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get the application configuration
 * Throws an error if configuration is invalid
 */
export function getConfig(): AppConfig {
  const config = loadConfig();
  const validation = validateConfig(config);
  
  if (!validation.valid) {
    const errorMessage = `Configuration validation failed:\n${validation.errors.join('\n')}`;
    console.error(errorMessage);
    
    // In production, throw an error to prevent startup with invalid config
    if (config.environment === 'production') {
      throw new Error(errorMessage);
    }
    
    // In development, just warn
    console.warn('⚠️ Application starting with invalid configuration');
  }
  
  return config;
}

// Export a singleton instance
export const config = getConfig();

// Log configuration on startup (excluding sensitive data)
if (config.monitoring.enableConsoleLogging) {
  console.log('📝 Application Configuration:', {
    environment: config.environment,
    app: config.app,
    features: config.features,
    limits: config.limits,
    supabase: {
      url: config.supabase.url,
      anonKey: config.supabase.anonKey ? '***' + config.supabase.anonKey.slice(-4) : 'not set',
    },
  });
}
