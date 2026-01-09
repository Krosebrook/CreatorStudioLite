import { supabase } from '../src/lib/supabase';
import { storageService } from '../src/services/media/StorageService';
import { logger } from '../src/utils/logger';

// File size limit: 5MB for profile pictures
const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024;

// Allowed image types for profile pictures
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadProfilePictureRequest {
  userId: string;
  file: File;
}

export interface UploadProfilePictureResponse {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

/**
 * Validates profile picture file before upload
 * Checks file size and MIME type
 */
export function validateProfilePicture(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_PROFILE_PICTURE_SIZE) {
    const sizeMB = (MAX_PROFILE_PICTURE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds ${sizeMB}MB limit. Please choose a smaller image.`
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }

  return { valid: true };
}

/**
 * Uploads a profile picture for a user
 * Validates file size and type, then uploads to storage
 */
export async function uploadProfilePicture(
  request: UploadProfilePictureRequest
): Promise<UploadProfilePictureResponse> {
  const { userId, file } = request;

  // Validate file
  const validation = validateProfilePicture(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    // Upload to storage service using userId for user-specific folder
    // Note: Using userId as folder identifier for user-specific avatars
    const uploadResult = await storageService.uploadFile(file, {
      workspaceId: userId,
      userId: userId,
      folder: 'avatars',
      makePublic: true
    });

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload profile picture'
      };
    }

    // Update user profile with new avatar URL
    if (supabase && uploadResult.url) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: uploadResult.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        // Log error but don't fail - file is uploaded
        logger.error('Failed to update user profile', updateError);
      }
    }

    return {
      success: true,
      avatarUrl: uploadResult.url
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Gets the current user's profile
 */
export async function getUserProfile(userId: string) {
  if (!supabase) {
    return { profile: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { profile: null, error };
    }

    return { profile: data, error: null };
  } catch (error) {
    return { profile: null, error: error as Error };
  }
}
