import { PLATFORM_LIMITS, SupportedPlatform } from '../../config/constants';
import { logger } from '../../utils/logger';

export interface ContentData {
  title?: string;
  body: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  link?: string;
}

export interface AdaptedContent {
  platform: SupportedPlatform;
  content: string;
  mediaUrls: string[];
  metadata: Record<string, any>;
  warnings?: string[];
  truncated?: boolean;
}

export class ContentAdaptationService {
  private static instance: ContentAdaptationService;

  private constructor() {}

  static getInstance(): ContentAdaptationService {
    if (!ContentAdaptationService.instance) {
      ContentAdaptationService.instance = new ContentAdaptationService();
    }
    return ContentAdaptationService.instance;
  }

  adaptForPlatform(
    content: ContentData,
    platform: SupportedPlatform
  ): AdaptedContent {
    const limits = PLATFORM_LIMITS[platform];
    const warnings: string[] = [];
    const adaptedContent = content.body;
    const truncated = false;

    switch (platform) {
      case 'youtube':
        return this.adaptForYouTube(content, limits, warnings);
      case 'instagram':
        return this.adaptForInstagram(content, limits, warnings);
      case 'tiktok':
        return this.adaptForTikTok(content, limits, warnings);
      case 'twitter':
        return this.adaptForTwitter(content, limits, warnings);
      case 'linkedin':
        return this.adaptForLinkedIn(content, limits, warnings);
      case 'pinterest':
        return this.adaptForPinterest(content, limits, warnings);
      default:
        return {
          platform,
          content: adaptedContent,
          mediaUrls: content.mediaUrls || [],
          metadata: {},
          warnings
        };
    }
  }

  private adaptForYouTube(
    content: ContentData,
    limits: any,
    warnings: string[]
  ): AdaptedContent {
    let title = content.title || content.body.substring(0, 100);
    let description = content.body;

    if (title.length > limits.maxTitleLength) {
      title = title.substring(0, limits.maxTitleLength - 3) + '...';
      warnings.push('Title truncated to fit YouTube limit');
    }

    if (description.length > limits.maxDescriptionLength) {
      description = description.substring(0, limits.maxDescriptionLength - 3) + '...';
      warnings.push('Description truncated to fit YouTube limit');
    }

    const tags = content.hashtags?.slice(0, 500) || [];
    if (content.hashtags && content.hashtags.length > 500) {
      warnings.push('Maximum 500 tags allowed on YouTube');
    }

    return {
      platform: 'youtube',
      content: description,
      mediaUrls: content.mediaUrls || [],
      metadata: {
        title,
        description,
        tags,
        categoryId: '22'
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private adaptForInstagram(
    content: ContentData,
    limits: any,
    warnings: string[]
  ): AdaptedContent {
    let caption = content.body;
    let truncated = false;

    if (caption.length > limits.maxCaptionLength) {
      caption = caption.substring(0, limits.maxCaptionLength - 3) + '...';
      truncated = true;
      warnings.push('Caption truncated to fit Instagram limit (2200 chars)');
    }

    const hashtags = content.hashtags?.slice(0, limits.maxHashtags) || [];
    if (content.hashtags && content.hashtags.length > limits.maxHashtags) {
      warnings.push(`Instagram allows max ${limits.maxHashtags} hashtags`);
    }

    const fullCaption = hashtags.length > 0
      ? `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
      : caption;

    return {
      platform: 'instagram',
      content: fullCaption,
      mediaUrls: content.mediaUrls || [],
      metadata: {
        caption: fullCaption,
        mediaType: content.mediaUrls && content.mediaUrls.length > 1 ? 'CAROUSEL' : 'IMAGE'
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      truncated
    };
  }

  private adaptForTikTok(
    content: ContentData,
    limits: any,
    warnings: string[]
  ): AdaptedContent {
    let caption = content.body;

    if (caption.length > limits.maxCaptionLength) {
      caption = caption.substring(0, limits.maxCaptionLength - 3) + '...';
      warnings.push('Caption truncated to fit TikTok limit (2200 chars)');
    }

    return {
      platform: 'tiktok',
      content: caption,
      mediaUrls: content.mediaUrls || [],
      metadata: {
        title: caption.substring(0, 150),
        privacy: 'PUBLIC_TO_EVERYONE',
        disableComments: false,
        disableDuet: false,
        disableStitch: false
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private adaptForTwitter(
    content: ContentData,
    limits: any,
    warnings: string[]
  ): AdaptedContent {
    let tweet = content.body;
    let truncated = false;

    if (tweet.length > limits.maxTweetLength) {
      tweet = tweet.substring(0, limits.maxTweetLength - 3) + '...';
      truncated = true;
      warnings.push('Tweet truncated to fit 280 character limit');
    }

    const mediaUrls = content.mediaUrls?.slice(0, limits.maxMediaItems) || [];
    if (content.mediaUrls && content.mediaUrls.length > limits.maxMediaItems) {
      warnings.push(`Twitter allows max ${limits.maxMediaItems} media items`);
    }

    return {
      platform: 'twitter',
      content: tweet,
      mediaUrls,
      metadata: {},
      warnings: warnings.length > 0 ? warnings : undefined,
      truncated
    };
  }

  private adaptForLinkedIn(
    content: ContentData,
    limits: any,
    warnings: string[]
  ): AdaptedContent {
    let post = content.body;

    if (post.length > limits.maxPostLength) {
      post = post.substring(0, limits.maxPostLength - 3) + '...';
      warnings.push('Post truncated to fit LinkedIn limit (3000 chars)');
    }

    return {
      platform: 'linkedin',
      content: post,
      mediaUrls: content.mediaUrls || [],
      metadata: {
        visibility: 'PUBLIC'
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private adaptForPinterest(
    content: ContentData,
    limits: any,
    warnings: string[]
  ): AdaptedContent {
    const title = content.title || content.body.substring(0, 100);
    const description = content.body;

    return {
      platform: 'pinterest',
      content: description,
      mediaUrls: content.mediaUrls || [],
      metadata: {
        title,
        description,
        link: content.link
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  validateMedia(
    mediaUrl: string,
    platform: SupportedPlatform,
    mediaType: 'image' | 'video'
  ): { valid: boolean; error?: string } {
    const limits = PLATFORM_LIMITS[platform];

    if (mediaType === 'video' && platform === 'instagram') {
      if (limits.maxVideoDuration) {
        return {
          valid: true
        };
      }
    }

    return { valid: true };
  }

  batchAdapt(
    content: ContentData,
    platforms: SupportedPlatform[]
  ): AdaptedContent[] {
    return platforms.map(platform => this.adaptForPlatform(content, platform));
  }
}

export const contentAdaptationService = ContentAdaptationService.getInstance();
