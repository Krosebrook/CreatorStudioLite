import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadProfilePicture, validateProfilePicture } from '../../../api/user';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';

interface UserProfileProps {
  className?: string;
}

/**
 * UserProfile component
 * Allows users to upload and update their profile picture
 * Features:
 * - File size validation (max 5MB)
 * - File type validation (JPEG, PNG, WebP)
 * - Loading state during upload
 * - Error handling with user-friendly messages
 * - Preview of selected image before upload
 */
export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate file before preview
    const validation = validateProfilePicture(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) {
      setError('Please select a file to upload');
      return;
    }

    const file = fileInputRef.current.files[0];
    
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadProfilePicture({
        userId: user.id,
        file
      });

      if (result.success) {
        setSuccess(true);
        setError(null);
        // Update preview to show uploaded image
        if (result.avatarUrl) {
          setPreviewUrl(result.avatarUrl);
        }
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Upload failed');
        setSuccess(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <div className="p-6 text-center text-neutral-600">
          Please sign in to manage your profile
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Profile Picture
        </h2>

        <div className="space-y-4">
          {/* Current or preview avatar */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                src={previewUrl || user.avatarUrl || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-neutral-200"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>

          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Instructions */}
          <div className="text-sm text-neutral-600 text-center">
            Upload a profile picture (Max 5MB, JPEG/PNG/WebP)
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
              Profile picture updated successfully!
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!previewUrl ? (
              <Button
                variant="primary"
                size="base"
                fullWidth
                onClick={handleButtonClick}
                disabled={uploading}
              >
                Choose Picture
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="base"
                  fullWidth
                  onClick={handleUpload}
                  disabled={uploading}
                  loading={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="secondary"
                  size="base"
                  onClick={handleCancel}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
