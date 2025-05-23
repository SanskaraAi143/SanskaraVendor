
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, X } from 'lucide-react';

interface StaffPortfolioProps {
  staffData: any;
}

const MEDIA_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' }
];

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  metadata: any;
}

const StaffPortfolioSection: React.FC<StaffPortfolioProps> = ({ staffData }) => {
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form fields for new portfolio item
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [featured, setFeatured] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Category-specific metadata
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  
  // For filtering
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      try {
        // Using the raw query approach to avoid type issues
        const { data, error } = await supabase
          .from('staff_portfolio_items')
          .select('*')
          .eq('staff_id', staffData.staff_id)
          .order('created_at', { ascending: false }) as { data: PortfolioItem[] | null, error: any };
          
        if (error) {
          throw error;
        }
        
        // Type assertion to help TypeScript understand the data structure
        const typedData = data || [] as PortfolioItem[];
        setPortfolioItems(typedData);
        
        // Extract categories
        const uniqueCategories = [...new Set(typedData.map(item => item.category))];
        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
        toast({
          title: "Error",
          description: "Failed to load portfolio items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolioItems();
  }, [staffData.staff_id, selectedCategory]);
  
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadFile = async (file: File, folderPath: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${staffData.supabase_auth_uid}/${folderPath}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('staff_portfolios')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('staff_portfolios')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };
  
  const savePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mediaFile) {
      toast({
        title: "Missing Media",
        description: "Please select a media file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload media file
      const mediaUrl = await uploadFile(mediaFile, 'portfolio');
      
      // Upload thumbnail if provided (for videos/documents)
      let thumbnailUrl = null;
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails');
      }
      
      // Prepare metadata based on category
      const metadata: any = {};
      
      if (price) metadata.price = parseFloat(price);
      if (capacity) metadata.capacity = parseInt(capacity);
      if (customDetails) metadata.details = customDetails;
      
      // Save to database using a direct approach to avoid type issues
      const { error } = await supabase
        .rpc('add_portfolio_item', {
          p_staff_id: staffData.staff_id,
          p_title: title,
          p_description: description,
          p_category: category,
          p_media_type: mediaType,
          p_media_url: mediaUrl,
          p_thumbnail_url: thumbnailUrl,
          p_featured: featured,
          p_metadata: metadata
        }) as any; // Type assertion to bypass TypeScript checks
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setMediaType('image');
      setFeatured(false);
      setMediaFile(null);
      setThumbnailFile(null);
      setMediaPreview(null);
      setThumbnailPreview(null);
      setPrice('');
      setCapacity('');
      setCustomDetails('');
      setDialogOpen(false);
      
      // Refresh portfolio items
      const { data: updatedData, error: fetchError } = await supabase
        .from('staff_portfolio_items')
        .select('*')
        .eq('staff_id', staffData.staff_id)
        .order('created_at', { ascending: false }) as { data: PortfolioItem[] | null, error: any };
        
      if (fetchError) throw fetchError;
      
      // Type assertion to help TypeScript understand the data structure
      const typedData = updatedData || [] as PortfolioItem[];
      setPortfolioItems(typedData);
      
      // Extract categories
      const uniqueCategories = [...new Set(typedData.map(item => item.category))];
      setCategories(uniqueCategories);
      
      if (!selectedCategory && uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
    } catch (error: any) {
      console.error('Error saving portfolio item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save portfolio item",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const deletePortfolioItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Use a stored procedure to delete the item to bypass type checking
      const { error } = await supabase
        .rpc('delete_portfolio_item', { p_id: id }) as any;
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
      
      // Update local state
      setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete portfolio item",
        variant: "destructive",
      });
    }
  };
  
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      // Use a stored procedure to update the featured status to bypass type checking
      const { error } = await supabase
        .rpc('update_portfolio_item_featured', { 
          p_id: id, 
          p_featured: !currentFeatured 
        }) as any;
        
      if (error) throw error;
      
      // Update local state
      setPortfolioItems(portfolioItems.map(item => 
        item.id === id ? { ...item, featured: !currentFeatured } : item
      ));
      
      toast({
        title: "Success",
        description: `Item ${!currentFeatured ? "featured" : "unfeatured"} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update portfolio item",
        variant: "destructive",
      });
    }
  };
  
  const renderPortfolioItem = (item: PortfolioItem) => {
    return (
      <Card key={item.id} className="overflow-hidden">
        <div className="relative">
          {/* Media */}
          <div className="aspect-video bg-muted overflow-hidden">
            {item.media_type === 'image' ? (
              <img 
                src={item.media_url} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : item.media_type === 'video' ? (
              item.thumbnail_url ? (
                <div className="relative">
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21"></polygon>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span>Video</span>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span>Document</span>
              </div>
            )}
          </div>
          
          {/* Delete button */}
          <button 
            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
            onClick={() => deletePortfolioItem(item.id)}
          >
            <X size={16} />
          </button>
        </div>
        
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.featured ? 'Featured' : 'Not Featured'}</span>
              <Switch 
                checked={item.featured}
                onCheckedChange={() => toggleFeatured(item.id, item.featured)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
          
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-medium">Category:</span> {item.category}
            </div>
            
            {item.metadata?.price && (
              <div className="text-xs">
                <span className="font-medium">Price:</span> ${item.metadata.price}
              </div>
            )}
            
            {item.metadata?.capacity && (
              <div className="text-xs">
                <span className="font-medium">Capacity:</span> {item.metadata.capacity}
              </div>
            )}
            
            {item.metadata?.details && (
              <div className="text-xs">
                <span className="font-medium">Details:</span> {item.metadata.details}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <a 
            href={item.media_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-sanskara-red hover:text-sanskara-red/80"
          >
            View Full {item.media_type}
          </a>
        </CardFooter>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red"></div>
        <p className="ml-3">Loading portfolio...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Your Portfolio</h2>
          <p className="text-muted-foreground">Showcase your work and services</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sanskara-red hover:bg-sanskara-red/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
              <DialogDescription>
                Showcase your work by adding images, videos or documents to your portfolio.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={savePortfolioItem}>
              <div className="grid gap-4 py-4">
                <div>
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this item"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this item"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Wedding Venue, Decoration, Catering"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Media Type</label>
                  <Select value={mediaType} onValueChange={setMediaType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIA_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="media-file" className="text-sm font-medium">
                    Upload {mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Document'}
                  </label>
                  <Input
                    id="media-file"
                    type="file"
                    accept={
                      mediaType === 'image' ? 'image/*' :
                      mediaType === 'video' ? 'video/*' :
                      '.pdf,.doc,.docx'
                    }
                    onChange={handleMediaFileChange}
                    required
                  />
                  
                  {mediaPreview && (
                    <div className="mt-2 flex justify-center">
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-40 max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>
                
                {(mediaType === 'video' || mediaType === 'document') && (
                  <div>
                    <label htmlFor="thumbnail" className="text-sm font-medium">
                      Thumbnail Image (Optional)
                    </label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    
                    {thumbnailPreview && (
                      <div className="mt-2 flex justify-center">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          className="max-h-40 max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Category-specific metadata */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Additional Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="price" className="text-sm font-medium">Price (Optional)</label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Price in USD"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="capacity" className="text-sm font-medium">Capacity (Optional)</label>
                      <Input
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="Maximum capacity"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="custom-details" className="text-sm font-medium">Other Details (Optional)</label>
                      <Textarea
                        id="custom-details"
                        value={customDetails}
                        onChange={(e) => setCustomDetails(e.target.value)}
                        placeholder="Other relevant details"
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={featured}
                        onCheckedChange={setFeatured}
                      />
                      <Label htmlFor="featured">Feature this item</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading}
                  className="bg-sanskara-red hover:bg-sanskara-red/90"
                >
                  {uploading ? 'Uploading...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {categories.length > 0 ? (
        <Tabs 
          value={selectedCategory || categories[0]} 
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="mb-4 flex flex-wrap">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(cat => (
            <TabsContent key={cat} value={cat}>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {portfolioItems
                  .filter(item => item.category === cat)
                  .map(renderPortfolioItem)
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-2">No portfolio items yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Start building your portfolio by adding your first item
          </p>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-sanskara-red hover:bg-sanskara-red/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default StaffPortfolioSection;
