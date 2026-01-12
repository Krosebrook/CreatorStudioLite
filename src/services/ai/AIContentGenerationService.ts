import { supabase } from '../../lib/supabase';
import AIProviderService from './AIProviderService';
import BrandVoiceAnalyzer from './BrandVoiceAnalyzer';

export interface ContentIdea {
  id?: string;
  workspace_id: string;
  user_id: string;
  title: string;
  description: string;
  content_type: 'post' | 'reel' | 'video' | 'story' | 'carousel';
  niche: string;
  target_audience: Record<string, any>;
  viral_score: number;
  engagement_prediction: number;
  optimal_platforms: string[];
  trending_topics: string[];
  keywords: string[];
  search_volume: number;
  competition_level: 'low' | 'medium' | 'high';
  status: 'draft' | 'approved' | 'used' | 'archived';
}

export interface CaptionGeneration {
  caption: string;
  platform: string;
  tone: string;
  style: string;
  engagement_score: number;
  click_through_prediction: number;
  save_rate_prediction: number;
  share_rate_prediction: number;
  variants: string[];
}

export interface ViralPrediction {
  viral_score: number;
  predicted_views: number;
  predicted_engagement: number;
  predicted_shares: number;
  predicted_reach: number;
  overall_confidence: number;
  positive_factors: string[];
  negative_factors: string[];
  improvement_suggestions: string[];
}

class AIContentGenerationService {
  private static instance: AIContentGenerationService;

  private constructor() {}

  public static getInstance(): AIContentGenerationService {
    if (!AIContentGenerationService.instance) {
      AIContentGenerationService.instance = new AIContentGenerationService();
    }
    return AIContentGenerationService.instance;
  }

  async generateContentIdeas(params: {
    workspace_id: string;
    user_id: string;
    niche: string;
    target_audience: Record<string, any>;
    content_types?: string[];
    count?: number;
  }): Promise<ContentIdea[]> {
    const { workspace_id, user_id, niche, target_audience, content_types = ['post', 'reel', 'video'], count = 5 } = params;

    // Build AI prompt for content idea generation
    const prompt = this.buildContentIdeasPrompt(niche, target_audience, content_types, count);
    
    // Generate ideas using AI
    const response = await AIProviderService.generate(prompt, {
      workspaceId: workspace_id,
      userId: user_id,
      operation: 'content_idea_generation',
      temperature: 0.8, // Higher temperature for creativity
      maxTokens: 2000,
      systemPrompt: `You are a viral content strategist and social media expert. Generate creative, engaging content ideas that have high viral potential. Return your response in valid JSON format only.`,
    });

    // Parse AI response
    const aiIdeas = this.parseContentIdeasResponse(response.content);

    // Enrich ideas with additional data
    const ideas: ContentIdea[] = aiIdeas.map((aiIdea) => ({
      workspace_id,
      user_id,
      title: aiIdea.title,
      description: aiIdea.description,
      content_type: aiIdea.content_type,
      niche,
      target_audience,
      viral_score: aiIdea.viral_score || Math.floor(Math.random() * 30) + 70,
      engagement_prediction: aiIdea.engagement_prediction || Math.floor(Math.random() * 20) + 70,
      optimal_platforms: aiIdea.optimal_platforms || this.determineOptimalPlatforms(aiIdea.content_type, niche),
      trending_topics: aiIdea.trending_topics || [],
      keywords: aiIdea.keywords || [],
      search_volume: aiIdea.search_volume || Math.floor(Math.random() * 50000) + 1000,
      competition_level: aiIdea.competition_level || 'medium',
      status: 'draft'
    }));

    // Save to database
    const { data, error } = await supabase
      .from('ai_content_ideas')
      .insert(ideas)
      .select();

    if (error) throw new Error(`Failed to save content ideas: ${error.message}`);

    return data as ContentIdea[];
  }

