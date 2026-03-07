import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DocumentUploadStepProps {
  onCompletion: (data: any) => void;
  onError: (title: string, description: string) => void;
  isVendor: boolean;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ onCompletion, onError, isVendor }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
    'image/jpeg',
    'image/png',
  ];

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} exceeds the maximum size of 5MB.`;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File ${file.name} has an unsupported type: ${file.type}. Allowed types are PDF, DOCX, TXT, JPG, PNG.`;
    }
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const validFiles: File[] = [];
      const invalidMessages: string[] = [];

      newFiles.forEach(file => {
        const validationError = validateFile(file);
        if (validationError) {
          invalidMessages.push(validationError);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidMessages.length > 0) {
        onError("File Validation Error", invalidMessages.join('\n'));
      }
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setUploadStatus('idle');
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setUploadStatus('idle');
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file); // Changed to 'files' as per backend
    });
    formData.append('is_vendor', isVendor.toString()); // Send is_vendor flag

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
        setUploadProgress(i);
      }

      const response = await fetch('http://localhost:8765/api/vendor_onboarding/upload-and-extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (response.status === 204) { // No Content, meaning no data was extracted
        toast({
          title: "No Data Extracted",
          description: "Files uploaded successfully, but no data could be extracted. Please fill manually.",
          variant: "default",
        });
        onCompletion({}); // Signal completion with empty data to proceed to manual
        setUploadStatus('success');
      } else if (!data) {
        throw new Error("GenAI extraction returned unexpected empty data.");
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setUploadProgress(100); // Ensure it ends at 100%
        setUploadStatus('success');
        toast({
          title: "Upload successful",
          description: "Documents uploaded and data extracted successfully.",
          variant: "success",
        });
        onCompletion(data); // Signal completion and pass data to parent
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus('error');
      onError("Upload failed", err.message || "An unknown error occurred during upload.");
      setUploadProgress(0);
      onCompletion({}); // Proceed to manual form even on error with empty data
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Document Upload</h2>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="group border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:border-gray-400 transition-colors mb-4 bg-transparent"
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to select</p>
          <Input
            id="file-upload-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Selected Files:</Label>
            <ul className="list-disc pl-5 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm text-gray-800">
                  {file.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering file input click
                      removeFile(file);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isUploading && (
          <div className="mb-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-center text-sm text-gray-500 mt-2">
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing data...'}
            </p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mb-4 flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">Files uploaded and processed successfully!</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mb-4 flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">Upload failed. Please try again.</p>
          </div>
        )}


        <div className="flex justify-end mt-6">
          <Button onClick={uploadFiles} disabled={isUploading || selectedFiles.length === 0 || uploadStatus === 'success'}>
            {isUploading ? 'Uploading...' : uploadStatus === 'success' ? 'Uploaded' : 'Upload & Next'}
          </Button>
        </div>
    </div>
  );
};

export default DocumentUploadStep;