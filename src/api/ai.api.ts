import { apiClient } from './client';
import {
  ContentIdea,
  Caption,
  Hashtag,
  BrandVoiceProfile,
  ViralPrediction,
  GenerateContentIdeasRequest,
  GenerateCaptionRequest,
  GenerateHashtagsRequest,
  PredictViralPotentialRequest
} from '../types';

class AIApi {
  private static instance: AIApi;

  private constructor() {}

  public static getInstance(): AIApi {
    if (!AIApi.instance) {
      AIApi.instance = new AIApi();
    }
    return AIApi.instance;
  }

  async getContentIdeas(workspaceId: string, filters?: Record<string, any>): Promise<ContentIdea[]> {
    return apiClient.query<ContentIdea>('ai_content_ideas', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'viral_score', ascending: false }
    });
  }

  async getContentIdea(id: string): Promise<ContentIdea | null> {
    return apiClient.queryOne<ContentIdea>('ai_content_ideas', { id });
  }

  async createContentIdea(idea: Partial<ContentIdea>): Promise<ContentIdea> {
    const [result] = await apiClient.insert<ContentIdea>('ai_content_ideas', idea);
    return result;
  }

  async updateContentIdea(id: string, data: Partial<ContentIdea>): Promise<ContentIdea> {
    return apiClient.update<ContentIdea>('ai_content_ideas', id, data);
  }

  async deleteContentIdea(id: string): Promise<void> {
    await apiClient.delete('ai_content_ideas', { id });
  }

  async getCaptions(workspaceId: string, filters?: Record<string, any>): Promise<Caption[]> {
    return apiClient.query<Caption>('ai_captions', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'engagement_score', ascending: false }
    });
  }

  async getCaption(id: string): Promise<Caption | null> {
    return apiClient.queryOne<Caption>('ai_captions', { id });
  }

  async createCaption(caption: Partial<Caption>): Promise<Caption> {
    const [result] = await apiClient.insert<Caption>('ai_captions', caption);
    return result;
  }

  async updateCaption(id: string, data: Partial<Caption>): Promise<Caption> {
    return apiClient.update<Caption>('ai_captions', id, data);
  }

  async getHashtags(workspaceId: string, filters?: Record<string, any>): Promise<Hashtag[]> {
    return apiClient.query<Hashtag>('ai_hashtags', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'trending_score', ascending: false }
    });
  }

  async createHashtags(hashtags: Partial<Hashtag>[]): Promise<Hashtag[]> {
    return apiClient.upsert<Hashtag>('ai_hashtags', hashtags, {
      onConflict: 'tag,platform,workspace_id'
    });
  }

  async getBrandVoiceProfiles(workspaceId: string): Promise<BrandVoiceProfile[]> {
    return apiClient.query<BrandVoiceProfile>('brand_voice_profiles', {
      filters: { workspace_id: workspaceId },
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  async getBrandVoiceProfile(id: string): Promise<BrandVoiceProfile | null> {
    return apiClient.queryOne<BrandVoiceProfile>('brand_voice_profiles', { id });
  }

  async getDefaultBrandVoice(workspaceId: string): Promise<BrandVoiceProfile | null> {
    return apiClient.queryOne<BrandVoiceProfile>('brand_voice_profiles', {
      workspace_id: workspaceId,
      is_default: true
    });
  }

  async createBrandVoiceProfile(profile: Partial<BrandVoiceProfile>): Promise<BrandVoiceProfile> {
    const [result] = await apiClient.insert<BrandVoiceProfile>('brand_voice_profiles', profile);
    return result;
  }

  async updateBrandVoiceProfile(id: string, data: Partial<BrandVoiceProfile>): Promise<BrandVoiceProfile> {
    return apiClient.update<BrandVoiceProfile>('brand_voice_profiles', id, data);
  }

  async deleteBrandVoiceProfile(id: string): Promise<void> {
    await apiClient.delete('brand_voice_profiles', { id });
  }

  async getViralPredictions(workspaceId: string, filters?: Record<string, any>): Promise<ViralPrediction[]> {
    return apiClient.query<ViralPrediction>('viral_predictions', {
      filters: { workspace_id: workspaceId, ...filters },
      orderBy: { column: 'viral_score', ascending: false }
    });
  }

  async getViralPrediction(id: string): Promise<ViralPrediction | null> {
    return apiClient.queryOne<ViralPrediction>('viral_predictions', { id });
  }

  async createViralPrediction(prediction: Partial<ViralPrediction>): Promise<ViralPrediction> {
    const [result] = await apiClient.insert<ViralPrediction>('viral_predictions', prediction);
    return result;
  }

  async updateViralPrediction(id: string, data: Partial<ViralPrediction>): Promise<ViralPrediction> {
    return apiClient.update<ViralPrediction>('viral_predictions', id, data);
  }
}

export const aiApi = AIApi.getInstance();
