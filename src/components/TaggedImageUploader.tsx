
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  Upload, 
  X, 
  Plus, 
  Image as ImageIcon, 
  Loader2, 
  Trash2,
  Eye,
  Tag
} from 'lucide-react';
import {
  TaggedImages,
  uploadTaggedFiles,
  addImagesToTag,
  removeImageFromTag,
  deleteImageFromStorage,
  getSuggestedTags,
  validateTagName,
  formatTagName,
  getAvailableTags,
  UploadOptions,
  UploadResult
} from '@/utils/taggedUploadHelpers';

interface TaggedImageUploaderProps {
  taggedImages: TaggedImages | null;
  onImagesChange: (taggedImages: TaggedImages | null) => void;
  bucket: string;
  folder?: string;
  category?: string;
  disabled?: boolean;
  maxFilesPerTag?: number;
  maxTotalFiles?: number;
}

const TaggedImageUploader: React.FC<TaggedImageUploaderProps> = ({
  taggedImages,
  onImagesChange,
  bucket,
  folder,
  category = 'general',
  disabled = false,
  maxFilesPerTag = 10,
  maxTotalFiles = 50
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const suggestedTags = getSuggestedTags(category);
  const availableTags = getAvailableTags(taggedImages);
  const allTags = [...new Set([...availableTags, ...suggestedTags])];
  
  // Set initial active tab
  React.useEffect(() => {
    if (availableTags.length > 0 && !activeTab) {
      setActiveTab(availableTags[0]);
    }
  }, [availableTags, activeTab]);

  const handleFileSelect = useCallback(async (files: File[], tag: string) => {
    if (!tag) {
      toast({
        title: 'Error',
        description: 'Please select or create a tag first',
        variant: 'destructive',
      });
      return;
    }

    if (!validateTagName(tag)) {
      toast({
        title: 'Invalid Tag',
        description: 'Tag name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores',
        variant: 'destructive',
      });
      return;
    }

    const currentTagImages = taggedImages?.[formatTagName(tag)] || [];
    if (currentTagImages.length + files.length > maxFilesPerTag) {
      toast({
        title: 'Too Many Files',
        description: `Maximum ${maxFilesPerTag} files allowed per tag`,
        variant: 'destructive',
      });
      return;
    }

    const totalImages = Object.values(taggedImages || {}).flat().length;
    if (totalImages + files.length > maxTotalFiles) {
      toast({
        title: 'Total File Limit Exceeded',
        description: `Maximum ${maxTotalFiles} files allowed in total`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadOptions: UploadOptions = { bucket, folder, tag };
      const result: UploadResult = await uploadTaggedFiles(files, uploadOptions);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const updatedTaggedImages = addImagesToTag(taggedImages, result.tag, result.urls);
      onImagesChange(updatedTaggedImages);
      
      // Set active tab to the newly uploaded tag
      setActiveTab(result.tag);
      
      toast({
        title: 'Upload Successful',
        description: `${files.length} file(s) uploaded to "${result.tag}" tag`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [taggedImages, onImagesChange, bucket, folder, maxFilesPerTag, maxTotalFiles]);

  const handleRemoveImage = useCallback(async (tag: string, url: string) => {
    try {
      // Remove from storage
      const deleteResult = await deleteImageFromStorage(bucket, url);
      if (!deleteResult.success) {
        console.warn('Failed to delete from storage:', deleteResult.error);
        // Continue with removing from state even if storage deletion fails
      }

      // Remove from state
      const updatedTaggedImages = removeImageFromTag(taggedImages || {}, tag, url);
      onImagesChange(Object.keys(updatedTaggedImages).length > 0 ? updatedTaggedImages : null);
      
      toast({
        title: 'Image Removed',
        description: 'Image has been successfully removed',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Removal Failed',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    }
  }, [taggedImages, onImagesChange, bucket]);

  const handleCreateTag = useCallback(() => {
    if (!newTagName.trim()) return;
    
    if (!validateTagName(newTagName)) {
      toast({
        title: 'Invalid Tag Name',
        description: 'Tag name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores',
        variant: 'destructive',
      });
      return;
    }

    const formattedTag = formatTagName(newTagName);
    setSelectedTag(formattedTag);
    setNewTagName('');
    setIsCreatingTag(false);
    
    toast({
      title: 'Tag Created',
      description: `Tag "${formattedTag}" is ready for uploads`,
    });
  }, [newTagName]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && selectedTag) {
      handleFileSelect(files, selectedTag);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect, selectedTag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && selectedTag) {
      handleFileSelect(files, selectedTag);
    }
  }, [handleFileSelect, selectedTag]);

  const ImageGrid: React.FC<{ images: string[]; tag: string }> = ({ images, tag }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((url, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={url}
              alt={`${tag} ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveImage(tag, url)}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image Gallery with Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="tag-select">Select Tag</Label>
              <Select
                value={selectedTag}
                onValueChange={setSelectedTag}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tag..." />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        {tag}
                        {availableTags.includes(tag) && (
                          <Badge variant="secondary" className="text-xs">
                            {taggedImages?.[tag]?.length || 0}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsCreatingTag(true)}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </div>

          {isCreatingTag && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                disabled={disabled}
              />
              <Button onClick={handleCreateTag} disabled={disabled}>
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingTag(false);
                  setNewTagName('');
                }}
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && selectedTag && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {selectedTag 
                    ? `Drop files here or click to upload to "${selectedTag}" tag`
                    : 'Select a tag first, then drop files here or click to upload'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Max {maxFilesPerTag} files per tag, {maxTotalFiles} total
                </p>
              </div>
            )}
          </div>

          {selectedTag && (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading || !selectedTag}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload to "{selectedTag}" Tag
            </Button>
          )}
        </div>

        {/* Image Display */}
        {availableTags.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-auto">
              {availableTags.map(tag => (
                <TabsTrigger key={tag} value={tag} className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <Badge variant="secondary" className="text-xs">
                    {taggedImages?.[tag]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {availableTags.map(tag => (
              <TabsContent key={tag} value={tag} className="mt-4">
                <ImageGrid images={taggedImages?.[tag] || []} tag={tag} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No images uploaded yet</p>
            <p className="text-sm">Select a tag and upload your first images</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaggedImageUploader;
