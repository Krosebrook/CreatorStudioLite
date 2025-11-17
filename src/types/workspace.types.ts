import { UUID, Timestamp } from './common.types';

export interface Workspace {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  owner_id: UUID;
  plan: WorkspacePlan;
  settings: WorkspaceSettings;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type WorkspacePlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface WorkspaceSettings {
  default_timezone: string;
  default_language: string;
  content_approval_required: boolean;
  auto_publish_enabled: boolean;
  analytics_retention_days: number;
  team_collaboration_enabled: boolean;
}

export interface WorkspaceMember {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  role: WorkspaceRole;
  permissions: WorkspacePermission[];
  invited_by: UUID;
  joined_at?: Timestamp;
  last_active_at?: Timestamp;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type WorkspacePermission =
  | 'content.create'
  | 'content.edit'
  | 'content.delete'
  | 'content.publish'
  | 'analytics.view'
  | 'team.manage'
  | 'billing.manage'
  | 'settings.manage';

export interface WorkspaceInvite {
  id: UUID;
  workspace_id: UUID;
  email: string;
  role: WorkspaceRole;
  invited_by: UUID;
  expires_at: Timestamp;
  accepted_at?: Timestamp;
  token: string;
  metadata: Record<string, any>;
  created_at: Timestamp;
}

export interface Team {
  id: UUID;
  workspace_id: UUID;
  name: string;
  description?: string;
  members: UUID[];
  permissions: WorkspacePermission[];
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}
