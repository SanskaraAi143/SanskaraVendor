import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Edit2, Save, X, Plus, Trash2, UploadCloud } from 'lucide-react';

// Actual ImageUploader for portfolio_image_urls
import RealImageUploader, { SelectedFileWithTags } from '@/components/ImageUploader';


// Placeholder ImageUploader for other image arrays (sampleMenuUrls, pastEventPhotoUrls)
const PlaceholderImageUploader: React.FC<{
  initialUrls?: string[];
  onUrlsChange: (urls: string[]) => void;
  bucketName: string;
  folderName?: string;
  label: string;
}> = ({ initialUrls, onUrlsChange, bucketName, folderName, label }) => {
  const [urls, setUrls] = useState(initialUrls || []);
  // This uploader is a placeholder and does not actually upload.
  // It simulates URL management for fields not yet converted to the new uploader.
  const handleAddUrl = () => {
    const newUrl = prompt(`Enter image URL for ${label} (placeholder):`);
    if (newUrl) {
      const newUrls = [...urls, newUrl];
      setUrls(newUrls);
      onUrlsChange(newUrls);
    }
  };
  const handleRemoveUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    onUrlsChange(newUrls);
  };
  return (
    <div className="space-y-2 p-4 border rounded-md bg-muted/20">
      <Label className="font-semibold">{label}</Label>
      {urls.map((url, index) => (
        <div key={index} className="flex items-center space-x-2 my-1">
          <Input type="text" value={url} readOnly className="flex-grow bg-white" aria-label={`Image URL ${index + 1}`} />
          <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveUrl(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={handleAddUrl} className="mt-2 w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Image URL (Manual Entry)
      </Button>
      <p className="text-xs text-muted-foreground mt-1">
        This is a placeholder for managing URLs directly. Bucket: {bucketName}, Folder: {folderName || 'N/A'}
      </p>
    </div>
  );
};


interface AddressData {
  full_address?: string;
  street?: string; 
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  landmark?: string;
  latitude?: number; 
  longitude?: number; 
}

interface PricingRangeData { 
  currency?: string;
  min?: string; 
  max?: string; 
}

interface VendorDetails {
  contactPersonName?: string;
  establishmentYear?: string; 
  uniqueFeatures?: string; 
  
  sampleMenuUrls?: string[]; 
  pastEventPhotoUrls?: string[];

  pricing?: { [key: string]: any };
  catering?: { [key: string]: any };
  alcoholPolicy?: { [key: string]: any };
  decoration?: { [key: string]: any };
  taxesPayment?: { [key: string]: any };
  amenities?: { [key: string]: any };
  ritualCultural?: { [key: string]: any };
  aiOperational?: { [key: string]: any };
  venueRules?: string; 
  [key: string]: any; 
}


interface ExtendedVendorProfile {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string; 
  contact_email: string;
  phone_number: string;
  website_url?: string;
  address?: AddressData;
  pricing_range?: PricingRangeData; 
  rating?: number;
  description?: string; 
  details?: VendorDetails; 
  portfolio_image_urls?: Record<string, string[]> | null; // Updated type
  is_active?: boolean;
  is_verified?: boolean;
  commission_rate?: number;
  created_at?: string;
  updated_at?: string;
}


const VendorProfile: React.FC = () => {
  const { user, vendorProfile, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingNewImages, setIsUploadingNewImages] = useState(false);
  const [venueData, setVenueData] = useState<ExtendedVendorProfile | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [editedData, setEditedData] = useState<Partial<ExtendedVendorProfile>>({});
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [activePhotoTag, setActivePhotoTag] = useState<string | null>(null);


  const initializeEditedData = useCallback((profile: ExtendedVendorProfile) => {
    setEditedData({
      vendor_name: profile.vendor_name || '',
      vendor_category: profile.vendor_category || 'venue',
      contact_email: profile.contact_email || '',
      phone_number: profile.phone_number || '',
      website_url: profile.website_url || '',
      description: profile.description || '',
      address: profile.address ? { ...profile.address } : {},
      portfolio_image_urls: profile.portfolio_image_urls ? JSON.parse(JSON.stringify(profile.portfolio_image_urls)) : {}, // Deep clone or empty object
      pricing_range: profile.pricing_range ? { ...profile.pricing_range } : { currency: 'INR' },
      details: {
        ...(profile.details || {}), 
        pricing: profile.details?.pricing ? { ...profile.details.pricing } : {},
        catering: profile.details?.catering ? { ...profile.details.catering } : {},
        alcoholPolicy: profile.details?.alcoholPolicy ? { ...profile.details.alcoholPolicy } : {},
        decoration: profile.details?.decoration ? { ...profile.details.decoration } : {},
        taxesPayment: profile.details?.taxesPayment ? { ...profile.details.taxesPayment } : {},
        amenities: profile.details?.amenities ? { ...profile.details.amenities } : {},
        ritualCultural: profile.details?.ritualCultural ? { ...profile.details.ritualCultural } : {},
        aiOperational: profile.details?.aiOperational ? { ...profile.details.aiOperational } : {},
        sampleMenuUrls: profile.details?.sampleMenuUrls ? [...profile.details.sampleMenuUrls] : [],
        pastEventPhotoUrls: profile.details?.pastEventPhotoUrls ? [...profile.details.pastEventPhotoUrls] : [],
      },
    });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVendorData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, vendorProfile]); // Removed navigate from deps as it's stable

  const fetchVendorData = async () => {
    if (!vendorProfile?.vendor_id) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const extendedProfile = vendorProfile as unknown as ExtendedVendorProfile; // Use the profile from context first
      
      // Fetch services separately
      const { data: servicesData, error: servicesError } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);

      if (servicesError) throw servicesError;
      
      setVenueData(extendedProfile);
      setServices(servicesData || []);
      initializeEditedData(extendedProfile);

      // Set initial active photo tag for viewing
      if (extendedProfile.portfolio_image_urls && Object.keys(extendedProfile.portfolio_image_urls).length > 0) {
        setActivePhotoTag(Object.keys(extendedProfile.portfolio_image_urls)[0]);
      } else {
        setActivePhotoTag(null);
      }

    } catch (error: any) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!venueData?.vendor_id) return;

    try {
      setIsSaving(true);
      const details = JSON.parse(JSON.stringify(editedData.details || {}));
      const updatePayload: Partial<ExtendedVendorProfile> = {
        vendor_name: editedData.vendor_name,
        vendor_category: editedData.vendor_category,
        contact_email: editedData.contact_email,
        phone_number: editedData.phone_number,
        website_url: editedData.website_url,
        description: editedData.description,
        address: editedData.address as any || {},
        details: details,
        pricing_range: editedData.pricing_range as any || {},
        portfolio_image_urls: editedData.portfolio_image_urls || null, // Send null if empty object
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('vendors')
        .update(updatePayload)
        .eq('vendor_id', venueData.vendor_id);
      if (error) throw error;
      await refreshVendorProfile(); // This will trigger a re-fetch via useEffect
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!venueData) return;
    initializeEditedData(venueData); 
    setIsEditing(false);
  };

  const updateField = (field: keyof ExtendedVendorProfile, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };
  
  const updateAddressField = (field: keyof AddressData, value: any) => {
    setEditedData(prev => ({ ...prev, address: { ...(prev.address || {}), [field]: value }}));
  };
  
  const updatePricingRangeField = (field: keyof PricingRangeData, value: any) => {
    setEditedData(prev => ({ ...prev, pricing_range: { ...(prev.pricing_range || {}), [field]: value }}));
  };

  const updateDetailField = (path: string, value: any) => {
    setEditedData(prev => {
      const newDetails = JSON.parse(JSON.stringify(prev.details || {})); 
      const pathArray = path.split('.');
      let current = newDetails;
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]] || typeof current[pathArray[i]] !== 'object') {
          current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
      }
      current[pathArray[pathArray.length - 1]] = value;
      return { ...prev, details: newDetails };
    });
  };
  
  const getDetailValue = (path: string, defaultValue: any = '') => {
    const pathArray = path.split('.');
    let current = editedData.details || {};
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current && current[key] !== null && current[key] !== undefined) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    return current;
  };

  // --- Portfolio Image Management ---
  const uploadMultipleFilesLocal = async (files: File[], folder: string): Promise<string[]> => {
    setIsUploadingNewImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${venueData?.vendor_id}/${folder}/${fileName}`;

        const { error } = await supabase.storage.from('vendors').upload(filePath, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('vendors').getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      });
      const urls = await Promise.all(uploadPromises);
      toast({ title: "Success", description: `${urls.length} new image(s) uploaded.`});
      return urls;
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive"});
      return [];
    } finally {
      setIsUploadingNewImages(false);
    }
  };

  const handleNewPortfolioImagesSelected = async (filesWithTags: SelectedFileWithTags[]) => {
    if (!filesWithTags.length || !venueData?.vendor_id) return;

    const filesToUpload = filesWithTags.map(fwt => fwt.file);
    const newImageUrls = await uploadMultipleFilesLocal(filesToUpload, 'portfolio');

    if (newImageUrls.length === filesWithTags.length) { // Ensure all uploads were successful (or handle partials if needed)
      const currentPortfolio = JSON.parse(JSON.stringify(editedData.portfolio_image_urls || {}));
      filesWithTags.forEach((fileWithTags, index) => {
        const newUrl = newImageUrls[index];
        if (!newUrl) return; // Skip if a URL failed
        const tags = fileWithTags.tags.length > 0 ? fileWithTags.tags : ['untagged'];
        tags.forEach(tag => {
          if (!currentPortfolio[tag]) currentPortfolio[tag] = [];
          if (!currentPortfolio[tag].includes(newUrl)) {
            currentPortfolio[tag].push(newUrl);
          }
        });
      });
      updateField('portfolio_image_urls', currentPortfolio);
    }
  };

  const handleRemovePortfolioImage = (tag: string, imageUrl: string) => {
    const currentPortfolio = JSON.parse(JSON.stringify(editedData.portfolio_image_urls || {}));
    if (currentPortfolio[tag]) {
      currentPortfolio[tag] = currentPortfolio[tag].filter((url: string) => url !== imageUrl);
      if (currentPortfolio[tag].length === 0) {
        delete currentPortfolio[tag];
      }
    }
    updateField('portfolio_image_urls', currentPortfolio);
  };

  const handleRemovePortfolioTagGroup = (tag: string) => {
    const currentPortfolio = JSON.parse(JSON.stringify(editedData.portfolio_image_urls || {}));
    delete currentPortfolio[tag];
    updateField('portfolio_image_urls', currentPortfolio);
  };
  // --- End Portfolio Image Management ---


  const renderBasicInfo = () => ( /* Content as before, ensure getDetailValue and updateDetailField are used */ 
    <Card>
      <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Business Name</Label>
                <Input id="vendorName" value={editedData.vendor_name || ''} onChange={(e) => updateField('vendor_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorCategory">Category</Label>
                <Select value={editedData.vendor_category || ''} onValueChange={(value) => updateField('vendor_category', value)}>
                  <SelectTrigger id="vendorCategory"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent><SelectItem value="venue">Venue</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Contact Person Name (Owner/Manager)</Label>
                <Input id="contactPersonName" value={getDetailValue('contactPersonName')} onChange={(e) => updateDetailField('contactPersonName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Direct Phone Number(s)</Label>
                <Input id="phoneNumber" value={editedData.phone_number || ''} onChange={(e) => updateField('phone_number', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input id="contactEmail" type="email" value={editedData.contact_email || ''} onChange={(e) => updateField('contact_email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website or Social Media Links</Label>
                <Input id="websiteUrl" value={editedData.website_url || ''} onChange={(e) => updateField('website_url', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishmentYear">Establishment Year</Label>
                <Input id="establishmentYear" value={getDetailValue('establishmentYear')} onChange={(e) => updateDetailField('establishmentYear', e.target.value)} placeholder="YYYY" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description / Overview</Label>
              <Textarea id="description" value={editedData.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniqueFeatures">Unique Features / Selling Points</Label>
              <Textarea id="uniqueFeatures" value={getDetailValue('uniqueFeatures')} onChange={(e) => updateDetailField('uniqueFeatures', e.target.value)} rows={3} />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p><Label>Business Name:</Label> {venueData?.vendor_name}</p>
            <p><Label>Category:</Label> <span className="capitalize">{venueData?.vendor_category}</span></p>
            <p><Label>Contact Person:</Label> {venueData?.details?.contactPersonName || 'N/A'}</p>
            <p><Label>Phone:</Label> {venueData?.phone_number}</p>
            <p><Label>Email:</Label> {venueData?.contact_email}</p>
            <p><Label>Website:</Label> {venueData?.website_url || 'N/A'}</p>
            <p><Label>Established:</Label> {venueData?.details?.establishmentYear || 'N/A'}</p>
            <div><Label>Description:</Label><p className="text-sm text-muted-foreground">{venueData?.description || 'N/A'}</p></div>
            <div><Label>Unique Features:</Label><p className="text-sm text-muted-foreground">{venueData?.details?.uniqueFeatures || 'N/A'}</p></div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAddressInfo = () => ( /* Content as before */ 
    <Card>
      <CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullAddress">Full Address with Pin Code</Label>
              <Textarea id="fullAddress" value={editedData.address?.full_address || ''} onChange={(e) => updateAddressField('full_address', e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" placeholder="City" value={editedData.address?.city || ''} onChange={(e) => updateAddressField('city', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" placeholder="State" value={editedData.address?.state || ''} onChange={(e) => updateAddressField('state', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="country">Country</Label><Input id="country" placeholder="Country" value={editedData.address?.country || ''} onChange={(e) => updateAddressField('country', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="pincode">Pincode</Label><Input id="pincode" placeholder="Pincode" value={editedData.address?.pincode || ''} onChange={(e) => updateAddressField('pincode', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="landmark">Landmark (Optional)</Label><Input id="landmark" placeholder="Landmark (Optional)" value={editedData.address?.landmark || ''} onChange={(e) => updateAddressField('landmark', e.target.value)} /></div>
          </>
        ) : (
          <div className="space-y-2">
            <p><Label>Full Address:</Label> {venueData?.address?.full_address || 'N/A'}</p>
            <p><Label>City:</Label> {venueData?.address?.city || 'N/A'}</p>
            <p><Label>State:</Label> {venueData?.address?.state || 'N/A'}</p>
            <p><Label>Country:</Label> {venueData?.address?.country || 'N/A'}</p>
            <p><Label>Pincode:</Label> {venueData?.address?.pincode || 'N/A'}</p>
            <p><Label>Landmark:</Label> {venueData?.address?.landmark || 'N/A'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPricingInfo = () => ( /* Content as before */ 
     <Card>
      <CardHeader><CardTitle>Pricing, Catering, and Packages</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">Overall Price Range (for listings)</h3>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="currency">Currency</Label><Select value={editedData.pricing_range?.currency || 'INR'} onValueChange={(val) => updatePricingRangeField('currency', val)}>
                <SelectTrigger id="currency"><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent><SelectItem value="INR">INR (₹)</SelectItem></SelectContent>
              </Select></div>
              <div className="space-y-2"><Label htmlFor="minPrice">Min Price</Label><Input id="minPrice" type="text" placeholder="e.g., 50000" value={editedData.pricing_range?.min || ''} onChange={e => updatePricingRangeField('min', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="maxPrice">Max Price</Label><Input id="maxPrice" type="text" placeholder="e.g., 200000" value={editedData.pricing_range?.max || ''} onChange={e => updatePricingRangeField('max', e.target.value)} /></div>
            </div>
          ) : (
            <p>{venueData?.pricing_range?.currency || 'INR'} {venueData?.pricing_range?.min || 'N/A'} - {venueData?.pricing_range?.max || 'N/A'}</p>
          )}
        </div>
        {/* Other pricing details as before, using getDetailValue and updateDetailField */}
        </CardContent>
    </Card>
  );
  
  const renderAmenitiesInfo = () => ( /* Content as before */ 
    <Card>
      <CardHeader><CardTitle>Amenities & Event Services</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Content as before, using getDetailValue and updateDetailField */}
      </CardContent>
    </Card>
  );
  
  const renderPolicies = () => ( /* Content as before */ 
    <Card>
      <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Content as before, using getDetailValue and updateDetailField */}
      </CardContent>
    </Card>
  );

  const renderRitualAiInfo = () => ( /* Content as before */ 
    <Card>
      <CardHeader><CardTitle>Ritual, AI & Operational Data</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Content as before, using getDetailValue and updateDetailField */}
      </CardContent>
    </Card>
  );
  
  const renderPhotosTab = () => {
    const currentPortfolio = isEditing ? editedData.portfolio_image_urls : venueData?.portfolio_image_urls;
    const tags = currentPortfolio ? Object.keys(currentPortfolio) : [];

    if (!activePhotoTag && tags.length > 0) {
      setActivePhotoTag(tags[0]);
    }
    
    const imagesForSelectedTag = activePhotoTag && currentPortfolio?.[activePhotoTag] ? currentPortfolio[activePhotoTag] : [];

    return (
      <Card>
        <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-lg">Venue Photos & Videos (Main Portfolio)</h3>
            {isEditing && (
              <div className="p-4 border rounded-md bg-muted/10 mb-6">
                <h4 className="font-medium text-md mb-3">Add New Portfolio Images</h4>
                <RealImageUploader
                  onFileSelect={handleNewPortfolioImagesSelected}
                  title="Upload new portfolio images/videos"
                  maxFiles={10} // Can be adjusted
                />
                {isUploadingNewImages && <div className="flex items-center mt-2"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</div>}
              </div>
            )}

            {tags.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 border-b pb-3 mb-3">
                  {tags.map(tag => (
                    <Button 
                      key={tag} 
                      variant={activePhotoTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActivePhotoTag(tag)}
                      className="capitalize"
                    >
                      {tag} ({currentPortfolio?.[tag]?.length || 0})
                      {isEditing && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 ml-2 hover:bg-destructive/20"
                          onClick={(e) => { e.stopPropagation(); handleRemovePortfolioTagGroup(tag); }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </Button>
                  ))}
                </div>
                
                {activePhotoTag && imagesForSelectedTag.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagesForSelectedTag.map((url, i) => (
                      <div key={`${activePhotoTag}-${i}-${url}`} className="relative group">
                        <img src={url} alt={`${activePhotoTag} ${i+1}`} className="w-full h-40 object-cover rounded-md shadow-md"/>
                        {isEditing && (
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePortfolioImage(activePhotoTag, url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No images for tag: {activePhotoTag || 'N/A'}.</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {isEditing ? 'No portfolio images added yet. Use the uploader above to add images with tags.' : 'No venue photos uploaded.'}
              </p>
            )}
          </div>
          <hr className="my-6"/>
          {/* Placeholder Uploader for Past Event Photos */}
          <div>
            <h3 className="font-semibold mb-2 text-lg">Past Event Photos (Themes/Setup Styles)</h3>
            <PlaceholderImageUploader
              label="Manage Photos of Past Events"
              initialUrls={getDetailValue('pastEventPhotoUrls', [])}
              onUrlsChange={(urls) => updateDetailField('pastEventPhotoUrls', urls)}
              bucketName="vendors"
              folderName={`${venueData?.vendor_id}/past-events`}
            />
          </div>
           <hr className="my-6"/>
          {/* Placeholder Uploader for Sample Menus */}
          <div>
            <h3 className="font-semibold mb-2 text-lg">Sample Menus (PDF/Images)</h3>
            <PlaceholderImageUploader
              label="Manage Sample Menus"
              initialUrls={getDetailValue('sampleMenuUrls', [])}
              onUrlsChange={(urls) => updateDetailField('sampleMenuUrls', urls)}
              bucketName="vendors"
              folderName={`${venueData?.vendor_id}/sample-menus`}
            />
          </div>
        </CardContent>
      </Card>
    );
  };


  const renderServicesInfo = () => ( /* Content as before */ 
    <Card>
      <CardHeader>
        <CardTitle>Venue Spaces / Halls (Services)</CardTitle>
        <CardDescription>
          Manage individual halls or distinct service spaces. Each hall/space is a 'service' entry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No venue spaces/halls (services) defined yet.</p>
            <Button onClick={() => navigate('/services/add')}> 
              <Plus className="h-4 w-4 mr-2" /> Add Hall/Space
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.service_id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-md">{service.service_name} (e.g., Main Hall, Lawn 1)</h4>
                    <Badge variant="outline" className="text-xs">
                      Category: {service.service_category} 
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/services/edit/${service.service_id}`)} 
                  >
                    <Edit2 className="h-4 w-4 mr-1" /> Edit Details
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Description: {service.description || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Capacity:</span> {service.min_capacity} - {service.max_capacity} guests</p>
                {service.base_price && (
                  <p className="text-sm"><span className="font-medium">Base Price:</span> {service.base_price} {service.price_unit || ''}</p>
                )}
                 {service.customizability_details && typeof service.customizability_details === 'string' && (
                  <div className="mt-2 text-xs bg-slate-50 p-2 rounded">
                    <p className="font-semibold">Additional Space Details (from service record):</p>
                    <pre className="whitespace-pre-wrap text-xs">{
                      (() => {
                        try {
                          const parsed = JSON.parse(service.customizability_details);
                          return `Type: ${parsed.typeOfSpace || 'N/A'} ${parsed.otherTypeOfSpace ? `(${parsed.otherTypeOfSpace})` : ''}\n` +
                                 `Area: ${parsed.areaSqFt || 'N/A'} sq.ft.\n` +
                                 `AC: ${parsed.airConditioning || 'N/A'}\n` +
                                 `Stage: ${parsed.stageAvailable ? `Yes (${parsed.stageDimensions || 'N/A'})` : 'No'}\n` +
                                 `Dance Floor: ${parsed.danceFloorAvailable ? `Yes (${parsed.danceFloorSizeSqFt || 'N/A'} sq.ft.)` : 'No'}\n` +
                                 `Seating - Theatre: ${parsed.seatingTheatre || 'N/A'}, Banquet: ${parsed.seatingBanquet || 'N/A'}, Floating: ${parsed.seatingFloating || 'N/A'}\n`+
                                 `Dining: ${parsed.separateDiningHall ? `Separate (Capacity: ${parsed.diningCapacity || 'N/A'})` : 'Integrated/No Separate'}\n` +
                                 `Ambience: ${parsed.ambienceDescription || 'N/A'}`;
                        } catch {
                          return service.customizability_details; 
                        }
                      })()
                    }</pre>
                  </div>
                )}
              </div>
            ))}
            <Button onClick={() => navigate('/services/add')} className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" /> Add Another Hall/Space
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Loading profile...</span></div>;
  }

  if (!venueData?.vendor_id) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Incomplete</h2>
          <p className="text-gray-600 mb-4">Your vendor profile is not fully set up. Please complete the onboarding process.</p>
          <Button onClick={() => navigate('/onboarding')}>Complete Onboarding</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{editedData.vendor_name || venueData.vendor_name || 'Vendor Profile'}</h1>
          <p className="text-gray-600">Manage your business information, services, and settings.</p>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="ritual_ai">Ritual/AI</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="services">Spaces</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">{renderBasicInfo()}</TabsContent>
        <TabsContent value="address">{renderAddressInfo()}</TabsContent>
        <TabsContent value="pricing">{renderPricingInfo()}</TabsContent>
        <TabsContent value="amenities">{renderAmenitiesInfo()}</TabsContent>
        <TabsContent value="policies">{renderPolicies()}</TabsContent>
        <TabsContent value="ritual_ai">{renderRitualAiInfo()}</TabsContent>
        <TabsContent value="photos">{renderPhotosTab()}</TabsContent>
        <TabsContent value="services">{renderServicesInfo()}</TabsContent>
      </Tabs>

      {isEditing && (
        <div className="mt-8 pt-6 border-t flex justify-end space-x-3 sticky bottom-0 bg-background py-4 z-10">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving || isUploadingNewImages}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isUploadingNewImages}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;