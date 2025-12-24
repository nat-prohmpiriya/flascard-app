'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  uploadCardImage,
  deleteCardImage,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
  UploadResult,
} from '@/services/storage';

interface UseImageUploadOptions {
  initialUrl?: string;
  initialStoragePath?: string;
}

interface UseImageUploadReturn {
  // State
  imageFile: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  error: string | null;

  // Actions
  selectImage: (file: File) => void;
  clearImage: () => void;
  uploadImage: (userId: string, deckId: string, cardId: string) => Promise<UploadResult | null>;
  removeExistingImage: () => Promise<void>;

  // Computed
  hasImage: boolean;
  hasNewImage: boolean;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { initialUrl, initialStoragePath } = options;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [currentStoragePath, setCurrentStoragePath] = useState<string | undefined>(initialStoragePath);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== initialUrl && previewUrl.startsWith('blob:')) {
        revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl, initialUrl]);

  const selectImage = useCallback((file: File) => {
    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Revoke previous preview if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      revokeImagePreview(previewUrl);
    }

    // Create new preview
    const preview = createImagePreview(file);
    setImageFile(file);
    setPreviewUrl(preview);
  }, [previewUrl]);

  const clearImage = useCallback(() => {
    // Revoke preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      revokeImagePreview(previewUrl);
    }

    setImageFile(null);
    setPreviewUrl(initialUrl || null);
    setError(null);
  }, [previewUrl, initialUrl]);

  const uploadImage = useCallback(async (
    userId: string,
    deckId: string,
    cardId: string
  ): Promise<UploadResult | null> => {
    if (!imageFile) {
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Delete old image if exists
      if (currentStoragePath) {
        try {
          await deleteCardImage(currentStoragePath);
        } catch (deleteError) {
          console.error('Failed to delete old image:', deleteError);
        }
      }

      // Upload new image
      const result = await uploadCardImage(userId, deckId, cardId, imageFile);
      setCurrentStoragePath(result.storagePath);
      setPreviewUrl(result.url);
      setImageFile(null);

      return result;
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload image';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [imageFile, currentStoragePath]);

  const removeExistingImage = useCallback(async () => {
    if (!currentStoragePath) {
      setPreviewUrl(null);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await deleteCardImage(currentStoragePath);
      setCurrentStoragePath(undefined);
      setPreviewUrl(null);
      setImageFile(null);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete image';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }, [currentStoragePath]);

  return {
    imageFile,
    previewUrl,
    isUploading,
    error,
    selectImage,
    clearImage,
    uploadImage,
    removeExistingImage,
    hasImage: !!previewUrl,
    hasNewImage: !!imageFile,
  };
}
