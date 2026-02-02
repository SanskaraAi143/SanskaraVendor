import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
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

      const vendorRef = doc(db, 'vendors', userId);
      const vendorSnap = await getDoc(vendorRef);

      if (vendorSnap.exists()) {
        const data = vendorSnap.data();

        const profile: VendorProfile = {
          vendor_id: vendorSnap.id,
          vendor_name: data.vendor_name || '',
          vendor_category: data.vendor_category || '',
          contact_email: data.contact_email || '',
          is_verified: data.is_verified || false,
          is_active: data.is_active || false,
          phone_number: data.phone_number || undefined,
          website_url: data.website_url || undefined,
          description: data.description || undefined,
          portfolio_image_urls: data.portfolio_image_urls || [],
          address: data.address || undefined,
          pricing_range: data.pricing_range || undefined,
          details: data.details || undefined,
          status: data.status || undefined,
        };

        setVendorProfile(profile);
      } else {
        // Fallback or search by supabase_auth_uid (which is now just uid in firebase)
        const vendorsRef = collection(db, 'vendors');
        const q = query(vendorsRef, where('supabase_auth_uid', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          const profile: VendorProfile = {
            vendor_id: doc.id,
            vendor_name: data.vendor_name || '',
            vendor_category: data.vendor_category || '',
            contact_email: data.contact_email || '',
            is_verified: data.is_verified || false,
            is_active: data.is_active || false,
            phone_number: data.phone_number || undefined,
            website_url: data.website_url || undefined,
            description: data.description || undefined,
            portfolio_image_urls: data.portfolio_image_urls || [],
            address: data.address || undefined,
            pricing_range: data.pricing_range || undefined,
            details: data.details || undefined,
            status: data.status || undefined,
          };
          setVendorProfile(profile);
        } else {
          setVendorProfile(null);
        }
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

      const staffRef = doc(db, 'vendor_staff', userId);
      const staffSnap = await getDoc(staffRef);

      if (staffSnap.exists()) {
        const data = staffSnap.data();

        const profile: StaffProfile = {
          staff_id: staffSnap.id,
          vendor_id: data.vendor_id,
          display_name: data.display_name || '',
          email: data.email || '',
          phone_number: data.phone_number || undefined,
          role: data.role || 'staff',
          is_active: data.is_active || false,
          invitation_status: data.invitation_status || undefined,
        };

        setStaffProfile(profile);
      } else {
        // Fallback or search by supabase_auth_uid
        const staffColRef = collection(db, 'vendor_staff');
        const q = query(staffColRef, where('supabase_auth_uid', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          const profile: StaffProfile = {
            staff_id: doc.id,
            vendor_id: data.vendor_id,
            display_name: data.display_name || '',
            email: data.email || '',
            phone_number: data.phone_number || undefined,
            role: data.role || 'staff',
            is_active: data.is_active || false,
            invitation_status: data.invitation_status || undefined,
          };
          setStaffProfile(profile);
        } else {
          setStaffProfile(null);
        }
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
    } finally {
      setIsLoadingStaffProfile(false);
    }
  };

  // Function to manually refresh vendor profile data
  const refreshVendorProfile = async () => {
    if (user?.uid) {
      await fetchVendorProfile(user.uid);
    }
  };

  // Function to manually refresh staff profile data
  const refreshStaffProfile = async () => {
    if (user?.uid) {
      await fetchStaffProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserType(null);
        return;
      }

      setIsLoadingUserType(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error('User profile not found in Firestore');
          // Maybe it's stored by supabase_auth_uid?
          const usersColRef = collection(db, 'users');
          const q = query(usersColRef, where('supabase_auth_uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            await signOut();
            return;
          }

          const userProfile = querySnapshot.docs[0].data();
          await processUserType(userProfile);
        } else {
          const userProfile = userSnap.data();
          await processUserType(userProfile);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
      } finally {
        setIsLoadingUserType(false);
      }
    };

    const processUserType = async (userProfile: any) => {
      if (userProfile?.user_type === 'vendor_staff' || userProfile?.user_type === 'staff') {
        setUserType('staff');
        await fetchStaffProfile(user!.uid);
      } else if (userProfile?.user_type === 'vendor') {
        setUserType('vendor');
        await fetchVendorProfile(user!.uid);
        await fetchStaffProfile(user!.uid);
      } else {
        setUserType('customer');
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!isLoading && user) {
      if (userType === 'vendor' && vendorProfile) {
        if (vendorProfile.status !== 'onboarding_complete' && !location.pathname.startsWith('/onboard')) {
          navigate('/onboard');
        } else if (vendorProfile.status === 'onboarding_complete' && location.pathname.startsWith('/onboard')) {
          navigate('/dashboard');
        }
      } else if (userType === 'staff' && staffProfile) {
        if (!staffProfile.is_active && location.pathname !== '/staff/onboarding') {
          navigate('/staff/onboarding');
        } else if (staffProfile.is_active && location.pathname === '/staff/onboarding') {
          navigate('/staff/dashboard');
        }
      }
    }
  }, [user, userType, vendorProfile, staffProfile, isLoading, navigate, location.pathname]);


  // ... keep existing code (signIn, signUp, signOut functions)
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      let userProfileData = userSnap.exists() ? userSnap.data() : null;

      if (!userProfileData) {
        // Fallback search
        const usersColRef = collection(db, 'users');
        const q = query(usersColRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userProfileData = querySnapshot.docs[0].data();
        }
      }

      if (!userProfileData) {
        throw new Error("User profile not found");
      }

      if (userProfileData.user_type === 'vendor_staff') {
        toast({
          title: "Access Denied",
          description: "Vendor staff should use the vendor staff portal.",
          variant: "destructive",
        });
        await firebaseSignOut(auth);
        return;
      }

      if (userProfileData.user_type !== 'vendor' && userProfileData.user_type !== 'staff') {
        toast({
          title: "Access Denied",
          description: "Only vendors and staff are allowed to log in here.",
          variant: "destructive",
        });
        await firebaseSignOut(auth);
        return;
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      if (userProfileData.user_type === 'vendor') {
        const vendorRef = doc(db, 'vendors', user.uid);
        const vendorSnap = await getDoc(vendorRef);
        const currentVendorProfile = vendorSnap.exists() ? vendorSnap.data() : null;

        if (currentVendorProfile?.status !== 'onboarding_complete') {
          navigate('/onboard');
        } else {
          navigate('/dashboard');
        }
      } else if (userProfileData.user_type === 'staff') {
        navigate('/staff/dashboard');
      } else {
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

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user record in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        user_type: userType,
        display_name: metadata.display_name || '',
        firebase_uid: firebaseUser.uid,
        created_at: new Date().toISOString(),
      });

      if (userType === 'vendor') {
        const vendorId = `vendor_${Date.now()}`;
        await setDoc(doc(db, 'vendors', firebaseUser.uid), {
          vendor_id: vendorId,
          vendor_name: metadata.vendor_name,
          vendor_category: metadata.vendor_category,
          firebase_uid: firebaseUser.uid,
          contact_email: email,
          phone_number: metadata.phone_number,
          is_active: false,
          status: 'onboarding_in_progress',
          created_at: new Date().toISOString(),
        });

        await setDoc(doc(db, 'vendor_staff', firebaseUser.uid), {
          staff_id: `staff_${Date.now()}`,
          vendor_id: vendorId,
          firebase_uid: firebaseUser.uid,
          display_name: metadata.display_name,
          email: email,
          phone_number: metadata.phone_number,
          role: 'owner',
          created_at: new Date().toISOString(),
        });
      } else if (userType === 'vendor_staff') {
        await setDoc(doc(db, 'vendor_staff', firebaseUser.uid), {
          staff_id: `staff_${Date.now()}`,
          vendor_id: metadata.vendor_id,
          firebase_uid: firebaseUser.uid,
          display_name: metadata.display_name,
          email: email,
          phone_number: metadata.phone_number,
          role: metadata.role,
          invitation_status: 'pending',
          created_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Registration successful",
        description: "Welcome!",
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
      const vendorRef = doc(db, 'vendors', vendorId);
      await updateDoc(vendorRef, updates as any);

      // Refresh the vendor profile to get the latest data
      await refreshVendorProfile();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during the update",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      localStorage.clear();
      sessionStorage.clear();

      await firebaseSignOut(auth);

      setUser(null);
      setUserType(null);
      setVendorProfile(null);
      setStaffProfile(null);

      window.location.href = '/login';
      toast({
        title: "Logged out",
        description: "You have been logged out",
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