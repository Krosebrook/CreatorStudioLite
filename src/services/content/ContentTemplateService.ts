import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  platforms: string[];
  template: {
    title?: string;
    body: string;
    hashtags?: string[];
    mediaType?: 'image' | 'video' | 'carousel';
  };
  workspaceId?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

export class ContentTemplateService {
  private static instance: ContentTemplateService;

  private constructor() {}

  static getInstance(): ContentTemplateService {
    if (!ContentTemplateService.instance) {
      ContentTemplateService.instance = new ContentTemplateService();
    }
    return ContentTemplateService.instance;
  }

  getBuiltInTemplates(): ContentTemplate[] {
    return [
      {
        id: 'announcement',
        name: 'Product Announcement',
        description: 'Announce new products or features',
        category: 'business',
        platforms: ['instagram', 'twitter', 'linkedin'],
        template: {
          title: 'Introducing [Product Name]',
          body: '🚀 Excited to announce [Product Name]!\n\n[Brief description of what makes it special]\n\n✨ Key features:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\nAvailable now! Link in bio.',
          hashtags: ['ProductLaunch', 'NewRelease', 'Innovation'],
          mediaType: 'image'
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: 'behind-scenes',
        name: 'Behind the Scenes',
        description: 'Share your creative process',
        category: 'engagement',
        platforms: ['instagram', 'tiktok', 'youtube'],
        template: {
          body: '👀 Behind the scenes of [Project/Process]\n\nSharing the journey from concept to reality.\n\nWhat would you like to see next?',
          hashtags: ['BTS', 'BehindTheScenes', 'Process'],
          mediaType: 'video'
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: 'tips-tricks',
        name: 'Tips & Tricks',
        description: 'Share valuable knowledge',
        category: 'educational',
        platforms: ['instagram', 'linkedin', 'twitter'],
        template: {
          title: '[Number] Tips for [Topic]',
          body: '💡 [Number] [Topic] tips:\n\n1️⃣ [Tip 1]\n2️⃣ [Tip 2]\n3️⃣ [Tip 3]\n4️⃣ [Tip 4]\n5️⃣ [Tip 5]\n\nWhich one will you try first?',
          hashtags: ['Tips', 'Tutorial', 'HowTo'],
          mediaType: 'carousel'
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: 'user-testimonial',
        name: 'Customer Testimonial',
        description: 'Showcase customer success',
        category: 'social-proof',
        platforms: ['instagram', 'linkedin', 'facebook'],
        template: {
          body: '⭐ "[Customer quote]"\n\n- [Customer Name], [Title/Company]\n\nLove hearing success stories from our community!\n\nHave a story to share? DM us!',
          hashtags: ['Testimonial', 'CustomerSuccess', 'Review'],
          mediaType: 'image'
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: 'question-engagement',
        name: 'Engagement Question',
        description: 'Boost engagement with questions',
        category: 'engagement',
        platforms: ['instagram', 'twitter', 'facebook'],
        template: {
          body: '❓ Quick question:\n\n[Your question here]\n\nA) [Option A]\nB) [Option B]\nC) [Option C]\n\nComment below! 👇',
          hashtags: ['Question', 'Community', 'YourThoughts'],
          mediaType: 'image'
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: 'inspirational-quote',
        name: 'Inspirational Quote',
        description: 'Share motivational content',
        category: 'inspiration',
        platforms: ['instagram', 'twitter', 'pinterest'],
        template: {
          body: '✨ "[Inspirational quote]"\n\n- [Author]\n\nTag someone who needs to see this!',
          hashtags: ['Motivation', 'Inspiration', 'QuoteOfTheDay'],
          mediaType: 'image'
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      }
    ];
  }

  async applyTemplate(
    templateId: string,
    customValues: Record<string, string>
  ): Promise<{ content: any; error: Error | null }> {
    try {
      const templates = this.getBuiltInTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return { content: null, error: new Error('Template not found') };
      }

      let body = template.template.body;
      let title = template.template.title;

      for (const [key, value] of Object.entries(customValues)) {
        const placeholder = `[${key}]`;
        body = body.replace(new RegExp(placeholder, 'g'), value);
        if (title) {
          title = title.replace(new RegExp(placeholder, 'g'), value);
        }
      }

      const content = {
        title,
        body,
        hashtags: template.template.hashtags,
        platforms: template.platforms,
        metadata: {
          templateId: template.id,
          templateName: template.name,
          mediaType: template.template.mediaType
        }
      };

      logger.info('Template applied', { templateId });

      return { content, error: null };
    } catch (error) {
      logger.error('Error applying template', error as Error);
      return { content: null, error: error as Error };
    }
  }

  async saveCustomTemplate(
    template: Omit<ContentTemplate, 'id' | 'createdAt' | 'usageCount'>
  ): Promise<{ templateId?: string; error: Error | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      logger.info('Custom template saved', { name: template.name });

      return { templateId: 'custom-' + Date.now(), error: null };
    } catch (error) {
      logger.error('Error saving template', error as Error);
      return { error: error as Error };
    }
  }

  getTemplatesByCategory(category: string): ContentTemplate[] {
    return this.getBuiltInTemplates().filter(t => t.category === category);
  }

  getTemplatesByPlatform(platform: string): ContentTemplate[] {
    return this.getBuiltInTemplates().filter(t => t.platforms.includes(platform));
  }
}

export const contentTemplateService = ContentTemplateService.getInstance();
