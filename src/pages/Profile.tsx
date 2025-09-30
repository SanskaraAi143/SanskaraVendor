import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import ProfileBasicInfo from '@/components/ProfileBasicInfo';
import ProfileAddressInfo from '@/components/ProfileAddressInfo';
import ProfilePricingInfo from '@/components/ProfilePricingInfo';
import ProfileAmenitiesInfo from '@/components/ProfileAmenitiesInfo';
import ProfilePolicies from '@/components/ProfilePolicies';
import ProfileRitualAiInfo from '@/components/ProfileRitualAiInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploader from '@/components/ImageUploader';
import { Badge } from '@/components/ui/badge';
import { uploadMultipleFiles } from '@/utils/uploadHelpers';

// --- Type Definitions ---

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
  pricing?: {
    rentalIncludedInCatering?: boolean;
    weekdayRate?: string;
    weekendRate?: string;
    auspiciousRate?: string;
    rentalDurationOptions?: string[];
    perHourRate?: string;
    basicRentalInclusions?: string[];
    basicRentalInclusionsOther?: string;
    pricePerPlateVegStandard?: { min?: string; max?: string };
    pricePerPlateVegDeluxe?: { min?: string; max?: string };
    pricePerPlateNonVegStandard?: { min?: string; max?: string };
    pricePerPlateNonVegDeluxe?: { min?: string; max?: string };
  };
  catering?: {
    options?: string;
    outsideCaterersApprovedVendors?: string;
    outsideCaterersRoyaltyFee?: boolean;
    outsideCaterersKitchenAccess?: boolean;
    cuisineSpecialties?: string[];
    cuisineSpecialtiesOther?: string;
    menuCustomization?: string;
  };
  alcoholPolicy?: {
    allowed?: boolean;
    inHouseBar?: boolean;
    permitRequired?: boolean;
    corkageFeeApplicable?: string;
    corkageFeeAmount?: string;
  };
  decoration?: {
    options?: string;
    restrictionsOutside?: string;
    basicIncluded?: boolean;
    basicIncludedDetails?: string;
    standardPackagesPriceRange?: { min?: string; max?: string };
    standardPackagesThemes?: string;
    customizationAllowed?: boolean;
    customizationPopularThemes?: string;
  };
  taxesPayment?: {
    gstApplied?: boolean;
    gstPercentage?: string;
    otherCharges?: string;
    advanceBookingAmount?: string;
    paymentTerms?: string;
    cancellationPolicy?: string;
    acceptedPaymentModes?: string[];
  };
  amenities?: {
    parkingCars?: string;
    parkingTwoWheelers?: string;
    valetParkingAvailable?: boolean;
    valetParkingCost?: string;
    totalRooms?: string;
    acRooms?: string;
    nonAcRooms?: string;
    complimentaryRoomsOffered?: boolean;
    extraRoomCharges?: string;
    roomAmenities?: string[];
    roomAmenitiesOther?: string;
    powerBackupCapacity?: string;
    powerBackupDuration?: string;
    soundSystem?: string;
    projectorScreen?: string;
    djServices?: string;
    djCostInHouse?: string;
    washroomsNumber?: string;
    washroomsCleanlinessDescription?: string;
    wheelchairAccessAvailable?: boolean;
    elevatorForGuests?: boolean;
    eventStaffNumber?: string;
    eventStaffServicesCovered?: string;
    wifiAvailable?: boolean;
  };
  ritualCultural?: {
    fireHawanAllowed?: string;
    mandapSetupRestrictions?: string;
  };
  aiOperational?: {
    currentBookingSystem?: string;
    crmSoftwareName?: string;
    otherBookingSystemName?: string;
    willingToIntegrateSanskara?: boolean;
    idealClientProfile?: string;
    flexibilityLevel?: string;
    aiMenuDecorSuggestions?: string;
    preferredLeadMode?: string;
  };
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
  portfolio_image_urls?: string[];
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
  const [venueData, setVenueData] = useState<ExtendedVendorProfile | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [editedData, setEditedData] = useState<Partial<ExtendedVendorProfile>>({});
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingPastEvents, setUploadingPastEvents] = useState(false);

  const initializeEditedData = useCallback((profile: ExtendedVendorProfile) => {
    setEditedData({
      vendor_name: profile.vendor_name || '',
      vendor_category: profile.vendor_category || 'venue',
      contact_email: profile.contact_email || '',
      phone_number: profile.phone_number || '',
      website_url: profile.website_url || '',
      description: profile.description || '',
      address: profile.address ? { ...profile.address } : {},
      portfolio_image_urls: profile.portfolio_image_urls ? [...profile.portfolio_image_urls] : [],
      pricing_range: profile.pricing_range ? { ...profile.pricing_range } : { currency: 'INR' },
      details: {
        ...(profile.details || {}), // Spread existing details first
        // Ensure nested objects are initialized if not present in profile.details
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
  }, [user, vendorProfile, navigate]);

  const fetchVendorData = async () => {
    if (!vendorProfile?.vendor_id) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      if (!vendorProfile || !vendorProfile.vendor_id) {
        setIsLoading(false);
        return;
      }
      const { data: servicesData, error: servicesError } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);

      if (servicesError) throw servicesError;

      const extendedProfile = vendorProfile as unknown as ExtendedVendorProfile;
      
      setVenueData(extendedProfile);
      setServices(servicesData || []);
      initializeEditedData(extendedProfile);

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
      // Deep clone details to ensure all nested changes are included
      const details = JSON.parse(JSON.stringify(editedData.details || {}));
      const updatePayload = {
        vendor_name: editedData.vendor_name,
        vendor_category: editedData.vendor_category,
        contact_email: editedData.contact_email,
        phone_number: editedData.phone_number,
        website_url: editedData.website_url,
        description: editedData.description,
        address: editedData.address as any || {},
        details: details,
        pricing_range: editedData.pricing_range as any || {},
        portfolio_image_urls: editedData.portfolio_image_urls || [],
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('vendors')
        .update(updatePayload)
        .eq('vendor_id', venueData.vendor_id);
      if (error) throw error;
      await refreshVendorProfile();
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
    setEditedData(prev => ({
      ...prev,
      address: { ...(prev.address || {}), [field]: value }
    }));
  };
  
  const updatePricingRangeField = (field: keyof PricingRangeData, value: any) => {
    setEditedData(prev => ({
      ...prev,
      pricing_range: { ...(prev.pricing_range || {}), [field]: value }
    }));
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

  // --- Image Upload Handlers ---
  const handlePortfolioFileSelect = async (files: File[]) => {
    if (!venueData?.vendor_id || !user?.id) return;
    setUploadingPortfolio(true);
    try {
      const urls = await uploadMultipleFiles(files, 'vendors', user.id);
      setEditedData(prev => ({
        ...prev,
        portfolio_image_urls: [...(prev.portfolio_image_urls || []), ...urls],
      }));
      toast({ title: 'Upload Successful', description: `${urls.length} file(s) uploaded.` });
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message || 'Could not upload files', variant: 'destructive' });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handlePastEventFileSelect = async (files: File[]) => {
    if (!venueData?.vendor_id || !user?.id) return;
    setUploadingPastEvents(true);
    try {
      const urls = await uploadMultipleFiles(files, 'vendors', user.id);
      setEditedData(prev => ({
        ...prev,
        details: {
          ...(prev.details || {}),
          pastEventPhotoUrls: [
            ...((prev.details?.pastEventPhotoUrls as string[]) || []),
            ...urls,
          ],
        },
      }));
      toast({ title: 'Upload Successful', description: `${urls.length} file(s) uploaded.` });
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message || 'Could not upload files', variant: 'destructive' });
    } finally {
      setUploadingPastEvents(false);
    }
  };

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
          <h1 className="text-3xl font-bold">{venueData.vendor_name || 'Vendor Profile'}</h1>
          <p className="text-gray-600">Manage your business information, services, and settings.</p>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto whitespace-nowrap gap-2 rounded-lg border bg-muted p-1">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="ritual_ai">Ritual/AI</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="services">Spaces</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <ProfileBasicInfo
            isEditing={isEditing}
            editedData={editedData}
            updateField={updateField}
            getDetailValue={getDetailValue}
            updateDetailField={updateDetailField}
            venueData={venueData}
          />
        </TabsContent>
        <TabsContent value="address">
          <ProfileAddressInfo
            isEditing={isEditing}
            editedData={editedData}
            updateAddressField={updateAddressField}
            venueData={venueData}
          />
        </TabsContent>
        <TabsContent value="pricing">
          <ProfilePricingInfo
            isEditing={isEditing}
            editedData={editedData}
            updatePricingRangeField={updatePricingRangeField}
            getDetailValue={getDetailValue}
            updateDetailField={updateDetailField}
            venueData={venueData}
          />
        </TabsContent>
        <TabsContent value="amenities">
          <ProfileAmenitiesInfo
            isEditing={isEditing}
            getDetailValue={getDetailValue}
            updateDetailField={updateDetailField}
            venueData={venueData}
          />
        </TabsContent>
        <TabsContent value="policies">
          <ProfilePolicies
            isEditing={isEditing}
            getDetailValue={getDetailValue}
            updateDetailField={updateDetailField}
            venueData={venueData}
          />
        </TabsContent>
        <TabsContent value="ritual_ai">
          <ProfileRitualAiInfo
            isEditing={isEditing}
            getDetailValue={getDetailValue}
            updateDetailField={updateDetailField}
            venueData={venueData}
          />
        </TabsContent>
        <TabsContent value="photos">
          <Card>
            <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-lg">Venue Photos & Videos (Main Portfolio)</h3>
                {isEditing ? (
                  <ImageUploader
                    title="Upload High-Quality Photos & Videos of Venue"
                    existingImages={editedData.portfolio_image_urls || []}
                    onFileSelect={handlePortfolioFileSelect}
                    uploading={uploadingPortfolio}
                  />
                ) : (
                  venueData?.portfolio_image_urls?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {venueData.portfolio_image_urls.map((url, i) => <img key={i} src={url} alt={`Venue ${i+1}`} className="w-full h-40 object-cover rounded-md shadow-md"/>) }
                    </div>
                  ) : <p className="text-muted-foreground">No venue photos uploaded.</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-lg">Past Event Photos (Themes/Setup Styles)</h3>
                {isEditing ? (
                  <ImageUploader
                    title="Upload Photos of Past Events"
                    existingImages={getDetailValue('pastEventPhotoUrls', [])}
                    onFileSelect={handlePastEventFileSelect}
                    uploading={uploadingPastEvents}
                  />
                ) : (
                  venueData?.details?.pastEventPhotoUrls?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {venueData.details.pastEventPhotoUrls.map((url, i) => <img key={i} src={url} alt={`Past Event ${i+1}`} className="w-full h-40 object-cover rounded-md shadow-md"/>) }
                    </div>
                  ) : <p className="text-muted-foreground">No past event photos uploaded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="services">
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
        </TabsContent>
      </Tabs>

      {isEditing && (
        <div className="mt-8 pt-6 border-t flex justify-end space-x-3 sticky bottom-0 bg-background py-4 z-10">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;