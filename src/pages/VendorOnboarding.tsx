import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, AddressData, PricingRangeData } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import ImageUploader from '@/components/ImageUploader';
import { uploadMultipleFiles } from '@/utils/uploadHelpers';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';

// Vendor categories from the schema
const vendorCategories = [
  "Venue", "Catering", "Photography", "Videography", "Decor", 
  "Makeup", "Clothing", "Music", "Transportation", "Invitation", "Other"
];

const VendorOnboarding: React.FC = () => {
  const { user, vendorProfile, refreshVendorProfile } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data with type safety
  const [vendorData, setVendorData] = useState({
    vendor_name: vendorProfile?.vendor_name || '',
    vendor_category: vendorProfile?.vendor_category || '',
    contact_email: vendorProfile?.contact_email || user?.email || '',
    phone_number: vendorProfile?.phone_number || '',
    website_url: vendorProfile?.website_url || '',
    description: vendorProfile?.description || '',
    pricing_range: (vendorProfile?.pricing_range as unknown as PricingRangeData) || { min: '', max: '', currency: 'INR' },
    address: (vendorProfile?.address as unknown as AddressData) || { city: '', state: '', country: 'India', full_address: '' },
  });
  
  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    (vendorProfile?.portfolio_image_urls as string[]) || []
  );
  const [isUploading, setIsUploading] = useState(false);
  
  // Setup steps
  const steps = [
    { id: 1, name: 'Basic Information' },
    { id: 2, name: 'Business Details' },
    { id: 3, name: 'Portfolio Images' },
  ];
  
  // Auto-redirect if profile is complete
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (vendorProfile) {
      const isProfileComplete = 
        vendorProfile.vendor_name &&
        vendorProfile.vendor_category &&
        vendorProfile.contact_email &&
        vendorProfile.description;
      
      if (isProfileComplete && !(vendorProfile.portfolio_image_urls || []).length) {
        setCurrentStep(3); // Go straight to image upload step
      } else if (isProfileComplete) {
        navigate('/'); // Profile is already complete
      }
    }
  }, [user, vendorProfile, navigate]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
  
  const handlePricingChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setVendorData(prev => ({
      ...prev,
      pricing_range: {
        ...prev.pricing_range,
        [name]: value
      }
    }));
  };
  
  const handleCategoryChange = (value: string) => {
    setVendorData(prev => ({
      ...prev,
      vendor_category: value
    }));
  };
  
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };
  
  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(image => image !== url));
  };
  
  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!vendorData.vendor_name || !vendorData.vendor_category || !vendorData.contact_email) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      // Save profile data
      await saveVendorProfile();
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const saveVendorProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('vendors')
        .upsert({
          supabase_auth_uid: user.id,
          vendor_name: vendorData.vendor_name,
          vendor_category: vendorData.vendor_category,
          contact_email: vendorData.contact_email,
          phone_number: vendorData.phone_number,
          website_url: vendorData.website_url,
          description: vendorData.description,
          address: vendorData.address as any,
          pricing_range: vendorData.pricing_range as any
        }, {
          onConflict: 'supabase_auth_uid'
        });
      
      if (error) throw error;
      
      // Refresh profile data
      await refreshVendorProfile();
      
      toast({
        title: "Profile updated",
        description: "Your business profile has been saved",
      });
    } catch (error: any) {
      console.error('Error saving vendor profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleComplete = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // First upload any new images
      let uploadedImageUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        uploadedImageUrls = await uploadMultipleFiles(
          selectedFiles, 
          'vendors', 
          user.id
        );
        setIsUploading(false);
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls];
      
      // Update the vendor record with the new images
      const { error } = await supabase
        .from('vendors')
        .update({
          portfolio_image_urls: allImages,
          updated_at: new Date().toISOString()
        })
        .eq('supabase_auth_uid', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await refreshVendorProfile();
      
      toast({
        title: "Onboarding complete!",
        description: "Your vendor profile has been set up successfully",
      });
      
      // Redirect to dashboard
      navigate('/');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If not logged in, don't show anything
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div 
                key={step.id}
                className="flex flex-col items-center"
              >
                <div 
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full border-2",
                    currentStep === step.id 
                      ? "bg-sanskara-red text-white border-sanskara-red" 
                      : currentStep > step.id
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white border-gray-300 text-gray-500"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-sm mt-2">{step.name}</span>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="relative mt-2">
            <div className="h-1 bg-gray-200 w-full mt-2"></div>
            <div 
              className="absolute top-0 h-1 bg-sanskara-red transition-all"
              style={{ width: `${(currentStep - 1) / (steps.length - 1) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <Card className="shadow-lg">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Let's start with some basic information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Business Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="vendor_name"
                    name="vendor_name"
                    value={vendorData.vendor_name}
                    onChange={handleInputChange}
                    placeholder="Your business name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vendor_category">Business Category <span className="text-red-500">*</span></Label>
                  <Select 
                    value={vendorData.vendor_category} 
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
                  <Label htmlFor="contact_email">Contact Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={vendorData.contact_email}
                    onChange={handleInputChange}
                    placeholder="contact@yourbusiness.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={vendorData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </CardContent>
            </>
          )}
          
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Tell us more about your business and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={vendorData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Describe your business and services"
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={vendorData.website_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://yourbusiness.com"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min">Minimum Price Range</Label>
                    <Input
                      id="min"
                      name="min"
                      value={vendorData.pricing_range?.min || ''}
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
                      value={vendorData.pricing_range?.max || ''}
                      onChange={handlePricingChange}
                      placeholder="50000"
                      type="number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_address">Business Address</Label>
                  <Textarea
                    id="full_address"
                    name="full_address"
                    value={vendorData.address?.full_address || ''}
                    onChange={handleAddressChange}
                    placeholder="Full address of your business"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={vendorData.address?.city || ''}
                      onChange={handleAddressChange}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={vendorData.address?.state || ''}
                      onChange={handleAddressChange}
                      placeholder="State"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}
          
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Portfolio Images</CardTitle>
                <CardDescription>
                  Upload images to showcase your work and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  maxFiles={10}
                  existingImages={existingImages}
                  onRemoveExisting={handleRemoveExistingImage}
                  uploading={isUploading}
                />
                
                <p className="text-sm text-muted-foreground mt-4">
                  You can upload up to 10 images that showcase your services. These images will be displayed on your vendor profile.
                </p>
              </CardContent>
            </>
          )}
          
          <CardFooter className="flex justify-between">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading || isSubmitting}
              >
                Previous
              </Button>
            )}
            {currentStep === 1 && <div />}
            
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-sanskara-red hover:bg-sanskara-maroon"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Helper function for conditionally joining classes
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default VendorOnboarding;
