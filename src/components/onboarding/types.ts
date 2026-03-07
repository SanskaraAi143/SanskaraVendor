// --- Staff Onboarding Types ---
export interface StaffGenericAttributes {
  food_options?: string;
  pricing_details?: string;
  service_type?: string;
}

export interface StaffOnboardingForm {
  name?: string;
  role?: string;
  portfolioTitle?: string;
  portfolioDescription?: string;
  portfolioType?: string;
  genericAttributes?: StaffGenericAttributes;
  imageUrls?: File[];
}


// --- Vendor Onboarding Types ---
export interface PricingRange {
  min?: number | string;
  max?: number | string;
}

export interface HallSeatingCapacity {
  theatre?: number | string;
  roundTable?: number | string;
  floating?: number | string;
}

export interface HallDiningArrangement {
  has_separate_dining?: boolean;
  diningCapacity?: number | string;
}

export interface HallStage {
  is_available?: boolean;
  dimensions?: string;
}

export interface HallDanceFloor {
  is_available?: boolean;
  size?: string;
}

export interface HallDetails {
  id?: string;
  name?: string;
  type?: string;
  otherType?: string;
  seatingCapacity?: HallSeatingCapacity;
  diningArrangement?: HallDiningArrangement;
  area_sq_ft?: number | string;
  airConditioning?: string;
  stage?: HallStage;
  danceFloor?: HallDanceFloor;
  ambience?: string;
}

export interface RentalCharges {
  weekday?: number | string;
  weekend?: number | string;
  festival?: number | string;
}

export interface CateringPricing {
  vegStandard?: PricingRange;
  vegDeluxe?: PricingRange;
  nonVegStandard?: PricingRange;
  nonVegDeluxe?: PricingRange;
}

export interface OutsideCaterersDetails {
  tieUps?: string;
  is_royalty_fee?: boolean;
  has_kitchen_access?: boolean;
}

export interface AlcoholCorkageFee {
  is_applicable?: boolean;
  amount?: string;
}

export interface DecorPackages {
  priceRange?: PricingRange;
  themes?: string;
}

export interface ParkingDetails {
  cars?: number | string;
  twoWheelers?: number | string;
  is_valet_available?: boolean;
  valetCost?: string;
}

export interface RoomDetails {
  total?: number | string;
  ac?: number | string;
  nonAc?: number | string;
  is_complimentary?: boolean;
  extraCharges?: string;
  amenities?: string[];
}

export interface PowerBackupDetails {
  capacity?: string;
  duration_hours?: number | string;
}

export interface AudioVisualDetails {
  has_sound_system?: boolean;
  is_sound_system_included?: boolean;
  has_projector?: boolean;
  is_projector_included?: boolean;
  djServices?: string;
  djCost?: string;
}

export interface WashroomDetails {
  number?: number | string;
  description?: string;
}

export interface AccessibilityDetails {
  has_wheelchair_access?: boolean;
  has_elevator?: boolean;
}

export interface EventStaffingDetails {
  staffCount?: number | string;
  services?: string;
}

export interface VendorOnboardingForm {
  venueName?: string;
  fullAddress?: string;
  contactPersonName?: string;
  directPhoneNumbers?: string;
  emailAddress?: string;
  websiteLinks?: string;
  yearsInOperation?: number | string;
  halls?: HallDetails[];
  is_rental_included_in_catering?: boolean;
  rentalCharges?: RentalCharges;
  rentalDuration?: string[];
  hourlyRate?: number | string;
  basicRentalIncludes?: string[];
  cateringOptions?: string;
  outsideCaterersDetails?: OutsideCaterersDetails;
  pricing?: CateringPricing;
  cuisineSpecialties?: string[];
  menuCustomization?: string;
  is_alcohol_allowed?: boolean;
  has_in_house_bar?: boolean;
  is_permit_required?: boolean;
  corkageFee?: AlcoholCorkageFee;
  decorationOptions?: string;
  outsideDecoratorRestrictions?: string;
  is_basic_decor_included?: boolean;
  basicDecorDetails?: string;
  decorPackages?: DecorPackages;
  is_decor_customization?: boolean;
  popularThemes?: string;
  is_gst_applied?: boolean;
  gstPercentage?: number | string;
  otherCharges?: string;
  advanceBooking?: string;
  paymentTerms?: string;
  cancellationPolicy?: string;
  paymentModes?: string[];
  parking?: ParkingDetails;
  rooms?: RoomDetails;
  powerBackup?: PowerBackupDetails;
  audioVisual?: AudioVisualDetails;
  washrooms?: WashroomDetails;
  accessibility?: AccessibilityDetails;
  eventStaffing?: EventStaffingDetails;
  is_wifi_available?: boolean;
  fireRitual?: string;
  mandapSetup?: string;
  bookingSystem?: string;
  is_integrate_with_app?: boolean;
  uniqueFeatures?: string;
  idealClientProfile?: string;
  flexibilityLevel?: string;
  aiSuggestions?: string;
  preferredLeadMode?: string;
  venueRules?: string;
  documentUrls?: string[];
  imageUrls?: string[];
}


// --- Shared Types ---
export enum SessionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface Transcription {
  user: string;
  agent: string;
  isFinal: boolean;
}
