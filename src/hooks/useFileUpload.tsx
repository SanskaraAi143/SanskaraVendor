import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuthContext';

export const useFileUpload = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    if (!user) {
      setUploadError('User not authenticated.');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      setUploadError(error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadError, uploadFile };
};