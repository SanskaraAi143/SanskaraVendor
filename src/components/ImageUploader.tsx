import React, { useState, useEffect, useCallback } from 'react';
import { FileInput } from '@/components/ui/file-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // Added this line
import { X, Upload, Tags } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Validation Constants
const TAG_MIN_LENGTH = 2;
const TAG_MAX_LENGTH = 30;
const MAX_TAGS_PER_IMAGE = 5;
const VALID_TAG_REGEX = /^[a-zA-Z0-9\s]+$/; // Alphanumeric and spaces

export interface SelectedFileWithTags {
  file: File;
  tags: string[];
}

interface SelectedFileInternalState {
  file: File;
  previewUrl: string | null;
  tags: string[]; // Should always store valid tags
  id: string;
  // For live input, not stored in actual tags array until valid
  currentTagInput: string; 
}

interface ImageUploaderProps {
  onFileSelect: (filesWithTags: SelectedFileWithTags[]) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileInternalState[]>([]);
  const [tagInputErrors, setTagInputErrors] = useState<Record<string, string | null>>({});

  const getFilePreview = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const memoizedOnFileSelect = useCallback(onFileSelect, [onFileSelect]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach(item => {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [selectedFiles]);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFilesArray = Array.from(files);
      const currentTotalFiles = selectedFiles.length + existingImages.length;
      
      if (currentTotalFiles + newFilesArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed. You can select ${maxFiles - currentTotalFiles} more files.`);
        return;
      }
      
      const newFilesWithMeta: SelectedFileInternalState[] = newFilesArray.map(file => ({
        file,
        previewUrl: getFilePreview(file),
        tags: [],
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 9)}`,
        currentTagInput: '', // Initialize currentTagInput
      }));
      
