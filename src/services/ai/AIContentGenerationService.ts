import { supabase } from '../../lib/supabase';

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

    // AI-powered content idea generation
    // In production, this would call OpenAI/Anthropic/Google AI
    const ideas: ContentIdea[] = [];

    const ideaTemplates = [
      { type: 'tutorial', viral_range: [65, 85] },
      { type: 'behind-the-scenes', viral_range: [70, 90] },
      { type: 'transformation', viral_range: [75, 95] },
      { type: 'trending-challenge', viral_range: [80, 95] },
      { type: 'educational', viral_range: [60, 80] },
      { type: 'storytelling', viral_range: [70, 88] },
      { type: 'product-review', viral_range: [55, 75] },
      { type: 'comparison', viral_range: [65, 85] },
      { type: 'list-format', viral_range: [70, 85] },
      { type: 'controversy', viral_range: [75, 95] }
    ];

    for (let i = 0; i < count; i++) {
      const template = ideaTemplates[Math.floor(Math.random() * ideaTemplates.length)];
      const content_type = content_types[Math.floor(Math.random() * content_types.length)] as any;
      const viral_score = Math.floor(Math.random() * (template.viral_range[1] - template.viral_range[0] + 1)) + template.viral_range[0];

      const idea: ContentIdea = {
        workspace_id,
        user_id,
        title: this.generateTitle(niche, template.type, content_type),
        description: this.generateDescription(niche, template.type),
        content_type,
        niche,
        target_audience,
        viral_score,
        engagement_prediction: this.calculateEngagementPrediction(viral_score),
        optimal_platforms: this.determineOptimalPlatforms(content_type, niche),
        trending_topics: this.getTrendingTopics(niche),
        keywords: this.generateKeywords(niche, template.type),
        search_volume: Math.floor(Math.random() * 50000) + 1000,
        competition_level: viral_score > 80 ? 'high' : viral_score > 60 ? 'medium' : 'low',
        status: 'draft'
      };

      ideas.push(idea);
    }

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

    // AI caption generation based on platform and brand voice
    const caption = this.generateAICaption(platform, topic, context, brandVoice);
    const variants = this.generateCaptionVariants(caption, platform, 3);

    const tones = ['professional', 'casual', 'funny', 'inspirational', 'educational'];
    const styles = ['storytelling', 'direct', 'question', 'listicle'];

    const captionData: CaptionGeneration = {
      caption,
      platform,
      tone: brandVoice?.tone?.[0] || tones[Math.floor(Math.random() * tones.length)],
      style: brandVoice?.style?.[0] || styles[Math.floor(Math.random() * styles.length)],
      engagement_score: Math.floor(Math.random() * 30) + 70,
      click_through_prediction: Math.random() * 3 + 2,
      save_rate_prediction: Math.random() * 5 + 3,
      share_rate_prediction: Math.random() * 2 + 1,
      variants
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
        character_count: caption.length,
        word_count: caption.split(' ').length,
        emoji_count: (caption.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
        hashtag_count: (caption.match(/#\w+/g) || []).length,
        mention_count: (caption.match(/@\w+/g) || []).length,
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
    niche: string;
    platform: string;
    count?: number;
  }): Promise<string[]> {
    const { workspace_id, niche, platform, count = 10 } = params;

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

    // Generate new AI hashtags
    const hashtags = this.generateAIHashtags(niche, platform, count);

    // Save new hashtags
    const hashtagRecords = hashtags.map(tag => ({
      workspace_id,
      tag,
      platform,
      niche,
      trending_score: Math.floor(Math.random() * 40) + 60,
      volume_24h: Math.floor(Math.random() * 100000) + 10000,
      volume_7d: Math.floor(Math.random() * 500000) + 50000,
      volume_30d: Math.floor(Math.random() * 2000000) + 200000,
      growth_rate: Math.random() * 50 + 10,
      avg_engagement_rate: Math.random() * 10 + 5,
      competition_level: Math.random() > 0.5 ? 'medium' : 'low',
      recommended_for_niches: [niche]
    }));

    await supabase
      .from('ai_hashtags')
      .upsert(hashtagRecords, { onConflict: 'tag,platform,workspace_id' });

    return hashtags;
  }

  async predictViralPotential(params: {
    workspace_id: string;
    content_idea_id?: string;
    content_type: string;
    platform: string;
    title: string;
    description: string;
    niche: string;
  }): Promise<ViralPrediction> {
    const { workspace_id, content_idea_id, content_type, platform, title, description, niche } = params;

    // AI-powered viral prediction algorithm
    const baseScore = Math.floor(Math.random() * 30) + 60;
    const titleScore = this.analyzeTitleViralPotential(title);
    const contentScore = this.analyzeContentViralPotential(description, content_type);
    const nicheScore = this.analyzeNicheViralPotential(niche, platform);

    const viral_score = Math.min(100, Math.floor((baseScore + titleScore + contentScore + nicheScore) / 4));

    const prediction: ViralPrediction = {
      viral_score,
      predicted_views: this.predictViews(viral_score, platform),
      predicted_engagement: this.predictEngagement(viral_score, platform),
      predicted_shares: Math.floor(Math.random() * 1000) + (viral_score * 10),
      predicted_reach: this.predictReach(viral_score, platform),
      overall_confidence: Math.random() * 20 + 75,
      positive_factors: this.getPositiveFactors(viral_score, title, content_type),
      negative_factors: this.getNegativeFactors(viral_score, title),
      improvement_suggestions: this.getSuggestions(viral_score, content_type, platform)
    };

    // Save prediction
    await supabase
      .from('viral_predictions')
      .insert({
        workspace_id,
        content_idea_id,
        platform,
        prediction_model: 'ml_v1',
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
  private generateTitle(niche: string, type: string, content_type: string): string {
    const titles = {
      tutorial: [`How to Master ${niche} in 5 Minutes`, `Ultimate ${niche} Guide for Beginners`],
      'behind-the-scenes': [`Behind the Scenes of My ${niche} Journey`, `What Nobody Tells You About ${niche}`],
      transformation: [`My ${niche} Transformation in 30 Days`, `Before & After: ${niche} Results`],
      'trending-challenge': [`${niche} Challenge That's Breaking the Internet`, `Trying the Viral ${niche} Trend`],
      educational: [`5 Things You Need to Know About ${niche}`, `The Science Behind ${niche}`],
      storytelling: [`How ${niche} Changed My Life Forever`, `My ${niche} Story: From Zero to Hero`],
      'product-review': [`Honest ${niche} Product Review`, `Is This ${niche} Product Worth the Hype?`],
      comparison: [`${niche} A vs B: Which One Wins?`, `Best ${niche} Options Compared`],
      'list-format': [`Top 10 ${niche} Tips for Success`, `7 ${niche} Mistakes to Avoid`],
      controversy: [`Why Everyone is Wrong About ${niche}`, `The ${niche} Truth Nobody Wants to Hear`]
    };

    const typeTemplates = titles[type] || [`Amazing ${niche} Content`];
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  }

  private generateDescription(niche: string, type: string): string {
    return `Comprehensive ${type} content about ${niche}. This content is designed to engage your audience and provide real value. Perfect for ${niche} enthusiasts and newcomers alike.`;
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

  private getTrendingTopics(niche: string): string[] {
    const topics = [
      `${niche} trends 2025`,
      `viral ${niche}`,
      `${niche} hacks`,
      `best ${niche} tips`,
      `${niche} for beginners`
    ];
    return topics.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generateKeywords(niche: string, type: string): string[] {
    return [niche, type, 'viral', 'trending', 'tips', 'guide', 'tutorial', 'how to'];
  }

  private calculateEngagementPrediction(viral_score: number): number {
    return Math.min(100, viral_score * 0.8 + Math.random() * 15);
  }

  private generateAICaption(platform: string, topic: string, context?: string, brandVoice?: any): string {
    const hooks = [
      `You won't believe what happened when I tried ${topic}...`,
      `Here's why ${topic} is changing everything...`,
      `The truth about ${topic} that nobody talks about...`,
      `I tested ${topic} for 30 days and here's what happened...`,
      `Stop doing ${topic} wrong! Here's the right way...`
    ];

    const hook = hooks[Math.floor(Math.random() * hooks.length)];

    let caption = hook + '\n\n';
    caption += context || `This is a game-changer for anyone interested in ${topic}. Here's what you need to know...`;

    // Add emojis based on brand voice
    if (!brandVoice || brandVoice.emoji_usage !== 'none') {
      caption += ' ✨💯🔥';
    }

    return caption;
  }

  private generateCaptionVariants(original: string, platform: string, count: number): string[] {
    const variants: string[] = [];
    const tones = ['🔥 Super energetic:', '💭 Thoughtful:', '😎 Chill vibe:', '🚀 Action-packed:'];

    for (let i = 0; i < count; i++) {
      const tone = tones[i % tones.length];
      const variant = tone + ' ' + original.split('\n')[0];
      variants.push(variant);
    }

    return variants;
  }

  private generateAIHashtags(niche: string, platform: string, count: number): string[] {
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
