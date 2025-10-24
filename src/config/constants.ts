export const APP_CONFIG = {
  NAME: 'SparkLabs',
  VERSION: '0.1.0',
  DESCRIPTION: 'AI-Powered Creator Platform'
};

export const CONNECTOR_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BACKOFF_MS: 1000,
  TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000,
  HEALTH_CHECK_INTERVAL_MS: 60 * 1000
};

export const JOB_CONFIG = {
  MAX_CONCURRENT_JOBS: 5,
  DEFAULT_JOB_TIMEOUT_MS: 30 * 1000,
  MAX_JOB_ATTEMPTS: 3,
  JOB_CLEANUP_AFTER_MS: 24 * 60 * 60 * 1000
};

export const RATE_LIMITS = {
  youtube: {
    dailyQuota: 10000,
    requestsPerSecond: 5
  },
  instagram: {
    requestsPerHour: 200
  },
  tiktok: {
    requestsPerDay: 1000
  },
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000
  }
};

export const SUPPORTED_PLATFORMS = [
  'youtube',
  'instagram',
  'tiktok',
  'twitter',
  'linkedin',
  'pinterest',
  'facebook'
] as const;

export type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number];

export const PLATFORM_LIMITS = {
  youtube: {
    maxVideoSize: 256 * 1024 * 1024 * 1024,
    maxTitleLength: 100,
    maxDescriptionLength: 5000,
    maxTags: 500
  },
  instagram: {
    maxImageSize: 8 * 1024 * 1024,
    maxVideoSize: 100 * 1024 * 1024,
    maxVideoDuration: 60,
    maxCaptionLength: 2200,
    maxHashtags: 30
  },
  tiktok: {
    maxVideoSize: 287 * 1024 * 1024,
    maxVideoDuration: 600,
    maxCaptionLength: 2200
  },
  twitter: {
    maxTweetLength: 280,
    maxMediaSize: 512 * 1024 * 1024,
    maxMediaItems: 4
  },
  linkedin: {
    maxPostLength: 3000,
    maxImageSize: 10 * 1024 * 1024,
    maxVideoSize: 5 * 1024 * 1024 * 1024
  }
};

export const MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
};

export const DEFAULT_TIMEZONE = 'UTC';

export const WEBHOOK_EVENTS = {
  CONTENT_PUBLISHED: 'content.published',
  CONTENT_SCHEDULED: 'content.scheduled',
  CONTENT_FAILED: 'content.failed',
  CONNECTOR_CONNECTED: 'connector.connected',
  CONNECTOR_DISCONNECTED: 'connector.disconnected',
  CONNECTOR_ERROR: 'connector.error',
  ANALYTICS_UPDATED: 'analytics.updated',
  WORKSPACE_CREATED: 'workspace.created',
  MEMBER_INVITED: 'member.invited',
  MEMBER_REMOVED: 'member.removed'
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  CONNECTOR_NOT_CONNECTED: 'Platform connector not connected',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  INTERNAL_ERROR: 'An internal error occurred'
};
