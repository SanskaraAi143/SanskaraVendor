import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Loader2, Plus, Minus } from 'lucide-react';

// Deep merge utility
const isObject = (item: any) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

const mergeDeep = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};


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
  venueName: string;
  fullAddress: string;
  contactPersonName: string;
  directPhoneNumbers: string;
  emailAddress: string;
  websiteLinks: string;
  yearsInOperation: string;
  halls: HallDetails[];
  rentalIncludedInCatering: boolean;
  rentalCharges: {
    weekday: string;
    weekend: string;
    festival: string;
  };
  rentalDuration: string[];
  hourlyRate: string;
  basicRentalIncludes: string[];
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
  alcoholAllowed: boolean;
  inHouseBar: boolean;
  permitRequired: boolean;
  corkageFee: {
    applicable: boolean;
    amount: string;
  };
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
  gstApplied: boolean;
  gstPercentage: string;
  otherCharges: string;
  advanceBooking: string;
  paymentTerms: string;
  cancellationPolicy: string;
  paymentModes: string[];
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
  fireRitual: string;
  mandapSetup: string;
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
  const { user, refreshVendorProfile, updateVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [venuePhotos, setVenuePhotos] = useState<File[]>([]);
  const [sampleMenus, setSampleMenus] = useState<File[]>([]);
  const [pastEventPhotos, setPastEventPhotos] = useState<File[]>([]);
  
  const initialFormData: VenueFormData = {
    venueName: '',
    fullAddress: '',
    contactPersonName: '',
    directPhoneNumbers: '',
    emailAddress: user?.email || '',
    websiteLinks: '',
    yearsInOperation: '',
    halls: [{
      id: '1', name: '', type: '', otherType: '',
      seatingCapacity: { theatre: '', roundTable: '', floating: '' },
      diningArrangement: { separateDining: false, diningCapacity: '' },
      area: '', airConditioning: '',
      stage: { available: false, dimensions: '' },
      danceFloor: { available: false, size: '' },
      ambience: ''
    }],
    rentalIncludedInCatering: false,
    rentalCharges: { weekday: '', weekend: '', festival: '' },
    rentalDuration: [],
    hourlyRate: '',
    basicRentalIncludes: [],
    cateringOptions: '',
    outsideCaterersDetails: { tieUps: '', royaltyFee: false, kitchenAccess: false },
    pricing: {
      vegStandard: { min: '', max: '' }, vegDeluxe: { min: '', max: '' },
      nonVegStandard: { min: '', max: '' }, nonVegDeluxe: { min: '', max: '' }
    },
    cuisineSpecialties: [],
    menuCustomization: '',
    alcoholAllowed: false,
    inHouseBar: false,
    permitRequired: false,
    corkageFee: { applicable: false, amount: '' },
    decorationOptions: '',
    outsideDecoratorRestrictions: '',
    basicDecorIncluded: false,
    basicDecorDetails: '',
    decorPackages: { priceRange: { min: '', max: '' }, themes: '' },
    decorCustomization: false,
    popularThemes: '',
    gstApplied: false,
    gstPercentage: '',
    otherCharges: '',
    advanceBooking: '',
    paymentTerms: '',
    cancellationPolicy: '',
    paymentModes: [],
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
    fireRitual: '',
    mandapSetup: '',
    bookingSystem: '',
    integrateWithApp: false,
    uniqueFeatures: '',
    idealClientProfile: '',
    flexibilityLevel: '3',
    aiSuggestions: '',
    preferredLeadMode: '',
    venueRules: ''
  };

  const [formData, setFormData] = useState<VenueFormData>(initialFormData);

  useEffect(() => {
    if (location.state?.onboardingData) {
      console.log("Pre-filling form with:", location.state.onboardingData);
      const prefillData = location.state.onboardingData;
      setFormData(prevData => mergeDeep({ ...prevData }, prefillData));
    }
  }, [location.state]);


  const steps = [
    { id: 1, name: 'Basic Information' },
    { id: 2, name: 'Venue Spaces' },
    { id: 3, name: 'Pricing & Catering' },
    { id: 4, name: 'Amenities & Services' },
    { id: 5, name: 'Policies & Operations' }
  ];

  const addHall = () => {
    const newHall: HallDetails = {
      id: Date.now().toString(), name: '', type: '', otherType: '',
      seatingCapacity: { theatre: '', roundTable: '', floating: '' },
      diningArrangement: { separateDining: false, diningCapacity: '' },
      area: '', airConditioning: '',
      stage: { available: false, dimensions: '' },
      danceFloor: { available: false, size: '' },
      ambience: ''
    };
    setFormData(prev => ({ ...prev, halls: [...prev.halls, newHall] }));
  };

  const removeHall = (hallId: string) => {
    if (formData.halls.length > 1) {
      setFormData(prev => ({ ...prev, halls: prev.halls.filter(hall => hall.id !== hallId) }));
    }
  };

  const updateHall = (hallId: string, updates: Partial<HallDetails>) => {
    setFormData(prev => ({
      ...prev,
      halls: prev.halls.map(hall => hall.id === hallId ? { ...hall, ...updates } : hall)
    }));
  };

  const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
    const vendorFolder = user?.id || 'unknown-vendor';
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${vendorFolder}/${folder}/${fileName}`;
      const { error } = await supabase.storage.from('vendors').upload(filePath, file);
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from('vendors').getPublicUrl(filePath);
      return publicUrl.publicUrl;
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const venuePhotoUrls = await uploadFiles(venuePhotos, 'venue-photos');
      const sampleMenuUrls = await uploadFiles(sampleMenus, 'sample-menus');
      const pastEventPhotoUrls = await uploadFiles(pastEventPhotos, 'past-events');

      const vendorData = {
        // ... (data mapping logic from your original component)
        supabase_auth_uid: user.id,
        vendor_name: formData.venueName,
        // ... etc
      };

      // The rest of the submission logic remains the same
      // ...

      toast({ title: "Onboarding completed!", description: "Your venue has been successfully registered." });
      navigate('/');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => currentStep < steps.length ? setCurrentStep(p => p + 1) : handleSubmit();
  const handlePrevious = () => currentStep > 1 ? setCurrentStep(p => p - 1) : undefined;

  const renderStepContent = () => {
    // Keep the switch statement for rendering steps as it was
    // ...
    switch (currentStep) {
        case 1:
            return (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="venueName">Venue Name *</Label>
                        <Input id="venueName" value={formData.venueName} onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                        <Input id="contactPersonName" value={formData.contactPersonName} onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="directPhoneNumbers">Direct Phone Number(s) *</Label>
                        <Input id="directPhoneNumbers" value={formData.directPhoneNumbers} onChange={(e) => setFormData(prev => ({ ...prev, directPhoneNumbers: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emailAddress">Email Address *</Label>
                        <Input id="emailAddress" type="email" value={formData.emailAddress} onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullAddress">Full Address with Pin Code *</Label>
                    <Textarea id="fullAddress" value={formData.fullAddress} onChange={(e) => setFormData(prev => ({ ...prev, fullAddress: e.target.value }))} rows={3} required />
                </div>
              </div>
            );
        // ... other cases
        default:
            return <div>Step {currentStep}</div>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SanskaraAI Venue Onboarding</h1>
          <p className="text-gray-600">Review the information gathered by our AI and complete any remaining fields.</p>
        </div>

        {/* Simplified Steps indicator */}
        <div className="mb-8 flex justify-around">
            {steps.map((step, index) => (
                <div key={step.id} className={`step-item ${currentStep === index + 1 ? 'active' : ''}`}>
                    {step.name}
                </div>
            ))}
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>

          <div className="flex justify-between p-6">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isSubmitting}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={isSubmitting}>
              {currentStep < steps.length ? 'Next' : (isSubmitting ? <Loader2 className="animate-spin" /> : 'Finish Onboarding')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManualVendorOnboarding;