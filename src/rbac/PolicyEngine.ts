import { PolicyContext, PolicyResult, Permission, Scope, UserRole } from './types';
import { getRolePermissions } from './roles';

type PolicyRule = (context: PolicyContext) => Promise<PolicyResult> | PolicyResult;

export class PolicyEngine {
  private static instance: PolicyEngine;
  private customPolicies: Map<string, PolicyRule> = new Map();

  private constructor() {}

  static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  registerPolicy(name: string, rule: PolicyRule): void {
    this.customPolicies.set(name, rule);
  }

  async evaluate(context: PolicyContext): Promise<PolicyResult> {
    if (context.userRoles.length === 0) {
      return {
        allowed: false,
        reason: 'User has no roles assigned'
      };
    }

    const relevantRoles = this.getRelevantRoles(context);

    if (relevantRoles.length === 0) {
      return {
        allowed: false,
        reason: `User has no roles for ${context.scope} scope`
      };
    }

    const hasExpiredRole = relevantRoles.some(
      r => r.expiresAt && r.expiresAt < new Date()
    );

    if (hasExpiredRole) {
      return {
        allowed: false,
        reason: 'User role has expired'
      };
    }

    const hasRequiredPermission = relevantRoles.some(role => {
      const permissions = getRolePermissions(role.role);
      return permissions.includes(context.action);
    });

    if (!hasRequiredPermission) {
      return {
        allowed: false,
        reason: `User does not have ${context.action} permission`
      };
    }

    for (const [name, policy] of this.customPolicies) {
      const result = await policy(context);
      if (!result.allowed) {
        return {
          allowed: false,
          reason: result.reason || `Custom policy '${name}' denied access`
        };
      }
    }

    return {
      allowed: true
    };
  }

  async can(
    userId: string,
    action: Permission,
    userRoles: UserRole[],
    options?: {
      scope?: Scope;
      resourceId?: string;
      resource?: any;
    }
  ): Promise<boolean> {
    const context: PolicyContext = {
      userId,
      userRoles,
      action,
      scope: options?.scope || Scope.GLOBAL,
      resourceId: options?.resourceId,
      resource: options?.resource
    };

    const result = await this.evaluate(context);
    return result.allowed;
  }

  private getRelevantRoles(context: PolicyContext): UserRole[] {
    return context.userRoles.filter(role => {
      if (role.scope === Scope.GLOBAL) {
        return true;
      }

      if (role.scope === context.scope) {
        if (!context.resourceId) {
          return true;
        }
        return role.resourceId === context.resourceId;
      }

      const scopeHierarchy = {
        [Scope.GLOBAL]: 4,
        [Scope.WORKSPACE]: 3,
        [Scope.PROJECT]: 2,
        [Scope.CONTENT]: 1
      };

      return scopeHierarchy[role.scope] > scopeHierarchy[context.scope];
    });
  }
}

export const policyEngine = PolicyEngine.getInstance();
