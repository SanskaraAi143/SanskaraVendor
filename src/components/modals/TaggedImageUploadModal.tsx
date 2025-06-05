
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { uploadTaggedFiles, getSuggestedTags, validateTagName, formatTagName } from '@/utils/taggedUploadHelpers';

interface TaggedImageUploadModalProps {
  trigger: React.ReactNode;
  onUploadComplete: (tag: string, urls: string[]) => void;
  bucket: string;
  folder?: string;
  category?: string;
  existingTags?: string[];
  title?: string;
}

const TaggedImageUploadModal: React.FC<TaggedImageUploadModalProps> = ({
  trigger,
  onUploadComplete,
  bucket,
  folder,
  category = 'general',
  existingTags = [],
  title = 'Upload Images'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const suggestedTags = getSuggestedTags(category);
  const allTags = [...new Set([...existingTags, ...suggestedTags])];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleCreateTag = () => {
    if (!validateTagName(customTag)) {
      toast({
        title: 'Invalid Tag',
        description: 'Tag name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores',
        variant: 'destructive',
      });
      return;
    }
    const formattedTag = formatTagName(customTag);
    setSelectedTag(formattedTag);
    setCustomTag('');
    setIsCreatingTag(false);
  };

  const handleUpload = async () => {
    if (!selectedTag) {
      toast({
        title: 'Error',
        description: 'Please select or create a tag',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadTaggedFiles(selectedFiles, {
        bucket,
        folder,
        tag: selectedTag
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      onUploadComplete(result.tag, result.urls);
      toast({
        title: 'Success',
        description: `${selectedFiles.length} files uploaded successfully`,
      });
      
      // Reset form
      setSelectedFiles([]);
      setSelectedTag('');
      setIsOpen(false);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Tag</Label>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a tag..." />
              </SelectTrigger>
              <SelectContent>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isCreatingTag ? (
            <Button
              variant="outline"
              onClick={() => setIsCreatingTag(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Tag
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <Button onClick={handleCreateTag} size="sm">
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingTag(false);
                  setCustomTag('');
                }}
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-gray-600">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedTag || selectedFiles.length === 0}
              className="flex-1"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaggedImageUploadModal;
