import { User } from 'firebase/auth';

export type AddressData = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

export type PricingRangeData = {
  min?: number;
  max?: number;
  currency?: string;
};

export type VendorDetailsData = {
  [key: string]: any;
};

export type VendorProfile = {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  contact_email: string;
  is_verified: boolean;
  is_active: boolean;
  phone_number?: string;
  website_url?: string;
  description?: string;
  portfolio_image_urls?: string[];
  address?: AddressData;
  pricing_range?: PricingRangeData;
  details?: VendorDetailsData;
  status?: string;
};

export type StaffProfile = {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  email: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  invitation_status?: 'pending' | 'accepted' | 'rejected';
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  isLoadingUserType: boolean;
  vendorProfile: VendorProfile | null;
  staffProfile: StaffProfile | null;
  userType: 'vendor' | 'staff' | 'customer' | null;
  isLoadingVendorProfile: boolean;
  isLoadingStaffProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any, userType?: 'vendor' | 'vendor_staff' | 'customer') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string, userType?: 'vendor' | 'staff' | 'customer') => Promise<void>;
  signOut: () => Promise<void>;
  updateVendor: (vendorId: string, updates: Partial<VendorProfile>) => Promise<void>;
  refreshVendorProfile: () => Promise<void>;
  refreshStaffProfile: () => Promise<void>;
  refreshUserType: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};
