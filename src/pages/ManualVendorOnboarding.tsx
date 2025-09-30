import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { FileInput } from '@/components/ui/file-input';
import { Loader2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

interface HallDetails {
  id: string;
  name: string;
  type: string;
  otherType: string;
  seatingCapacity: {
    theatre: string;
    roundTable: string;
    floating: string;
  };
  diningArrangement: {
    separateDining: boolean;
    diningCapacity: string;
  };
  area: string;
  airConditioning: string;
  stage: {
    available: boolean;
    dimensions: string;
  };
  danceFloor: {
    available: boolean;
    size: string;
  };
  ambience: string;
}

interface VenueFormData {
  // Basic Information
  venueName: string;
  fullAddress: string;
  contactPersonName: string;
  directPhoneNumbers: string;
  emailAddress: string;
  websiteLinks: string;
  yearsInOperation: string;
  
  // Hall Details
  halls: HallDetails[];
  
  // Pricing & Packages
  rentalIncludedInCatering: boolean;
  rentalCharges: {
    weekday: string;
    weekend: string;
    festival: string;
  };
  rentalDuration: string[];
  hourlyRate: string;
  basicRentalIncludes: string[];
  
  // Catering
  cateringOptions: string;
  outsideCaterersDetails: {
    tieUps: string;
    royaltyFee: boolean;
    kitchenAccess: boolean;
  };
  pricing: {
    vegStandard: { min: string; max: string };
    vegDeluxe: { min: string; max: string };
    nonVegStandard: { min: string; max: string };
    nonVegDeluxe: { min: string; max: string };
  };
  cuisineSpecialties: string[];
  menuCustomization: string;
  
  // Alcohol Policy
  alcoholAllowed: boolean;
  inHouseBar: boolean;
  permitRequired: boolean;
  corkageFee: {
    applicable: boolean;
    amount: string;
  };
  
  // Decoration
  decorationOptions: string;
  outsideDecoratorRestrictions: string;
  basicDecorIncluded: boolean;
  basicDecorDetails: string;
  decorPackages: {
    priceRange: { min: string; max: string };
    themes: string;
  };
  decorCustomization: boolean;
  popularThemes: string;
  
  // Taxes & Payment
  gstApplied: boolean;
  gstPercentage: string;
  otherCharges: string;
  advanceBooking: string;
  paymentTerms: string;
  cancellationPolicy: string;
  paymentModes: string[];
  
  // Amenities
  parking: {
    cars: string;
    twoWheelers: string;
    valetAvailable: boolean;
    valetCost: string;
  };
  rooms: {
    total: string;
    ac: string;
    nonAc: string;
    complimentary: boolean;
    extraCharges: string;
    amenities: string[];
  };
  powerBackup: {
    capacity: string;
    duration: string;
  };
  audioVisual: {
    soundSystem: { available: boolean; included: boolean };
    projector: { available: boolean; included: boolean };
    djServices: string;
    djCost: string;
  };
  washrooms: {
    number: string;
    description: string;
  };
  accessibility: {
    wheelchairAccess: boolean;
    elevator: boolean;
  };
  eventStaffing: {
    staffCount: string;
    services: string;
  };
  wifiAvailable: boolean;
  
  // Ritual & Cultural
  fireRitual: string;
  mandapSetup: string;
  
  // AI & Operational
  bookingSystem: string;
  integrateWithApp: boolean;
  uniqueFeatures: string;
  idealClientProfile: string;
  flexibilityLevel: string;
  aiSuggestions: string;
  preferredLeadMode: string;
  venueRules: string;
}

const ManualVendorOnboarding: React.FC = () => {
  const { user, vendorProfile, isLoading, isLoadingVendorProfile, refreshVendorProfile, updateVendor } = useAuth();
  const loading = isLoading || isLoadingVendorProfile;
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingState, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File upload state
  const [venuePhotos, setVenuePhotos] = useState<File[]>([]);
  const [sampleMenus, setSampleMenus] = useState<File[]>([]);
  const [pastEventPhotos, setPastEventPhotos] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<VenueFormData>({
    // Basic Information
    venueName: '',
    fullAddress: '',
    contactPersonName: '',
    directPhoneNumbers: '',
    emailAddress: user?.email || '',
    websiteLinks: '',
    yearsInOperation: '',
    
    // Hall Details
    halls: [{
      id: '1',
      name: '',
      type: '',
      otherType: '',
      seatingCapacity: { theatre: '', roundTable: '', floating: '' },
      diningArrangement: { separateDining: false, diningCapacity: '' },
      area: '',
      airConditioning: '',
      stage: { available: false, dimensions: '' },
      danceFloor: { available: false, size: '' },
      ambience: ''
    }],
    
    // Pricing & Packages
    rentalIncludedInCatering: false,
    rentalCharges: { weekday: '', weekend: '', festival: '' },
    rentalDuration: [],
    hourlyRate: '',
    basicRentalIncludes: [],
    
    // Catering
    cateringOptions: '',
    outsideCaterersDetails: { tieUps: '', royaltyFee: false, kitchenAccess: false },
    pricing: {
      vegStandard: { min: '', max: '' },
      vegDeluxe: { min: '', max: '' },
      nonVegStandard: { min: '', max: '' },
      nonVegDeluxe: { min: '', max: '' }
    },
    cuisineSpecialties: [],
    menuCustomization: '',
    
    // Alcohol Policy
    alcoholAllowed: false,
    inHouseBar: false,
    permitRequired: false,
    corkageFee: { applicable: false, amount: '' },
    
    // Decoration
    decorationOptions: '',
    outsideDecoratorRestrictions: '',
    basicDecorIncluded: false,
    basicDecorDetails: '',
    decorPackages: { priceRange: { min: '', max: '' }, themes: '' },
    decorCustomization: false,
    popularThemes: '',
    
    // Taxes & Payment
    gstApplied: false,
    gstPercentage: '',
    otherCharges: '',
    advanceBooking: '',
    paymentTerms: '',
    cancellationPolicy: '',
    paymentModes: [],
    
    // Amenities
    parking: { cars: '', twoWheelers: '', valetAvailable: false, valetCost: '' },
    rooms: { total: '', ac: '', nonAc: '', complimentary: false, extraCharges: '', amenities: [] },
    powerBackup: { capacity: '', duration: '' },
    audioVisual: {
      soundSystem: { available: false, included: false },
      projector: { available: false, included: false },
      djServices: '',
      djCost: ''
    },
    washrooms: { number: '', description: '' },
    accessibility: { wheelchairAccess: false, elevator: false },
    eventStaffing: { staffCount: '', services: '' },
    wifiAvailable: false,
    
    // Ritual & Cultural
    fireRitual: '',
    mandapSetup: '',
    
    // AI & Operational
    bookingSystem: '',
    integrateWithApp: false,
    uniqueFeatures: '',
    idealClientProfile: '',
    flexibilityLevel: '3',
    aiSuggestions: '',
    preferredLeadMode: '',
    venueRules: ''
  });

  const steps = [
    { id: 1, name: 'Basic Information', icon: '📋' },
    { id: 2, name: 'Venue Spaces', icon: '🏛️' },
    { id: 3, name: 'Pricing & Catering', icon: '💰' },
    { id: 4, name: 'Amenities & Services', icon: '🛎️' },
    { id: 5, name: 'Policies & Operations', icon: '📝' }
  ];

  const addHall = () => {
    const newHall: HallDetails = {
      id: Date.now().toString(),
      name: '',
      type: '',
      otherType: '',
      seatingCapacity: { theatre: '', roundTable: '', floating: '' },
      diningArrangement: { separateDining: false, diningCapacity: '' },
      area: '',
      airConditioning: '',
      stage: { available: false, dimensions: '' },
      danceFloor: { available: false, size: '' },
      ambience: ''
    };
    setFormData(prev => ({
      ...prev,
      halls: [...prev.halls, newHall]
    }));
  };

  const removeHall = (hallId: string) => {
    if (formData.halls.length > 1) {
      setFormData(prev => ({
        ...prev,
        halls: prev.halls.filter(hall => hall.id !== hallId)
      }));
    }
  };

  const updateHall = (hallId: string, updates: Partial<HallDetails>) => {
    setFormData(prev => ({
      ...prev,
      halls: prev.halls.map(hall => 
        hall.id === hallId ? { ...hall, ...updates } : hall
      )
    }));
  };

  const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
    const vendorFolder = user?.id || 'unknown-vendor';
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${vendorFolder}/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('vendors')
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('vendors')
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Upload files
      const venuePhotoUrls = venuePhotos.length > 0 ? await uploadFiles(venuePhotos, 'venue-photos') : [];
      const sampleMenuUrls = sampleMenus.length > 0 ? await uploadFiles(sampleMenus, 'sample-menus') : [];
      const pastEventPhotoUrls = pastEventPhotos.length > 0 ? await uploadFiles(pastEventPhotos, 'past-events') : [];

      // Prepare vendor data
      const vendorData = {
        supabase_auth_uid: user.id,
        vendor_name: formData.venueName,
        vendor_category: 'Venue',
        contact_email: formData.emailAddress,
        phone_number: formData.directPhoneNumbers,
        website_url: formData.websiteLinks || null,
        address: {
          full_address: formData.fullAddress,
          city: '', // You might want to parse this from the address
          state: '',
          country: 'India'
        },
        pricing_range: {
          min: Math.min(
            parseInt(formData.pricing.vegStandard.min) || 0,
            parseInt(formData.pricing.nonVegStandard.min) || 0
          ),
          max: Math.max(
            parseInt(formData.pricing.vegDeluxe.max) || 0,
            parseInt(formData.pricing.nonVegDeluxe.max) || 0
          ),
          currency: 'INR'
        },
        description: formData.uniqueFeatures,
        portfolio_image_urls: venuePhotoUrls,
        details: {
          establishmentYear: formData.yearsInOperation,
          contactPerson: formData.contactPersonName,
          
          // Catering details
          cateringOptions: formData.cateringOptions,
          outsideCaterersDetails: formData.outsideCaterersDetails,
          pricing: formData.pricing,
          cuisineSpecialties: formData.cuisineSpecialties,
          menuCustomization: formData.menuCustomization,
          sampleMenuUrls,
          
          // Policies
          alcoholPolicy: {
            allowed: formData.alcoholAllowed,
            inHouseBar: formData.inHouseBar,
            permitRequired: formData.permitRequired,
            corkageFee: formData.corkageFee
          },
          
          decoration: {
            options: formData.decorationOptions,
            restrictions: formData.outsideDecoratorRestrictions,
            basicIncluded: formData.basicDecorIncluded,
            packages: formData.decorPackages,
            customization: formData.decorCustomization
          },
          
          // Rental & Pricing
          rental: {
            includedInCatering: formData.rentalIncludedInCatering,
            charges: formData.rentalCharges,
            duration: formData.rentalDuration,
            hourlyRate: formData.hourlyRate,
            basicIncludes: formData.basicRentalIncludes
          },
          
          // Taxes & Payment
          taxes: {
            gstApplied: formData.gstApplied,
            gstPercentage: formData.gstPercentage,
            otherCharges: formData.otherCharges
          },
          
          payment: {
            advanceBooking: formData.advanceBooking,
            terms: formData.paymentTerms,
            cancellationPolicy: formData.cancellationPolicy,
            modes: formData.paymentModes
          },
          
          // Amenities
          parking: formData.parking,
          rooms: formData.rooms,
          powerBackup: formData.powerBackup,
          audioVisual: formData.audioVisual,
          washrooms: formData.washrooms,
          accessibility: formData.accessibility,
          eventStaffing: formData.eventStaffing,
          wifi: formData.wifiAvailable,
          
          // Cultural & Ritual
          fireRitual: formData.fireRitual,
          mandapSetup: formData.mandapSetup,
          
          // Operational
          bookingSystem: formData.bookingSystem,
          integrateWithApp: formData.integrateWithApp,
          idealClientProfile: formData.idealClientProfile,
          flexibilityLevel: parseInt(formData.flexibilityLevel),
          aiSuggestions: formData.aiSuggestions,
          preferredLeadMode: formData.preferredLeadMode,
          venueRules: formData.venueRules,
          pastEventPhotoUrls,
          status: 'onboarding_in_progress'
        }
      };

      // Insert vendor
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single();

      if (vendorError) throw vendorError;

      // Create vendor staff entry for contact person
      const { error: staffError } = await supabase
        .from('vendor_staff')
        .insert({
          vendor_id: vendor.vendor_id,
          supabase_auth_uid: user.id,
          email: formData.emailAddress,
          phone_number: formData.directPhoneNumbers,
          display_name: formData.contactPersonName,
          role: 'owner'
        });

      if (staffError) throw staffError;

      // Create services for each hall
      const hallServices = formData.halls.map(hall => ({
        vendor_id: vendor.vendor_id,
        service_name: hall.name || `${hall.type} Space`,
        service_category: 'Venue Space',
        description: `${hall.type} with ${hall.area} sq ft area. ${hall.ambience}`,
        base_price: null, // Will be determined based on catering/rental setup
        min_capacity: Math.min(
          parseInt(hall.seatingCapacity.theatre) || 0,
          parseInt(hall.seatingCapacity.roundTable) || 0,
          parseInt(hall.seatingCapacity.floating) || 0
        ),
        max_capacity: Math.max(
          parseInt(hall.seatingCapacity.theatre) || 0,
          parseInt(hall.seatingCapacity.roundTable) || 0,
          parseInt(hall.seatingCapacity.floating) || 0
        ),
        customizability_details: JSON.stringify({
          type: hall.type,
          area: hall.area,
          airConditioning: hall.airConditioning,
          stage: hall.stage,
          danceFloor: hall.danceFloor,
          seatingCapacity: hall.seatingCapacity,
          diningArrangement: hall.diningArrangement
        })
      }));

      if (hallServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('vendor_services')
          .insert(hallServices);

        if (servicesError) throw servicesError;
      }

      // Add catering service if in-house catering is offered
      if (formData.cateringOptions === 'in-house' || formData.cateringOptions === 'both') {
        const { error: cateringError } = await supabase
          .from('vendor_services')
          .insert({
            vendor_id: vendor.vendor_id,
            service_name: 'In-house Catering',
            service_category: 'Catering',
            description: `Specialties: ${formData.cuisineSpecialties.join(', ')}`,
            base_price: parseInt(formData.pricing.vegStandard.min) || null,
            customizability_details: JSON.stringify({
              cuisines: formData.cuisineSpecialties,
              pricing: formData.pricing,
              customization: formData.menuCustomization
            })
          });

        if (cateringError) throw cateringError;
      }

      await refreshVendorProfile();

      toast({
        title: "Onboarding completed!",
        description: "Your venue has been successfully registered with SanskaraAi.",
      });

      if (vendor) {
        await updateVendor(vendor.vendor_id, { is_active: true, status: 'active' });
      }

      navigate('/');
    } catch (error: any) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venueName">Venue Name *</Label>
                  <Input
                    id="venueName"
                    value={formData.venueName}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Contact Person Name (Owner/Manager) *</Label>
                  <Input
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="directPhoneNumbers">Direct Phone Number(s) *</Label>
                  <Input
                    id="directPhoneNumbers"
                    value={formData.directPhoneNumbers}
                    onChange={(e) => setFormData(prev => ({ ...prev, directPhoneNumbers: e.target.value }))}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearsInOperation">Years in Operation / Establishment Year *</Label>
                  <Input
                    id="yearsInOperation"
                    value={formData.yearsInOperation}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearsInOperation: e.target.value }))}
                    placeholder="2015 or 8 years"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="fullAddress">Full Address with Pin Code *</Label>
                <Textarea
                  id="fullAddress"
                  value={formData.fullAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullAddress: e.target.value }))}
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="websiteLinks">Website or Social Media Links</Label>
                <Textarea
                  id="websiteLinks"
                  value={formData.websiteLinks}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteLinks: e.target.value }))}
                  placeholder="Website: https://..., Instagram: @..., Facebook: ..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Upload High-Quality Photos & Videos of Venue *</Label>
                <FileInput
                  multiple
                  accept="image/*,video/*"
                  onFileChange={(files) => setVenuePhotos(Array.from(files || []))}
                />
                {venuePhotos.length > 0 && (
                  <p className="text-sm text-gray-600">{venuePhotos.length} files selected</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Venue Space / Hall Details</h3>
              
              {formData.halls.map((hall, index) => (
                <Card key={hall.id} className="mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md">Hall {index + 1}</CardTitle>
                      {formData.halls.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeHall(hall.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name/Identifier of Hall *</Label>
                        <Input
                          value={hall.name}
                          onChange={(e) => updateHall(hall.id, { name: e.target.value })}
                          placeholder="e.g., Main Hall, Lawn 1"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Type of Space *</Label>
                        <Select value={hall.type} onValueChange={(value) => updateHall(hall.id, { type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select space type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="banquet-hall">Banquet Hall</SelectItem>
                            <SelectItem value="open-lawn">Open Lawn</SelectItem>
                            <SelectItem value="rooftop">Rooftop</SelectItem>
                            <SelectItem value="auditorium">Auditorium</SelectItem>
                            <SelectItem value="poolside">Poolside</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {hall.type === 'other' && (
                          <Input
                            value={hall.otherType}
                            onChange={(e) => updateHall(hall.id, { otherType: e.target.value })}
                            placeholder="Specify other type"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Seating Capacity (Max/Min)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Theatre Style</Label>
                          <Input
                            type="number"
                            value={hall.seatingCapacity.theatre}
                            onChange={(e) => updateHall(hall.id, {
                              seatingCapacity: { ...hall.seatingCapacity, theatre: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Round Table / Banquet Style</Label>
                          <Input
                            type="number"
                            value={hall.seatingCapacity.roundTable}
                            onChange={(e) => updateHall(hall.id, {
                              seatingCapacity: { ...hall.seatingCapacity, roundTable: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Floating Crowd</Label>
                          <Input
                            type="number"
                            value={hall.seatingCapacity.floating}
                            onChange={(e) => updateHall(hall.id, {
                              seatingCapacity: { ...hall.seatingCapacity, floating: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Dining Arrangement</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={hall.diningArrangement.separateDining}
                          onCheckedChange={(checked) => updateHall(hall.id, {
                            diningArrangement: { ...hall.diningArrangement, separateDining: !!checked }
                          })}
                        />
                        <Label>Separate Dining Hall?</Label>
                      </div>
                      {hall.diningArrangement.separateDining && (
                        <div className="space-y-2">
                          <Label className="text-sm">Dining Capacity</Label>
                          <Input
                            type="number"
                            value={hall.diningArrangement.diningCapacity}
                            onChange={(e) => updateHall(hall.id, {
                              diningArrangement: { ...hall.diningArrangement, diningCapacity: e.target.value }
                            })}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Area/Dimensions (Sq. Ft. or Sq. M)</Label>
                        <Input
                          value={hall.area}
                          onChange={(e) => updateHall(hall.id, { area: e.target.value })}
                          placeholder="e.g., 2000 sq ft"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Air Conditioning</Label>
                        <Select value={hall.airConditioning} onValueChange={(value) => updateHall(hall.id, { airConditioning: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AC type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-ac">No AC</SelectItem>
                            <SelectItem value="window-ac">Window ACs</SelectItem>
                            <SelectItem value="split-ac">Split ACs</SelectItem>
                            <SelectItem value="centralized-ac">Centralized AC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={hall.stage.available}
                          onCheckedChange={(checked) => updateHall(hall.id, {
                            stage: { ...hall.stage, available: !!checked }
                          })}
                        />
                        <Label>Stage Available?</Label>
                      </div>
                      {hall.stage.available && (
                        <div className="space-y-2">
                          <Label className="text-sm">Stage Dimensions</Label>
                          <Input
                            value={hall.stage.dimensions}
                            onChange={(e) => updateHall(hall.id, {
                              stage: { ...hall.stage, dimensions: e.target.value }
                            })}
                            placeholder="e.g., 20ft x 15ft"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={hall.danceFloor.available}
                          onCheckedChange={(checked) => updateHall(hall.id, {
                            danceFloor: { ...hall.danceFloor, available: !!checked }
                          })}
                        />
                        <Label>Dance Floor Available?</Label>
                      </div>
                      {hall.danceFloor.available && (
                        <div className="space-y-2">
                          <Label className="text-sm">Size in Sq. Ft</Label>
                          <Input
                            value={hall.danceFloor.size}
                            onChange={(e) => updateHall(hall.id, {
                              danceFloor: { ...hall.danceFloor, size: e.target.value }
                            })}
                            placeholder="e.g., 400 sq ft"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ambience/Lighting/Natural Light Description</Label>
                      <Textarea
                        value={hall.ambience}
                        onChange={(e) => updateHall(hall.id, { ambience: e.target.value })}
                        placeholder="e.g., Pillar-less, Large windows, Garden-facing"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button onClick={addHall} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Hall/Space
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing, Catering, and Packages</h3>
              
              {/* Rental & Booking Charges */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Rental & Booking Charges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.rentalIncludedInCatering}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rentalIncludedInCatering: !!checked }))}
                    />
                    <Label>Is Rental Included in Catering Charges?</Label>
                  </div>
                  
                  {formData.rentalIncludedInCatering && (
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      We'll show the hall as 'complimentary with in-house catering' in your listing.
                    </p>
                  )}
                  
                  {!formData.rentalIncludedInCatering && (
                    <div className="space-y-4">
                      <Label>Rental Charges</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Weekday Rate (Mon–Thu)</Label>
                          <Input
                            type="number"
                            value={formData.rentalCharges.weekday}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              rentalCharges: { ...prev.rentalCharges, weekday: e.target.value }
                            }))}
                            placeholder="₹"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Weekend Rate (Fri–Sun)</Label>
                          <Input
                            type="number"
                            value={formData.rentalCharges.weekend}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              rentalCharges: { ...prev.rentalCharges, weekend: e.target.value }
                            }))}
                            placeholder="₹"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Auspicious/Festival Dates Rate</Label>
                          <Input
                            type="number"
                            value={formData.rentalCharges.festival}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              rentalCharges: { ...prev.rentalCharges, festival: e.target.value }
                            }))}
                            placeholder="₹"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rental Duration Options</Label>
                        <div className="space-y-2">
                          {['Half Day', 'Full Day', 'Per Hour'].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.rentalDuration.includes(option)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      rentalDuration: [...prev.rentalDuration, option]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      rentalDuration: prev.rentalDuration.filter(d => d !== option)
                                    }));
                                  }
                                }}
                              />
                              <Label>{option}</Label>
                            </div>
                          ))}
                        </div>
                        
                        {formData.rentalDuration.includes('Per Hour') && (
                          <div className="space-y-2">
                            <Label className="text-sm">Rate per hour</Label>
                            <Input
                              type="number"
                              value={formData.hourlyRate}
                              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                              placeholder="₹"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>What is Included in the Basic Rental?</Label>
                        <div className="space-y-2">
                          {['Tables & Chairs', 'Basic Lighting', 'Power Backup', 'Cleaning & Maintenance', 'Other'].map((item) => (
                            <div key={item} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.basicRentalIncludes.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      basicRentalIncludes: [...prev.basicRentalIncludes, item]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      basicRentalIncludes: prev.basicRentalIncludes.filter(i => i !== item)
                                    }));
                                  }
                                }}
                              />
                              <Label>{item}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Food & Catering */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Food & Catering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Catering Options Allowed</Label>
                    <RadioGroup
                      value={formData.cateringOptions}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, cateringOptions: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-house" id="in-house" />
                        <Label htmlFor="in-house">In-house Catering Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outside" id="outside" />
                        <Label htmlFor="outside">Outside Caterers Allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both">Both Allowed</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {(formData.cateringOptions === 'outside' || formData.cateringOptions === 'both') && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded">
                      <div className="space-y-2">
                        <Label>Any Tie-Ups or Approved Vendors?</Label>
                        <Textarea
                          value={formData.outsideCaterersDetails.tieUps}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            outsideCaterersDetails: { ...prev.outsideCaterersDetails, tieUps: e.target.value }
                          }))}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.outsideCaterersDetails.royaltyFee}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            outsideCaterersDetails: { ...prev.outsideCaterersDetails, royaltyFee: !!checked }
                          }))}
                        />
                        <Label>Royalty Fee Charged?</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.outsideCaterersDetails.kitchenAccess}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            outsideCaterersDetails: { ...prev.outsideCaterersDetails, kitchenAccess: !!checked }
                          }))}
                        />
                        <Label>Kitchen Access Provided?</Label>
                      </div>
                    </div>
                  )}
                  
                  {(formData.cateringOptions === 'in-house' || formData.cateringOptions === 'both') && (
                    <div className="space-y-4">
                      <Label>Price Per Plate</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">Veg</Label>
                          <div className="space-y-2">
                            <Label className="text-xs">Standard Range</Label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Min ₹"
                                value={formData.pricing.vegStandard.min}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    vegStandard: { ...prev.pricing.vegStandard, min: e.target.value }
                                  }
                                }))}
                              />
                              <Input
                                type="number"
                                placeholder="Max ₹"
                                value={formData.pricing.vegStandard.max}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    vegStandard: { ...prev.pricing.vegStandard, max: e.target.value }
                                  }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Deluxe/Custom</Label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Min ₹"
                                value={formData.pricing.vegDeluxe.min}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    vegDeluxe: { ...prev.pricing.vegDeluxe, min: e.target.value }
                                  }
                                }))}
                              />
                              <Input
                                type="number"
                                placeholder="Max ₹"
                                value={formData.pricing.vegDeluxe.max}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    vegDeluxe: { ...prev.pricing.vegDeluxe, max: e.target.value }
                                  }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">Non-Veg</Label>
                          <div className="space-y-2">
                            <Label className="text-xs">Standard Range</Label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Min ₹"
                                value={formData.pricing.nonVegStandard.min}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    nonVegStandard: { ...prev.pricing.nonVegStandard, min: e.target.value }
                                  }
                                }))}
                              />
                              <Input
                                type="number"
                                placeholder="Max ₹"
                                value={formData.pricing.nonVegStandard.max}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    nonVegStandard: { ...prev.pricing.nonVegStandard, max: e.target.value }
                                  }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Deluxe/Custom</Label>
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder="Min ₹"
                                value={formData.pricing.nonVegDeluxe.min}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    nonVegDeluxe: { ...prev.pricing.nonVegDeluxe, min: e.target.value }
                                  }
                                }))}
                              />
                              <Input
                                type="number"
                                placeholder="Max ₹"
                                value={formData.pricing.nonVegDeluxe.max}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  pricing: {
                                    ...prev.pricing,
                                    nonVegDeluxe: { ...prev.pricing.nonVegDeluxe, max: e.target.value }
                                  }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Cuisine Specialties Offered</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Live Counters', 'Jain Food', 'Satvic Food'].map((cuisine) => (
                            <div key={cuisine} className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.cuisineSpecialties.includes(cuisine)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      cuisineSpecialties: [...prev.cuisineSpecialties, cuisine]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      cuisineSpecialties: prev.cuisineSpecialties.filter(c => c !== cuisine)
                                    }));
                                  }
                                }}
                              />
                              <Label className="text-sm">{cuisine}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Menu Customization Allowed?</Label>
                        <RadioGroup
                          value={formData.menuCustomization}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, menuCustomization: value }))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="menu-yes" />
                            <Label htmlFor="menu-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="menu-no" />
                            <Label htmlFor="menu-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="menu-partial" />
                            <Label htmlFor="menu-partial">Partial</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Upload Sample Menus (PDF/Images)</Label>
                        <FileInput
                          multiple
                          accept=".pdf,image/*"
                          onFileChange={(files) => setSampleMenus(Array.from(files || []))}
                        />
                        {sampleMenus.length > 0 && (
                          <p className="text-sm text-gray-600">{sampleMenus.length} files selected</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Amenities & Event Services</h3>
              
              {/* Alcohol Policy */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Alcohol Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.alcoholAllowed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, alcoholAllowed: !!checked }))}
                    />
                    <Label>Is Alcohol Allowed?</Label>
                  </div>
                  
                  {formData.alcoholAllowed && (
                    <div className="space-y-4 pl-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.inHouseBar}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inHouseBar: !!checked }))}
                        />
                        <Label>In-house Bar Available?</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.permitRequired}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permitRequired: !!checked }))}
                        />
                        <Label>Permit Required?</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.corkageFee.applicable}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            corkageFee: { ...prev.corkageFee, applicable: !!checked }
                          }))}
                        />
                        <Label>Corkage Fee Applicable?</Label>
                      </div>
                      
                      {formData.corkageFee.applicable && (
                        <div className="space-y-2">
                          <Label className="text-sm">Corkage Fee Amount</Label>
                          <Input
                            type="number"
                            value={formData.corkageFee.amount}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              corkageFee: { ...prev.corkageFee, amount: e.target.value }
                            }))}
                            placeholder="₹"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Decoration */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Decoration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Decoration Options</Label>
                    <RadioGroup
                      value={formData.decorationOptions}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, decorationOptions: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-house" id="decor-in-house" />
                        <Label htmlFor="decor-in-house">In-house Decorator Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outside" id="decor-outside" />
                        <Label htmlFor="decor-outside">Outside Decorators Allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="decor-both" />
                        <Label htmlFor="decor-both">Both Allowed</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {(formData.decorationOptions === 'outside' || formData.decorationOptions === 'both') && (
                    <div className="space-y-2">
                      <Label>Restrictions for Outside Decorators?</Label>
                      <Textarea
                        value={formData.outsideDecoratorRestrictions}
                        onChange={(e) => setFormData(prev => ({ ...prev, outsideDecoratorRestrictions: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.basicDecorIncluded}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, basicDecorIncluded: !!checked }))}
                    />
                    <Label>Basic Decor Included?</Label>
                  </div>
                  
                  {formData.basicDecorIncluded && (
                    <div className="space-y-2">
                      <Label className="text-sm">What's Included?</Label>
                      <Input
                        value={formData.basicDecorDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, basicDecorDetails: e.target.value }))}
                        placeholder="e.g., Basic lighting, table covers, centerpieces"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <Label>Standard Decor Packages</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Price Range</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Min ₹"
                            value={formData.decorPackages.priceRange.min}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              decorPackages: {
                                ...prev.decorPackages,
                                priceRange: { ...prev.decorPackages.priceRange, min: e.target.value }
                              }
                            }))}
                          />
                          <Input
                            type="number"
                            placeholder="Max ₹"
                            value={formData.decorPackages.priceRange.max}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              decorPackages: {
                                ...prev.decorPackages,
                                priceRange: { ...prev.decorPackages.priceRange, max: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Themes/Styles Offered</Label>
                        <Textarea
                          value={formData.decorPackages.themes}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            decorPackages: { ...prev.decorPackages, themes: e.target.value }
                          }))}
                          placeholder="e.g., Traditional, Modern, Royal, Floral"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.decorCustomization}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, decorCustomization: !!checked }))}
                    />
                    <Label>Customization Allowed in Decoration?</Label>
                  </div>
                  
                  {formData.decorCustomization && (
                    <div className="space-y-2">
                      <Label className="text-sm">Popular Themes with Price Range</Label>
                      <Textarea
                        value={formData.popularThemes}
                        onChange={(e) => setFormData(prev => ({ ...prev, popularThemes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Parking */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Parking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Capacity (Cars)</Label>
                      <Input
                        type="number"
                        value={formData.parking.cars}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parking: { ...prev.parking, cars: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Capacity (2-Wheelers)</Label>
                      <Input
                        type="number"
                        value={formData.parking.twoWheelers}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parking: { ...prev.parking, twoWheelers: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.parking.valetAvailable}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        parking: { ...prev.parking, valetAvailable: !!checked }
                      }))}
                    />
                    <Label>Valet Parking Available?</Label>
                  </div>
                  
                  {formData.parking.valetAvailable && (
                    <div className="space-y-2">
                      <Label className="text-sm">Additional Cost</Label>
                      <Input
                        type="number"
                        value={formData.parking.valetCost}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parking: { ...prev.parking, valetCost: e.target.value }
                        }))}
                        placeholder="₹"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Power Backup & AV Equipment */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Power Backup & AV Equipment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Generator Capacity (kVA)</Label>
                      <Input
                        value={formData.powerBackup.capacity}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          powerBackup: { ...prev.powerBackup, capacity: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Duration Supported (Hours)</Label>
                      <Input
                        type="number"
                        value={formData.powerBackup.duration}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          powerBackup: { ...prev.powerBackup, duration: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Audio/Visual Equipment Available</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={formData.audioVisual.soundSystem.available}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            audioVisual: {
                              ...prev.audioVisual,
                              soundSystem: { ...prev.audioVisual.soundSystem, available: !!checked }
                            }
                          }))}
                        />
                        <Label>Sound System</Label>
                        {formData.audioVisual.soundSystem.available && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formData.audioVisual.soundSystem.included}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                audioVisual: {
                                  ...prev.audioVisual,
                                  soundSystem: { ...prev.audioVisual.soundSystem, included: !!checked }
                                }
                              }))}
                            />
                            <Label className="text-sm">Included</Label>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={formData.audioVisual.projector.available}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            audioVisual: {
                              ...prev.audioVisual,
                              projector: { ...prev.audioVisual.projector, available: !!checked }
                            }
                          }))}
                        />
                        <Label>Projector & Screen</Label>
                        {formData.audioVisual.projector.available && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formData.audioVisual.projector.included}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                audioVisual: {
                                  ...prev.audioVisual,
                                  projector: { ...prev.audioVisual.projector, included: !!checked }
                                }
                              }))}
                            />
                            <Label className="text-sm">Included</Label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>DJ Services</Label>
                    <RadioGroup
                      value={formData.audioVisual.djServices}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        audioVisual: { ...prev.audioVisual, djServices: value }
                      }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-house" id="dj-in-house" />
                        <Label htmlFor="dj-in-house">In-house</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outside-allowed" id="dj-outside" />
                        <Label htmlFor="dj-outside">Outside Allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-allowed" id="dj-not-allowed" />
                        <Label htmlFor="dj-not-allowed">Not Allowed</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {formData.audioVisual.djServices === 'in-house' && (
                    <div className="space-y-2">
                      <Label className="text-sm">DJ Cost if In-house</Label>
                      <Input
                        type="number"
                        value={formData.audioVisual.djCost}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          audioVisual: { ...prev.audioVisual, djCost: e.target.value }
                        }))}
                        placeholder="₹"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Policies & Operations</h3>
              
              {/* Taxes & Payment */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Taxes & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.gstApplied}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gstApplied: !!checked }))}
                    />
                    <Label>GST Applied?</Label>
                  </div>
                  
                  {formData.gstApplied && (
                    <div className="space-y-2">
                      <Label className="text-sm">GST %</Label>
                      <Input
                        type="number"
                        value={formData.gstPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, gstPercentage: e.target.value }))}
                        placeholder="18"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Other Charges/Hidden Fees (if any)</Label>
                    <Textarea
                      value={formData.otherCharges}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherCharges: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Advance Booking Amount</Label>
                    <Input
                      value={formData.advanceBooking}
                      onChange={(e) => setFormData(prev => ({ ...prev, advanceBooking: e.target.value }))}
                      placeholder="e.g., 30% of total or ₹50,000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Terms & Schedule</Label>
                    <Textarea
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cancellation & Refund Policy</Label>
                    <Textarea
                      value={formData.cancellationPolicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Accepted Payment Modes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['UPI', 'Bank Transfer', 'Credit/Debit Cards', 'Cash', 'Cheque'].map((mode) => (
                        <div key={mode} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.paymentModes.includes(mode)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  paymentModes: [...prev.paymentModes, mode]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  paymentModes: prev.paymentModes.filter(m => m !== mode)
                                }));
                              }
                            }}
                          />
                          <Label className="text-sm">{mode}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ritual & Cultural Support */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">Ritual & Cultural Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Is Fire/Hawan Ritual Allowed?</Label>
                    <Select value={formData.fireRitual} onValueChange={(value) => setFormData(prev => ({ ...prev, fireRitual: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="not-allowed">Not Allowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mandap Setup Location Preferences or Restrictions</Label>
                    <Textarea
                      value={formData.mandapSetup}
                      onChange={(e) => setFormData(prev => ({ ...prev, mandapSetup: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* AI & Operational Data */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-md">AI & Operational Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Booking & Calendar Management System</Label>
                    <Select value={formData.bookingSystem} onValueChange={(value) => setFormData(prev => ({ ...prev, bookingSystem: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual (Notebook/Phone)</SelectItem>
                        <SelectItem value="google-calendar">Google Calendar</SelectItem>
                        <SelectItem value="crm-software">CRM Software</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.integrateWithApp}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, integrateWithApp: !!checked }))}
                    />
                    <Label>Willing to Integrate with SanskaraAi App/Portal?</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Unique Features / Selling Points of Your Venue</Label>
                    <Textarea
                      value={formData.uniqueFeatures}
                      onChange={(e) => setFormData(prev => ({ ...prev, uniqueFeatures: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ideal Client Profile (type of events, budget preferences)</Label>
                    <Textarea
                      value={formData.idealClientProfile}
                      onChange={(e) => setFormData(prev => ({ ...prev, idealClientProfile: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Select value={formData.flexibilityLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, flexibilityLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Rigid</SelectItem>
                        <SelectItem value="2">2 - Rigid</SelectItem>
                        <SelectItem value="3">3 - Moderate</SelectItem>
                        <SelectItem value="4">4 - Flexible</SelectItem>
                        <SelectItem value="5">5 - Very Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Upload Photos of Past Events with Themes/Setup Styles</Label>
                    <FileInput
                      multiple
                      accept="image/*"
                      onFileChange={(files) => setPastEventPhotos(Array.from(files || []))}
                    />
                    {pastEventPhotos.length > 0 && (
                      <p className="text-sm text-gray-600">{pastEventPhotos.length} files selected</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Would You Consider Allowing AI to Suggest Menu or Decor Based on Client Profiles?</Label>
                    <RadioGroup
                      value={formData.aiSuggestions}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, aiSuggestions: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ai-yes" />
                        <Label htmlFor="ai-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ai-no" />
                        <Label htmlFor="ai-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="needs-approval" id="ai-approval" />
                        <Label htmlFor="ai-approval">Needs Approval</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preferred Mode of Receiving Leads/Bookings from SanskaraAi</Label>
                    <Select value={formData.preferredLeadMode} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLeadMode: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="dashboard">In-App Dashboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Any Venue Rules or Restrictions Clients Must Know?</Label>
                    <Textarea
                      value={formData.venueRules}
                      onChange={(e) => setFormData(prev => ({ ...prev, venueRules: e.target.value }))}
                      placeholder="e.g., music cutoff time, decor limitations, usage rules, etc."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sanskara-red mb-2">
            SanskaraAi Venue Onboarding Form
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Welcome! This form collects complete details about your venue for onboarding into SanskaraAi's platform. 
            Accurate information helps us present your venue better to potential clients. Please take 15–20 minutes to fill out this form.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div 
                key={step.id}
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 ${
                    currentStep === step.id 
                      ? "bg-sanskara-red text-white border-sanskara-red" 
                      : currentStep > step.id
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-xs mt-2 text-center max-w-[80px]">{step.name}</span>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="relative mt-4">
            <div className="h-1 bg-gray-200 w-full"></div>
            <div 
              className="absolute top-0 h-1 bg-sanskara-red transition-all"
              style={{ width: `${(currentStep - 1) / (steps.length - 1) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {currentStep < steps.length ? 'Next' : isSubmitting ? 'Submitting...' : 'Finish'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManualVendorOnboarding;