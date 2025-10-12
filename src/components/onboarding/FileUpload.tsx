import React from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
    isProcessing: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title: string;
    description: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ isProcessing, onFileChange, title, description }) => {
    return (
        <div className="bg-gray-900/5 p-4 rounded-lg border border-dashed border-gray-300">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer">
                <UploadIcon className="w-5 h-5"/>
                <span>{isProcessing ? 'Processing...' : 'Upload Documents or Images'}</span>
                <input 
                    type="file" 
                    className="hidden" 
                    onChange={onFileChange} 
                    accept=".txt,.pdf,.doc,.docx,image/*" 
                    disabled={isProcessing} 
                    multiple
                />
            </label>
        </div>
    );
};