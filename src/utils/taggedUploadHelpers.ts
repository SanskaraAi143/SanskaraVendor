import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface TaggedImages {
  [tag: string]: string[];
}

export interface UploadOptions {
  bucket: string;
  folder?: string;
  tag: string;
}

export interface UploadResult {
  success: boolean;
  urls: string[];
  tag: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export const uploadTaggedFiles = async (
  files: File[],
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    const { bucket, folder, tag } = options;
    const urls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tag}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      const storageRef = ref(storage, `${bucket}/${filePath}`);

      const snapshot = await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(snapshot.ref);
      urls.push(publicUrl);
    }

    return {
      success: true,
      urls,
      tag,
    };
  } catch (error) {
    return {
      success: false,
      urls: [],
      tag: options.tag,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getSuggestedTags = (category: string): string[] => {
  const tagCategories: Record<string, string[]> = {
    general: ['Portfolio', 'Work Samples', 'Before & After'],
    venue: ['Exterior', 'Interior', 'Ceremony Space', 'Reception Hall', 'Decorations'],
    photography: ['Wedding Photos', 'Portrait', 'Landscape', 'Event Coverage'],
    catering: ['Menu Items', 'Setup', 'Service Style', 'Presentation'],
    decoration: ['Floral', 'Lighting', 'Table Setup', 'Stage Design'],
    music: ['Performance', 'Setup', 'Equipment', 'Events'],
    event_photography: ['Event Photos', 'Candid Shots', 'Group Photos', 'Detail Shots'],
    portrait_photography: ['Portraits', 'Headshots', 'Family Photos', 'Individual Shots'],
    event_planning: ['Event Setup', 'Coordination', 'Decorations', 'Timeline'],
    music_entertainment: ['Performance', 'Equipment', 'Setup', 'Entertainment'],
    other: ['Work Samples', 'Portfolio', 'Projects', 'Examples'],
  };

  return tagCategories[category] || tagCategories.general;
};

export const validateTagName = (tag: string): boolean => {
  return tag.length > 0 && tag.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(tag);
};

export const formatTagName = (tag: string): string => {
  return tag.trim().replace(/\s+/g, ' ');
};

export const getAvailableTags = (taggedImages: TaggedImages | null): string[] => {
  if (!taggedImages) return [];
  return Object.keys(taggedImages).filter(tag => taggedImages[tag].length > 0);
};

export const convertToTaggedImages = (data: any): TaggedImages | null => {
  if (!data) return null;

  // If it's already in TaggedImages format
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as TaggedImages;
  }

  // If it's an array of URLs, convert to default tag
  if (Array.isArray(data)) {
    return { 'Portfolio': data };
  }

  return null;
};

export const convertForDatabase = (taggedImages: TaggedImages | null): any => {
  if (!taggedImages) return null;
  return taggedImages;
};

export const addImagesToTag = (
  currentImages: TaggedImages | null,
  tag: string,
  urls: string[]
): TaggedImages => {
  const images = currentImages || {};
  const existingUrls = images[tag] || [];
  return {
    ...images,
    [tag]: [...existingUrls, ...urls]
  };
};

export const removeImageFromTag = (
  currentImages: TaggedImages,
  tag: string,
  url: string
): TaggedImages => {
  const updatedImages = { ...currentImages };
  if (updatedImages[tag]) {
    updatedImages[tag] = updatedImages[tag].filter(imageUrl => imageUrl !== url);
    if (updatedImages[tag].length === 0) {
      delete updatedImages[tag];
    }
  }
  return updatedImages;
};

export const deleteImageFromStorage = async (bucket: string, url: string): Promise<DeleteResult> => {
  try {
    // In Firebase Storage, 'url' might be the full download URL.
    // However, if we store the path, it's easier.
    // If it's a download URL, we might need to extract the path or use refFromURL.
    // For now, assuming we can get the path from the URL if it's a standard Firebase Storage URL.

    // Standard Firebase Storage URL format:
    // https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]

    const decodedUrl = decodeURIComponent(url);
    const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

    if (pathMatch && pathMatch[1]) {
      const filePath = pathMatch[1];
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return { success: true };
    }

    // Fallback or alternative method if refFromURL is available (it is in the Web SDK)
    // But we'll try to recreate the ref if possible.

    return { success: false, error: 'Could not extract file path from URL' };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
