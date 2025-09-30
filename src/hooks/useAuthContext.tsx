import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

import { User, Session } from '@supabase/supabase-js';
import { toast } from '../components/ui/use-toast';

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
  // Define properties based on actual usage or schema
  // For now, using a generic object type
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
}

type StaffProfile = {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  email: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  invitation_status?: 'pending' | 'accepted' | 'rejected';
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoadingUserType: boolean;
  vendorProfile: VendorProfile | null;
  staffProfile: StaffProfile | null;
  userType: 'vendor' | 'staff' | 'customer' | null;
  isLoadingVendorProfile: boolean;
  isLoadingStaffProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any, userType?: 'vendor' | 'vendor_staff' | 'customer') => Promise<void>;
  signOut: () => Promise<void>;
  updateVendor: (vendorId: string, updates: Partial<VendorProfile>) => Promise<void>;
  refreshVendorProfile: () => Promise<void>;
  refreshStaffProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ... keep existing code (state declarations and other functions)
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [userType, setUserType] = useState<'vendor' | 'staff' | 'customer' | null>(null);
  const [isLoadingVendorProfile, setIsLoadingVendorProfile] = useState(false);
  const [isLoadingStaffProfile, setIsLoadingStaffProfile] = useState(false);
  const [isLoadingUserType, setIsLoadingUserType] = useState(false);
  const navigate = useNavigate();

  // Fetch vendor profile data
  const fetchVendorProfile = async (userId: string) => {
    try {
      setIsLoadingVendorProfile(true);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('supabase_auth_uid', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vendor profile:', error);
        return;
      }

      if (data) {
        
        const profile: VendorProfile = {
          vendor_id: data.vendor_id,
          vendor_name: data.vendor_name || '',
          vendor_category: data.vendor_category || '',
          contact_email: data.contact_email || '',
          is_verified: data.is_verified || false,
          is_active: data.is_active || false,
          phone_number: data.phone_number || undefined,
          website_url: data.website_url || undefined,
          description: data.description || undefined,
          portfolio_image_urls: (data.portfolio_image_urls as string[]) || [],
          address: (data.address as unknown as AddressData) || undefined,
          pricing_range: (data.pricing_range as unknown as PricingRangeData) || undefined,
          details: (data.details as unknown as VendorDetailsData) || undefined,
          status: data.status || undefined,
        };
        
        setVendorProfile(profile);
      } else {
        setVendorProfile(null);
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    } finally {
      setIsLoadingVendorProfile(false);
    }
  };

  // ... keep existing code (fetchStaffProfile and other functions)
  const fetchStaffProfile = async (userId: string) => {
    try {
      setIsLoadingStaffProfile(true);
      
      const { data, error } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('supabase_auth_uid', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching staff profile:', error);
        return;
      }

      if (data) {
        
        const profile: StaffProfile = {
          staff_id: data.staff_id,
          vendor_id: data.vendor_id,
          display_name: data.display_name || '',
          email: data.email || '',
          phone_number: data.phone_number || undefined,
          role: data.role || 'staff',
          is_active: data.is_active || false,
          invitation_status: data.invitation_status as 'pending' | 'accepted' | 'rejected' || undefined,
        };
        
        setStaffProfile(profile);
        
      } else {
        setStaffProfile(null);
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
    } finally {
      setIsLoadingStaffProfile(false);
    }
  };

  // Function to manually refresh vendor profile data
  const refreshVendorProfile = async () => {
    if (user?.id) {
      await fetchVendorProfile(user.id);
    }
  };

  // Function to manually refresh staff profile data
  const refreshStaffProfile = async () => {
    if (user?.id) {
      await fetchStaffProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const currentUserId = user?.id;
      const newUserId = newSession?.user?.id;
      const currentAccessToken = session?.access_token;
      const newAccessToken = newSession?.access_token;

      // Only update state if the user ID or access token has actually changed,
      // or if it's a SIGNED_OUT event (which always implies a change)
      if (currentUserId !== newUserId || currentAccessToken !== newAccessToken || _event === 'SIGNED_OUT') {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      const currentUserId = user?.id;
      const newUserId = initialSession?.user?.id;
      const currentAccessToken = session?.access_token;
      const newAccessToken = initialSession?.access_token;

      if (currentUserId !== newUserId || currentAccessToken !== newAccessToken) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [user, session]); // Add user and session to dependencies for the comparison to work correctly

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserType(null);
        return;
      }

      setIsLoadingUserType(true);
      try {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('users')
          .select('user_type')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (userProfileError) {
          console.error('Error fetching user profile:', userProfileError);
          // Don't sign out on temporary errors
          if (userProfileError.code === 'PGRST116') {
            // Record not found - this is a serious error
            await signOut();
          }
          return;
        }

        // Set user type and fetch corresponding profile
        if (userProfile?.user_type === 'vendor_staff' || userProfile?.user_type === 'staff') {
          setUserType('staff');
          await fetchStaffProfile(user.id);
        } else if (userProfile?.user_type === 'vendor') {
          setUserType('vendor');
          await fetchVendorProfile(user.id);
          // Also fetch staff profile for vendor owners
          await fetchStaffProfile(user.id);
        } else {
          setUserType('customer');
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        // Only sign out on critical errors
        if (error instanceof Error && error.message.includes('not found')) {
          await signOut();
        }
      } finally {
        setIsLoadingUserType(false);
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!isLoading && user) {
      if (userType === 'vendor' && vendorProfile) {
        if (!vendorProfile.is_active && location.pathname !== '/onboarding' && location.pathname !== '/manual-vendor-onboarding') {
          navigate('/onboarding');
        } else if (vendorProfile.is_active && (location.pathname === '/onboarding' || location.pathname === '/manual-vendor-onboarding')) {
          navigate('/dashboard');
        }
      } else if (userType === 'staff' && staffProfile) {
        if (staffProfile.invitation_status === 'pending' && location.pathname !== '/staff/onboarding') {
          navigate('/staff/onboarding');
        } else if (staffProfile.invitation_status === 'accepted' && location.pathname === '/staff/onboarding') {
          navigate('/staff/dashboard');
        }
      }
    }
  }, [user, userType, vendorProfile, staffProfile, isLoading, navigate, location.pathname]);


  // ... keep existing code (signIn, signUp, signOut functions)
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('user_type')
        .eq('email', email)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (userProfile?.user_type === 'vendor_staff') {
        toast({
          title: "Access Denied",
          description: "Vendor staff should use the vendor staff portal.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      if (userProfile?.user_type !== 'vendor') {
        toast({
          title: "Access Denied",
          description: "Only vendors are allowed to log in to the vendor portal.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      // Determine redirection based on userType
      if (userProfile?.user_type === 'vendor') {
        navigate('/dashboard');
      } else if (userProfile?.user_type === 'vendor_staff' || userProfile?.user_type === 'staff') {
        navigate('/staff/dashboard');
      } else {
        // Default redirection for other user types or if user_type is not set
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: any = {},
    userType: 'vendor' | 'vendor_staff' | 'customer' = 'customer'
  ) => {
    try {
      setIsLoading(true);

      const userMetadata = {
        ...metadata,
        user_type: userType,
      };


      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) {
        throw error;
      }
      if (data.user) {
        // The trigger creates the user, so we need to update the user_type
        const { error: userError } = await supabase
          .from('users')
          .update({ user_type: userType })
          .eq('supabase_auth_uid', data.user.id);

        if (userError) throw userError;

        if (userType === 'vendor') {
          // Check if a vendor record already exists to prevent duplicates
          const { data: existingVendor, error: existingVendorError } = await supabase
            .from('vendors')
            .select('supabase_auth_uid')
            .eq('supabase_auth_uid', data.user.id)
            .single();

          if (existingVendorError && existingVendorError.code !== 'PGRST116') {
            throw existingVendorError;
          }

          if (!existingVendor) {
            const { data: vendor, error: vendorError } = await supabase
              .from('vendors')
              .insert({
                vendor_name: metadata.vendor_name,
                vendor_category: metadata.vendor_category,
                supabase_auth_uid: data.user.id,
                contact_email: data.user.email,
                phone_number: metadata.phone_number,
                is_active: false,
                status: 'onboarding_in_progress',
              })
              .select()
              .single();

            if (vendorError) throw vendorError;

            const { error: staffError } = await supabase
              .from('vendor_staff')
              .insert({
                vendor_id: vendor.vendor_id,
                supabase_auth_uid: data.user.id,
                display_name: metadata.display_name,
                email: data.user.email,
                phone_number: metadata.phone_number,
                role: 'owner',
              });

            if (staffError) throw staffError;
          }
        } else if (userType === 'vendor_staff') {
          // Check if a staff record already exists
          const { data: existingStaff, error: existingStaffError } = await supabase
            .from('vendor_staff')
            .select('supabase_auth_uid')
            .eq('supabase_auth_uid', data.user.id)
            .single();

          if (existingStaffError && existingStaffError.code !== 'PGRST116') {
            throw existingStaffError;
          }
          
          if (!existingStaff) {
            const { error: staffError } = await supabase
              .from('vendor_staff')
              .insert({
                vendor_id: metadata.vendor_id,
                supabase_auth_uid: data.user.id,
                display_name: metadata.display_name,
                email: data.user.email,
                phone_number: metadata.phone_number,
                role: metadata.role,
                invitation_status: 'pending',
              });

            if (staffError) throw staffError;
          }
        }
      }

      toast({
        title: "Registration successful",
        description: "Please check your email for verification link",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateVendor = async (vendorId: string, updates: Partial<VendorProfile>) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(updates as any)
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Refresh the vendor profile to get the latest data
      await refreshVendorProfile();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during the update",
        variant: "destructive",
      });
    } finally {
      // No need to set isLoading to false here, as it's handled by the parent component
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast({
          title: "Session not found",
          description: "You are already logged out.",
          variant: "destructive",
        });
        window.location.href = '/login';
        return;
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Reset all states
      setUser(null);
      setUserType(null);
      setVendorProfile(null);
      setStaffProfile(null);

      // Clear any cached data
      localStorage.removeItem('vendorProfile');
      localStorage.removeItem('staffProfile');
      localStorage.removeItem('userType');

      window.location.href = '/login';
      toast({
        title: "Logged out",
        description: "You have been logged out for security reasons",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isLoadingUserType,
      vendorProfile,
      staffProfile,
      userType,
      isLoadingVendorProfile,
      isLoadingStaffProfile,
      signIn,
      signUp,
      signOut,
      updateVendor,
      refreshVendorProfile,
      refreshStaffProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};