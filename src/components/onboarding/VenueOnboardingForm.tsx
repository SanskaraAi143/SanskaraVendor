
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload } from 'lucide-react';
import TaggedImageUploadModal from '@/components/modals/TaggedImageUploadModal';
import TaggedImageViewer from '@/components/TaggedImageViewer';
import { TaggedImages, convertForDatabase, addImagesToTag, removeImageFromTag, deleteImageFromStorage } from '@/utils/taggedUploadHelpers';

const VenueOnboardingForm: React.FC = () => {
  const { user, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic Information
  const [venueName, setVenueName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // Address Information
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  
  // Venue Details
  const [capacity, setCapacity] = useState<number>(0);
  const [venueType, setVenueType] = useState('');
  const [style, setStyle] = useState('');
  
  // Amenities
  const [hasParking, setHasParking] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasAc, setHasAc] = useState(false);
  const [hasCatering, setHasCatering] = useState(false);
  const [hasDecoration, setHasDecoration] = useState(false);
  
  // Pricing
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  
  // Images
  const [taggedImages, setTaggedImages] = useState<TaggedImages | null>(null);

  const handleImageUpload = (tag: string, urls: string[]) => {
    const updatedImages = addImagesToTag(taggedImages, tag, urls);
    setTaggedImages(updatedImages);
  };

  const handleImageRemove = async (tag: string, url: string) => {
    try {
      await deleteImageFromStorage('vendors', url);
      const updatedImages = removeImageFromTag(taggedImages || {}, tag, url);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!venueName || !description || !contactEmail) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const amenities = [];
      if (hasParking) amenities.push('Parking');
      if (hasWifi) amenities.push('WiFi');
      if (hasAc) amenities.push('Air Conditioning');
      if (hasCatering) amenities.push('Catering');
      if (hasDecoration) amenities.push('Decoration');

      const vendorData = {
        supabase_auth_uid: user.id,
        vendor_name: venueName,
        vendor_category: 'Venue',
        contact_email: contactEmail,
        phone_number: phoneNumber || null,
        website_url: websiteUrl || null,
        description,
        address: {
          full_address: fullAddress,
          city,
          state,
          country
        },
        pricing_range: {
          min: minPrice,
          max: maxPrice,
          currency: 'INR'
        },
        details: {
          capacity: capacity || null,
          venue_type: venueType || null,
          style: style || null,
          amenities,
        },
        portfolio_image_urls: convertForDatabase(taggedImages),
        is_verified: false,
        is_active: true
      };

      const { error } = await supabase
        .from('vendors')
        .upsert(vendorData, { onConflict: 'supabase_auth_uid' });

      if (error) throw error;

      await refreshVendorProfile();
      
      toast({
        title: "Success",
        description: "Your venue profile has been created successfully!",
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating vendor profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create venue profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Venue Registration</h1>
        <p className="text-gray-600 mt-2">Complete your venue profile to start receiving bookings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about your venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue-name">Venue Name *</Label>
                <Input
                  id="venue-name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Enter your venue name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your venue, its atmosphere, and what makes it special"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where is your venue located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-address">Full Address</Label>
              <Textarea
                id="full-address"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Complete address including landmarks"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
            <CardDescription>Specific information about your venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (guests)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  placeholder="Maximum guests"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-type">Venue Type</Label>
                <Input
                  id="venue-type"
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value)}
                  placeholder="Banquet Hall, Garden, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Traditional, Modern, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>What facilities do you provide?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking"
                  checked={hasParking}
                  onCheckedChange={(checked) => setHasParking(checked === true)}
                />
                <Label htmlFor="parking">Parking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wifi"
                  checked={hasWifi}
                  onCheckedChange={(checked) => setHasWifi(checked === true)}
                />
                <Label htmlFor="wifi">WiFi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ac"
                  checked={hasAc}
                  onCheckedChange={(checked) => setHasAc(checked === true)}
                />
                <Label htmlFor="ac">Air Conditioning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="catering"
                  checked={hasCatering}
                  onCheckedChange={(checked) => setHasCatering(checked === true)}
                />
                <Label htmlFor="catering">Catering Services</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="decoration"
                  checked={hasDecoration}
                  onCheckedChange={(checked) => setHasDecoration(checked === true)}
                />
                <Label htmlFor="decoration">Decoration Services</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>What are your price ranges?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-price">Minimum Price (₹)</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  placeholder="Minimum booking amount"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-price">Maximum Price (₹)</Label>
                <Input
                  id="max-price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  placeholder="Maximum booking amount"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Images */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Images</CardTitle>
            <CardDescription>Upload images to showcase your venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Upload high-quality images of your venue organized by categories.
              </p>
              <TaggedImageUploadModal
                trigger={
                  <Button type="button">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                }
                onUploadComplete={handleImageUpload}
                bucket="vendors"
                folder={user?.id}
                category="venue"
                existingTags={taggedImages ? Object.keys(taggedImages) : []}
                title="Upload Venue Images"
              />
            </div>
            
            <TaggedImageViewer
              taggedImages={taggedImages}
              onRemoveImage={handleImageRemove}
              title="Venue Images"
              showRemoveButton={true}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Complete Registration'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VenueOnboardingForm;
