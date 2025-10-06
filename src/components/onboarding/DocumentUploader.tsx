import React, { useState } from 'react';
import { uploadFile } from '@/utils/upload';
import { UploadIcon, CheckCircle, XCircle, Loader } from 'lucide-react';

interface DocumentUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    bucket: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete, bucket }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'completed' | 'error'>>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
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
                <input type="file" multiple onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs" />
                <button onClick={handleUpload} className="btn btn-primary" disabled={files.length === 0}>
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Upload
                </button>
            </div>
            <div className="mt-4 space-y-2">
                {files.map(file => (
                    <div key={file.name} className="flex items-center justify-between p-2 rounded-lg bg-base-200">
                        <span>{file.name}</span>
                        {uploadStatus[file.name] === 'uploading' && <Loader className="animate-spin" />}
                        {uploadStatus[file.name] === 'completed' && <CheckCircle className="text-success" />}
                        {uploadStatus[file.name] === 'error' && <XCircle className="text-error" />}
                    </div>
                ))}
            </div>
        </div>
    );
};