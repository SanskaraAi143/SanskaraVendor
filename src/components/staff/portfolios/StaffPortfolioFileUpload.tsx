import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { supabase } from '../../../integrations/supabase/client';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Loader2, UploadCloud, Trash2, FileText, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface StaffPortfolioFileUploadProps {
  vendorId: string;
  staffId: string;
  portfolioType: string;
  currentFiles: string[]; // Array of existing file URLs
  onFilesUploaded: (newFileUrls: string[]) => void; // Called when new files are successfully uploaded
  onFileRemoved: (fileUrlToRemove: string) => void; // Called when an existing file is requested to be removed
  fileType?: 'image' | 'video' | 'document'; // To tailor accept attribute and validation
  maxFiles?: number;
  maxFileSizeMb?: number; // Max file size in MB
  bucketName?: string; // Default to 'staff-portfolios'
}

const StaffPortfolioFileUpload: React.FC<StaffPortfolioFileUploadProps> = ({
  vendorId,
  staffId,
  portfolioType,
  currentFiles,
  onFilesUploaded,
  onFileRemoved,
  fileType = 'image',
  maxFiles = 5,
  maxFileSizeMb = 5,
  bucketName = 'staff-portfolios',
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = event.target.files;
    if (files) {
      if (currentFiles.length + files.length > maxFiles) {
        setUploadError(`You can upload a maximum of ${maxFiles} files.`);
        setSelectedFiles([]);
        setFilePreviews([]);
        return;
      }
      const newSelectedFiles = Array.from(files);
      // Validate file size and type
      const validFiles = newSelectedFiles.filter(file => {
        if (file.size > maxFileSizeMb * 1024 * 1024) {
          setUploadError(`File "${file.name}" exceeds ${maxFileSizeMb}MB limit.`);
          return false;
        }
        // Basic type validation (can be more robust)
        if (fileType === 'image' && !file.type.startsWith('image/')) {
          setUploadError(`File "${file.name}" is not a valid image type.`);
          return false;
        }
        if (fileType === 'video' && !file.type.startsWith('video/')) {
          setUploadError(`File "${file.name}" is not a valid video type.`);
          return false;
        }
        return true;
      });

      setSelectedFiles(validFiles);
      
      const previews = validFiles.map(file => URL.createObjectURL(file));
      setFilePreviews(previews);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("No files selected to upload.");
      return;
    }
    if (!vendorId || !staffId || !portfolioType) {
        setUploadError("Missing critical IDs for upload path construction.");
        return;
    }

    setIsUploading(true);
    setUploadError(null);
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${vendorId}/${staffId}/${portfolioType}/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false, // true to overwrite, false to error if file exists (uuid should make it unique)
          });

        if (error) {
          throw error;
        }

        // Construct the public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        } else {
          throw new Error(`Could not get public URL for ${filePath}`);
        }

      } catch (error: any) {
        console.error('Error uploading file:', file.name, error);
        setUploadError(`Failed to upload ${file.name}: ${error.message}`);
        // Optionally, decide if to stop on first error or try all files
        // For now, we stop and let user retry.
        setIsUploading(false);
        return; 
      }
    }

    if (uploadedUrls.length > 0) {
      onFilesUploaded(uploadedUrls); // Pass all newly uploaded URLs
    }
    setSelectedFiles([]);
    setFilePreviews(previews => {
        previews.forEach(URL.revokeObjectURL); // Clean up object URLs
        return [];
    });
    setIsUploading(false);
  };
  
  // Clean up object URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      filePreviews.forEach(URL.revokeObjectURL);
    };
  }, [filePreviews]);

  const getAcceptTypes = () => {
    if (fileType === 'image') return 'image/*';
    if (fileType === 'video') return 'video/*';
    if (fileType === 'document') return 'application/pdf,.doc,.docx,.txt';
    return '*/*';
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <Label htmlFor={`file-upload-${fileType}`} className="text-base font-medium">
        Upload {fileType}s (Max: {maxFiles}, {maxFileSizeMb}MB each)
      </Label>
      
      {/* Display existing files */}
      {currentFiles && currentFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Current {fileType}s:</p>
          <ul className="list-none space-y-1">
            {currentFiles.map((url, index) => (
              <li key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-md">
                <a href={url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-blue-600">
                  <FileText className="inline h-4 w-4 mr-1" /> {url.substring(url.lastIndexOf('/') + 1)}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemoved(url)}
                  title="Remove this file"
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col items-start space-y-2">
        <Input
          id={`file-upload-${fileType}`}
          type="file"
          multiple
          onChange={handleFileChange}
          accept={getAcceptTypes()}
          className="max-w-md"
          disabled={isUploading || currentFiles.length >= maxFiles}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <p>{selectedFiles.length} file(s) selected:</p>
            <ul className="list-disc list-inside">
              {selectedFiles.map((file, index) => <li key={index}>{file.name} ({ (file.size / 1024 / 1024).toFixed(2) } MB)</li>)}
            </ul>
          </div>
        )}
      </div>

      {filePreviews.length > 0 && fileType === 'image' && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {filePreviews.map((previewUrl, index) => (
            <img key={index} src={previewUrl} alt={`Preview ${index}`} className="rounded-md object-cover h-24 w-full" />
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          Upload Selected
        </Button>
      )}

      {uploadError && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2"/> {uploadError}
        </div>
      )}
    </div>
  );
};

export default StaffPortfolioFileUpload;
