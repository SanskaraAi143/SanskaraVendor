import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `${bucket}/${fileName}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const publicUrl = await getDownloadURL(snapshot.ref);
        return publicUrl;
    } catch (error: any) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};