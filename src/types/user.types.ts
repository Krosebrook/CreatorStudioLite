import { UUID, Timestamp } from './common.types';

export interface User {
  id: UUID;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  email_verified: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type UserRole = 'admin' | 'creator' | 'viewer';

export interface UserProfile {
  id: UUID;
  user_id: UUID;
  bio?: string;
  website?: string;
  location?: string;
  timezone: string;
  language: string;
  avatar_url?: string;
  cover_image_url?: string;
  social_links: SocialLinks;
  preferences: UserPreferences;
  stripe_customer_id?: string;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  email_frequency: 'realtime' | 'daily' | 'weekly' | 'never';
  language: string;
  timezone: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  content_published: boolean;
  content_failed: boolean;
  new_followers: boolean;
  high_engagement: boolean;
  revenue_milestones: boolean;
  team_invites: boolean;
}

export interface Subscription {
  id: UUID;
  user_id: UUID;
  workspace_id: UUID;
  plan_id: string;
  plan_name: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: SubscriptionStatus;
  current_period_start: Timestamp;
  current_period_end: Timestamp;
  cancel_at_period_end: boolean;
  canceled_at?: Timestamp;
  trial_start?: Timestamp;
  trial_end?: Timestamp;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface UsageTracking {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  resource_type: ResourceType;
  amount: number;
  period_start: Timestamp;
  period_end: Timestamp;
  metadata: Record<string, any>;
  created_at: Timestamp;
}

export type ResourceType = 'post' | 'ai_credit' | 'storage' | 'team_member' | 'export';
