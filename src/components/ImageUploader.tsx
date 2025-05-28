import React, { useState } from 'react';
import { FileInput } from '@/components/ui/file-input';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImageUploaderProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  uploading?: boolean;
  accept?: string;
  title?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  maxFiles = 10,
  existingImages = [],
  onRemoveExisting,
  uploading = false,
  accept = "image/*,video/*",
  title = "Upload Files"
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      const totalFiles = selectedFiles.length + existingImages.length + newFiles.length;
      
      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      onFileSelect([...selectedFiles, ...newFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-gray-500">
            Upload up to {maxFiles} files. Supports images and videos.
          </p>
          <FileInput
            multiple
            accept={accept}
            onFileChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Existing Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <Card key={index} className="relative">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                {onRemoveExisting && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => onRemoveExisting(url)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="relative">
                {getFilePreview(file) ? (
                  <img
                    src={getFilePreview(file)!}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500 text-center px-1">
                      {file.name}
                    </span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeSelectedFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sanskara-red"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading files...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
