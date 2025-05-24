import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ImageIcon, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  className?: string;
  uploading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  maxFiles = 5,
  existingImages = [],
  onRemoveExisting,
  className,
  uploading = false
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews for selected files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check file count
    if (files.length + selectedFiles.length + existingImages.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} images`,
        variant: "destructive"
      });
      return;
    }
    
    // Check file types and size
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isImage) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
      }
      
      if (!isUnder5MB) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive"
        });
      }
      
      return isImage && isUnder5MB;
    });
    
    // Create object URLs for previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Call the parent component's handler
    onFileSelect(validFiles);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Remove from previews and release object URL
    URL.revokeObjectURL(previews[index]);
    
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* File Input */}
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-accent/5",
          "flex flex-col items-center justify-center gap-2 h-40"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">Click to upload images</p>
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG or WebP (max {maxFiles} images, up to 5MB each)
          </p>
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>
      
      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading images...</span>
        </div>
      )}
      
      {/* Image Previews */}
      {(previews.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {/* Existing Images */}
          {existingImages.map((url, index) => (
            <div 
              key={`existing-${index}`}
              className="relative aspect-square rounded-md overflow-hidden border group"
            >
              <img 
                src={url} 
                alt={`Existing image ${index + 1}`}
                className="w-full h-full object-cover" 
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded px-2 py-1">
                Existing
              </div>
            </div>
          ))}
          
          {/* New Image Previews */}
          {previews.map((preview, index) => (
            <div 
              key={`preview-${index}`}
              className="relative aspect-square rounded-md overflow-hidden border group"
            >
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded px-2 py-1">
                New
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
