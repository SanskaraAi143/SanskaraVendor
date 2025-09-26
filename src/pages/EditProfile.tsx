import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, AddressData, PricingRangeData } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader, ImageIcon } from 'lucide-react';
import TaggedImageUploader from '@/components/TaggedImageUploader';
import { TaggedImages, convertToTaggedImages, convertForDatabase } from '@/utils/taggedUploadHelpers';
import { useNavigate } from 'react-router-dom';

const vendorCategories = [
  "Venue", "Catering", "Photography", "Videography", "Decor", 
  "Makeup", "Clothing", "Music", "Transportation", "Invitation", "Other"
];

const EditProfile: React.FC = () => {
  const { vendorProfile, user, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [profile, setProfile] = useState({
    vendor_name: '',
    vendor_category: '',
    contact_email: '',
    phone_number: '',
    website_url: '',
    description: '',
    address: { city: '', state: '', country: 'India' } as AddressData,
    pricing_range: { min: undefined, max: undefined, currency: 'INR' } as PricingRangeData,
    status: '',
  });
  
  // Tagged images state
  const [taggedImages, setTaggedImages] = useState<TaggedImages | null>(null);
  
  useEffect(() => {
    const loadVendorData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          const address = (data.address as unknown as AddressData) || { city: '', state: '', country: 'India' };
          const pricing_range = (data.pricing_range as unknown as PricingRangeData) || { min: undefined, max: undefined, currency: 'INR' };
          const portfolio_images = convertToTaggedImages(data.portfolio_image_urls);
          
          setProfile({
            vendor_name: data.vendor_name || '',
            vendor_category: data.vendor_category || '',
            contact_email: data.contact_email || user.email || '',
            phone_number: data.phone_number || '',
            website_url: data.website_url || '',
            description: data.description || '',
            address,
            pricing_range,
            status: data.status || '',
          });
          
          setTaggedImages(portfolio_images);
        }
      } catch (error) {
        console.error('Error loading vendor data:', error);
        toast({
          title: 'Error',
          description: 'Unable to load vendor profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVendorData();
  }, [user, vendorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
  
  const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      pricing_range: {
        ...prev.pricing_range,
        [name]: Number(value) || undefined
      }
    }));
  };

  const handleCategoryChange = (value: string) => {
    setProfile((prev) => ({ ...prev, vendor_category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({
          vendor_name: profile.vendor_name,
          vendor_category: profile.vendor_category,
          contact_email: profile.contact_email,
          phone_number: profile.phone_number,
          website_url: profile.website_url,
          description: profile.description,
          address: profile.address as any,
          pricing_range: profile.pricing_range as any,
          portfolio_image_urls: convertForDatabase(taggedImages) as any,
          updated_at: new Date().toISOString(),
          status: profile.status,
        })
        .eq('supabase_auth_uid', user.id);

      if (error) throw error;
      
      await refreshVendorProfile();

      toast({
        title: 'Success',
        description: 'Your profile has been updated',
      });
      
      navigate('/dashboard/profile');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating your profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Edit Vendor Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your vendor profile information
          </p>
        </div>
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard/profile')}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details shown to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Business Name</Label>
                  <Input
                    id="vendor_name"
                    name="vendor_name"
                    value={profile.vendor_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_category">Business Category</Label>
                  <Select 
                    value={profile.vendor_category} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={profile.contact_email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={profile.phone_number || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={profile.website_url || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile.description || ''}
                  onChange={handleChange}
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Minimum Price Range</Label>
                  <Input
                    id="min"
                    name="min"
                    value={profile.pricing_range?.min || ''}
                    onChange={handlePricingChange}
                    placeholder="10000"
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max">Maximum Price Range</Label>
                  <Input
                    id="max"
                    name="max"
                    value={profile.pricing_range?.max || ''}
                    onChange={handlePricingChange}
                    placeholder="50000"
                    type="number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_address">Business Address</Label>
                <Textarea
                  id="street"
                  name="street"
                  value={profile.address?.street || ''}
                  onChange={handleAddressChange}
                  placeholder="Street address of your business"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={profile.address?.city || ''}
                    onChange={handleAddressChange}
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={profile.address?.state || ''}
                    onChange={handleAddressChange}
                    placeholder="State"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Portfolio Images
              </CardTitle>
              <CardDescription>Upload and organize your portfolio images by categories</CardDescription>
            </CardHeader>
            <CardContent>
              <TaggedImageUploader
                taggedImages={taggedImages}
                onImagesChange={setTaggedImages}
                bucket="vendors"
                folder={user?.id}
                category={profile.vendor_category || 'general'}
                maxFilesPerTag={15}
                maxTotalFiles={50}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
