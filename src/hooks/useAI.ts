import { useState, useCallback } from 'react';
import { useAsync } from './useAsync';
import { aiApi } from '../api';
import AIContentGenerationService from '../services/ai/AIContentGenerationService';
import { ContentIdea, Caption, Hashtag, BrandVoiceProfile, ViralPrediction } from '../types';

export function useContentIdeas(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<ContentIdea[]>(
    () => aiApi.getContentIdeas(workspaceId),
    [workspaceId]
  );

  const generate = useCallback(async (params: {
    niche: string;
    target_audience: Record<string, any>;
    content_types?: string[];
    count?: number;
  }) => {
    const ideas = await AIContentGenerationService.generateContentIdeas({
      workspace_id: workspaceId,
      user_id: '', // Get from auth context
      ...params
    });
    await execute();
    return ideas;
  }, [workspaceId, execute]);

  const update = useCallback(async (id: string, data: Partial<ContentIdea>) => {
    await aiApi.updateContentIdea(id, data);
    await execute();
  }, [execute]);

  const remove = useCallback(async (id: string) => {
    await aiApi.deleteContentIdea(id);
    await execute();
  }, [execute]);

  return {
    ideas: data || [],
    loading,
    error,
    generate,
    update,
    remove,
    refresh: execute
  };
}

export function useCaptions(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<Caption[]>(
    () => aiApi.getCaptions(workspaceId),
    [workspaceId]
  );

  const generate = useCallback(async (params: {
    platform: string;
    topic: string;
    context?: string;
    brand_voice_id?: string;
  }) => {
    const caption = await AIContentGenerationService.generateCaption({
      workspace_id: workspaceId,
      user_id: '', // Get from auth context
      ...params
    });
    await execute();
    return caption;
  }, [workspaceId, execute]);

  return {
    captions: data || [],
    loading,
    error,
    generate,
    refresh: execute
  };
}

export function useHashtags(workspaceId: string, platform: string, niche: string) {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (count = 10) => {
    setLoading(true);
    setError(null);

    try {
      const tags = await AIContentGenerationService.generateHashtags({
        workspace_id: workspaceId,
        niche,
        platform,
        count
      });
      setHashtags(tags);
      return tags;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, platform, niche]);

  return {
    hashtags,
    loading,
    error,
    generate
  };
}

export function useBrandVoice(workspaceId: string) {
  const { data, loading, error, execute } = useAsync<BrandVoiceProfile[]>(
    () => aiApi.getBrandVoiceProfiles(workspaceId),
    [workspaceId]
  );

  const create = useCallback(async (profile: Partial<BrandVoiceProfile>) => {
    await aiApi.createBrandVoiceProfile({ ...profile, workspace_id: workspaceId });
    await execute();
  }, [workspaceId, execute]);

  const update = useCallback(async (id: string, data: Partial<BrandVoiceProfile>) => {
    await aiApi.updateBrandVoiceProfile(id, data);
    await execute();
  }, [execute]);

  const remove = useCallback(async (id: string) => {
    await aiApi.deleteBrandVoiceProfile(id);
    await execute();
  }, [execute]);

  return {
    profiles: data || [],
    loading,
    error,
    create,
    update,
    remove,
    refresh: execute
  };
}

export function useViralPrediction() {
  const [prediction, setPrediction] = useState<ViralPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const predict = useCallback(async (params: {
    workspace_id: string;
    content_type: string;
    platform: string;
    title: string;
    description: string;
    niche: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AIContentGenerationService.predictViralPotential(params);
      setPrediction(result as any);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    prediction,
    loading,
    error,
    predict,
    reset: () => setPrediction(null)
  };
}
