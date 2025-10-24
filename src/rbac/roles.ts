import { Role, Permission, RoleDefinition } from './types';

export const roleDefinitions: Record<Role, RoleDefinition> = {
  [Role.OWNER]: {
    role: Role.OWNER,
    description: 'Full access to all resources and settings',
    permissions: [
      Permission.CONTENT_CREATE,
      Permission.CONTENT_READ,
      Permission.CONTENT_UPDATE,
      Permission.CONTENT_DELETE,
      Permission.CONTENT_PUBLISH,
      Permission.CONTENT_SCHEDULE,
      Permission.CONNECTOR_CREATE,
      Permission.CONNECTOR_READ,
      Permission.CONNECTOR_UPDATE,
      Permission.CONNECTOR_DELETE,
      Permission.ANALYTICS_READ,
      Permission.ANALYTICS_EXPORT,
      Permission.SETTINGS_READ,
      Permission.SETTINGS_UPDATE,
      Permission.TEAM_READ,
      Permission.TEAM_INVITE,
      Permission.TEAM_REMOVE,
      Permission.TEAM_UPDATE_ROLES,
      Permission.BILLING_READ,
      Permission.BILLING_UPDATE
    ]
  },

  [Role.ADMIN]: {
    role: Role.ADMIN,
    description: 'Manage content, connectors, and team members',
    permissions: [
      Permission.CONTENT_CREATE,
      Permission.CONTENT_READ,
      Permission.CONTENT_UPDATE,
      Permission.CONTENT_DELETE,
      Permission.CONTENT_PUBLISH,
      Permission.CONTENT_SCHEDULE,
      Permission.CONNECTOR_CREATE,
      Permission.CONNECTOR_READ,
      Permission.CONNECTOR_UPDATE,
      Permission.CONNECTOR_DELETE,
      Permission.ANALYTICS_READ,
      Permission.ANALYTICS_EXPORT,
      Permission.SETTINGS_READ,
      Permission.TEAM_READ,
      Permission.TEAM_INVITE
    ]
  },

  [Role.EDITOR]: {
    role: Role.EDITOR,
    description: 'Create and publish content',
    permissions: [
      Permission.CONTENT_CREATE,
      Permission.CONTENT_READ,
      Permission.CONTENT_UPDATE,
      Permission.CONTENT_PUBLISH,
      Permission.CONTENT_SCHEDULE,
      Permission.CONNECTOR_READ,
      Permission.ANALYTICS_READ,
      Permission.SETTINGS_READ,
      Permission.TEAM_READ
    ]
  },

  [Role.CONTRIBUTOR]: {
    role: Role.CONTRIBUTOR,
    description: 'Create and edit content without publishing',
    permissions: [
      Permission.CONTENT_CREATE,
      Permission.CONTENT_READ,
      Permission.CONTENT_UPDATE,
      Permission.CONNECTOR_READ,
      Permission.ANALYTICS_READ,
      Permission.SETTINGS_READ
    ]
  },

  [Role.VIEWER]: {
    role: Role.VIEWER,
    description: 'View content and analytics only',
    permissions: [
      Permission.CONTENT_READ,
      Permission.CONNECTOR_READ,
      Permission.ANALYTICS_READ,
      Permission.SETTINGS_READ
    ]
  }
};

export function getRolePermissions(role: Role): Permission[] {
  const definition = roleDefinitions[role];
  const permissions = new Set<Permission>(definition.permissions);

  if (definition.inherits) {
    for (const inheritedRole of definition.inherits) {
      const inheritedPermissions = getRolePermissions(inheritedRole);
      inheritedPermissions.forEach(p => permissions.add(p));
    }
  }

  return Array.from(permissions);
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}
