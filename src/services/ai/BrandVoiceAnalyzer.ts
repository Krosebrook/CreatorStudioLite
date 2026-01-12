import { supabase } from '../../lib/supabase';
import AIProviderService from './AIProviderService';
import {
  BrandVoiceProfile,
  CaptionTone,
  CaptionStyle,
  VocabularyLevel,
  SentenceStructure,
  EmojiUsage,
} from '../../types/ai.types';

/**
 * Brand Voice Analyzer Service
 * Analyzes user's content to learn their brand voice and create profiles
 */
class BrandVoiceAnalyzer {
  private static instance: BrandVoiceAnalyzer;

  private constructor() {}

  public static getInstance(): BrandVoiceAnalyzer {
    if (!BrandVoiceAnalyzer.instance) {
      BrandVoiceAnalyzer.instance = new BrandVoiceAnalyzer();
    }
    return BrandVoiceAnalyzer.instance;
  }

  /**
   * Analyze user's existing content to create brand voice profile
   */
  async analyzeAndCreateProfile(params: {
    workspaceId: string;
    userId: string;
    name: string;
    description?: string;
    sampleContentIds?: string[];
    minSamples?: number;
  }): Promise<BrandVoiceProfile> {
    const {
      workspaceId,
      userId,
      name,
      description,
      sampleContentIds,
      minSamples = 10,
    } = params;

    // Fetch sample content
    let sampleContent: string[] = [];
    
    if (sampleContentIds && sampleContentIds.length > 0) {
      // Use provided content IDs
      const { data: captions } = await supabase
        .from('ai_captions')
        .select('caption')
        .in('id', sampleContentIds)
        .eq('workspace_id', workspaceId);
      
      sampleContent = (captions || []).map((c) => c.caption);
    } else {
      // Fetch recent successful captions
      const { data: captions } = await supabase
        .from('ai_captions')
        .select('caption')
        .eq('workspace_id', workspaceId)
        .eq('status', 'used')
        .order('created_at', { ascending: false })
        .limit(Math.max(minSamples, 20));
      
      sampleContent = (captions || []).map((c) => c.caption);
    }

    if (sampleContent.length < minSamples) {
      throw new Error(
        `Not enough sample content. Found ${sampleContent.length}, need at least ${minSamples}`
      );
    }

    // Analyze brand voice using AI
    const analysis = await this.analyzeContent(workspaceId, userId, sampleContent);

    // Create brand voice profile
    const profile: Partial<BrandVoiceProfile> = {
      workspace_id: workspaceId,
      user_id: userId,
      name,
      description,
      is_default: false,
      tone: analysis.tone,
      style: analysis.style,
      personality_traits: analysis.personalityTraits,
      vocabulary_level: analysis.vocabularyLevel,
      sentence_structure: analysis.sentenceStructure,
      emoji_usage: analysis.emojiUsage,
      key_phrases: analysis.keyPhrases,
      avoid_phrases: [],
      preferred_hashtags: analysis.preferredHashtags,
      brand_values: analysis.brandValues,
      sample_content: sampleContent.slice(0, 5), // Store first 5 samples
      engagement_patterns: {},
      audience_response: {},
      metadata: {
        samples_analyzed: sampleContent.length,
        analyzed_at: new Date().toISOString(),
      },
    };

    // Save to database
    const { data, error } = await supabase
      .from('brand_voice_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create brand voice profile: ${error.message}`);
    }

    return data as BrandVoiceProfile;
  }

  /**
   * Analyze content using AI to extract brand voice characteristics
   */
  private async analyzeContent(
    workspaceId: string,
    userId: string,
    samples: string[]
  ): Promise<{
    tone: CaptionTone[];
    style: CaptionStyle[];
    personalityTraits: string[];
    vocabularyLevel: VocabularyLevel;
    sentenceStructure: SentenceStructure;
    emojiUsage: EmojiUsage;
    keyPhrases: string[];
    preferredHashtags: string[];
    brandValues: string[];
  }> {
    // Prepare analysis prompt
    const prompt = this.buildAnalysisPrompt(samples);

    // Call AI provider
    const response = await AIProviderService.generate(prompt, {
      workspaceId,
      userId,
      operation: 'brand_voice_analysis',
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 2000,
      systemPrompt: `You are an expert brand voice analyst. Analyze the provided content samples and extract detailed characteristics about the writing style, tone, and personality. Return your analysis in a structured JSON format.`,
    });

    // Parse AI response
    const analysis = this.parseAnalysisResponse(response.content);

    // Add statistical analysis
    const stats = this.analyzeStatistics(samples);

    return {
      ...analysis,
      vocabularyLevel: stats.vocabularyLevel,
      sentenceStructure: stats.sentenceStructure,
      emojiUsage: stats.emojiUsage,
      preferredHashtags: stats.hashtags,
    };
  }

  /**
   * Build analysis prompt for AI
   */
  private buildAnalysisPrompt(samples: string[]): string {
    const samplesText = samples
      .map((s, i) => `Sample ${i + 1}:\n${s}\n`)
      .join('\n---\n');

    return `Analyze the following content samples and identify the brand voice characteristics:

${samplesText}

Please provide a detailed analysis in the following JSON format:
{
  "tone": ["professional", "casual", "funny", "inspirational", "educational"],
  "style": ["storytelling", "direct", "question", "listicle"],
  "personalityTraits": ["authentic", "energetic", "thoughtful", "bold", "friendly"],
  "keyPhrases": ["phrases that are frequently used"],
  "brandValues": ["values reflected in the content"]
}

Focus on:
1. The overall tone and mood of the content
2. The writing style and structure
3. Personality traits that shine through
4. Recurring phrases or expressions
5. Core values and messages

Return ONLY the JSON object, no additional text.`;
  }

