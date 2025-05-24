import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Edit, MapPin, Phone, Mail, Globe, Building, Tag, CreditCard, X, ChevronLeft, ChevronRight, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Profile: React.FC = () => {
  const { vendorProfile, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadVendorData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData(data);
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

  const navigateToEditProfile = () => {
    navigate('/profile/edit');
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageViewer = () => {
    setIsModalOpen(false);
  };

  const deleteImage = async (imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (!fileName) throw new Error('Invalid image URL');

      const { error } = await supabase.storage.from('portfolio').remove([fileName]);
      if (error) throw error;

      setProfileData((prev: any) => ({
        ...prev,
        portfolio_image_urls: prev.portfolio_image_urls.filter((url: string) => url !== imageUrl),
      }));

      toast({
        title: 'Image Deleted',
        description: 'The image has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Unable to delete the image.',
        variant: 'destructive',
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % profileData.portfolio_image_urls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + profileData.portfolio_image_urls.length) % profileData.portfolio_image_urls.length);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
        <p className="ml-3 text-sanskara-maroon">Loading profile data...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Profile Not Found</h2>
        <p className="mt-2 text-muted-foreground">Your vendor profile information could not be loaded.</p>
        <Button onClick={navigateToEditProfile} className="mt-4">Create Profile</Button>
      </div>
    );
  }

  const address = profileData.address || {};
  const pricingRange = profileData.pricing_range || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Vendor Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your business information that customers will see
          </p>
        </div>
        <Button onClick={navigateToEditProfile} className="flex items-center gap-2">
          <Edit className="h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Business Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> {profileData.vendor_name || 'Business Name'}
            </CardTitle>
            <CardDescription>
              {profileData.vendor_category && <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-1"><Tag className="h-3 w-3" /> {profileData.vendor_category}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
              <p className="text-sm">{profileData.description || 'No description available'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {profileData.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" /> 
                      {profileData.contact_email}
                    </div>
                  )}
                  {profileData.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" /> 
                      {profileData.phone_number}
                    </div>
                  )}
                  {profileData.website_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" /> 
                      <a href={profileData.website_url.startsWith('http') ? profileData.website_url : `https://${profileData.website_url}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-primary hover:underline">
                        {profileData.website_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Address</h3>
                {address.full_address ? (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" /> 
                    <span>{address.full_address}</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No address provided</div>
                )}
                {(address.city || address.state) && (
                  <div className="text-sm mt-1 pl-6">
                    {address.city}{address.city && address.state && ', '}{address.state}
                    {address.country && `, ${address.country}`}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Pricing</h3>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {pricingRange.min || pricingRange.max ? (
                  <span className="text-sm">
                    {pricingRange.min && `${pricingRange.currency || 'INR'} ${pricingRange.min}`}
                    {pricingRange.min && pricingRange.max && ' - '}
                    {pricingRange.max && `${pricingRange.currency || 'INR'} ${pricingRange.max}`}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">No pricing information provided</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Sample images of your work</CardDescription>
          </CardHeader>
          <CardContent>
            {profileData.portfolio_image_urls && profileData.portfolio_image_urls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {profileData.portfolio_image_urls.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-md cursor-pointer"
                    onClick={() => openImageViewer(index)}
                  >
                    <img
                      src={url}
                      alt={`Portfolio image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground">No portfolio images uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-3xl">
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-50"
              onClick={closeImageViewer}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative flex items-center justify-center">
              <button
                className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <img
                src={profileData.portfolio_image_urls[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
              <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 text-white">
                {currentImageIndex + 1} / {profileData.portfolio_image_urls.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
