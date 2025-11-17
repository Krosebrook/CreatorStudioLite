import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { workspaceApi } from '../api';
import { Workspace, WorkspaceMember } from '../types';

export function useWorkspaces(userId: string) {
  const { data, loading, error, execute } = useAsync<Workspace[]>(
    () => workspaceApi.getWorkspaces(userId),
    [userId]
  );

  const create = useCallback(async (workspace: Partial<Workspace>) => {
    await workspaceApi.createWorkspace(workspace);
    await execute();
  }, [execute]);

  return {
    workspaces: data || [],
    loading,
    error,
    create,
    refresh: execute
  };
}

export function useWorkspace(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<Workspace | null>(
    () => workspaceApi.getWorkspace(workspaceId),
    [workspaceId]
  );

  const update = useCallback(async (data: Partial<Workspace>) => {
    if (!workspaceId) return;
    await workspaceApi.updateWorkspace(workspaceId, data);
    await execute();
  }, [workspaceId, execute]);

  return {
    workspace: data,
    loading,
    error,
    update,
    refresh: execute
  };
}

export function useWorkspaceMembers(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<WorkspaceMember[]>(
    () => workspaceApi.getWorkspaceMembers(workspaceId),
    [workspaceId]
  );

  const add = useCallback(async (member: Partial<WorkspaceMember>) => {
    await workspaceApi.addWorkspaceMember({ ...member, workspace_id: workspaceId });
    await execute();
  }, [workspaceId, execute]);

  const update = useCallback(async (id: string, data: Partial<WorkspaceMember>) => {
    await workspaceApi.updateWorkspaceMember(id, data);
    await execute();
  }, [execute]);

  const remove = useCallback(async (id: string) => {
    await workspaceApi.removeWorkspaceMember(id);
    await execute();
  }, [execute]);

  return {
    members: data || [],
    loading,
    error,
    add,
    update,
    remove,
    refresh: execute
  };
}
