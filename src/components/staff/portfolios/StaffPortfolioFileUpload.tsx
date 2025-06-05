
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import TaggedImageUploader from '../../TaggedImageUploader';
import { uploadTaggedFiles, addImagesToTag, removeImageFromTag, TaggedImages } from '../../../utils/taggedUploadHelpers';

interface StaffPortfolioFileUploadProps {
  vendorId: string;
  staffId: string;
  portfolioType: string;
  currentTaggedImages: TaggedImages | null;
  onFilesUploaded: (updatedTaggedImages: TaggedImages) => void;
  onFileRemoved: (updatedTaggedImages: TaggedImages) => void;
  fileType?: 'image' | 'video' | 'document';
  maxFiles?: number;
  maxFileSizeMb?: number;
  bucketName?: string;
}

const StaffPortfolioFileUpload: React.FC<StaffPortfolioFileUploadProps> = ({
  vendorId,
  staffId,
  portfolioType,
  currentTaggedImages,
  onFilesUploaded,
  onFileRemoved,
  fileType = 'image',
  maxFiles = 20,
  maxFileSizeMb = 5,
  bucketName = 'staff-portfolios',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getSuggestedTags = () => {
    switch (portfolioType) {
      case 'caterer':
        return ['appetizers', 'main_course', 'desserts', 'beverages', 'setup', 'service'];
      case 'photographer':
        return ['portraits', 'events', 'ceremony', 'reception', 'candid', 'posed'];
      case 'venue_space':
        return ['exterior', 'interior', 'ceremony_area', 'reception_hall', 'amenities', 'parking'];
      case 'decor_item':
        return ['centerpieces', 'lighting', 'floral', 'table_settings', 'backdrops', 'signage'];
      default:
        return ['general', 'primary', 'secondary', 'detail_shots', 'process', 'final_result'];
    }
  };

  const handleImagesChange = (updatedTaggedImages: TaggedImages | null) => {
    if (updatedTaggedImages) {
      onFilesUploaded(updatedTaggedImages);
    } else {
      onFileRemoved({});
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">
        Upload {fileType}s by Category (Max: {maxFiles}, {maxFileSizeMb}MB each)
      </Label>
      
      <TaggedImageUploader
        taggedImages={currentTaggedImages}
        onImagesChange={handleImagesChange}
        bucket={bucketName}
        folder={`${vendorId}/${staffId}/${portfolioType}`}
        category={portfolioType}
        maxFilesPerTag={maxFiles}
        maxTotalFiles={maxFiles * 2}
      />

      {uploadError && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default StaffPortfolioFileUpload;