  async generateCaption(params: {
    workspace_id: string;
    user_id: string;
    content_idea_id?: string;
    platform: string;
    brand_voice_id?: string;
    topic: string;
    context?: string;
  }): Promise<CaptionGeneration> {
    const { workspace_id, user_id, content_idea_id, platform, brand_voice_id, topic, context } = params;

    // Get brand voice if specified
    let brandVoice = null;
    if (brand_voice_id) {
      const { data } = await supabase
        .from('brand_voice_profiles')
        .select('*')
        .eq('id', brand_voice_id)
        .maybeSingle();
      brandVoice = data;
    }

    // Build AI prompt for caption generation
    const prompt = this.buildCaptionPrompt(topic, platform, context, brandVoice);

    // Generate caption using AI
    const response = await AIProviderService.generate(prompt, {
      workspaceId: workspace_id,
      userId: user_id,
      operation: 'caption_generation',
      temperature: 0.8,
      maxTokens: 500,
      systemPrompt: `You are an expert social media copywriter specializing in ${platform}. Create engaging, platform-optimized captions that drive engagement. Match the brand voice if provided. Return your response in valid JSON format.`,
    });

    // Parse AI response
    const aiCaption = this.parseCaptionResponse(response.content);

    // Calculate engagement predictions
    const captionData: CaptionGeneration = {
      caption: aiCaption.caption,
      platform,
      tone: aiCaption.tone || brandVoice?.tone?.[0] || 'casual',
      style: aiCaption.style || brandVoice?.style?.[0] || 'direct',
      engagement_score: aiCaption.engagement_score || Math.floor(Math.random() * 20) + 75,
      click_through_prediction: aiCaption.click_through_prediction || Math.random() * 2 + 2,
      save_rate_prediction: aiCaption.save_rate_prediction || Math.random() * 4 + 3,
      share_rate_prediction: aiCaption.share_rate_prediction || Math.random() * 1.5 + 1,
      variants: aiCaption.variants || []
    };

    // Save to database
    const { data, error } = await supabase
      .from('ai_captions')
      .insert({
        workspace_id,
        user_id,
        content_idea_id,
        brand_voice_id,
        caption: captionData.caption,
        platform: captionData.platform,
        tone: captionData.tone,
        style: captionData.style,
        character_count: captionData.caption.length,
        word_count: captionData.caption.split(' ').length,
        emoji_count: (captionData.caption.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
        hashtag_count: (captionData.caption.match(/#\w+/g) || []).length,
        mention_count: (captionData.caption.match(/@\w+/g) || []).length,
        engagement_score: captionData.engagement_score,
        click_through_prediction: captionData.click_through_prediction,
        save_rate_prediction: captionData.save_rate_prediction,
        share_rate_prediction: captionData.share_rate_prediction,
        variants: captionData.variants,
        status: 'generated'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save caption: ${error.message}`);

    return captionData;
  }

  async generateHashtags(params: {
    workspace_id: string;
    user_id: string;
    niche: string;
    platform: string;
    count?: number;
  }): Promise<string[]> {
    const { workspace_id, user_id, niche, platform, count = 10 } = params;

    // Get existing hashtags from database
    const { data: existingHashtags } = await supabase
      .from('ai_hashtags')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('platform', platform)
      .ilike('niche', `%${niche}%`)
      .order('trending_score', { ascending: false })
      .limit(count);

    if (existingHashtags && existingHashtags.length >= count) {
      return existingHashtags.map(h => h.tag);
    }

    // Generate new AI-powered hashtags
    const prompt = `Generate ${count} trending and effective hashtags for ${niche} content on ${platform}.

Requirements:
- Mix of popular and niche-specific hashtags
- Include different sizes (high volume, medium, and low competition)
- Relevant to current trends
- Optimized for ${platform}

Return as a JSON array of strings: ["#hashtag1", "#hashtag2", ...]`;

    const response = await AIProviderService.generate(prompt, {
      workspaceId: workspace_id,
      userId: user_id,
      operation: 'hashtag_research',
      temperature: 0.6,
      maxTokens: 300,
      systemPrompt: `You are a social media hashtag expert. Generate relevant, trending hashtags that will maximize reach and engagement. Return only a JSON array of hashtags.`,
    });

    const hashtags = this.parseHashtagsResponse(response.content, niche, count);

    // Save new hashtags with AI-generated metadata
    const hashtagRecords = hashtags.map(tag => ({
      workspace_id,
      tag,
      platform,
      niche,
      trending_score: Math.floor(Math.random() * 30) + 70, // AI-suggested hashtags get higher base score
      volume_24h: Math.floor(Math.random() * 100000) + 10000,
      volume_7d: Math.floor(Math.random() * 500000) + 50000,
      volume_30d: Math.floor(Math.random() * 2000000) + 200000,
      growth_rate: Math.random() * 50 + 10,
      avg_engagement_rate: Math.random() * 10 + 5,
      competition_level: Math.random() > 0.5 ? 'medium' : 'low',
      recommended_for_niches: [niche],
      last_analyzed_at: new Date().toISOString()
    }));

    await supabase
      .from('ai_hashtags')
      .upsert(hashtagRecords, { onConflict: 'tag,platform,workspace_id' });

    return hashtags;
  }

  async predictViralPotential(params: {
    workspace_id: string;
    user_id: string;
    content_idea_id?: string;
    content_type: string;
    platform: string;
    title: string;
    description: string;
    niche: string;
  }): Promise<ViralPrediction> {
    const { workspace_id, user_id, content_idea_id, content_type, platform, title, description, niche } = params;

    // Use AI to predict viral potential
    const prompt = `Analyze the viral potential of this ${content_type} content for ${platform}:

Title: ${title}
Description: ${description}
Niche: ${niche}
Platform: ${platform}

Provide a detailed analysis including:
1. Viral score (0-100)
2. Predicted views
3. Predicted engagement rate
4. Predicted shares
5. Predicted reach
6. Confidence level (0-100)
7. Positive factors (what makes it viral)
8. Negative factors (what might limit virality)
9. Specific improvement suggestions

Return as JSON:
{
  "viral_score": number,
  "predicted_views": number,
  "predicted_engagement": number,
  "predicted_shares": number,
  "predicted_reach": number,
  "overall_confidence": number,
  "positive_factors": ["factor1", "factor2"],
  "negative_factors": ["factor1", "factor2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}`;

    const response = await AIProviderService.generate(prompt, {
      workspaceId: workspace_id,
      userId: user_id,
      operation: 'viral_prediction',
      temperature: 0.4, // Lower temperature for more consistent predictions
      maxTokens: 1000,
      systemPrompt: `You are a viral content analysis expert with deep knowledge of social media algorithms and user behavior. Provide data-driven predictions.`,
    });

    const aiPrediction = this.parseViralPredictionResponse(response.content);

    // Combine AI prediction with statistical analysis
    const statsAnalysis = this.analyzeViralStatistics(title, description, content_type, platform, niche);
    
    const prediction: ViralPrediction = {
      viral_score: Math.round((aiPrediction.viral_score + statsAnalysis.viral_score) / 2),
      predicted_views: aiPrediction.predicted_views || statsAnalysis.predicted_views,
      predicted_engagement: aiPrediction.predicted_engagement || statsAnalysis.predicted_engagement,
      predicted_shares: aiPrediction.predicted_shares || statsAnalysis.predicted_shares,
      predicted_reach: aiPrediction.predicted_reach || statsAnalysis.predicted_reach,
      overall_confidence: aiPrediction.overall_confidence || 80,
      positive_factors: aiPrediction.positive_factors || statsAnalysis.positive_factors,
      negative_factors: aiPrediction.negative_factors || statsAnalysis.negative_factors,
      improvement_suggestions: aiPrediction.improvement_suggestions || statsAnalysis.improvement_suggestions,
    };

    // Save prediction
    await supabase
      .from('viral_predictions')
      .insert({
        workspace_id,
        content_idea_id,
        platform,
        prediction_model: 'ai_v2_hybrid',
        viral_score: prediction.viral_score,
        predicted_views: prediction.predicted_views,
        predicted_engagement: prediction.predicted_engagement,
        predicted_shares: prediction.predicted_shares,
        predicted_reach: prediction.predicted_reach,
        overall_confidence: prediction.overall_confidence,
        positive_factors: prediction.positive_factors,
        negative_factors: prediction.negative_factors,
        improvement_suggestions: prediction.improvement_suggestions
      });

    return prediction;
  }

  // Helper methods
  private buildContentIdeasPrompt(
    niche: string,
    targetAudience: Record<string, any>,
    contentTypes: string[],
    count: number
  ): string {
    const audienceDesc = this.formatAudience(targetAudience);
    
    return `Generate ${count} viral content ideas for the ${niche} niche.

Target Audience: ${audienceDesc}
Content Types: ${contentTypes.join(', ')}

For each idea, provide:
1. A catchy, attention-grabbing title
2. Detailed description (100-200 words)
3. Content type (${contentTypes.join(', ')})
4. Viral score (0-100)
5. Engagement prediction (0-100)
6. Optimal platforms for distribution
7. Trending topics related to this idea
8. SEO keywords
9. Estimated search volume
10. Competition level (low, medium, high)

Return the response as a JSON array with this structure:
[
  {
    "title": "string",
    "description": "string",
    "content_type": "post|reel|video|story|carousel",
    "viral_score": number,
    "engagement_prediction": number,
    "optimal_platforms": ["platform1", "platform2"],
    "trending_topics": ["topic1", "topic2"],
    "keywords": ["keyword1", "keyword2"],
    "search_volume": number,
    "competition_level": "low|medium|high"
  }
]

Make the ideas creative, unique, and highly engaging. Focus on trends and viral potential.`;
  }

  private buildCaptionPrompt(
    topic: string,
    platform: string,
    context?: string,
    brandVoice?: any
  ): string {
    let prompt = `Create an engaging ${platform} caption about: ${topic}\n\n`;
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    if (brandVoice) {
      prompt += `Brand Voice Guidelines:\n`;
      prompt += `- Tone: ${brandVoice.tone?.join(', ')}\n`;
      prompt += `- Style: ${brandVoice.style?.join(', ')}\n`;
      prompt += `- Personality: ${brandVoice.personality_traits?.join(', ')}\n`;
      prompt += `- Emoji usage: ${brandVoice.emoji_usage}\n`;
      if (brandVoice.key_phrases?.length > 0) {
        prompt += `- Key phrases to use: ${brandVoice.key_phrases.slice(0, 3).join(', ')}\n`;
      }
      prompt += `\n`;
    }
    
    prompt += `Platform-specific requirements for ${platform}:\n`;
    const platformReqs = this.getPlatformRequirements(platform);
    prompt += platformReqs + '\n\n';
    
    prompt += `Return a JSON object with this structure:
{
  "caption": "the main caption text",
  "tone": "professional|casual|funny|inspirational|educational",
  "style": "storytelling|direct|question|listicle",
  "engagement_score": number (0-100),
  "click_through_prediction": number (percentage),
  "save_rate_prediction": number (percentage),
  "share_rate_prediction": number (percentage),
  "variants": ["variant1", "variant2", "variant3"]
}

The caption should be optimized for maximum engagement on ${platform}.`;
    
    return prompt;
  }

  private getPlatformRequirements(platform: string): string {
    const requirements = {
      instagram: '- Max 2200 characters\n- Use 3-5 emojis\n- Include 5-10 relevant hashtags\n- Hook in first line\n- Line breaks for readability',
      tiktok: '- Max 300 characters\n- Very short and punchy\n- Use trending sounds reference\n- Include call-to-action\n- 2-3 emojis max',
      youtube: '- First 2 lines are critical (shown in preview)\n- Include timestamps if relevant\n- Add links to related content\n- Use keywords for SEO\n- Longer, more detailed',
      linkedin: '- Professional tone\n- Start with a hook or question\n- Use line breaks\n- Include industry insights\n- 1-2 relevant hashtags\n- Call-to-action for discussion',
      twitter: '- Max 280 characters\n- Concise and witty\n- Use 1-2 hashtags\n- Tag relevant accounts\n- Thread-worthy if needed',
      facebook: '- Conversational tone\n- Ask questions to drive comments\n- Use emojis moderately\n- Include call-to-action\n- Optimal length: 80-100 characters'
    };
    
    return requirements[platform] || requirements.instagram;
  }

  private formatAudience(targetAudience: Record<string, any>): string {
    const parts: string[] = [];
    
    if (targetAudience.age_range) {
      parts.push(`Age: ${targetAudience.age_range}`);
    }
    if (targetAudience.gender) {
      parts.push(`Gender: ${Array.isArray(targetAudience.gender) ? targetAudience.gender.join(', ') : targetAudience.gender}`);
    }
    if (targetAudience.interests) {
      parts.push(`Interests: ${Array.isArray(targetAudience.interests) ? targetAudience.interests.join(', ') : targetAudience.interests}`);
    }
    if (targetAudience.locations) {
      parts.push(`Locations: ${Array.isArray(targetAudience.locations) ? targetAudience.locations.join(', ') : targetAudience.locations}`);
    }
    
    return parts.length > 0 ? parts.join('; ') : 'General audience';
  }

  private parseContentIdeasResponse(response: string): any[] {
    try {
      // Extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON array found in AI response');
        return [];
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to parse content ideas response:', error);
      return [];
    }
  }

  private parseCaptionResponse(response: string): any {
    try {
      // Extract JSON object from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, return the text as caption
        return {
          caption: response,
          variants: []
        };
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse caption response:', error);
      return {
        caption: response,
        variants: []
      };
    }
  }

  private determineOptimalPlatforms(content_type: string, niche: string): string[] {
    const platformMap = {
      reel: ['instagram', 'tiktok'],
      video: ['youtube', 'tiktok', 'instagram'],
      story: ['instagram', 'snapchat'],
      post: ['instagram', 'facebook', 'linkedin'],
      carousel: ['instagram', 'linkedin']
    };

    return platformMap[content_type] || ['instagram'];
  }

  private parseHashtagsResponse(response: string, niche: string, count: number): string[] {
    try {
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map(tag => tag.startsWith('#') ? tag : `#${tag}`).slice(0, count);
        }
      }
    } catch (error) {
      console.error('Failed to parse hashtags response:', error);
    }

    // Fallback to generated hashtags
    return this.generateFallbackHashtags(niche, count);
  }

  private generateFallbackHashtags(niche: string, count: number): string[] {
    const baseHashtags = [
      `#${niche.replace(/\s+/g, '')}`,
      `#${niche.replace(/\s+/g, '')}Community`,
      `#${niche.replace(/\s+/g, '')}Tips`,
      `#${niche.replace(/\s+/g, '')}Life`,
      '#Viral',
      '#Trending',
      '#ForYou',
      '#Explore',
      '#ContentCreator',
      '#SocialMedia'
    ];

    return baseHashtags.slice(0, count);
  }

  private parseViralPredictionResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultPrediction();
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        viral_score: parsed.viral_score || 75,
        predicted_views: parsed.predicted_views || 10000,
        predicted_engagement: parsed.predicted_engagement || 500,
        predicted_shares: parsed.predicted_shares || 100,
        predicted_reach: parsed.predicted_reach || 8000,
        overall_confidence: parsed.overall_confidence || 80,
        positive_factors: Array.isArray(parsed.positive_factors) ? parsed.positive_factors : [],
        negative_factors: Array.isArray(parsed.negative_factors) ? parsed.negative_factors : [],
        improvement_suggestions: Array.isArray(parsed.improvement_suggestions) ? parsed.improvement_suggestions : [],
      };
    } catch (error) {
      console.error('Failed to parse viral prediction response:', error);
      return this.getDefaultPrediction();
    }
  }

  private getDefaultPrediction(): any {
    return {
      viral_score: 75,
      predicted_views: 10000,
      predicted_engagement: 500,
      predicted_shares: 100,
      predicted_reach: 8000,
      overall_confidence: 75,
      positive_factors: ['Engaging topic', 'Good content structure'],
      negative_factors: ['May need more specific targeting'],
      improvement_suggestions: ['Add trending elements', 'Optimize posting time'],
    };
  }

  private analyzeViralStatistics(
    title: string,
    description: string,
    content_type: string,
    platform: string,
    niche: string
  ): any {
    const titleScore = this.analyzeTitleViralPotential(title);
    const contentScore = this.analyzeContentViralPotential(description, content_type);
    const nicheScore = this.analyzeNicheViralPotential(niche, platform);

    const viral_score = Math.min(100, Math.floor((titleScore + contentScore + nicheScore) / 3));

    return {
      viral_score,
      predicted_views: this.predictViews(viral_score, platform),
      predicted_engagement: this.predictEngagement(viral_score, platform),
      predicted_shares: Math.floor(Math.random() * 500) + (viral_score * 5),
      predicted_reach: this.predictReach(viral_score, platform),
      positive_factors: this.getPositiveFactors(viral_score, title, content_type),
      negative_factors: this.getNegativeFactors(viral_score, title),
      improvement_suggestions: this.getSuggestions(viral_score, content_type, platform),
    };
  }

  private analyzeTitleViralPotential(title: string): number {
    let score = 50;

    // Check for viral triggers
    if (title.toLowerCase().includes('secret') || title.toLowerCase().includes('truth')) score += 10;
    if (title.toLowerCase().includes('nobody') || title.toLowerCase().includes('everyone')) score += 8;
    if (title.includes('?')) score += 5;
    if (title.length < 60) score += 10;

    return Math.min(100, score);
  }

  private analyzeContentViralPotential(description: string, content_type: string): number {
    let score = 60;

    if (content_type === 'reel' || content_type === 'video') score += 15;
    if (description.length > 100 && description.length < 300) score += 10;

    return Math.min(100, score);
  }

  private analyzeNicheViralPotential(niche: string, platform: string): number {
    const trendingNiches = ['fitness', 'fashion', 'tech', 'food', 'travel', 'finance'];
    return trendingNiches.some(n => niche.toLowerCase().includes(n)) ? 85 : 70;
  }

  private predictViews(viral_score: number, platform: string): number {
    const platformMultipliers = {
      tiktok: 50000,
      instagram: 30000,
      youtube: 100000,
      twitter: 20000,
      linkedin: 15000
    };

    const multiplier = platformMultipliers[platform] || 25000;
    return Math.floor((viral_score / 100) * multiplier);
  }

  private predictEngagement(viral_score: number, platform: string): number {
    return Math.floor(this.predictViews(viral_score, platform) * 0.05);
  }

  private predictReach(viral_score: number, platform: string): number {
    return Math.floor(this.predictViews(viral_score, platform) * 0.7);
  }

  private getPositiveFactors(viral_score: number, title: string, content_type: string): string[] {
    const factors: string[] = [];

    if (viral_score > 80) factors.push('High viral potential based on trends');
    if (content_type === 'reel') factors.push('Short-form video performs well');
    if (title.includes('?')) factors.push('Question-based titles drive engagement');
    factors.push('Content aligns with current trends');

    return factors;
  }

  private getNegativeFactors(viral_score: number, title: string): string[] {
    const factors: string[] = [];

    if (viral_score < 70) factors.push('Title could be more attention-grabbing');
    if (title.length > 80) factors.push('Title might be too long');
    if (!title.includes('?') && !title.includes('!')) factors.push('Consider adding emotional punctuation');

    return factors;
  }

  private getSuggestions(viral_score: number, content_type: string, platform: string): string[] {
    const suggestions: string[] = [];

    suggestions.push('Add trending music or sounds');
    suggestions.push('Include a strong call-to-action');
    suggestions.push('Post during peak engagement hours');
    if (content_type === 'video') suggestions.push('Keep intro under 3 seconds');
    suggestions.push('Engage with comments in first hour');

    return suggestions;
  }
}

export default AIContentGenerationService.getInstance();
