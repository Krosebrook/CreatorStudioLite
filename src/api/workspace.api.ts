import { apiClient } from './client';
import { Workspace, WorkspaceMember } from '../types';

class WorkspaceApi {
  private static instance: WorkspaceApi;

  private constructor() {}

  public static getInstance(): WorkspaceApi {
    if (!WorkspaceApi.instance) {
      WorkspaceApi.instance = new WorkspaceApi();
    }
    return WorkspaceApi.instance;
  }

  async getWorkspaces(userId: string): Promise<Workspace[]> {
    return apiClient.rpc<Workspace[]>('get_user_workspaces', { user_id: userId });
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return apiClient.queryOne<Workspace>('workspaces', { id });
  }

  async createWorkspace(workspace: Partial<Workspace>): Promise<Workspace> {
    const [result] = await apiClient.insert<Workspace>('workspaces', workspace);
    return result;
  }

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    return apiClient.update<Workspace>('workspaces', id, data);
  }

  async deleteWorkspace(id: string): Promise<void> {
    await apiClient.delete('workspaces', { id });
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiClient.query<WorkspaceMember>('workspace_members', {
      filters: { workspace_id: workspaceId }
    });
  }

  async addWorkspaceMember(member: Partial<WorkspaceMember>): Promise<WorkspaceMember> {
    const [result] = await apiClient.insert<WorkspaceMember>('workspace_members', member);
    return result;
  }

  async updateWorkspaceMember(id: string, data: Partial<WorkspaceMember>): Promise<WorkspaceMember> {
    return apiClient.update<WorkspaceMember>('workspace_members', id, data);
  }

  async removeWorkspaceMember(id: string): Promise<void> {
    await apiClient.delete('workspace_members', { id });
  }
}

export const workspaceApi = WorkspaceApi.getInstance();
