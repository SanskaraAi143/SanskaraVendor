
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import TaggedImageUploadModal from '@/components/modals/TaggedImageUploadModal';
import TaggedImageViewer from '@/components/TaggedImageViewer';
import { 
  TaggedImages, 
  convertToTaggedImages, 
  convertForDatabase, 
  addImagesToTag, 
  removeImageFromTag, 
  deleteImageFromStorage,
  getAvailableTags 
} from '@/utils/taggedUploadHelpers';

interface ServiceImageManagerProps {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  vendorId: string;
  canEdit?: boolean;
}

const ServiceImageManager: React.FC<ServiceImageManagerProps> = ({
  serviceId,
  serviceName,
  serviceCategory,
  vendorId,
  canEdit = true
}) => {
  const [taggedImages, setTaggedImages] = useState<TaggedImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    loadServiceImages();
  }, [serviceId]);

  const loadServiceImages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vendor_services')
        .select('portfolio_image_urls')
        .eq('service_id', serviceId)
        .single();

      if (error) throw error;

      const images = convertToTaggedImages(data.portfolio_image_urls);
      setTaggedImages(images);
      
      // Set initial selected tag
      if (images && Object.keys(images).length > 0 && !selectedTag) {
        setSelectedTag(Object.keys(images)[0]);
      }
    } catch (error) {
      console.error('Error loading service images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service images',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (tag: string, urls: string[]) => {
    try {
      const updatedImages = addImagesToTag(taggedImages, tag, urls);
      
      const { error } = await supabase
        .from('vendor_services')
        .update({ portfolio_image_urls: convertForDatabase(updatedImages) })
        .eq('service_id', serviceId);

      if (error) throw error;

      setTaggedImages(updatedImages);
      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    }
  };

  const handleImageRemove = async (tag: string, url: string) => {
    try {
      await deleteImageFromStorage('vendor-services', url);
      
      const updatedImages = removeImageFromTag(taggedImages || {}, tag, url);
      
      const { error } = await supabase
        .from('vendor_services')
        .update({ 
          portfolio_image_urls: convertForDatabase(Object.keys(updatedImages).length > 0 ? updatedImages : null) 
        })
        .eq('service_id', serviceId);

      if (error) throw error;

      setTaggedImages(Object.keys(updatedImages).length > 0 ? updatedImages : null);
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  const availableTags = getAvailableTags(taggedImages);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Service Portfolio</h3>
        <div className="flex gap-2">
          {availableTags.length > 1 && (
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category to view..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {availableTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag} ({taggedImages?.[tag]?.length || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {canEdit && (
            <TaggedImageUploadModal
              trigger={
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              }
              onUploadComplete={handleImageUpload}
              bucket="vendor-services"
              folder={`${vendorId}/${serviceId}`}
              category={serviceCategory}
              existingTags={availableTags}
              title={`Upload Images for ${serviceName}`}
            />
          )}

          {availableTags.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Gallery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{serviceName} - Portfolio Gallery</DialogTitle>
                </DialogHeader>
                <TaggedImageViewer
                  taggedImages={taggedImages}
                  onRemoveImage={canEdit ? handleImageRemove : undefined}
                  title="Service Portfolio"
                  showRemoveButton={canEdit}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {selectedTag && taggedImages?.[selectedTag] ? (
        <TaggedImageViewer
          taggedImages={taggedImages}
          onRemoveImage={canEdit ? handleImageRemove : undefined}
          title=""
          showRemoveButton={canEdit}
          selectedTagOnly={selectedTag}
        />
      ) : availableTags.length > 0 && !selectedTag ? (
        <TaggedImageViewer
          taggedImages={taggedImages}
          onRemoveImage={canEdit ? handleImageRemove : undefined}
          title=""
          showRemoveButton={canEdit}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No portfolio images uploaded yet</p>
            {canEdit && (
              <p className="text-sm text-gray-400 mt-2">
                Upload images to showcase this service
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceImageManager;
