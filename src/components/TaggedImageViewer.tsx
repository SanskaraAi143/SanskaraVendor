
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { TaggedImages, getAvailableTags } from '@/utils/taggedUploadHelpers';

interface TaggedImageViewerProps {
  taggedImages: TaggedImages | null;
  onRemoveImage?: (tag: string, url: string) => void;
  title?: string;
  showRemoveButton?: boolean;
  selectedTagOnly?: string;
}

const TaggedImageViewer: React.FC<TaggedImageViewerProps> = ({
  taggedImages,
  onRemoveImage,
  title = 'Images',
  showRemoveButton = true,
  selectedTagOnly
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const availableTags = getAvailableTags(taggedImages);
  
  // Filter tags if selectedTagOnly is provided
  const displayTags = selectedTagOnly ? 
    (availableTags.includes(selectedTagOnly) ? [selectedTagOnly] : []) : 
    availableTags;

  React.useEffect(() => {
    if (displayTags.length > 0 && !selectedTag) {
      setSelectedTag(displayTags[0]);
    }
  }, [displayTags, selectedTag]);

  if (!taggedImages || displayTags.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No images available</p>
        </CardContent>
      </Card>
    );
  }

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
          {showRemoveButton && onRemoveImage && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveImage(tag, url)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (selectedTagOnly) {
    const images = taggedImages[selectedTagOnly] || [];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title} - {selectedTagOnly}
            <Badge variant="secondary">{images.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageGrid images={images} tag={selectedTagOnly} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayTags.length === 1 ? (
          <ImageGrid images={taggedImages[displayTags[0]] || []} tag={displayTags[0]} />
        ) : (
          <Tabs value={selectedTag} onValueChange={setSelectedTag}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${displayTags.length}, 1fr)` }}>
              {displayTags.map(tag => (
                <TabsTrigger key={tag} value={tag} className="flex items-center gap-2">
                  {tag}
                  <Badge variant="secondary" className="text-xs">
                    {taggedImages[tag]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {displayTags.map(tag => (
              <TabsContent key={tag} value={tag} className="mt-4">
                <ImageGrid images={taggedImages[tag] || []} tag={tag} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default TaggedImageViewer;
