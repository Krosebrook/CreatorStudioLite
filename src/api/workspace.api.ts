import { apiClient } from './client';
import { Workspace, WorkspaceMember } from '../types';

/**
 * Workspace API client for managing workspaces and team members.
 * 
 * Provides methods for CRUD operations on workspaces and workspace members.
 * Handles multi-tenant isolation and team collaboration features.
 * 
 * @example
 * ```typescript
 * import { workspaceApi } from './api';
 * 
 * // Get user's workspaces
 * const workspaces = await workspaceApi.getWorkspaces('user-123');
 * 
 * // Create new workspace
 * const workspace = await workspaceApi.createWorkspace({
 *   name: 'My Workspace',
 *   ownerId: 'user-123'
 * });
 * 
 * // Add team member
 * await workspaceApi.addWorkspaceMember({
 *   workspace_id: workspace.id,
 *   user_id: 'user-456',
 *   role: 'editor'
 * });
 * ```
 * 
 * @class
 * @since 1.0.0
 */
class WorkspaceApi {
  private static instance: WorkspaceApi;

  private constructor() {}

  /**
   * Returns the singleton instance of WorkspaceApi.
   * 
   * @returns The WorkspaceApi instance
   */
  public static getInstance(): WorkspaceApi {
    if (!WorkspaceApi.instance) {
      WorkspaceApi.instance = new WorkspaceApi();
    }
    return WorkspaceApi.instance;
  }

  /**
   * Retrieves all workspaces accessible by a user.
   * 
   * Returns workspaces where the user is either the owner or a member.
   * 
   * @param userId - The user ID to query
   * 
   * @returns Promise resolving to an array of workspaces
   * 
   * @example
   * ```typescript
   * const workspaces = await workspaceApi.getWorkspaces('user-123');
   * console.log(`User has access to ${workspaces.length} workspaces`);
   * ```
   */
  async getWorkspaces(userId: string): Promise<Workspace[]> {
    return apiClient.rpc<Workspace[]>('get_user_workspaces', { user_id: userId });
  }

  /**
   * Retrieves a single workspace by ID.
   * 
   * @param id - The workspace ID
   * 
   * @returns Promise resolving to the workspace or null if not found
   * 
   * @example
   * ```typescript
   * const workspace = await workspaceApi.getWorkspace('workspace-123');
   * if (workspace) {
   *   console.log('Workspace name:', workspace.name);
   * }
   * ```
   */
  async getWorkspace(id: string): Promise<Workspace | null> {
    return apiClient.queryOne<Workspace>('workspaces', { id });
  }

  /**
   * Creates a new workspace.
   * 
   * The user who creates the workspace becomes the owner with full permissions.
   * 
   * @param workspace - Partial workspace object with required fields
   * 
   * @returns Promise resolving to the created workspace
   * 
   * @throws {ValidationError} If required fields are missing
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * const workspace = await workspaceApi.createWorkspace({
   *   name: 'Creative Agency',
   *   owner_id: 'user-123',
   *   settings: {
   *     timezone: 'America/New_York',
   *     defaultPlatforms: ['instagram', 'facebook']
   *   }
   * });
   * ```
   */
  async createWorkspace(workspace: Partial<Workspace>): Promise<Workspace> {
    const [result] = await apiClient.insert<Workspace>('workspaces', workspace);
    return result;
  }

  /**
   * Updates an existing workspace.
   * 
   * Only workspace owners and admins can update workspace settings.
   * 
   * @param id - The workspace ID to update
   * @param data - Partial workspace object with fields to update
   * 
   * @returns Promise resolving to the updated workspace
   * 
   * @throws {NotFoundError} If workspace doesn't exist
   * @throws {AuthorizationError} If user lacks permission
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * const updated = await workspaceApi.updateWorkspace('workspace-123', {
   *   name: 'Updated Name',
   *   settings: { timezone: 'America/Los_Angeles' }
   * });
   * ```
   */
  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    return apiClient.update<Workspace>('workspaces', id, data);
  }

  /**
   * Deletes a workspace and all associated data.
   * 
   * This is a destructive operation that cascades to all workspace content,
   * connectors, analytics, and other related data. Only workspace owners can delete.
   * 
   * @param id - The workspace ID to delete
   * 
   * @returns Promise that resolves when deletion is complete
   * 
   * @throws {NotFoundError} If workspace doesn't exist
   * @throws {AuthorizationError} If user is not the owner
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * await workspaceApi.deleteWorkspace('workspace-123');
   * ```
   */
  async deleteWorkspace(id: string): Promise<void> {
    await apiClient.delete('workspaces', { id });
  }

  /**
   * Retrieves all members of a workspace.
   * 
   * @param workspaceId - The workspace ID to query
   * 
   * @returns Promise resolving to an array of workspace members
   * 
   * @example
   * ```typescript
   * const members = await workspaceApi.getWorkspaceMembers('workspace-123');
   * members.forEach(member => {
   *   console.log(`${member.user_id}: ${member.role}`);
   * });
   * ```
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiClient.query<WorkspaceMember>('workspace_members', {
      filters: { workspace_id: workspaceId }
    });
  }

  /**
   * Adds a new member to a workspace.
   * 
   * Sends an invitation email to the new member if they don't have an account.
   * Only workspace owners and admins can add members.
   * 
   * @param member - Partial workspace member object
   * 
   * @returns Promise resolving to the created membership
   * 
   * @throws {ConflictError} If user is already a member
   * @throws {AuthorizationError} If requester lacks permission
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * const member = await workspaceApi.addWorkspaceMember({
   *   workspace_id: 'workspace-123',
   *   user_id: 'user-456',
   *   role: 'editor'
   * });
   * ```
   */
  async addWorkspaceMember(member: Partial<WorkspaceMember>): Promise<WorkspaceMember> {
    const [result] = await apiClient.insert<WorkspaceMember>('workspace_members', member);
    return result;
  }

  /**
   * Updates a workspace member's role or permissions.
   * 
   * Only workspace owners and admins can update member roles.
   * 
   * @param id - The membership ID to update
   * @param data - Partial workspace member object with fields to update
   * 
   * @returns Promise resolving to the updated membership
   * 
   * @example
   * ```typescript
   * const updated = await workspaceApi.updateWorkspaceMember('member-123', {
   *   role: 'admin'
   * });
   * ```
   */
  async updateWorkspaceMember(id: string, data: Partial<WorkspaceMember>): Promise<WorkspaceMember> {
    return apiClient.update<WorkspaceMember>('workspace_members', id, data);
  }

  /**
   * Removes a member from a workspace.
   * 
   * The workspace owner cannot be removed. Only owners and admins can remove members.
   * 
   * @param id - The membership ID to remove
   * 
   * @returns Promise that resolves when removal is complete
   * 
   * @throws {AuthorizationError} If attempting to remove owner or lacking permission
   * @throws {DatabaseError} If database operation fails
   * 
   * @example
   * ```typescript
   * await workspaceApi.removeWorkspaceMember('member-123');
   * ```
   */
  async removeWorkspaceMember(id: string): Promise<void> {
    await apiClient.delete('workspace_members', { id });
  }
}

export const workspaceApi = WorkspaceApi.getInstance();