      const updatedFiles = [...selectedFiles, ...newFilesWithMeta];
      setSelectedFiles(updatedFiles);
      // We call onFileSelect with current tags (empty for new files), which is valid
      memoizedOnFileSelect(updatedFiles.map(({ file, tags }) => ({ file, tags })));
    }
  };

  const removeSelectedFile = (idToRemove: string) => {
    const newFiles = selectedFiles.filter(item => item.id !== idToRemove);
    setSelectedFiles(newFiles);
    setTagInputErrors(prev => {
      const updatedErrors = { ...prev };
      delete updatedErrors[idToRemove];
      return updatedErrors;
    });
    memoizedOnFileSelect(newFiles.map(({ file, tags }) => ({ file, tags })));
  };

  // This function handles the live input change for the tag input field
  const handleTagInputChange = (idToUpdate: string, value: string) => {
    setSelectedFiles(prevFiles => 
      prevFiles.map(item => 
        item.id === idToUpdate ? { ...item, currentTagInput: value } : item
      )
    );
    // Clear error as user types
    if (tagInputErrors[idToUpdate]) {
      setTagInputErrors(prev => ({...prev, [idToUpdate]: null}));
    }
  };

  // This function validates and commits tags, e.g., on blur or pressing Enter
  const validateAndCommitTags = (idToUpdate: string) => {
    const fileToUpdate = selectedFiles.find(item => item.id === idToUpdate);
    if (!fileToUpdate) return;

    const tagsString = fileToUpdate.currentTagInput;
    const rawTags = tagsString.split(',').map(tag => tag.trim());
    const validTags: string[] = [];
    let error: string | null = null;

    if (tagsString.trim() === '') { // Allow empty tags
      setSelectedFiles(prevFiles => 
        prevFiles.map(item => 
          item.id === idToUpdate ? { ...item, tags: [] } : item
        )
      );
      setTagInputErrors(prev => ({ ...prev, [idToUpdate]: null }));
      // Update parent with new (empty) tags state
      // Need to find the specific file in selectedFiles to get its file object for the callback
      const filesForParentCallback = selectedFiles.map(sf => {
        if (sf.id === idToUpdate) {
          return { file: sf.file, tags: [] };
        }
        return { file: sf.file, tags: sf.tags };
      });
      memoizedOnFileSelect(filesForParentCallback);
      return;
    }

    for (const tag of rawTags) {
      if (!tag && rawTags.length === 1 && tagsString.trim() !== '') { // only whitespace was entered
        continue;
      }
      if (tag) { // Process non-empty tags
        if (tag.length < TAG_MIN_LENGTH || tag.length > TAG_MAX_LENGTH) {
          error = `Tags must be ${TAG_MIN_LENGTH}-${TAG_MAX_LENGTH} chars. Invalid: '${tag}'`;
          break;
        }
        if (!VALID_TAG_REGEX.test(tag)) {
          error = `Tags must be alphanumeric/spaces. Invalid: '${tag}'`;
          break;
        }
        if (!validTags.includes(tag)) { // Avoid duplicate tags
          validTags.push(tag);
        }
      }
    }

    if (!error && validTags.length > MAX_TAGS_PER_IMAGE) {
      error = `Max ${MAX_TAGS_PER_IMAGE} tags allowed.`;
    }

    setTagInputErrors(prev => ({ ...prev, [idToUpdate]: error }));

    if (!error) {
      setSelectedFiles(prevFiles => {
        const updatedFiles = prevFiles.map(item => 
          item.id === idToUpdate ? { ...item, tags: validTags } : item
        );
        // Call onFileSelect after state is updated with valid tags
        memoizedOnFileSelect(updatedFiles.map(({ file, tags }) => ({ file, tags })));
        return updatedFiles;
      });
    } else {
      // If there's an error, we still need to inform the parent about the last valid state of tags for this file.
      // The 'tags' array in 'fileToUpdate' (from selectedFiles state) still holds the last valid tags.
      // So, when onFileSelect is called via other means (e.g. removing another file), it will reflect the last valid state.
      // No explicit call to memoizedOnFileSelect here if there's an error, as the internal 'tags' state for this item hasn't changed.
    }
  };


  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-gray-500">
            Upload up to {maxFiles} files. Tags: {TAG_MIN_LENGTH}-{TAG_MAX_LENGTH} chars, alphanumeric/spaces, max {MAX_TAGS_PER_IMAGE}.
          </p>
          <FileInput
            multiple
            accept={accept}
            onFileChange={handleFileChange}
            disabled={uploading || selectedFiles.length + existingImages.length >= maxFiles}
          />
        </div>
      </div>

      {existingImages.length > 0 && ( /* Existing images display unchanged */ 
         <div>
          <h4 className="text-md font-semibold mb-3">Existing Files</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((url, index) => (
              <Card key={`existing-${index}`} className="relative group overflow-hidden rounded-lg shadow-sm">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {onRemoveExisting && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1.5 right-1.5 h-7 w-7 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveExisting(url)}
                    aria-label="Remove existing image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3">Selected Files ({selectedFiles.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {selectedFiles.map((item) => (
              <Card key={item.id} className="relative group overflow-hidden rounded-lg shadow-sm p-3 space-y-2">
                <div className="relative">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt={item.file.name} className="w-full h-32 object-cover rounded-md"/>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-md flex flex-col items-center justify-center p-2">
                      <span className="text-xs text-gray-600 text-center break-all">{item.file.name}</span>
                      <span className="text-xs text-gray-400 mt-1">No preview available</span>
                    </div>
                  )}
                  <Button size="icon" variant="destructive" className="absolute top-1.5 right-1.5 h-7 w-7 p-0 opacity-70 group-hover:opacity-100 transition-opacity" onClick={() => removeSelectedFile(item.id)} aria-label="Remove selected file">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor={`tags-${item.id}`} className="text-xs font-medium text-gray-600 flex items-center">
                    <Tags className="h-3.5 w-3.5 mr-1.5 text-gray-500"/>
                    Tags <span className="text-gray-400 ml-1">(comma-separated)</span>
                  </label>
                  <Input
                    id={`tags-${item.id}`}
                    type="text"
                    placeholder="e.g. event, portrait"
                    value={item.currentTagInput} // Bind to currentTagInput for live editing
                    onChange={(e) => handleTagInputChange(item.id, e.target.value)}
                    onBlur={() => validateAndCommitTags(item.id)} // Validate on blur
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); validateAndCommitTags(item.id);}}} // Validate on Enter, prevent form submission
                    className={`h-9 text-xs ${tagInputErrors[item.id] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={uploading}
                    aria-describedby={tagInputErrors[item.id] ? `tags-error-${item.id}` : undefined}
                  />
                  {tagInputErrors[item.id] && (
                    <p id={`tags-error-${item.id}`} className="text-xs text-red-600 mt-1">{tagInputErrors[item.id]}</p>
                  )}
                   {/* Display committed valid tags */}
                   {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div> {/* This closes "space-y-1.5" */}
              </Card>
            ))}
          </div> {/* This closes "grid" */}
        </div> {/* This closes the div wrapping the selected files section */}
      )}

      {uploading && ( 
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading files...</p>
        </div>
      )}
       {/* 
        Consider adding an explicit "Upload All" or "Confirm Selection" button here 
        if onFileSelect should only be called once with the final set of files and tags,
        instead of on every modification. Current implementation calls onFileSelect on each change.
      */}
    </div>
  );
};

export default ImageUploader;
