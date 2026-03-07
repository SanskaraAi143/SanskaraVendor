import { storage } from '@/lib/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Firebase Storage
 * @param file File object to upload
 * @param bucket Bucket name (not used directly in ref for Firebase, but can be part of the path if needed)
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

    // Create the file path (bucket/folder/filename or just bucket/filename)
    // Note: in Firebase, 'bucket' is usually part of the initialization, 
    // but here we use it as the top-level folder to match Supabase structure.
    const filePath = folder
      ? `${bucket}/${folder}/${fileName}`
      : `${bucket}/${fileName}`;

    const storageRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the public URL
    const publicUrl = await getDownloadURL(snapshot.ref);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Uploads multiple files to Firebase Storage
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
 * Deletes a file from Firebase Storage
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

    // Extract the storage path from the URL
    // Firebase URLs look like: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
    const decodedUrl = decodeURIComponent(url);
    const pathStart = decodedUrl.indexOf('/o/') + 3;
    const pathEnd = decodedUrl.indexOf('?');
    const filePath = decodedUrl.substring(pathStart, pathEnd !== -1 ? pathEnd : undefined);

    console.log('Deleting file at path:', filePath);

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};
