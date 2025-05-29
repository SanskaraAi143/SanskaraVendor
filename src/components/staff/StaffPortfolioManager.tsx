import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon, Plus, Trash2, Upload, Loader2, Tag } from 'lucide-react';
import ImageUploader, { SelectedFileWithTags } from '@/components/ImageUploader'; // Actual ImageUploader

// Updated Portfolio interface
interface PortfolioItem {
  portfolio_id: string;
  staff_id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  portfolio_type: string;
  image_urls: Record<string, string[]> | null; // JSONB structure
  video_urls: string[] | null; // Assuming video_urls are simple arrays if they exist
  generic_attributes: Record<string, any> | null; // JSONB for other attributes
  created_at: string;
  updated_at: string | null;
}

interface StaffPortfolioManagerProps {
  staffId: string;
}

const StaffPortfolioManager: React.FC<StaffPortfolioManagerProps> = ({ staffId }) => {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false); // For add/edit form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  // State for the portfolio item being added or edited
  const [currentPortfolioItem, setCurrentPortfolioItem] = useState<Partial<PortfolioItem>>({});
  // State for new images selected via ImageUploader
  const [newlySelectedImages, setNewlySelectedImages] = useState<SelectedFileWithTags[]>([]);

  const defaultFormData: Partial<PortfolioItem> = {
    title: '',
    description: '',
    portfolio_type: 'event_photography',
    image_urls: {}, // Initialize as empty object for new items
    video_urls: [],
    generic_attributes: {},
  };

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
      toast({ title: 'Error', description: 'Failed to load staff information', variant: 'destructive'});
    }
  };

  const loadPortfolios = async () => {
    if (!vendorId) return;
    setLoading(true);
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
      toast({ title: 'Error', description: 'Failed to load portfolio items', variant: 'destructive'});
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (item?: PortfolioItem) => {
    if (item) {
      // Deep copy for editing to avoid direct state mutation
      setCurrentPortfolioItem(JSON.parse(JSON.stringify(item)));
    } else {
      setCurrentPortfolioItem({ ...defaultFormData, staff_id: staffId, vendor_id: vendorId });
    }
    setNewlySelectedImages([]); // Clear any staged images
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentPortfolioItem({});
    setNewlySelectedImages([]);
  };

  const handleInputChange = (field: keyof PortfolioItem, value: any) => {
    setCurrentPortfolioItem(prev => ({ ...prev, [field]: value }));
  };
  
  const handleVideoUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const urls = e.target.value.split('\n').map(url => url.trim()).filter(Boolean);
    handleInputChange('video_urls', urls);
  };

  const uploadPortfolioImages = async (files: File[], portfolioIdToUse: string): Promise<string[]> => {
    // Ensure portfolioIdToUse is valid, otherwise generate/use a placeholder if needed for new items before ID is known
    // For simplicity, we might need to ensure portfolioId is generated client-side first or use a temp path.
    // Path: staff/{staff_id}/portfolios/{portfolio_id}/images/{fileName}
    const folderPath = `staff/${staffId}/portfolios/${portfolioIdToUse}/images`;

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage.from('vendors').upload(filePath, file); // Using 'vendors' bucket as per other examples
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('vendors').getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!currentPortfolioItem.title?.trim()) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive'});
      return;
    }
    if (!vendorId) {
      toast({ title: 'Error', description: 'Vendor association not found', variant: 'destructive'});
      return;
    }

    setIsSubmitting(true);
    let finalImageUrls = JSON.parse(JSON.stringify(currentPortfolioItem.image_urls || {}));

    try {
      // 1. If there are newly selected images, upload them
      if (newlySelectedImages.length > 0) {
        const filesToUpload = newlySelectedImages.map(fwt => fwt.file);
        // For new items, portfolio_id isn't available yet. We can generate a UUID client-side for path, or upload after insert.
        // For simplicity here, let's assume a new ID is generated or use staffId for now (less ideal for organization)
        const portfolioIdForPath = currentPortfolioItem.portfolio_id || staffId; // Simplified
        const uploadedUrls = await uploadPortfolioImages(filesToUpload, portfolioIdForPath);

        // Merge new URLs with their tags into finalImageUrls
        newlySelectedImages.forEach((fileWithTags, index) => {
          const newUrl = uploadedUrls[index];
          if (!newUrl) return; 
          const tags = fileWithTags.tags.length > 0 ? fileWithTags.tags : ['untagged'];
          tags.forEach(tag => {
            if (!finalImageUrls[tag]) finalImageUrls[tag] = [];
            if (!finalImageUrls[tag].includes(newUrl)) {
              finalImageUrls[tag].push(newUrl);
            }
          });
        });
      }
      
      const submissionData = {
        ...currentPortfolioItem,
        staff_id: staffId,
        vendor_id: vendorId,
        image_urls: Object.keys(finalImageUrls).length > 0 ? finalImageUrls : null,
        updated_at: new Date().toISOString(),
      };
      
      let error;
      if (currentPortfolioItem.portfolio_id) { // Update
        const { portfolio_id, created_at, ...updateData } = submissionData; // Exclude fields not to be updated
        const { error: updateError } = await supabase
          .from('staff_portfolios')
          .update(updateData)
          .eq('portfolio_id', currentPortfolioItem.portfolio_id);
        error = updateError;
      } else { // Create
         const { error: insertError } = await supabase
          .from('staff_portfolios')
          .insert(submissionData);
        error = insertError;
      }

      if (error) throw error;
      toast({ title: 'Success', description: `Portfolio item ${currentPortfolioItem.portfolio_id ? 'updated' : 'added'} successfully`});
      handleCloseForm();
      loadPortfolios();
    } catch (err: any) {
      console.error('Error submitting portfolio:', err);
      toast({ title: 'Error', description: err.message || 'Failed to save portfolio item', variant: 'destructive'});
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveImageFromCurrentItem = (tag: string, imageUrl: string) => {
    const updatedImageUrls = JSON.parse(JSON.stringify(currentPortfolioItem.image_urls || {}));
    if (updatedImageUrls[tag]) {
      updatedImageUrls[tag] = updatedImageUrls[tag].filter((url: string) => url !== imageUrl);
      if (updatedImageUrls[tag].length === 0) {
        delete updatedImageUrls[tag];
      }
    }
    setCurrentPortfolioItem(prev => ({ ...prev, image_urls: updatedImageUrls }));
  };

  const handleRemoveTagGroupFromCurrentItem = (tag: string) => {
    const updatedImageUrls = JSON.parse(JSON.stringify(currentPortfolioItem.image_urls || {}));
    delete updatedImageUrls[tag];
    setCurrentPortfolioItem(prev => ({ ...prev, image_urls: updatedImageUrls }));
  };


  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const { error } = await supabase.from('staff_portfolios').delete().eq('portfolio_id', portfolioId);
      if (error) throw error;
      setPortfolios(portfolios.filter(p => p.portfolio_id !== portfolioId));
      toast({ title: 'Success', description: 'Portfolio item deleted'});
    } catch (err: any) {
      console.error('Error deleting portfolio:', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive'});
    }
  };
  
  const getFirstImageUrl = (imageUrls: Record<string, string[]> | null): string | null => {
    if (!imageUrls || Object.keys(imageUrls).length === 0) return null;
    const tags = Object.keys(imageUrls);
    // Prioritize 'untagged' or 'general' or first available
    const preferredTags = ['untagged', 'general'];
    for (const tag of preferredTags) {
      if (imageUrls[tag] && imageUrls[tag].length > 0) return imageUrls[tag][0];
    }
    // Fallback to first image from first tag
    if (imageUrls[tags[0]] && imageUrls[tags[0]].length > 0) return imageUrls[tags[0]][0];
    return null;
  };


  if (loading && !vendorId) { // Initial loading for staff info
    return <Card><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Loading staff data...</span></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center"><ImageIcon className="h-5 w-5 mr-2" />My Portfolio</CardTitle>
          {!isFormOpen && ( <Button onClick={() => handleOpenForm()} size="sm"><Plus className="h-4 w-4 mr-2" />Add New Item</Button> )}
        </div>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <Card className="mb-6 shadow-md">
            <CardHeader><CardTitle>{currentPortfolioItem.portfolio_id ? 'Edit' : 'Add New'} Portfolio Item</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="title">Title*</Label>
                <Input id="title" value={currentPortfolioItem.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={currentPortfolioItem.portfolio_type || 'event_photography'} onValueChange={(value) => handleInputChange('portfolio_type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event_photography">Event Photography</SelectItem>
                    <SelectItem value="portrait_photography">Portrait Photography</SelectItem>
                    <SelectItem value="wedding_films">Wedding Films</SelectItem>
                    <SelectItem value="design_decor">Design & Decor</SelectItem>
                    <SelectItem value="makeup_artistry">Makeup Artistry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={currentPortfolioItem.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} />
              </div>
              
              {/* Existing Tagged Images Management */}
              {currentPortfolioItem.image_urls && Object.keys(currentPortfolioItem.image_urls).length > 0 && (
                <div className="space-y-3 p-3 border rounded-md bg-gray-50/50">
                  <h4 className="font-medium text-sm">Current Images:</h4>
                  {Object.entries(currentPortfolioItem.image_urls).map(([tag, urls]) => (
                    <div key={tag} className="mb-2 p-2 border-b last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant="secondary" className="capitalize text-xs">{tag}</Badge>
                        <Button variant="ghost" size="xs" onClick={() => handleRemoveTagGroupFromCurrentItem(tag)} title={`Remove '${tag}' tag group`}>
                           <Trash2 className="h-3 w-3 text-destructive mr-1" /> Remove Tag
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {urls.map(url => (
                          <div key={url} className="relative group">
                            <img src={url} alt={tag} className="w-full h-20 object-cover rounded"/>
                            <Button variant="destructive" size="icon" className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImageFromCurrentItem(tag, url)}>
                              <X className="h-3 w-3"/>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label>Add/Upload New Images (with Tags)</Label>
                <ImageUploader 
                  onFileSelect={setNewlySelectedImages} 
                  maxFiles={10} 
                  title="Select images for this portfolio item"
                />
                {newlySelectedImages.length > 0 && <p className="text-xs mt-1 text-green-600">{newlySelectedImages.length} new image(s) staged for upload.</p>}
              </div>
              
              <div>
                <Label htmlFor="video_urls">Video URLs (one per line)</Label>
                <Textarea id="video_urls" value={(currentPortfolioItem.video_urls || []).join('\n')} onChange={handleVideoUrlsChange} rows={3} placeholder="https://youtube.com/watch?v=...\nhttps://vimeo.com/..."/>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCloseForm} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Upload className="mr-2 h-4 w-4" />{currentPortfolioItem.portfolio_id ? 'Save Changes' : 'Add Item'}</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && !isFormOpen && <div className="flex items-center justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Loading portfolio...</span></div>}
        
        {!loading && !isFormOpen && portfolios.length === 0 && (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No portfolio items yet.</p>
            <p className="text-sm text-gray-400">Click "Add New Item" to showcase your work.</p>
          </div>
        )}

        {!isFormOpen && portfolios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map(item => {
              const firstImage = getFirstImageUrl(item.image_urls);
              return (
                <Card key={item.portfolio_id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {firstImage && (
                      <div className="aspect-[16/10] bg-gray-100">
                        <img src={firstImage} alt={item.title} className="w-full h-full object-cover"/>
                      </div>
                    )}
                    {!firstImage && <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon className="h-10 w-10"/></div>}
                    <div className="p-4 space-y-1">
                      <h3 className="font-semibold text-md truncate" title={item.title}>{item.title}</h3>
                      <p className="text-xs text-gray-500 capitalize mb-1">{item.portfolio_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-600 line-clamp-2" title={item.description || ""}>{item.description || 'No description.'}</p>
                       {item.image_urls && Object.keys(item.image_urls).length > 0 && (
                        <div className="pt-1">
                          {Object.keys(item.image_urls).slice(0,3).map(tag => <Badge key={tag} variant="outline" className="mr-1 mb-1 text-xs capitalize">{tag} ({item.image_urls![tag].length})</Badge>)}
                          {Object.keys(item.image_urls).length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t flex justify-between items-center">
                      <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                      <div className="space-x-2">
                        <Button variant="outline" size="xs" onClick={() => handleOpenForm(item)}><Edit2 className="h-3 w-3 mr-1"/> Edit</Button>
                        <Button variant="destructive" size="xs" onClick={() => handleDeletePortfolio(item.portfolio_id)}><Trash2 className="h-3 w-3 mr-1"/>Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffPortfolioManager;
