
import { supabase } from '@/integrations/supabase/client';

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

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
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
    // Extract file path from URL
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === bucket);
    if (bucketIndex === -1) {
      return { success: false, error: 'Invalid URL format' };
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image from storage:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
