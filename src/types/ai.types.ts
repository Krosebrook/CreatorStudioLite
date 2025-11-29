import { UUID, Timestamp, Platform, ContentType } from './common.types';

export interface ContentIdea {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  title: string;
  description: string;
  content_type: ContentType;
  niche: string;
  target_audience: TargetAudience;
  viral_score: number;
  engagement_prediction: number;
  optimal_platforms: Platform[];
  trending_topics: string[];
  keywords: string[];
  search_volume: number;
  competition_level: CompetitionLevel;
  status: ContentIdeaStatus;
  used_in_content_id?: UUID;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TargetAudience {
  age_range?: string;
  gender?: string[];
  interests?: string[];
  locations?: string[];
  languages?: string[];
}

export type CompetitionLevel = 'low' | 'medium' | 'high';

export type ContentIdeaStatus = 'draft' | 'approved' | 'used' | 'archived';

export interface Caption {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  content_idea_id?: UUID;
  caption: string;
  platform: Platform;
  language: string;
  brand_voice_id?: UUID;
  tone: CaptionTone;
  style: CaptionStyle;
  character_count: number;
  word_count: number;
  emoji_count: number;
  hashtag_count: number;
  mention_count: number;
  engagement_score: number;
  click_through_prediction: number;
  save_rate_prediction: number;
  share_rate_prediction: number;
  actual_engagement_rate?: number;
  actual_clicks?: number;
  actual_saves?: number;
  actual_shares?: number;
  status: CaptionStatus;
  used_at?: Timestamp;
  variants: string[];
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type CaptionTone = 'professional' | 'casual' | 'funny' | 'inspirational' | 'educational';

export type CaptionStyle = 'storytelling' | 'direct' | 'question' | 'listicle';

export type CaptionStatus = 'generated' | 'approved' | 'used' | 'archived';

export interface Hashtag {
  id: UUID;
  workspace_id: UUID;
  tag: string;
  platform: Platform;
  niche?: string;
  trending_score: number;
  volume_24h: number;
  volume_7d: number;
  volume_30d: number;
  growth_rate: number;
  avg_engagement_rate: number;
  avg_reach: number;
  competition_level: CompetitionLevel;
  recommended_for_niches: string[];
  best_time_to_use?: string;
  complementary_tags: string[];
  last_analyzed_at: Timestamp;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface BrandVoiceProfile {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  name: string;
  description?: string;
  is_default: boolean;
  tone: CaptionTone[];
  style: CaptionStyle[];
  personality_traits: string[];
  vocabulary_level: VocabularyLevel;
  sentence_structure: SentenceStructure;
  emoji_usage: EmojiUsage;
  key_phrases: string[];
  avoid_phrases: string[];
  preferred_hashtags: string[];
  brand_values: string[];
  sample_content: string[];
  engagement_patterns: Record<string, unknown>;
  audience_response: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type VocabularyLevel = 'simple' | 'medium' | 'advanced';

export type SentenceStructure = 'short' | 'medium' | 'long' | 'varied';

export type EmojiUsage = 'none' | 'light' | 'moderate' | 'heavy';

export interface ViralPrediction {
  id: UUID;
  workspace_id: UUID;
  content_id?: UUID;
  content_idea_id?: UUID;
  platform: Platform;
  predicted_at: Timestamp;
  prediction_model: string;
  viral_score: number;
  predicted_views: number;
  predicted_engagement: number;
  predicted_shares: number;
  predicted_reach: number;
  overall_confidence: number;
  views_confidence: number;
  engagement_confidence: number;
  positive_factors: string[];
  negative_factors: string[];
  improvement_suggestions: string[];
  actual_views?: number;
  actual_engagement?: number;
  actual_shares?: number;
  actual_reach?: number;
  prediction_accuracy?: number;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Request/Response types
export interface GenerateContentIdeasRequest {
  workspace_id: UUID;
  user_id: UUID;
  niche: string;
  target_audience: TargetAudience;
  content_types?: ContentType[];
  count?: number;
}

export interface GenerateCaptionRequest {
  workspace_id: UUID;
  user_id: UUID;
  content_idea_id?: UUID;
  platform: Platform;
  brand_voice_id?: UUID;
  topic: string;
  context?: string;
}

export interface GenerateHashtagsRequest {
  workspace_id: UUID;
  niche: string;
  platform: Platform;
  count?: number;
}

export interface PredictViralPotentialRequest {
  workspace_id: UUID;
  content_idea_id?: UUID;
  content_type: ContentType;
  platform: Platform;
  title: string;
  description: string;
  niche: string;
}
