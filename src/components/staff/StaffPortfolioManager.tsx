
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon, Plus, Trash2, Upload, Loader2 } from 'lucide-react';

interface Portfolio {
  portfolio_id: string;
  title: string;
  description: string;
  portfolio_type: string;
  image_urls: string[];
  created_at: string;
}

interface StaffPortfolioManagerProps {
  staffId: string;
}

const StaffPortfolioManager: React.FC<StaffPortfolioManagerProps> = ({ staffId }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    portfolio_type: 'event_photography',
    images: [] as File[]
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
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

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${staffId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('vendor-staff')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-staff')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPortfolio(prev => ({ ...prev, images: files }));
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
      let imageUrls: string[] = [];
      
      if (newPortfolio.images.length > 0) {
        imageUrls = await uploadImages(newPortfolio.images);
      }

      const { error } = await supabase
        .from('staff_portfolios')
        .insert({
          staff_id: staffId,
          vendor_id: vendorId,
          title: newPortfolio.title,
          description: newPortfolio.description,
          portfolio_type: newPortfolio.portfolio_type,
          image_urls: imageUrls
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Portfolio item added successfully',
      });

      setNewPortfolio({
        title: '',
        description: '',
        portfolio_type: 'event_photography',
        images: []
      });
      setIsAdding(false);
      loadPortfolios();
    } catch (error) {
      console.error('Error adding portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to add portfolio item',
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Portfolio
          </CardTitle>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
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
                      <SelectItem value="event_photography">Event Photography</SelectItem>
                      <SelectItem value="portrait_photography">Portrait Photography</SelectItem>
                      <SelectItem value="event_planning">Event Planning</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                      <SelectItem value="decoration">Decoration</SelectItem>
                      <SelectItem value="music_entertainment">Music & Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                <div>
                  <Label htmlFor="images">Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
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
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Add Item
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {portfolios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map(portfolio => (
              <Card key={portfolio.portfolio_id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {portfolio.image_urls && portfolio.image_urls.length > 0 && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={portfolio.image_urls[0]}
                          alt={portfolio.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                      <p className="text-sm text-gray-600 capitalize mb-2">
                        {portfolio.portfolio_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-700">{portfolio.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        {new Date(portfolio.created_at).toLocaleDateString()}
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePortfolio(portfolio.portfolio_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <p className="text-sm text-gray-400">Add your first portfolio item to showcase your work</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffPortfolioManager;
