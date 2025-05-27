import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

// Define address and pricing range types
export interface AddressData {
  city: string;
  state: string;
  country: string;
  full_address: string;
}

export interface PricingRangeData {
  min: string;
  max: string;
  currency: string;
}

type VendorProfile = {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  contact_email: string;
  is_verified: boolean;
  phone_number?: string;
  website_url?: string;
  description?: string;
  portfolio_image_urls?: string[];
  address?: AddressData;
  pricing_range?: PricingRangeData;
}

type StaffProfile = {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  email: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  invitation_status: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  vendorProfile: VendorProfile | null;
  staffProfile: StaffProfile | null;
  isLoadingProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any, userType?: 'vendor' | 'vendor_staff' | 'customer') => Promise<void>;
  signOut: () => Promise<void>;
  refreshVendorProfile: () => Promise<void>;
  refreshStaffProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const navigate = useNavigate();

  // Fetch vendor profile data
  const fetchVendorProfile = async (userId: string) => {
    try {
      setIsLoadingProfile(true);
      console.log("Fetching vendor profile for user:", userId);
      
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
        console.log("Vendor profile found:", data);
        
        const profile: VendorProfile = {
          vendor_id: data.vendor_id,
          vendor_name: data.vendor_name || '',
          vendor_category: data.vendor_category || '',
          contact_email: data.contact_email || '',
          is_verified: data.is_verified || false,
          phone_number: data.phone_number || undefined,
          website_url: data.website_url || undefined,
          description: data.description || undefined,
          portfolio_image_urls: data.portfolio_image_urls as string[] || [],
          address: data.address as unknown as AddressData || undefined,
          pricing_range: data.pricing_range as unknown as PricingRangeData || undefined
        };
        
        setVendorProfile(profile);
      } else {
        console.log("No vendor profile found for user:", userId);
        setVendorProfile(null);
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch staff profile data
  const fetchStaffProfile = async (userId: string) => {
    try {
      setIsLoadingProfile(true);
      console.log("Fetching staff profile for user:", userId);
      
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
        console.log("Staff profile found:", data);
        
        const profile: StaffProfile = {
          staff_id: data.staff_id,
          vendor_id: data.vendor_id,
          display_name: data.display_name || '',
          email: data.email || '',
          phone_number: data.phone_number || undefined,
          role: data.role || 'staff',
          is_active: data.is_active || false,
          invitation_status: data.invitation_status || 'pending'
        };
        
        setStaffProfile(profile);
      } else {
        console.log("No staff profile found for user:", userId);
        setStaffProfile(null);
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
    } finally {
      setIsLoadingProfile(false);
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setTimeout(() => {
            if (currentSession?.user) {
              // Try to fetch both vendor and staff profiles
              fetchVendorProfile(currentSession.user.id);
              fetchStaffProfile(currentSession.user.id);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setVendorProfile(null);
          setStaffProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession ? "yes" : "no");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchVendorProfile(currentSession.user.id);
        fetchStaffProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

      navigate('/');
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
    userType: 'vendor' | 'vendor_staff' | 'customer'
  ) => {
    try {
      setIsLoading(true);

      const userMetadata = {
        ...metadata,
        user_type: userType,
      };

      console.log("Signing up with metadata:", userMetadata);

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
        const { error: updateError } = await supabase
          .from('users')
          .update({ user_type: userType })
          .eq('supabase_auth_uid', data.user.id);

        if (updateError) {
          console.error('Error updating user_type:', updateError);
          throw updateError;
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

  const signOut = async () => {
    try {
      setIsLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast({
          title: "Session not found",
          description: "You are already logged out.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
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
      vendorProfile, 
      staffProfile,
      isLoadingProfile,
      signIn, 
      signUp: (email, password, metadata, userType) => signUp(email, password, metadata, userType),
      signOut,
      refreshVendorProfile,
      refreshStaffProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
