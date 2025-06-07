import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon, Plus, Trash2, Loader2, Upload } from 'lucide-react';
import TaggedImageUploadModal from '@/components/modals/TaggedImageUploadModal';
import TaggedImageViewer from '@/components/TaggedImageViewer';
import { TaggedImages, convertToTaggedImages, convertForDatabase, addImagesToTag, removeImageFromTag, deleteImageFromStorage } from '@/utils/taggedUploadHelpers';

interface Portfolio {
  portfolio_id: string;
  title: string;
  description: string;
  portfolio_type: string;
  image_urls: TaggedImages | null;
  created_at: string;
}

interface StaffPortfolioManagerProps {
  staffId: string;
}

const portfolioTypes = [
  { value: 'event_photography', label: 'Event Photography' },
  { value: 'portrait_photography', label: 'Portrait Photography' },
  { value: 'event_planning', label: 'Event Planning' },
  { value: 'catering', label: 'Catering' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'music_entertainment', label: 'Music & Entertainment' },
  { value: 'other', label: 'Other' }
];

const StaffPortfolioManager: React.FC<StaffPortfolioManagerProps> = ({ staffId }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    portfolio_type: 'event_photography'
  });

  useEffect(() => {
    loadStaffInfo();
  }, [staffId]);

  useEffect(() => {
    if (vendorId) {
      loadPortfolios();
    }
  }, [vendorId]);

  const loadStaffInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_staff')
        .select('vendor_id')
        .eq('staff_id', staffId)
        .single();

      if (error) throw error;
      setVendorId(data.vendor_id);
    } catch (error) {
      console.error('Error loading staff info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff information',
        variant: 'destructive',
      });
    }
  };

  const loadPortfolios = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('staff_portfolios')
        .select('*')
        .eq('staff_id', staffId)
        .neq('portfolio_type', 'profile_data')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const convertedPortfolios = (data || []).map(portfolio => ({
        ...portfolio,
        image_urls: convertToTaggedImages(portfolio.image_urls)
      }));
      
      setPortfolios(convertedPortfolios);
    } catch (error) {
      console.error('Error loading portfolios:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolio.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your portfolio item',
        variant: 'destructive',
      });
      return;
    }

    if (!vendorId) {
      toast({
        title: 'Error',
        description: 'Vendor information not found',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase
        .from('staff_portfolios')
        .insert({
          staff_id: staffId,
          vendor_id: vendorId,
          title: newPortfolio.title,
          description: newPortfolio.description,
          portfolio_type: newPortfolio.portfolio_type,
          image_urls: null
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio item created successfully',
      });

      setNewPortfolio({
        title: '',
        description: '',
        portfolio_type: 'event_photography'
      });
      setIsAdding(false);
      loadPortfolios();
    } catch (error) {
      console.error('Error adding portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to create portfolio item',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const { error } = await supabase
        .from('staff_portfolios')
        .delete()
        .eq('portfolio_id', portfolioId);

      if (error) throw error;

      setPortfolios(portfolios.filter(p => p.portfolio_id !== portfolioId));
      toast({
        title: 'Success',
        description: 'Portfolio item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio item',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (portfolioId: string, tag: string, urls: string[]) => {
    try {
      const portfolio = portfolios.find(p => p.portfolio_id === portfolioId);
      if (!portfolio) return;

      const updatedImages = addImagesToTag(portfolio.image_urls, tag, urls);
      
      const { error } = await supabase
        .from('staff_portfolios')
        .update({ image_urls: convertForDatabase(updatedImages) })
        .eq('portfolio_id', portfolioId);

      if (error) throw error;

      setPortfolios(prev => prev.map(p => 
        p.portfolio_id === portfolioId 
          ? { ...p, image_urls: updatedImages }
          : p
      ));
    } catch (error) {
      console.error('Error updating portfolio images:', error);
      toast({
        title: 'Error',
        description: 'Failed to save images',
        variant: 'destructive',
      });
    }
  };

  const handleImageRemove = async (portfolioId: string, tag: string, url: string) => {
    try {
      await deleteImageFromStorage('vendor-staff', url);
      
      const portfolio = portfolios.find(p => p.portfolio_id === portfolioId);
      if (!portfolio) return;

      const updatedImages = removeImageFromTag(portfolio.image_urls || {}, tag, url);
      
      const { error } = await supabase
        .from('staff_portfolios')
        .update({ image_urls: convertForDatabase(Object.keys(updatedImages).length > 0 ? updatedImages : null) })
        .eq('portfolio_id', portfolioId);

      if (error) throw error;

      setPortfolios(prev => prev.map(p => 
        p.portfolio_id === portfolioId 
          ? { ...p, image_urls: Object.keys(updatedImages).length > 0 ? updatedImages : null }
          : p
      ));

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading portfolio...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Portfolio Management
            </CardTitle>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPortfolio.title}
                      onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Portfolio item title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newPortfolio.portfolio_type}
                      onValueChange={(value) => setNewPortfolio(prev => ({ ...prev, portfolio_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolioTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPortfolio.description}
                      onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this portfolio item..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPortfolio}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Portfolio Item'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {portfolios.length > 0 ? (
            <div className="space-y-6">
              {portfolios.map(portfolio => (
                <Card key={portfolio.portfolio_id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {portfolioTypes.find(t => t.value === portfolio.portfolio_type)?.label || portfolio.portfolio_type}
                          </p>
                          {portfolio.description && (
                            <p className="text-sm text-gray-700 mt-2">{portfolio.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <TaggedImageUploadModal
                            trigger={
                              <Button size="sm" variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Images
                              </Button>
                            }
                            onUploadComplete={(tag, urls) => handleImageUpload(portfolio.portfolio_id, tag, urls)}
                            bucket="vendor-staff"
                            folder={vendorId ? `${vendorId}/${staffId}/portfolio/${portfolio.portfolio_id}` : staffId}
                            category={portfolio.portfolio_type}
                            existingTags={portfolio.image_urls ? Object.keys(portfolio.image_urls) : []}
                            title={`Upload to ${portfolio.title}`}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePortfolio(portfolio.portfolio_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <TaggedImageViewer
                        taggedImages={portfolio.image_urls}
                        onRemoveImage={(tag, url) => handleImageRemove(portfolio.portfolio_id, tag, url)}
                        title="Portfolio Images"
                        showRemoveButton={true}
                      />
                      
                      <div className="text-xs text-gray-500 border-t pt-2">
                        Created {new Date(portfolio.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No portfolio items yet</p>
              <p className="text-sm text-gray-400">Create your first portfolio item to showcase your work</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPortfolioManager;
