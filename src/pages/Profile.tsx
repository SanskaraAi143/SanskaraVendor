import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
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
import { Loader2, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

// Assume ImageUploader component exists and works as described
// Placeholder for ImageUploader if not available
const ImageUploader: React.FC<{
  initialUrls?: string[];
  onUrlsChange: (urls: string[]) => void;
  bucketName: string;
  folderName?: string;
  label: string;
}> = ({ initialUrls, onUrlsChange, bucketName, folderName, label }) => {
  const [urls, setUrls] = useState(initialUrls || []);
  const handleAddUrl = () => {
    const newUrl = prompt("Enter image URL (placeholder uploader):");
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
    <div className="space-y-2">
      <Label>{label}</Label>
      {urls.map((url, index) => (
        <div key={index} className="flex items-center space-x-2 my-1">
          <Input type="text" value={url} readOnly className="flex-grow" aria-label={`Image URL ${index + 1}`} />
          <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveUrl(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={handleAddUrl} className="mt-2">
        <Plus className="h-4 w-4 mr-2" /> Add Image URL
      </Button>
      <p className="text-xs text-muted-foreground mt-1">
        Simulated uploader. Bucket: {bucketName}, Folder: {folderName || 'N/A'}
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
      
      const updatePayload = {
        vendor_name: editedData.vendor_name,
        vendor_category: editedData.vendor_category,
        contact_email: editedData.contact_email,
        phone_number: editedData.phone_number,
        website_url: editedData.website_url,
        description: editedData.description,
        address: editedData.address as any || {},
        details: editedData.details as any || {},
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


  const renderBasicInfo = () => (
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

  const renderAddressInfo = () => (
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

  const renderPricingInfo = () => (
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

        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">A. Rental & Booking Charges</h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="rentalIncluded" checked={!!getDetailValue('pricing.rentalIncludedInCatering', false)} onCheckedChange={checked => updateDetailField('pricing.rentalIncludedInCatering', !!checked)} />
                <Label htmlFor="rentalIncluded">Is Rental Included in Catering Charges?</Label>
              </div>
              {!getDetailValue('pricing.rentalIncludedInCatering', false) && (
                <>
                  <div className="space-y-2"><Label htmlFor="weekdayRate">Weekday Rate (Mon–Thu) ₹</Label><Input id="weekdayRate" value={getDetailValue('pricing.weekdayRate')} onChange={e => updateDetailField('pricing.weekdayRate', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="weekendRate">Weekend Rate (Fri–Sun) ₹</Label><Input id="weekendRate" value={getDetailValue('pricing.weekendRate')} onChange={e => updateDetailField('pricing.weekendRate', e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="auspiciousRate">Auspicious/Festival Dates Rate ₹</Label><Input id="auspiciousRate" value={getDetailValue('pricing.auspiciousRate')} onChange={e => updateDetailField('pricing.auspiciousRate', e.target.value)} /></div>
                  
                  <div className="space-y-2"><Label htmlFor="rentalDurationOptions">Rental Duration Options (comma-separated)</Label><Input id="rentalDurationOptions" placeholder="e.g., Half Day, Full Day, Per Hour" value={(getDetailValue('pricing.rentalDurationOptions', []) as string[]).join(', ')} onChange={e => updateDetailField('pricing.rentalDurationOptions', e.target.value.split(',').map(s => s.trim()))} /></div>
                  {(getDetailValue('pricing.rentalDurationOptions', []) as string[]).includes('Per Hour') && (
                    <div className="space-y-2"><Label htmlFor="perHourRate">Rate per hour ₹ (if applicable)</Label><Input id="perHourRate" value={getDetailValue('pricing.perHourRate')} onChange={e => updateDetailField('pricing.perHourRate', e.target.value)} /></div>
                  )}
                  <div className="space-y-2"><Label htmlFor="basicRentalInclusions">What is Included in the Basic Rental? (comma-separated)</Label><Input id="basicRentalInclusions" placeholder="e.g., Tables & Chairs, Basic Lighting" value={(getDetailValue('pricing.basicRentalInclusions', []) as string[]).join(', ')} onChange={e => updateDetailField('pricing.basicRentalInclusions', e.target.value.split(',').map(s => s.trim()))} /></div>
                  <div className="space-y-2"><Label htmlFor="basicRentalInclusionsOther">Other Inclusions</Label><Input id="basicRentalInclusionsOther" value={getDetailValue('pricing.basicRentalInclusionsOther')} onChange={e => updateDetailField('pricing.basicRentalInclusionsOther', e.target.value)} /></div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p><Label className="font-semibold">Rental Included in Catering:</Label> {venueData?.details?.pricing?.rentalIncludedInCatering ? 'Yes' : 'No'}</p>
              {!venueData?.details?.pricing?.rentalIncludedInCatering && <>
                <p><Label className="font-semibold">Weekday Rate:</Label> ₹{venueData?.details?.pricing?.weekdayRate || 'N/A'}</p>
                <p><Label className="font-semibold">Weekend Rate:</Label> ₹{venueData?.details?.pricing?.weekendRate || 'N/A'}</p>
                <p><Label className="font-semibold">Auspicious Rate:</Label> ₹{venueData?.details?.pricing?.auspiciousRate || 'N/A'}</p>
                <p><Label className="font-semibold">Duration Options:</Label> {(venueData?.details?.pricing?.rentalDurationOptions || []).join(', ') || 'N/A'}</p>
                {(venueData?.details?.pricing?.rentalDurationOptions || []).includes('Per Hour') && <p><Label className="font-semibold">Per Hour Rate:</Label> ₹{venueData?.details?.pricing?.perHourRate || 'N/A'}</p>}
                <p><Label className="font-semibold">Basic Inclusions:</Label> {(venueData?.details?.pricing?.basicRentalInclusions || []).join(', ') || 'N/A'}</p>
                {venueData?.details?.pricing?.basicRentalInclusionsOther && <p><Label className="font-semibold">Other Inclusions:</Label> {venueData.details.pricing.basicRentalInclusionsOther}</p>}
              </>}
            </div>
          )}
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">B. Food & Catering</h3>
          {isEditing ? (
            <div className="space-y-4">
               <div className="space-y-2"><Label htmlFor="cateringOptions">Catering Options Allowed</Label><Select value={getDetailValue('catering.options')} onValueChange={val => updateDetailField('catering.options', val)}>
                <SelectTrigger id="cateringOptions"><SelectValue placeholder="Catering Options Allowed" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-house Catering Only">In-house Catering Only</SelectItem>
                  <SelectItem value="Outside Caterers Allowed">Outside Caterers Allowed</SelectItem>
                  <SelectItem value="Both Allowed">Both Allowed</SelectItem>
                </SelectContent>
              </Select></div>
              {['Outside Caterers Allowed', 'Both Allowed'].includes(getDetailValue('catering.options')) && (
                <>
                  <div className="space-y-2"><Label htmlFor="approvedVendors">Any Tie-Ups or Approved Vendors?</Label><Textarea id="approvedVendors" value={getDetailValue('catering.outsideCaterersApprovedVendors')} onChange={e => updateDetailField('catering.outsideCaterersApprovedVendors', e.target.value)} /></div>
                  <div className="flex items-center space-x-2"><Checkbox id="royaltyFee" checked={!!getDetailValue('catering.outsideCaterersRoyaltyFee',false)} onCheckedChange={c => updateDetailField('catering.outsideCaterersRoyaltyFee', !!c)} /><Label htmlFor="royaltyFee">Royalty Fee Charged?</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="kitchenAccess" checked={!!getDetailValue('catering.outsideCaterersKitchenAccess',false)} onCheckedChange={c => updateDetailField('catering.outsideCaterersKitchenAccess', !!c)} /><Label htmlFor="kitchenAccess">Kitchen Access Provided?</Label></div>
                </>
              )}
              <Label>Price Per Plate (Veg) - Standard Range (Min-Max):</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input aria-label="Veg Standard Min Price" placeholder="Min ₹" value={getDetailValue('pricing.pricePerPlateVegStandard.min')} onChange={e => updateDetailField('pricing.pricePerPlateVegStandard.min', e.target.value)} />
                <Input aria-label="Veg Standard Max Price" placeholder="Max ₹" value={getDetailValue('pricing.pricePerPlateVegStandard.max')} onChange={e => updateDetailField('pricing.pricePerPlateVegStandard.max', e.target.value)} />
              </div>
              <Label>Price Per Plate (Veg) - Deluxe/Custom (Min-Max):</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input aria-label="Veg Deluxe Min Price" placeholder="Min ₹" value={getDetailValue('pricing.pricePerPlateVegDeluxe.min')} onChange={e => updateDetailField('pricing.pricePerPlateVegDeluxe.min', e.target.value)} />
                <Input aria-label="Veg Deluxe Max Price" placeholder="Max ₹" value={getDetailValue('pricing.pricePerPlateVegDeluxe.max')} onChange={e => updateDetailField('pricing.pricePerPlateVegDeluxe.max', e.target.value)} />
              </div>
              <Label>Price Per Plate (Non-Veg) - Standard Range (Min-Max):</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input aria-label="Non-Veg Standard Min Price" placeholder="Min ₹" value={getDetailValue('pricing.pricePerPlateNonVegStandard.min')} onChange={e => updateDetailField('pricing.pricePerPlateNonVegStandard.min', e.target.value)} />
                <Input aria-label="Non-Veg Standard Max Price" placeholder="Max ₹" value={getDetailValue('pricing.pricePerPlateNonVegStandard.max')} onChange={e => updateDetailField('pricing.pricePerPlateNonVegStandard.max', e.target.value)} />
              </div>
              <Label>Price Per Plate (Non-Veg) - Deluxe/Custom (Min-Max):</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input aria-label="Non-Veg Deluxe Min Price" placeholder="Min ₹" value={getDetailValue('pricing.pricePerPlateNonVegDeluxe.min')} onChange={e => updateDetailField('pricing.pricePerPlateNonVegDeluxe.min', e.target.value)} />
                <Input aria-label="Non-Veg Deluxe Max Price" placeholder="Max ₹" value={getDetailValue('pricing.pricePerPlateNonVegDeluxe.max')} onChange={e => updateDetailField('pricing.pricePerPlateNonVegDeluxe.max', e.target.value)} />
              </div>
              
              <div className="space-y-2"><Label htmlFor="cuisineSpecialties">Cuisine Specialties Offered (comma-separated)</Label><Input id="cuisineSpecialties" placeholder="e.g., North Indian, Chinese" value={(getDetailValue('catering.cuisineSpecialties', []) as string[]).join(', ')} onChange={e => updateDetailField('catering.cuisineSpecialties', e.target.value.split(',').map(s => s.trim()))} /></div>
              <div className="space-y-2"><Label htmlFor="cuisineSpecialtiesOther">Other Cuisine</Label><Input id="cuisineSpecialtiesOther" value={getDetailValue('catering.cuisineSpecialtiesOther')} onChange={e => updateDetailField('catering.cuisineSpecialtiesOther', e.target.value)} /></div>
              
              <div className="space-y-2"><Label htmlFor="menuCustomization">Menu Customization Allowed?</Label><Select value={getDetailValue('catering.menuCustomization')} onValueChange={val => updateDetailField('catering.menuCustomization', val)}>
                <SelectTrigger id="menuCustomization"><SelectValue placeholder="Menu Customization Allowed?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select></div>
              <ImageUploader
                label="Upload Sample Menus (PDF/Images)"
                initialUrls={getDetailValue('sampleMenuUrls', [])}
                onUrlsChange={(urls) => updateDetailField('sampleMenuUrls', urls)}
                bucketName="vendors" 
                folderName={`${venueData?.vendor_id}/sample-menus`}
              />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p><Label className="font-semibold">Catering Options:</Label> {venueData?.details?.catering?.options || 'N/A'}</p>
              {['Outside Caterers Allowed', 'Both Allowed'].includes(venueData?.details?.catering?.options || '') && (
                <>
                  <p><Label className="font-semibold">Approved Vendors:</Label> {venueData?.details?.catering?.outsideCaterersApprovedVendors || 'N/A'}</p>
                  <p><Label className="font-semibold">Royalty Fee:</Label> {venueData?.details?.catering?.outsideCaterersRoyaltyFee ? 'Yes' : 'No'}</p>
                  <p><Label className="font-semibold">Kitchen Access:</Label> {venueData?.details?.catering?.outsideCaterersKitchenAccess ? 'Yes' : 'No'}</p>
                </>
              )}
              <p><Label className="font-semibold">Veg Standard Price:</Label> ₹{venueData?.details?.pricing?.pricePerPlateVegStandard?.min || 'N/A'} - ₹{venueData?.details?.pricing?.pricePerPlateVegStandard?.max || 'N/A'}</p>
              <p><Label className="font-semibold">Veg Deluxe Price:</Label> ₹{venueData?.details?.pricing?.pricePerPlateVegDeluxe?.min || 'N/A'} - ₹{venueData?.details?.pricing?.pricePerPlateVegDeluxe?.max || 'N/A'}</p>
              <p><Label className="font-semibold">Non-Veg Standard Price:</Label> ₹{venueData?.details?.pricing?.pricePerPlateNonVegStandard?.min || 'N/A'} - ₹{venueData?.details?.pricing?.pricePerPlateNonVegStandard?.max || 'N/A'}</p>
              <p><Label className="font-semibold">Non-Veg Deluxe Price:</Label> ₹{venueData?.details?.pricing?.pricePerPlateNonVegDeluxe?.min || 'N/A'} - ₹{venueData?.details?.pricing?.pricePerPlateNonVegDeluxe?.max || 'N/A'}</p>
              <p><Label className="font-semibold">Cuisine Specialties:</Label> {(venueData?.details?.catering?.cuisineSpecialties || []).join(', ') || 'N/A'}</p>
              {venueData?.details?.catering?.cuisineSpecialtiesOther && <p><Label className="font-semibold">Other Cuisine:</Label> {venueData.details.catering.cuisineSpecialtiesOther}</p>}
              <p><Label className="font-semibold">Menu Customization:</Label> {venueData?.details?.catering?.menuCustomization || 'N/A'}</p>
              <div><Label className="font-semibold">Sample Menus:</Label> {venueData?.details?.sampleMenuUrls?.length ? venueData.details.sampleMenuUrls.map((url,i) => <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 block hover:underline">{`Menu ${i+1}`}</a>) : 'N/A'}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  const renderAmenitiesInfo = () => (
    <Card>
      <CardHeader><CardTitle>Amenities & Event Services</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Parking</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="parkingCars">Capacity (Cars)</Label><Input id="parkingCars" type="text" value={getDetailValue('amenities.parkingCars')} onChange={e => updateDetailField('amenities.parkingCars', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="parkingTwoWheelers">Capacity (2-Wheelers)</Label><Input id="parkingTwoWheelers" type="text" value={getDetailValue('amenities.parkingTwoWheelers')} onChange={e => updateDetailField('amenities.parkingTwoWheelers', e.target.value)} /></div>
            </div>
            <div className="flex items-center space-x-2"><Checkbox id="valetParking" checked={!!getDetailValue('amenities.valetParkingAvailable',false)} onCheckedChange={c => updateDetailField('amenities.valetParkingAvailable', !!c)} /><Label htmlFor="valetParking">Valet Parking Available?</Label></div>
            {!!getDetailValue('amenities.valetParkingAvailable') && <div className="space-y-2"><Label htmlFor="valetParkingCost">Additional Cost for Valet ₹</Label><Input id="valetParkingCost" value={getDetailValue('amenities.valetParkingCost')} onChange={e => updateDetailField('amenities.valetParkingCost', e.target.value)} /></div>}

            <h4 className="font-semibold text-lg mt-4">Rooms Availability</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="totalRooms">Total Rooms Available</Label><Input id="totalRooms" type="text" value={getDetailValue('amenities.totalRooms')} onChange={e => updateDetailField('amenities.totalRooms', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="acRooms">AC Rooms</Label><Input id="acRooms" type="text" value={getDetailValue('amenities.acRooms')} onChange={e => updateDetailField('amenities.acRooms', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="nonAcRooms">Non-AC Rooms</Label><Input id="nonAcRooms" type="text" value={getDetailValue('amenities.nonAcRooms')} onChange={e => updateDetailField('amenities.nonAcRooms', e.target.value)} /></div>
            </div>
            <div className="flex items-center space-x-2"><Checkbox id="complimentaryRooms" checked={!!getDetailValue('amenities.complimentaryRoomsOffered',false)} onCheckedChange={c => updateDetailField('amenities.complimentaryRoomsOffered', !!c)} /><Label htmlFor="complimentaryRooms">Complimentary Rooms Offered?</Label></div>
            {!!getDetailValue('amenities.complimentaryRoomsOffered') && <div className="space-y-2"><Label htmlFor="extraRoomCharges">Extra Room Charges ₹</Label><Input id="extraRoomCharges" value={getDetailValue('amenities.extraRoomCharges')} onChange={e => updateDetailField('amenities.extraRoomCharges', e.target.value)} /></div>}
            <div className="space-y-2"><Label htmlFor="roomAmenities">Room Amenities (comma-separated)</Label><Input id="roomAmenities" placeholder="AC/Fan, Attached Washroom..." value={(getDetailValue('amenities.roomAmenities', []) as string[]).join(', ')} onChange={e => updateDetailField('amenities.roomAmenities', e.target.value.split(',').map(s => s.trim()))} /></div>
            <div className="space-y-2"><Label htmlFor="roomAmenitiesOther">Other Room Amenities</Label><Input id="roomAmenitiesOther" value={getDetailValue('amenities.roomAmenitiesOther')} onChange={e => updateDetailField('amenities.roomAmenitiesOther', e.target.value)} /></div>
            
            <div className="flex items-center space-x-2 mt-4"><Checkbox id="wifiAvailable" checked={!!getDetailValue('amenities.wifiAvailable',false)} onCheckedChange={c => updateDetailField('amenities.wifiAvailable', !!c)} /><Label htmlFor="wifiAvailable">Wi-Fi Availability?</Label></div>

            <h4 className="font-semibold text-lg mt-4">Power Backup</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="generatorCapacity">Generator Capacity (kVA)</Label><Input id="generatorCapacity" value={getDetailValue('amenities.powerBackupCapacity')} onChange={e => updateDetailField('amenities.powerBackupCapacity', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="generatorDuration">Duration Supported (Hours)</Label><Input id="generatorDuration" value={getDetailValue('amenities.powerBackupDuration')} onChange={e => updateDetailField('amenities.powerBackupDuration', e.target.value)} /></div>
            </div>

            <h4 className="font-semibold text-lg mt-4">Audio/Visual</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="soundSystem">Sound System</Label><Select value={getDetailValue('amenities.soundSystem')} onValueChange={val => updateDetailField('amenities.soundSystem', val)}>
                <SelectTrigger id="soundSystem"><SelectValue placeholder="Sound System" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes - Included">Yes - Included</SelectItem>
                  <SelectItem value="Yes - Extra">Yes - Extra Cost</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select></div>
              <div className="space-y-2"><Label htmlFor="projectorScreen">Projector & Screen</Label><Select value={getDetailValue('amenities.projectorScreen')} onValueChange={val => updateDetailField('amenities.projectorScreen', val)}>
                <SelectTrigger id="projectorScreen"><SelectValue placeholder="Projector & Screen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes - Included">Yes - Included</SelectItem>
                  <SelectItem value="Yes - Extra">Yes - Extra Cost</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="djServices">DJ Services</Label><Select value={getDetailValue('amenities.djServices')} onValueChange={val => updateDetailField('amenities.djServices', val)}>
              <SelectTrigger id="djServices"><SelectValue placeholder="DJ Services" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="In-house">In-house</SelectItem>
                <SelectItem value="Outside Allowed">Outside Allowed</SelectItem>
                <SelectItem value="Not Allowed">Not Allowed</SelectItem>
              </SelectContent>
            </Select></div>
            {getDetailValue('amenities.djServices') === 'In-house' && <div className="space-y-2"><Label htmlFor="djCostInHouse">DJ Cost if In-house ₹</Label><Input id="djCostInHouse" value={getDetailValue('amenities.djCostInHouse')} onChange={e => updateDetailField('amenities.djCostInHouse', e.target.value)} /></div>}
            
            <h4 className="font-semibold text-lg mt-4">Washroom Facilities</h4>
            <div className="space-y-2"><Label htmlFor="washroomsNumber">Number of Washrooms</Label><Input id="washroomsNumber" value={getDetailValue('amenities.washroomsNumber')} onChange={e => updateDetailField('amenities.washroomsNumber', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="washroomsCleanliness">Cleanliness & Accessibility Description</Label><Textarea id="washroomsCleanliness" value={getDetailValue('amenities.washroomsCleanlinessDescription')} onChange={e => updateDetailField('amenities.washroomsCleanlinessDescription', e.target.value)} /></div>

            <h4 className="font-semibold text-lg mt-4">Accessibility</h4>
            <div className="flex items-center space-x-2"><Checkbox id="wheelchairAccess" checked={!!getDetailValue('amenities.wheelchairAccessAvailable',false)} onCheckedChange={c => updateDetailField('amenities.wheelchairAccessAvailable', !!c)} /><Label htmlFor="wheelchairAccess">Wheelchair Access Available?</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="elevatorForGuests" checked={!!getDetailValue('amenities.elevatorForGuests',false)} onCheckedChange={c => updateDetailField('amenities.elevatorForGuests', !!c)} /><Label htmlFor="elevatorForGuests">Elevator for Guests?</Label></div>

            <h4 className="font-semibold text-lg mt-4">Event Staffing</h4>
            <div className="space-y-2"><Label htmlFor="eventStaffNumber">Number of Staff Provided</Label><Input id="eventStaffNumber" value={getDetailValue('amenities.eventStaffNumber')} onChange={e => updateDetailField('amenities.eventStaffNumber', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="eventStaffServices">Services Covered by Staff</Label><Textarea id="eventStaffServices" value={getDetailValue('amenities.eventStaffServicesCovered')} onChange={e => updateDetailField('amenities.eventStaffServicesCovered', e.target.value)} /></div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div><h4 className="font-semibold">Parking:</h4>
              <p>Cars: {venueData?.details?.amenities?.parkingCars || 'N/A'}, 2-Wheelers: {venueData?.details?.amenities?.parkingTwoWheelers || 'N/A'}</p>
              <p>Valet: {venueData?.details?.amenities?.valetParkingAvailable ? `Yes (Cost: ₹${venueData?.details?.amenities?.valetParkingCost || 'N/A'})` : 'No'}</p>
            </div>
            <div><h4 className="font-semibold">Rooms:</h4>
              <p>Total: {venueData?.details?.amenities?.totalRooms || 'N/A'}, AC: {venueData?.details?.amenities?.acRooms || 'N/A'}, Non-AC: {venueData?.details?.amenities?.nonAcRooms || 'N/A'}</p>
              <p>Complimentary: {venueData?.details?.amenities?.complimentaryRoomsOffered ? `Yes (Extra Charges: ₹${venueData?.details?.amenities?.extraRoomCharges || 'N/A'})` : 'No'}</p>
              <p>Room Amenities: {(venueData?.details?.amenities?.roomAmenities || []).join(', ') || 'N/A'}. Other: {venueData?.details?.amenities?.roomAmenitiesOther || 'N/A'}</p>
            </div>
            <p><Label className="font-semibold">WiFi:</Label> {venueData?.details?.amenities?.wifiAvailable ? 'Available' : 'Not Available'}</p>
            <div><h4 className="font-semibold">Power Backup:</h4>
              <p>Capacity: {venueData?.details?.amenities?.powerBackupCapacity || 'N/A'} kVA, Duration: {venueData?.details?.amenities?.powerBackupDuration || 'N/A'} Hours</p>
            </div>
            <div><h4 className="font-semibold">Audio/Visual:</h4>
              <p>Sound System: {venueData?.details?.amenities?.soundSystem || 'N/A'}, Projector: {venueData?.details?.amenities?.projectorScreen || 'N/A'}</p>
              <p>DJ Services: {venueData?.details?.amenities?.djServices || 'N/A'} {venueData?.details?.amenities?.djServices === 'In-house' ? `(Cost: ₹${venueData?.details?.amenities?.djCostInHouse || 'N/A'})` : ''}</p>
            </div>
            <div><h4 className="font-semibold">Washrooms:</h4>
              <p>Number: {venueData?.details?.amenities?.washroomsNumber || 'N/A'}. Desc: {venueData?.details?.amenities?.washroomsCleanlinessDescription || 'N/A'}</p>
            </div>
            <div><h4 className="font-semibold">Accessibility:</h4>
              <p>Wheelchair: {venueData?.details?.amenities?.wheelchairAccessAvailable ? 'Yes' : 'No'}, Elevator: {venueData?.details?.amenities?.elevatorForGuests ? 'Yes' : 'No'}</p>
            </div>
             <div><h4 className="font-semibold">Event Staffing:</h4>
              <p>Number: {venueData?.details?.amenities?.eventStaffNumber || 'N/A'}. Services: {venueData?.details?.amenities?.eventStaffServicesCovered || 'N/A'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderPolicies = () => (
    <Card>
      <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">Alcohol Policy</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2"><Checkbox id="alcoholAllowed" checked={!!getDetailValue('alcoholPolicy.allowed',false)} onCheckedChange={c => updateDetailField('alcoholPolicy.allowed', !!c)} /><Label htmlFor="alcoholAllowed">Is Alcohol Allowed?</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="inHouseBar" checked={!!getDetailValue('alcoholPolicy.inHouseBar',false)} onCheckedChange={c => updateDetailField('alcoholPolicy.inHouseBar', !!c)} /><Label htmlFor="inHouseBar">In-house Bar Available?</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="permitRequired" checked={!!getDetailValue('alcoholPolicy.permitRequired',false)} onCheckedChange={c => updateDetailField('alcoholPolicy.permitRequired', !!c)} /><Label htmlFor="permitRequired">Permit Required?</Label></div>
              <div className="space-y-2">
                <Label htmlFor="corkageFeeApplicable">Corkage Fee Applicable?</Label>
                <Select 
                  value={getDetailValue('alcoholPolicy.corkageFeeApplicable')} 
                  onValueChange={val => updateDetailField('alcoholPolicy.corkageFeeApplicable', val)}
                >
                  <SelectTrigger id="corkageFeeApplicable">
                    <SelectValue placeholder="Corkage Fee Applicable?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Specify">Yes, specify amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {getDetailValue('alcoholPolicy.corkageFeeApplicable') === 'Specify' && <div className="space-y-2"><Label htmlFor="corkageFeeAmount">Corkage Fee Amount ₹</Label><Input id="corkageFeeAmount" value={getDetailValue('alcoholPolicy.corkageFeeAmount')} onChange={e => updateDetailField('alcoholPolicy.corkageFeeAmount', e.target.value)} /></div>}
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p><Label className="font-semibold">Allowed:</Label> {venueData?.details?.alcoholPolicy?.allowed ? 'Yes' : 'No'}</p>
              <p><Label className="font-semibold">In-house Bar:</Label> {venueData?.details?.alcoholPolicy?.inHouseBar ? 'Yes' : 'No'}</p>
              <p><Label className="font-semibold">Permit Required:</Label> {venueData?.details?.alcoholPolicy?.permitRequired ? 'Yes' : 'No'}</p>
              <p><Label className="font-semibold">Corkage Fee:</Label> {venueData?.details?.alcoholPolicy?.corkageFeeApplicable || 'N/A'} {venueData?.details?.alcoholPolicy?.corkageFeeApplicable === 'Specify' ? `(Amount: ₹${venueData?.details?.alcoholPolicy?.corkageFeeAmount || 'N/A'})` : ''}</p>
            </div>
          )}
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">Decoration Policy</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="decorationOptions">Decoration Options</Label>
                <Select 
                  value={getDetailValue('decoration.options')} 
                  onValueChange={val => updateDetailField('decoration.options', val)}
                >
                  <SelectTrigger id="decorationOptions">
                    <SelectValue placeholder="Decoration Options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-house Decorator Only">In-house Decorator Only</SelectItem>
                    <SelectItem value="Outside Decorators Allowed">Outside Decorators Allowed</SelectItem>
                    <SelectItem value="Both Allowed">Both Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="restrictionsOutside">Restrictions for Outside Decorators?</Label><Textarea id="restrictionsOutside" value={getDetailValue('decoration.restrictionsOutside')} onChange={e => updateDetailField('decoration.restrictionsOutside', e.target.value)} /></div>
              <div className="flex items-center space-x-2"><Checkbox id="basicDecorIncluded" checked={!!getDetailValue('decoration.basicIncluded',false)} onCheckedChange={c => updateDetailField('decoration.basicIncluded', !!c)} /><Label htmlFor="basicDecorIncluded">Basic Decor Included?</Label></div>
              {!!getDetailValue('decoration.basicIncluded') && <div className="space-y-2"><Label htmlFor="basicIncludedDetails">What’s Included in Basic Decor?</Label><Input id="basicIncludedDetails" value={getDetailValue('decoration.basicIncludedDetails')} onChange={e => updateDetailField('decoration.basicIncludedDetails', e.target.value)} /></div>}
              <Label>Standard Decor Packages Price Range (Min-Max):</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input aria-label="Standard Decor Min Price" placeholder="Min ₹" value={getDetailValue('decoration.standardPackagesPriceRange.min')} onChange={e => updateDetailField('decoration.standardPackagesPriceRange.min', e.target.value)} />
                <Input aria-label="Standard Decor Max Price" placeholder="Max ₹" value={getDetailValue('decoration.standardPackagesPriceRange.max')} onChange={e => updateDetailField('decoration.standardPackagesPriceRange.max', e.target.value)} />
              </div>
              <div className="space-y-2"><Label htmlFor="standardThemes">Themes/Styles Offered (Standard)</Label><Textarea id="standardThemes" value={getDetailValue('decoration.standardPackagesThemes')} onChange={e => updateDetailField('decoration.standardPackagesThemes', e.target.value)} /></div>
              <div className="flex items-center space-x-2"><Checkbox id="customizationAllowed" checked={!!getDetailValue('decoration.customizationAllowed',false)} onCheckedChange={c => updateDetailField('decoration.customizationAllowed', !!c)} /><Label htmlFor="customizationAllowed">Customization Allowed in Decoration?</Label></div>
              {!!getDetailValue('decoration.customizationAllowed') && <div className="space-y-2"><Label htmlFor="popularThemesCustom">Popular Themes with Price Range (Custom)</Label><Textarea id="popularThemesCustom" value={getDetailValue('decoration.customizationPopularThemes')} onChange={e => updateDetailField('decoration.customizationPopularThemes', e.target.value)} /></div>}
            </div>
          ) : (
             <div className="text-sm space-y-1">
              <p><Label className="font-semibold">Options:</Label> {venueData?.details?.decoration?.options || 'N/A'}</p>
              <p><Label className="font-semibold">Restrictions Outside:</Label> {venueData?.details?.decoration?.restrictionsOutside || 'N/A'}</p>
              <p><Label className="font-semibold">Basic Included:</Label> {venueData?.details?.decoration?.basicIncluded ? `Yes (${venueData?.details?.decoration?.basicIncludedDetails || 'Details N/A'})` : 'No'}</p>
              <p><Label className="font-semibold">Standard Packages Price:</Label> ₹{venueData?.details?.decoration?.standardPackagesPriceRange?.min || 'N/A'} - ₹{venueData?.details?.decoration?.standardPackagesPriceRange?.max || 'N/A'}</p>
              <p><Label className="font-semibold">Standard Themes:</Label> {venueData?.details?.decoration?.standardPackagesThemes || 'N/A'}</p>
              <p><Label className="font-semibold">Customization:</Label> {venueData?.details?.decoration?.customizationAllowed ? `Yes (${venueData?.details?.decoration?.customizationPopularThemes || 'Details N/A'})` : 'No'}</p>
            </div>
          )}
        </div>
        
        <div className="border p-4 rounded-md">
            <h3 className="font-semibold mb-3">Taxes & Payment</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2"><Checkbox id="gstApplied" checked={!!getDetailValue('taxesPayment.gstApplied',false)} onCheckedChange={c => updateDetailField('taxesPayment.gstApplied', !!c)} /><Label htmlFor="gstApplied">GST Applied?</Label></div>
                {!!getDetailValue('taxesPayment.gstApplied') && <div className="space-y-2"><Label htmlFor="gstPercentage">GST %</Label><Input id="gstPercentage" value={getDetailValue('taxesPayment.gstPercentage')} onChange={e => updateDetailField('taxesPayment.gstPercentage', e.target.value)} /></div>}
                <div className="space-y-2"><Label htmlFor="otherCharges">Other Charges/Hidden Fees (if any):</Label><Textarea id="otherCharges" value={getDetailValue('taxesPayment.otherCharges')} onChange={e => updateDetailField('taxesPayment.otherCharges', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="advanceBookingAmount">Advance Booking Amount (% of Total / Flat ₹):</Label><Input id="advanceBookingAmount" value={getDetailValue('taxesPayment.advanceBookingAmount')} onChange={e => updateDetailField('taxesPayment.advanceBookingAmount', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="paymentTerms">Payment Terms & Schedule:</Label><Textarea id="paymentTerms" value={getDetailValue('taxesPayment.paymentTerms')} onChange={e => updateDetailField('taxesPayment.paymentTerms', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="cancellationPolicy">Cancellation & Refund Policy:</Label><Textarea id="cancellationPolicy" value={getDetailValue('taxesPayment.cancellationPolicy')} onChange={e => updateDetailField('taxesPayment.cancellationPolicy', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="acceptedPaymentModes">Accepted Payment Modes (comma-separated)</Label><Input id="acceptedPaymentModes" placeholder="UPI, Bank Transfer..." value={(getDetailValue('taxesPayment.acceptedPaymentModes', []) as string[]).join(', ')} onChange={e => updateDetailField('taxesPayment.acceptedPaymentModes', e.target.value.split(',').map(s => s.trim()))} /></div>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <p><Label className="font-semibold">GST Applied:</Label> {venueData?.details?.taxesPayment?.gstApplied ? `Yes (${venueData?.details?.taxesPayment?.gstPercentage || 'N/A'}%)` : 'No'}</p>
                <p><Label className="font-semibold">Other Charges:</Label> {venueData?.details?.taxesPayment?.otherCharges || 'N/A'}</p>
                <p><Label className="font-semibold">Advance Amount:</Label> {venueData?.details?.taxesPayment?.advanceBookingAmount || 'N/A'}</p>
                <p><Label className="font-semibold">Payment Terms:</Label> {venueData?.details?.taxesPayment?.paymentTerms || 'N/A'}</p>
                <p><Label className="font-semibold">Cancellation Policy:</Label> {venueData?.details?.taxesPayment?.cancellationPolicy || 'N/A'}</p>
                <p><Label className="font-semibold">Accepted Modes:</Label> {(venueData?.details?.taxesPayment?.acceptedPaymentModes || []).join(', ') || 'N/A'}</p>
              </div>
            )}
        </div>
        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">Venue Rules</h3>
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="venueRules">Any Venue Rules or Restrictions Clients Must Know?</Label>
              <Textarea id="venueRules" value={getDetailValue('venueRules')} onChange={(e) => updateDetailField('venueRules', e.target.value)} rows={3}/>
            </div>
          ) : (
            <p className="text-sm">{venueData?.details?.venueRules || 'N/A'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRitualAiInfo = () => (
    <Card>
      <CardHeader><CardTitle>Ritual, AI & Operational Data</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">Ritual & Cultural Support</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="fireHawanAllowed">Is Fire/Hawan Ritual Allowed?</Label>
                <Select 
                  value={getDetailValue('ritualCultural.fireHawanAllowed')} 
                  onValueChange={val => updateDetailField('ritualCultural.fireHawanAllowed', val)}
                >
                  <SelectTrigger id="fireHawanAllowed">
                    <SelectValue placeholder="Is Fire/Hawan Ritual Allowed?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Not Allowed">Not Allowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="mandapSetupRestrictions">Mandap Setup Location Preferences or Restrictions</Label><Textarea id="mandapSetupRestrictions" value={getDetailValue('ritualCultural.mandapSetupRestrictions')} onChange={e => updateDetailField('ritualCultural.mandapSetupRestrictions', e.target.value)} /></div>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p><Label className="font-semibold">Fire/Hawan:</Label> {venueData?.details?.ritualCultural?.fireHawanAllowed || 'N/A'}</p>
              <p><Label className="font-semibold">Mandap Setup:</Label> {venueData?.details?.ritualCultural?.mandapSetupRestrictions || 'N/A'}</p>
            </div>
          )}
        </div>

        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-3">AI-Specific + Operational Data</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentBookingSystem">Current Booking & Calendar Management System</Label>
                <Select 
                  value={getDetailValue('aiOperational.currentBookingSystem')} 
                  onValueChange={val => updateDetailField('aiOperational.currentBookingSystem', val)}
                >
                  <SelectTrigger id="currentBookingSystem">
                    <SelectValue placeholder="Current Booking System" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual (Notebook/Phone)</SelectItem>
                    <SelectItem value="Google Calendar">Google Calendar</SelectItem>
                    <SelectItem value="CRM Software">CRM Software</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {getDetailValue('aiOperational.currentBookingSystem') === 'CRM Software' && <div className="space-y-2"><Label htmlFor="crmSoftwareName">CRM Software Name</Label><Input id="crmSoftwareName" value={getDetailValue('aiOperational.crmSoftwareName')} onChange={e => updateDetailField('aiOperational.crmSoftwareName', e.target.value)} /></div>}
              {getDetailValue('aiOperational.currentBookingSystem') === 'Other' && <div className="space-y-2"><Label htmlFor="otherBookingSystemName">Other Booking System Name</Label><Input id="otherBookingSystemName" value={getDetailValue('aiOperational.otherBookingSystemName')} onChange={e => updateDetailField('aiOperational.otherBookingSystemName', e.target.value)} /></div>}
              <div className="flex items-center space-x-2"><Checkbox id="willingToIntegrate" checked={!!getDetailValue('aiOperational.willingToIntegrateSanskara',false)} onCheckedChange={c => updateDetailField('aiOperational.willingToIntegrateSanskara', !!c)} /><Label htmlFor="willingToIntegrate">Willing to Integrate with SanskaraAi App/Portal?</Label></div>
              <div className="space-y-2"><Label htmlFor="idealClientProfile">Ideal Client Profile (type of events, budget preferences)</Label><Textarea id="idealClientProfile" value={getDetailValue('aiOperational.idealClientProfile')} onChange={e => updateDetailField('aiOperational.idealClientProfile', e.target.value)} /></div>
              <div className="space-y-2">
                <Label htmlFor="flexibilityLevel">Flexibility Level (1-5)</Label>
                <Select 
                  value={getDetailValue('aiOperational.flexibilityLevel')} 
                  onValueChange={val => updateDetailField('aiOperational.flexibilityLevel', val)}
                >
                  <SelectTrigger id="flexibilityLevel">
                    <SelectValue placeholder="Flexibility Level" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="1">1 - Very rigid</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3 - Neutral</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 - Very flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiMenuDecorSuggestions">Allow AI to Suggest Menu or Decor Based on Client Profiles?</Label>
                <Select 
                  value={getDetailValue('aiOperational.aiMenuDecorSuggestions')} 
                  onValueChange={val => updateDetailField('aiOperational.aiMenuDecorSuggestions', val)}
                >
                  <SelectTrigger id="aiMenuDecorSuggestions">
                    <SelectValue placeholder="AI Suggestions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Needs Approval">Needs Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredLeadMode">Preferred Mode of Receiving Leads/Bookings</Label>
                <Select 
                  value={getDetailValue('aiOperational.preferredLeadMode')} 
                  onValueChange={val => updateDetailField('aiOperational.preferredLeadMode', val)}
                >
                  <SelectTrigger id="preferredLeadMode">
                    <SelectValue placeholder="Preferred Lead Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="In-App Dashboard">In-App Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p><Label className="font-semibold">Booking System:</Label> {venueData?.details?.aiOperational?.currentBookingSystem || 'N/A'}
                {venueData?.details?.aiOperational?.currentBookingSystem === 'CRM Software' && ` (${venueData?.details?.aiOperational?.crmSoftwareName || 'N/A'})`}
                {venueData?.details?.aiOperational?.currentBookingSystem === 'Other' && ` (${venueData?.details?.aiOperational?.otherBookingSystemName || 'N/A'})`}
              </p>
              <p><Label className="font-semibold">Integrate SanskaraAi:</Label> {venueData?.details?.aiOperational?.willingToIntegrateSanskara ? 'Yes' : 'No'}</p>
              <p><Label className="font-semibold">Ideal Client:</Label> {venueData?.details?.aiOperational?.idealClientProfile || 'N/A'}</p>
              <p><Label className="font-semibold">Flexibility:</Label> {venueData?.details?.aiOperational?.flexibilityLevel || 'N/A'}</p>
              <p><Label className="font-semibold">AI Suggestions:</Label> {venueData?.details?.aiOperational?.aiMenuDecorSuggestions || 'N/A'}</p>
              <p><Label className="font-semibold">Preferred Lead Mode:</Label> {venueData?.details?.aiOperational?.preferredLeadMode || 'N/A'}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  const renderPhotosTab = () => (
    <Card>
      <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2 text-lg">Venue Photos & Videos (Main Portfolio)</h3>
          {isEditing ? (
            <ImageUploader
              label="Upload High-Quality Photos & Videos of Venue"
              initialUrls={editedData.portfolio_image_urls || []}
              onUrlsChange={(urls) => updateField('portfolio_image_urls', urls)}
              bucketName="vendors" 
              folderName={`${venueData?.vendor_id}/portfolio`}
            />
          ) : (
            venueData?.portfolio_image_urls?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {venueData.portfolio_image_urls.map((url, i) => <img key={i} src={url} alt={`Venue ${i+1}`} className="w-full h-40 object-cover rounded-md shadow-md"/>)}
              </div>
            ) : <p className="text-muted-foreground">No venue photos uploaded.</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-lg">Past Event Photos (Themes/Setup Styles)</h3>
          {isEditing ? (
            <ImageUploader
              label="Upload Photos of Past Events"
              initialUrls={getDetailValue('pastEventPhotoUrls', [])}
              onUrlsChange={(urls) => updateDetailField('pastEventPhotoUrls', urls)}
              bucketName="vendors"
              folderName={`${venueData?.vendor_id}/past-events`}
            />
          ) : (
            venueData?.details?.pastEventPhotoUrls?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {venueData.details.pastEventPhotoUrls.map((url, i) => <img key={i} src={url} alt={`Past Event ${i+1}`} className="w-full h-40 object-cover rounded-md shadow-md"/>)}
              </div>
            ) : <p className="text-muted-foreground">No past event photos uploaded.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderServicesInfo = () => (
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
                          // Display key aspects from Section II of onboarding form
                          return `Type: ${parsed.typeOfSpace || 'N/A'} ${parsed.otherTypeOfSpace ? `(${parsed.otherTypeOfSpace})` : ''}\n` +
                                 `Area: ${parsed.areaSqFt || 'N/A'} sq.ft.\n` +
                                 `AC: ${parsed.airConditioning || 'N/A'}\n` +
                                 `Stage: ${parsed.stageAvailable ? `Yes (${parsed.stageDimensions || 'N/A'})` : 'No'}\n` +
                                 `Dance Floor: ${parsed.danceFloorAvailable ? `Yes (${parsed.danceFloorSizeSqFt || 'N/A'} sq.ft.)` : 'No'}\n` +
                                 `Seating - Theatre: ${parsed.seatingTheatre || 'N/A'}, Banquet: ${parsed.seatingBanquet || 'N/A'}, Floating: ${parsed.seatingFloating || 'N/A'}\n`+
                                 `Dining: ${parsed.separateDiningHall ? `Separate (Capacity: ${parsed.diningCapacity || 'N/A'})` : 'Integrated/No Separate'}\n` +
                                 `Ambience: ${parsed.ambienceDescription || 'N/A'}`;
                        } catch {
                          return service.customizability_details; // Show raw if not parsable as expected
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