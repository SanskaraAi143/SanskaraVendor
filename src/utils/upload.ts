import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName).data;

    if (!publicUrl) {
        throw new Error('Failed to get public URL for the uploaded file.');
    }

    return publicUrl;
};