  /**
   * Parse AI analysis response
   */
  private parseAnalysisResponse(response: string): {
    tone: CaptionTone[];
    style: CaptionStyle[];
    personalityTraits: string[];
    keyPhrases: string[];
    brandValues: string[];
  } {
    try {
      // Extract JSON from response (in case AI adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        tone: Array.isArray(parsed.tone) ? parsed.tone.slice(0, 3) : ['casual'],
        style: Array.isArray(parsed.style) ? parsed.style.slice(0, 2) : ['direct'],
        personalityTraits: Array.isArray(parsed.personalityTraits)
          ? parsed.personalityTraits.slice(0, 5)
          : [],
        keyPhrases: Array.isArray(parsed.keyPhrases) ? parsed.keyPhrases.slice(0, 10) : [],
        brandValues: Array.isArray(parsed.brandValues) ? parsed.brandValues.slice(0, 5) : [],
      };
    } catch (error) {
      console.error('Failed to parse AI analysis:', error);
      // Return defaults if parsing fails
      return {
        tone: ['casual'],
        style: ['direct'],
        personalityTraits: [],
        keyPhrases: [],
        brandValues: [],
      };
    }
  }

  /**
   * Analyze statistical characteristics of content
   */
  private analyzeStatistics(samples: string[]): {
    vocabularyLevel: VocabularyLevel;
    sentenceStructure: SentenceStructure;
    emojiUsage: EmojiUsage;
    hashtags: string[];
  } {
    // Calculate average word length (indicates vocabulary complexity)
    const avgWordLength =
      samples.reduce((sum, sample) => {
        const words = sample.split(/\s+/).filter((w) => w.length > 0);
        const totalLength = words.reduce((s, w) => s + w.length, 0);
        return sum + (words.length > 0 ? totalLength / words.length : 0);
      }, 0) / samples.length;

    const vocabularyLevel: VocabularyLevel =
      avgWordLength > 7 ? 'advanced' : avgWordLength > 5 ? 'medium' : 'simple';

    // Analyze sentence structure
    const avgSentenceLength =
      samples.reduce((sum, sample) => {
        const sentences = sample.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        const words = sample.split(/\s+/).filter((w) => w.length > 0);
        return sum + (sentences.length > 0 ? words.length / sentences.length : 0);
      }, 0) / samples.length;

    const sentenceStructure: SentenceStructure =
      avgSentenceLength > 20
        ? 'long'
        : avgSentenceLength > 10
        ? 'medium'
        : avgSentenceLength > 5
        ? 'short'
        : 'varied';

    // Analyze emoji usage
    const totalEmojis = samples.reduce((sum, sample) => {
      const emojis = sample.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
      return sum + emojis.length;
    }, 0);

    const avgEmojisPerSample = totalEmojis / samples.length;

    const emojiUsage: EmojiUsage =
      avgEmojisPerSample === 0
        ? 'none'
        : avgEmojisPerSample > 5
        ? 'heavy'
        : avgEmojisPerSample > 2
        ? 'moderate'
        : 'light';

    // Extract common hashtags
    const hashtagCounts: Record<string, number> = {};
    samples.forEach((sample) => {
      const hashtags = sample.match(/#\w+/g) || [];
      hashtags.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    const sortedHashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 10);

    return {
      vocabularyLevel,
      sentenceStructure,
      emojiUsage,
      hashtags: sortedHashtags,
    };
  }

  /**
   * Update brand voice profile based on new content performance
   */
  async updateProfileFromPerformance(
    profileId: string,
    workspaceId: string,
    userId: string
  ): Promise<void> {
    // Get captions using this profile with actual performance data
    const { data: performingCaptions } = await supabase
      .from('ai_captions')
      .select('*')
      .eq('brand_voice_id', profileId)
      .eq('status', 'used')
      .not('actual_engagement_rate', 'is', null)
      .order('actual_engagement_rate', { ascending: false })
      .limit(20);

    if (!performingCaptions || performingCaptions.length === 0) {
      return; // Not enough data yet
    }

    // Calculate engagement patterns
    const engagementPatterns = {
      avg_engagement_rate:
        performingCaptions.reduce((sum, c) => sum + (c.actual_engagement_rate || 0), 0) /
        performingCaptions.length,
      best_performing_tone: this.findBestPerformingAttribute(performingCaptions, 'tone'),
      best_performing_style: this.findBestPerformingAttribute(performingCaptions, 'style'),
      total_captions_analyzed: performingCaptions.length,
    };

    // Update profile
    await supabase
      .from('brand_voice_profiles')
      .update({
        engagement_patterns: engagementPatterns,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);
  }

  /**
   * Find best performing attribute (tone/style)
   */
  private findBestPerformingAttribute(
    captions: any[],
    attribute: 'tone' | 'style'
  ): string | null {
    const attributeScores: Record<string, { total: number; count: number }> = {};

    captions.forEach((caption) => {
      const value = caption[attribute];
      const engagement = caption.actual_engagement_rate || 0;

      if (!attributeScores[value]) {
        attributeScores[value] = { total: 0, count: 0 };
      }

      attributeScores[value].total += engagement;
      attributeScores[value].count += 1;
    });

    // Find attribute with highest average engagement
    let bestAttribute: string | null = null;
    let bestAverage = 0;

    Object.entries(attributeScores).forEach(([attr, { total, count }]) => {
      const average = total / count;
      if (average > bestAverage) {
        bestAverage = average;
        bestAttribute = attr;
      }
    });

    return bestAttribute;
  }
}

export default BrandVoiceAnalyzer.getInstance();
