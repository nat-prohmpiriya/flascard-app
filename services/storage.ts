import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

// Image compression options
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,           // Max file size 500KB
  maxWidthOrHeight: 800,    // Max width/height 800px
  useWebWorker: true,
  fileType: 'image/jpeg',   // Convert to JPEG for smaller size
};

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB before compression

export interface UploadResult {
  url: string;
  storagePath: string;
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Compress image before upload
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Generate storage path for card image
 */
function generateStoragePath(userId: string, deckId: string, cardId: string): string {
  const timestamp = Date.now();
  return `cards/${userId}/${deckId}/${cardId}/${timestamp}.jpg`;
}

/**
 * Upload card image to Firebase Storage
 */
export async function uploadCardImage(
  userId: string,
  deckId: string,
  cardId: string,
  file: File
): Promise<UploadResult> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Compress image
  const compressedFile = await compressImage(file);

  // Generate storage path
  const storagePath = generateStoragePath(userId, deckId, cardId);
  const storageRef = ref(storage, storagePath);

  // Upload file
  const snapshot = await uploadBytes(storageRef, compressedFile, {
    contentType: 'image/jpeg',
  });

  // Get download URL
  const url = await getDownloadURL(snapshot.ref);

  return { url, storagePath };
}

/**
 * Delete card image from Firebase Storage
 */
export async function deleteCardImage(storagePath: string): Promise<void> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  if (!storagePath) {
    return;
  }

  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error: unknown) {
    // Ignore if file doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'storage/object-not-found') {
      console.warn('Image not found in storage:', storagePath);
      return;
    }
    throw error;
  }
}

/**
 * Create image preview URL from File object
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke image preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
