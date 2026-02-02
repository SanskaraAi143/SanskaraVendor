import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { useToast } from "../hooks/use-toast";
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

interface ManualVendorOnboardingProps {
  onboardingData?: any;
  onCompletion: (data: any) => void;
  onError: (title: string, description: string) => void;
}

const ManualVendorOnboarding: React.FC<ManualVendorOnboardingProps> = ({ onboardingData, onCompletion, onError }) => {
  const { user, vendorProfile, isLoading, isLoadingVendorProfile, refreshVendorProfile, updateVendor } = useAuth();
  const loading = isLoading || isLoadingVendorProfile;
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (onboardingData && onboardingData.extracted_data && onboardingData.extracted_data.length > 0) {
      const extractedData = onboardingData.extracted_data[0];
      console.log("onboardingData received in ManualVendorOnboarding:", onboardingData);
      console.log("extractedData from API response:", extractedData);
      setFormData(prev => {
        const newFormData = { ...prev };

        // Basic Information
        newFormData.venueName = extractedData.venueName ?? prev.venueName;
        newFormData.fullAddress = extractedData.fullAddress ?? prev.fullAddress;
        newFormData.contactPersonName = extractedData.contactPersonName ?? prev.contactPersonName;
        newFormData.directPhoneNumbers = extractedData.directPhoneNumbers ?? prev.directPhoneNumbers;
        newFormData.emailAddress = extractedData.emailAddress ?? prev.emailAddress;
        newFormData.websiteLinks = extractedData.websiteLinks ?? prev.websiteLinks;
        newFormData.yearsInOperation = extractedData.yearsInOperation?.toString() ?? prev.yearsInOperation;

        // Hall Details
        if (extractedData.halls && Array.isArray(extractedData.halls)) {
          newFormData.halls = extractedData.halls.map((hall: any, index: number) => ({
            id: prev.halls[index]?.id || hall.id || Date.now().toString() + index,
            name: hall.name ?? (prev.halls[index]?.name || ''),
            type: hall.type ?? (prev.halls[index]?.type || ''),
            otherType: hall.otherType ?? (prev.halls[index]?.otherType || ''),
            seatingCapacity: {
              theatre: hall.seatingCapacity?.theatre?.toString() ?? (prev.halls[index]?.seatingCapacity?.theatre || ''),
              roundTable: hall.seatingCapacity?.roundTable?.toString() ?? (prev.halls[index]?.seatingCapacity?.roundTable || ''),
              floating: hall.seatingCapacity?.floating?.toString() ?? (prev.halls[index]?.seatingCapacity?.floating || ''),
            },
            diningArrangement: {
              separateDining: hall.diningArrangement?.has_separate_dining ?? (prev.halls[index]?.diningArrangement?.separateDining || false),
              diningCapacity: hall.diningArrangement?.diningCapacity?.toString() ?? (prev.halls[index]?.diningArrangement?.diningCapacity || ''),
            },
            area: hall.area_sq_ft?.toString() ?? (prev.halls[index]?.area || ''),
            airConditioning: hall.airConditioning ?? (prev.halls[index]?.airConditioning || ''),
            stage: {
              available: hall.stage?.is_available ?? (prev.halls[index]?.stage?.available || false),
              dimensions: hall.stage?.dimensions ?? (prev.halls[index]?.stage?.dimensions || ''),
            },
            danceFloor: {
              available: hall.danceFloor?.is_available ?? (prev.halls[index]?.danceFloor?.available || false),
              size: hall.danceFloor?.size ?? (prev.halls[index]?.danceFloor?.size || ''),
            },
            ambience: hall.ambience ?? (prev.halls[index]?.ambience || ''),
          }));
        }

        // Pricing & Packages
        newFormData.rentalIncludedInCatering = extractedData.is_rental_included_in_catering ?? prev.rentalIncludedInCatering;
        newFormData.rentalCharges = {
          weekday: extractedData.rentalCharges?.weekday?.toString() ?? prev.rentalCharges.weekday,
          weekend: extractedData.rentalCharges?.weekend?.toString() ?? prev.rentalCharges.weekend,
          festival: extractedData.rentalCharges?.festival?.toString() ?? prev.rentalCharges.festival,
        };
        newFormData.rentalDuration = extractedData.rentalDuration ?? prev.rentalDuration;
        newFormData.hourlyRate = extractedData.hourlyRate?.toString() ?? prev.hourlyRate;
        newFormData.basicRentalIncludes = extractedData.basicRentalIncludes ?? prev.basicRentalIncludes;

        // Catering
        newFormData.cateringOptions = extractedData.cateringOptions ?? prev.cateringOptions;
        newFormData.outsideCaterersDetails = {
          tieUps: extractedData.outsideCaterersDetails?.tieUps ?? prev.outsideCaterersDetails.tieUps,
          royaltyFee: extractedData.outsideCaterersDetails?.is_royalty_fee ?? prev.outsideCaterersDetails.royaltyFee,
          kitchenAccess: extractedData.outsideCaterersDetails?.has_kitchen_access ?? prev.outsideCaterersDetails.kitchenAccess,
        };
        newFormData.pricing = {
          vegStandard: {
            min: extractedData.pricing?.vegStandard?.min?.toString() ?? prev.pricing.vegStandard.min,
            max: extractedData.pricing?.vegStandard?.max?.toString() ?? prev.pricing.vegStandard.max,
          },
          vegDeluxe: {
            min: extractedData.pricing?.vegDeluxe?.min?.toString() ?? prev.pricing.vegDeluxe.min,
            max: extractedData.pricing?.vegDeluxe?.max?.toString() ?? prev.pricing.vegDeluxe.max,
          },
          nonVegStandard: {
            min: extractedData.pricing?.nonVegStandard?.min?.toString() ?? prev.pricing.nonVegStandard.min,
            max: extractedData.pricing?.nonVegStandard?.max?.toString() ?? prev.pricing.nonVegStandard.max,
          },
          nonVegDeluxe: {
            min: extractedData.pricing?.nonVegDeluxe?.min?.toString() ?? prev.pricing.nonVegDeluxe.min,
            max: extractedData.pricing?.nonVegDeluxe?.max?.toString() ?? prev.pricing.nonVegDeluxe.max,
          },
        };
        newFormData.cuisineSpecialties = extractedData.cuisineSpecialties ?? prev.cuisineSpecialties;
        newFormData.menuCustomization = extractedData.menuCustomization ?? prev.menuCustomization;

        // Alcohol Policy
        newFormData.alcoholAllowed = extractedData.is_alcohol_allowed ?? prev.alcoholAllowed;
        newFormData.inHouseBar = extractedData.has_in_house_bar ?? prev.inHouseBar;
        newFormData.permitRequired = extractedData.is_permit_required ?? prev.permitRequired;
        newFormData.corkageFee = {
          applicable: extractedData.corkageFee?.is_applicable ?? prev.corkageFee.applicable,
          amount: extractedData.corkageFee?.amount ?? prev.corkageFee.amount,
        };

        // Decoration
        newFormData.decorationOptions = extractedData.decorationOptions ?? prev.decorationOptions;
        newFormData.outsideDecoratorRestrictions = extractedData.outsideDecoratorRestrictions ?? prev.outsideDecoratorRestrictions;
        newFormData.basicDecorIncluded = extractedData.is_basic_decor_included ?? prev.basicDecorIncluded;
        newFormData.basicDecorDetails = extractedData.basicDecorDetails ?? prev.basicDecorDetails;
        newFormData.decorPackages = {
          priceRange: {
            min: extractedData.decorPackages?.priceRange?.min?.toString() ?? prev.decorPackages.priceRange.min,
            max: extractedData.decorPackages?.priceRange?.max?.toString() ?? prev.decorPackages.priceRange.max,
          },
          themes: extractedData.decorPackages?.themes ?? prev.decorPackages.themes,
        };
        newFormData.decorCustomization = extractedData.is_decor_customization ?? prev.decorCustomization;
        newFormData.popularThemes = extractedData.popularThemes ?? prev.popularThemes;

        // Taxes & Payment
        newFormData.gstApplied = extractedData.is_gst_applied ?? prev.gstApplied;
        newFormData.gstPercentage = extractedData.gstPercentage?.toString() ?? prev.gstPercentage;
        newFormData.otherCharges = extractedData.otherCharges ?? prev.otherCharges;
        newFormData.advanceBooking = extractedData.advanceBooking ?? prev.advanceBooking;
        newFormData.paymentTerms = extractedData.paymentTerms ?? prev.paymentTerms;
        newFormData.cancellationPolicy = extractedData.cancellationPolicy ?? prev.cancellationPolicy;
        newFormData.paymentModes = extractedData.paymentModes ?? prev.paymentModes;

        // Amenities
        newFormData.parking = {
          cars: extractedData.parking?.cars?.toString() ?? prev.parking.cars,
          twoWheelers: extractedData.parking?.twoWheelers?.toString() ?? prev.parking.twoWheelers,
          valetAvailable: extractedData.parking?.is_valet_available ?? prev.parking.valetAvailable,
          valetCost: extractedData.parking?.valetCost ?? prev.parking.valetCost,
        };
        newFormData.rooms = {
          total: extractedData.rooms?.total?.toString() ?? prev.rooms.total,
          ac: extractedData.rooms?.ac?.toString() ?? prev.rooms.ac,
          nonAc: extractedData.rooms?.nonAc?.toString() ?? prev.rooms.nonAc,
          complimentary: extractedData.rooms?.is_complimentary ?? prev.rooms.complimentary,
          extraCharges: extractedData.rooms?.extraCharges ?? prev.rooms.extraCharges,
          amenities: extractedData.rooms?.amenities ?? prev.rooms.amenities,
        };
        newFormData.powerBackup = {
          capacity: extractedData.powerBackup?.capacity ?? prev.powerBackup.capacity,
          duration: extractedData.powerBackup?.duration_hours?.toString() ?? prev.powerBackup.duration,
        };
        newFormData.audioVisual = {
          soundSystem: {
            available: extractedData.audioVisual?.has_sound_system ?? prev.audioVisual.soundSystem.available,
            included: extractedData.audioVisual?.is_sound_system_included ?? prev.audioVisual.soundSystem.included,
          },
          projector: {
            available: extractedData.audioVisual?.has_projector ?? prev.audioVisual.projector.available,
            included: extractedData.audioVisual?.is_projector_included ?? prev.audioVisual.projector.included,
          },
          djServices: extractedData.audioVisual?.djServices ?? prev.audioVisual.djServices,
          djCost: extractedData.audioVisual?.djCost ?? prev.audioVisual.djCost,
        };
        newFormData.washrooms = {
          number: extractedData.washrooms?.number?.toString() ?? prev.washrooms.number,
          description: extractedData.washrooms?.description ?? prev.washrooms.description,
        };
        newFormData.accessibility = {
          wheelchairAccess: extractedData.accessibility?.has_wheelchair_access ?? prev.accessibility.wheelchairAccess,
          elevator: extractedData.accessibility?.has_elevator ?? prev.accessibility.elevator,
        };
        newFormData.eventStaffing = {
          staffCount: extractedData.eventStaffing?.staffCount?.toString() ?? prev.eventStaffing.staffCount,
          services: extractedData.eventStaffing?.services ?? prev.eventStaffing.services,
        };
        newFormData.wifiAvailable = extractedData.is_wifi_available ?? prev.wifiAvailable;

        // Ritual & Cultural
        newFormData.fireRitual = extractedData.fireRitual ?? prev.fireRitual;
        newFormData.mandapSetup = extractedData.mandapSetup ?? prev.mandapSetup;

        // AI & Operational
        newFormData.bookingSystem = extractedData.bookingSystem ?? prev.bookingSystem;
        newFormData.integrateWithApp = extractedData.is_integrate_with_app ?? prev.integrateWithApp;
        newFormData.uniqueFeatures = extractedData.uniqueFeatures ?? prev.uniqueFeatures;
        newFormData.idealClientProfile = extractedData.idealClientProfile ?? prev.idealClientProfile;
        newFormData.flexibilityLevel = extractedData.flexibilityLevel?.toString() ?? prev.flexibilityLevel;
        newFormData.aiSuggestions = extractedData.aiSuggestions ?? prev.aiSuggestions;
        newFormData.preferredLeadMode = extractedData.preferredLeadMode ?? prev.preferredLeadMode;
        newFormData.venueRules = extractedData.venueRules ?? prev.venueRules;

        return newFormData;
      });
    }
  }, [onboardingData]);

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
    const vendorFolder = user?.uid || 'unknown-vendor';
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `vendors/${vendorFolder}/${folder}/${fileName}`;

      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(snapshot.ref);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!user) {
      onError("Authentication Error", "User not authenticated. Please log in again.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload files
      const venuePhotoUrls = venuePhotos.length > 0 ? await uploadFiles(venuePhotos, 'venue-photos') : [];
      const sampleMenuUrls = sampleMenus.length > 0 ? await uploadFiles(sampleMenus, 'sample-menus') : [];
      const pastEventPhotoUrls = pastEventPhotos.length > 0 ? await uploadFiles(pastEventPhotos, 'past-events') : [];

      // Prepare vendor data
      const vendorData = {
        uid: user.uid,
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

      // Insert vendor using user.uid as document ID for easier lookup
      await setDoc(doc(db, 'vendors', user.uid), {
        ...vendorData,
        created_at: new Date().toISOString()
      });
      const vendorId = user.uid;

      // Create vendor staff entry for contact person
      // Also use user.uid as doc ID for the owner staff record
      await setDoc(doc(db, 'vendor_staff', user.uid), {
        vendor_id: vendorId,
        uid: user.uid,
        email: formData.emailAddress,
        phone_number: formData.directPhoneNumbers,
        display_name: formData.contactPersonName,
        role: 'owner',
        is_active: true,
        created_at: new Date().toISOString()
      });

      // Create services for each hall
      const hallServicePromises = formData.halls.map(hall => {
        const hallService = {
          vendor_id: vendorId,
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
          }),
          created_at: new Date().toISOString(),
          is_active: true
        };
        return addDoc(collection(db, 'vendor_services'), hallService);
      });

      await Promise.all(hallServicePromises);

      // Add catering service if in-house catering is offered
      if (formData.cateringOptions === 'in-house' || formData.cateringOptions === 'both') {
        await addDoc(collection(db, 'vendor_services'), {
          vendor_id: vendorId,
          service_name: 'In-house Catering',
          service_category: 'Catering',
          description: `Specialties: ${formData.cuisineSpecialties.join(', ')}`,
          base_price: parseInt(formData.pricing.vegStandard.min) || null,
          customizability_details: JSON.stringify({
            cuisines: formData.cuisineSpecialties,
            pricing: formData.pricing,
            customization: formData.menuCustomization
          }),
          created_at: new Date().toISOString(),
          is_active: true
        });
      }

      await refreshVendorProfile();

      toast({
        title: "Onboarding Completed!",
        description: "Your venue has been successfully registered with SanskaraAi.",
      });

      // Update vendor to active
      await updateDoc(doc(db, 'vendors', vendorId), {
        is_active: true,
        status: 'active',
        updated_at: new Date().toISOString()
      });

      onCompletion({ vendorId });
      // navigate('/'); // OnboardingLayout will handle navigation
    } catch (error: any) {
      console.error('Error submitting onboarding:', error);
      onError("Submission Error", error.message || "Failed to complete onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    // Basic validation before moving to the next step
    if (currentStep === 1) {
      if (!formData.venueName || !formData.fullAddress || !formData.contactPersonName || !formData.directPhoneNumbers || !formData.emailAddress || !formData.yearsInOperation || venuePhotos.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required basic information and upload venue photos.",
          variant: "destructive",
        });
        return;
      }
    }
    // Add more validation for other steps as needed

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit();
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
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Contact Person Name (Owner/Manager) *</Label>
                  <Input
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))}
                    required
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                  <p className="text-sm text-sanskara-text-secondary">{venuePhotos.length} files selected</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sanskara-text-primary">Venue Space / Hall Details</h3>

              {formData.halls.map((hall, index) => (
                <div key={hall.id} className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-gray-800">Hall {index + 1}</h3>
                    {formData.halls.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHall(hall.id)}
                        className="border-sanskara-text-secondary text-sanskara-text-secondary hover:bg-sanskara-cream hover:border-sanskara-maroon hover:text-sanskara-maroon"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name/Identifier of Hall *</Label>
                        <Input
                          value={hall.name}
                          onChange={(e) => updateHall(hall.id, { name: e.target.value })}
                          placeholder="e.g., Main Hall, Lawn 1"
                          required
                          className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Type of Space *</Label>
                        <Select value={hall.type} onValueChange={(value) => updateHall(hall.id, { type: value })}>
                          <SelectTrigger className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md">
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md mt-2"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                          className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                          className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Air Conditioning</Label>
                        <Select value={hall.airConditioning} onValueChange={(value) => updateHall(hall.id, { airConditioning: value })}>
                          <SelectTrigger className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md">
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
                          className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                          className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                        className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addHall} variant="outline" className="w-full border-sanskara-text-secondary text-sanskara-text-secondary hover:bg-sanskara-cream hover:border-sanskara-maroon hover:text-sanskara-maroon">
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
              <h3 className="text-lg font-semibold mb-4 text-sanskara-text-primary">Pricing, Catering, and Packages</h3>

              {/* Rental & Booking Charges */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Rental & Booking Charges</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.rentalIncludedInCatering}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rentalIncludedInCatering: !!checked }))}
                      className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                            className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                              className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
                              />
                              <Label>{item}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Food & Catering */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Food & Catering</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Catering Options Allowed</Label>
                    <RadioGroup
                      value={formData.cateringOptions}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, cateringOptions: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-house" id="in-house" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                        <Label htmlFor="in-house">In-house Catering Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="outside" id="outside" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                        <Label htmlFor="outside">Outside Caterers Allowed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
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
                          className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.outsideCaterersDetails.royaltyFee}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            outsideCaterersDetails: { ...prev.outsideCaterersDetails, royaltyFee: !!checked }
                          }))}
                          className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                          className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                                className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                            <RadioGroupItem value="yes" id="menu-yes" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                            <Label htmlFor="menu-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="menu-no" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                            <Label htmlFor="menu-no">No</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="menu-partial" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
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
                          <p className="text-sm text-sanskara-text-secondary">{sampleMenus.length} files selected</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Amenities & Event Services</h3>

              {/* Alcohol Policy */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold">Alcohol Policy</h3>
                <div className="space-y-4 mt-4">
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
                </div>
              </div>

              {/* Decoration */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold">Decoration</h3>
                <div className="space-y-4 mt-4">
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
                </div>
              </div>

              {/* Parking */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold">Parking</h3>
                <div className="space-y-4 mt-4">
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
                </div>
              </div>

              {/* Power Backup & AV Equipment */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold">Power Backup & AV Equipment</h3>
                <div className="space-y-4 mt-4">
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
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-sanskara-text-primary">Policies & Operations</h3>

              {/* Taxes & Payment */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Taxes & Payment</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.gstApplied}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gstApplied: !!checked }))}
                      className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
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
                        className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Other Charges/Hidden Fees (if any)</Label>
                    <Textarea
                      value={formData.otherCharges}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherCharges: e.target.value }))}
                      rows={3}
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Advance Booking Amount</Label>
                    <Input
                      value={formData.advanceBooking}
                      onChange={(e) => setFormData(prev => ({ ...prev, advanceBooking: e.target.value }))}
                      placeholder="e.g., 30% of total or ₹50,000"
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Terms & Schedule</Label>
                    <Textarea
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      rows={3}
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cancellation & Refund Policy</Label>
                    <Textarea
                      value={formData.cancellationPolicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                      rows={3}
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
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
                            className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
                          />
                          <Label className="text-sm">{mode}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ritual & Cultural Support */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Ritual & Cultural Support</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Is Fire/Hawan Ritual Allowed?</Label>
                    <Select value={formData.fireRitual} onValueChange={(value) => setFormData(prev => ({ ...prev, fireRitual: value }))}>
                      <SelectTrigger className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md">
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
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* AI & Operational Data */}
              <div className="mb-6 rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <h3 className="text-md font-semibold text-gray-800 mb-4">AI & Operational Data</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Booking & Calendar Management System</Label>
                    <Select value={formData.bookingSystem} onValueChange={(value) => setFormData(prev => ({ ...prev, bookingSystem: value }))}>
                      <SelectTrigger className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md">
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
                      className="border-gray-300 focus:ring-sanskara-deep-blue text-sanskara-maroon"
                    />
                    <Label>Willing to Integrate with SanskaraAi App/Portal?</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Unique Features / Selling Points of Your Venue</Label>
                    <Textarea
                      value={formData.uniqueFeatures}
                      onChange={(e) => setFormData(prev => ({ ...prev, uniqueFeatures: e.target.value }))}
                      rows={4}
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ideal Client Profile (type of events, budget preferences)</Label>
                    <Textarea
                      value={formData.idealClientProfile}
                      onChange={(e) => setFormData(prev => ({ ...prev, idealClientProfile: e.target.value }))}
                      rows={3}
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Select value={formData.flexibilityLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, flexibilityLevel: value }))}>
                      <SelectTrigger className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md">
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
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                    {pastEventPhotos.length > 0 && (
                      <p className="text-sm text-sanskara-text-secondary">{pastEventPhotos.length} files selected</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Would You Consider Allowing AI to Suggest Menu or Decor Based on Client Profiles?</Label>
                    <RadioGroup
                      value={formData.aiSuggestions}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, aiSuggestions: value }))}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ai-yes" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                        <Label htmlFor="ai-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ai-no" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                        <Label htmlFor="ai-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="needs-approval" id="ai-approval" className="border-gray-300 text-sanskara-maroon focus:ring-sanskara-deep-blue" />
                        <Label htmlFor="ai-approval">Needs Approval</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Mode of Receiving Leads/Bookings from SanskaraAi</Label>
                    <Select value={formData.preferredLeadMode} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLeadMode: value }))}>
                      <SelectTrigger className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md">
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
                      className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                    />
                  </div>
                </div>
              </div>
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
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-transparent">
      {renderStepContent()}

      <div className="flex justify-between mt-8">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSubmitting}
          variant="outline"
          className="flex items-center space-x-2 border-sanskara-deep-blue text-sanskara-deep-blue hover:bg-sanskara-cream"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center space-x-2 bg-sanskara-deep-blue text-white hover:bg-sanskara-maroon"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span>{currentStep === steps.length ? 'Submit Onboarding' : 'Next'}</span>
          {!isSubmitting && currentStep !== steps.length && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ManualVendorOnboarding;