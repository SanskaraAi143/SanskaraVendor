import React, { useState } from 'react';
import { uploadFile } from '@/utils/upload';
import { UploadIcon, CheckCircle, XCircle, Loader } from 'lucide-react';

interface ImageUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    bucket: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete, bucket }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'completed' | 'error'>>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(newFiles);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const handleUpload = async () => {
        const newUploadStatus: Record<string, 'uploading'> = {};
        files.forEach(file => {
            newUploadStatus[file.name] = 'uploading';
        });
        setUploadStatus(newUploadStatus);

        const uploadPromises = files.map(file => uploadFile(file, bucket));

        try {
            const urls = await Promise.all(uploadPromises);
            const completedStatus: Record<string, 'completed'> = {};
            files.forEach(file => {
                completedStatus[file.name] = 'completed';
            });
            setUploadStatus(prev => ({...prev, ...completedStatus}));
            onUploadComplete(urls);
        } catch (error) {
            console.error("Upload failed:", error);
            const errorStatus: Record<string, 'error'> = {};
            files.forEach(file => {
                errorStatus[file.name] = 'error';
            });
            setUploadStatus(prev => ({...prev, ...errorStatus}));
        }
    };

    return (
        <div>
            <div className="flex items-center gap-4">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs" />
                <button onClick={handleUpload} className="btn btn-primary" disabled={files.length === 0}>
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Upload
                </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                    <div key={files[index].name} className="relative">
                        <img src={preview} alt={`preview ${index}`} className="w-full h-auto rounded-lg" />
                        <div className="absolute top-1 right-1">
                            {uploadStatus[files[index].name] === 'uploading' && <Loader className="animate-spin text-white" />}
                            {uploadStatus[files[index].name] === 'completed' && <CheckCircle className="text-success" />}
                            {uploadStatus[files[index].name] === 'error' && <XCircle className="text-error" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};