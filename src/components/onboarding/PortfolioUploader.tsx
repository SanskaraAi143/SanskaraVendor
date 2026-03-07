import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';

interface PortfolioUploaderProps {
    onFilesChange: (files: File[]) => void;
}

export const PortfolioUploader: React.FC<PortfolioUploaderProps> = ({ onFilesChange }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const updateFiles = useCallback((newFiles: File[]) => {
        setFiles(prevFiles => {
            const updatedFiles = [...prevFiles, ...newFiles];
            onFilesChange(updatedFiles);
            return updatedFiles;
        });
        
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }, [onFilesChange]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            updateFiles(Array.from(e.target.files));
        }
    };

    const handleRemoveFile = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setFiles(files.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
        onFilesChange(files.filter((_, i) => i !== index));
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            updateFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Portfolio Images</label>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                    <UploadIcon className="w-10 h-10" />
                    <p className="font-semibold">
                        <span className="text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                </div>
            </div>
            {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img
                                src={preview}
                                alt={`preview ${index}`}
                                className="w-full h-full object-cover rounded-lg shadow-md"
                            />
                            <button
                                onClick={() => handleRemoveFile(index)}
                                className="absolute top-1 right-1 bg-gray-800/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};