import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { contentApi } from '../api';
import { Content, PublishingSchedule } from '../types';

export function useContent(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<Content[]>(
    () => contentApi.getContent(workspaceId),
    [workspaceId]
  );

  const create = useCallback(async (content: Partial<Content>) => {
    await contentApi.createContent({ ...content, workspace_id: workspaceId });
    await execute();
  }, [workspaceId, execute]);

  const update = useCallback(async (id: string, data: Partial<Content>) => {
    await contentApi.updateContent(id, data);
    await execute();
  }, [execute]);

  const remove = useCallback(async (id: string) => {
    await contentApi.deleteContent(id);
    await execute();
  }, [execute]);

  return {
    content: data || [],
    loading,
    error,
    create,
    update,
    remove,
    refresh: execute
  };
}

export function useScheduledContent(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<PublishingSchedule[]>(
    () => contentApi.getScheduledContent(workspaceId),
    [workspaceId]
  );

  const schedule = useCallback(async (scheduleData: Partial<PublishingSchedule>) => {
    await contentApi.scheduleContent({ ...scheduleData, workspace_id: workspaceId });
    await execute();
  }, [workspaceId, execute]);

  const updateSchedule = useCallback(async (id: string, data: Partial<PublishingSchedule>) => {
    await contentApi.updateSchedule(id, data);
    await execute();
  }, [execute]);

  const cancel = useCallback(async (id: string) => {
    await contentApi.cancelSchedule(id);
    await execute();
  }, [execute]);

  return {
    scheduled: data || [],
    loading,
    error,
    schedule,
    updateSchedule,
    cancel,
    refresh: execute
  };
}
