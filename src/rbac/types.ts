export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  CONTRIBUTOR = 'contributor'
}

export enum Permission {
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',
  CONTENT_SCHEDULE = 'content:schedule',

  CONNECTOR_CREATE = 'connector:create',
  CONNECTOR_READ = 'connector:read',
  CONNECTOR_UPDATE = 'connector:update',
  CONNECTOR_DELETE = 'connector:delete',

  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',

  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',

  TEAM_READ = 'team:read',
  TEAM_INVITE = 'team:invite',
  TEAM_REMOVE = 'team:remove',
  TEAM_UPDATE_ROLES = 'team:update_roles',

  BILLING_READ = 'billing:read',
  BILLING_UPDATE = 'billing:update'
}

export enum Scope {
  GLOBAL = 'global',
  WORKSPACE = 'workspace',
  PROJECT = 'project',
  CONTENT = 'content'
}

export interface RoleDefinition {
  role: Role;
  permissions: Permission[];
  description: string;
  inherits?: Role[];
}

export interface UserRole {
  userId: string;
  role: Role;
  scope: Scope;
  resourceId?: string;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface PolicyContext {
  userId: string;
  userRoles: UserRole[];
  resource?: any;
  action: Permission;
  scope: Scope;
  resourceId?: string;
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}
