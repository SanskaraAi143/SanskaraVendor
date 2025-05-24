import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Supabase Storage
 * @param file File object to upload
 * @param bucket Bucket name
 * @param folder Folder path within bucket (optional)
 * @returns URL of the uploaded file or null if failed
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string = ''
): Promise<string | null> => {
  try {
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Create the file path (userId/filename or just filename)
    const filePath = folder 
      ? `${folder}/${fileName}`
      : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Uploads multiple files to Supabase Storage
 * @param files Array of File objects to upload
 * @param bucket Bucket name
 * @param folder Folder path within bucket (optional)
 * @returns Array of URLs of the uploaded files
 */
export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  folder: string = ''
): Promise<string[]> => {
  const urls: string[] = [];
  
  for (const file of files) {
    const url = await uploadFile(file, bucket, folder);
    if (url) {
      urls.push(url);
    }
  }
  
  return urls;
};

/**
 * Deletes a file from Supabase Storage
 * @param url Full URL of the file to delete
 * @param bucket Bucket name
 * @param userId User ID for identifying the file's folder
 * @returns Success status
 */
export const deleteFile = async (url: string, bucket: string, userId: string): Promise<boolean> => {
  try {
    // Validate the URL
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error('Invalid URL provided to deleteFile');
    }

    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Ensure the userId is not appended twice
    const filePathParts = pathParts.slice(pathParts.indexOf(bucket) + 1);
    const filePath = filePathParts[0] === userId
      ? filePathParts.join('/')
      : `${userId}/${filePathParts.join('/')}`;

    console.log('Deleting file at path:', filePath);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};
