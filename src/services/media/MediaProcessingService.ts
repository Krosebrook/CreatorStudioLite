import { MIME_TYPES, PLATFORM_LIMITS } from '../../config/constants';
import { logger } from '../../utils/logger';

export interface MediaFile {
  file: File;
  type: 'image' | 'video' | 'audio';
  url?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  size: number;
}

export interface ProcessedMedia {
  original: MediaFile;
  processed: {
    url: string;
    format: string;
    size: number;
    dimensions?: { width: number; height: number };
  };
  optimizations: string[];
}

export class MediaProcessingService {
  private static instance: MediaProcessingService;

  private constructor() {}

  static getInstance(): MediaProcessingService {
    if (!MediaProcessingService.instance) {
      MediaProcessingService.instance = new MediaProcessingService();
    }
    return MediaProcessingService.instance;
  }

  async processMediaForPlatform(
    media: MediaFile,
    platform: string
  ): Promise<ProcessedMedia> {
    const optimizations: string[] = [];
    const limits = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];

    if (!limits) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    if (media.type === 'image') {
      return this.processImage(media, limits, optimizations);
    } else if (media.type === 'video') {
      return this.processVideo(media, limits, optimizations);
    }

    throw new Error(`Unsupported media type: ${media.type}`);
  }

  private async processImage(
    media: MediaFile,
    limits: any,
    optimizations: string[]
  ): Promise<ProcessedMedia> {
    const processedUrl = media.url || URL.createObjectURL(media.file);
    let processedSize = media.size;
    let dimensions = media.dimensions;

    if (limits.maxImageSize && media.size > limits.maxImageSize) {
      optimizations.push(`Image compressed to fit ${limits.maxImageSize / (1024 * 1024)}MB limit`);
      processedSize = limits.maxImageSize;
    }

    if (dimensions) {
      const maxDimension = 1920;
      if (dimensions.width > maxDimension || dimensions.height > maxDimension) {
        const scale = maxDimension / Math.max(dimensions.width, dimensions.height);
        dimensions = {
          width: Math.round(dimensions.width * scale),
          height: Math.round(dimensions.height * scale)
        };
        optimizations.push(`Image resized to ${dimensions.width}x${dimensions.height}`);
      }
    }

    return {
      original: media,
      processed: {
        url: processedUrl,
        format: media.file.type,
        size: processedSize,
        dimensions
      },
      optimizations
    };
  }

  private async processVideo(
    media: MediaFile,
    limits: any,
    optimizations: string[]
  ): Promise<ProcessedMedia> {
    const processedUrl = media.url || URL.createObjectURL(media.file);
    const processedSize = media.size;
    const dimensions = media.dimensions;

    if (limits.maxVideoSize && media.size > limits.maxVideoSize) {
      optimizations.push(`Video needs compression to fit ${limits.maxVideoSize / (1024 * 1024)}MB limit`);
    }

    if (limits.maxVideoDuration && media.duration && media.duration > limits.maxVideoDuration) {
      optimizations.push(`Video exceeds ${limits.maxVideoDuration}s duration limit`);
    }

    return {
      original: media,
      processed: {
        url: processedUrl,
        format: media.file.type,
        size: processedSize,
        dimensions
      },
      optimizations
    };
  }

  validateMedia(file: File): { valid: boolean; error?: string; type?: 'image' | 'video' | 'audio' } {
    const mimeType = file.type;

    if (MIME_TYPES.images.includes(mimeType)) {
      return { valid: true, type: 'image' };
    }

    if (MIME_TYPES.videos.includes(mimeType)) {
      return { valid: true, type: 'video' };
    }

    if (MIME_TYPES.audio.includes(mimeType)) {
      return { valid: true, type: 'audio' };
    }

    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}`
    };
  }

  async getMediaDimensions(file: File): Promise<{ width: number; height: number } | null> {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return null;
    }

    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({ width: video.videoWidth, height: video.videoHeight });
          URL.revokeObjectURL(video.src);
        };
        video.onerror = () => resolve(null);
        video.src = URL.createObjectURL(file);
      }
    });
  }

  async getVideoDuration(file: File): Promise<number | null> {
    if (!file.type.startsWith('video/')) {
      return null;
    }

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(null);
      video.src = URL.createObjectURL(file);
    });
  }

  async generateThumbnail(file: File): Promise<Blob | null> {
    if (!file.type.startsWith('video/')) {
      return null;
    }

    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob);
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg', 0.8);
      };

      video.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }
}

export const mediaProcessingService = MediaProcessingService.getInstance();
