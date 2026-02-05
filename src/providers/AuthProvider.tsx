import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
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
import { 
  VendorProfile, 
  StaffProfile 
} from '../types/auth';
import { AuthContext } from '../contexts/authContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [userType, setUserType] = useState<'vendor' | 'staff' | 'customer' | null>(null);
  const [isLoadingVendorProfile, setIsLoadingVendorProfile] = useState(false);
  const [isLoadingStaffProfile, setIsLoadingStaffProfile] = useState(false);
  const [isLoadingUserType, setIsLoadingUserType] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  const clearRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.error("Error clearing reCAPTCHA:", e);
      }
      (window as any).recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  };

  const fetchVendorProfile = async (userId: string) => {
    try {
      setIsLoadingVendorProfile(true);
      const vendorRef = doc(db, 'vendors', userId);
      const vendorSnap = await getDoc(vendorRef);

      if (vendorSnap.exists()) {
        const data = vendorSnap.data();
        setVendorProfile({
          vendor_id: vendorSnap.id,
          vendor_name: data.vendor_name || '',
          vendor_category: data.vendor_category || '',
          contact_email: data.contact_email || '',
          is_verified: data.is_verified || false,
          is_active: data.is_active || false,
          phone_number: data.phone_number,
          website_url: data.website_url,
          description: data.description,
          portfolio_image_urls: data.portfolio_image_urls || [],
          address: data.address,
          pricing_range: data.pricing_range,
          details: data.details,
          status: data.status,
        });
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    } finally {
      setIsLoadingVendorProfile(false);
    }
  };

  const fetchStaffProfile = async (userId: string) => {
    try {
      setIsLoadingStaffProfile(true);
      const staffRef = doc(db, 'vendor_staff', userId);
      const staffSnap = await getDoc(staffRef);

      if (staffSnap.exists()) {
        const data = staffSnap.data();
        setStaffProfile({
          staff_id: staffSnap.id,
          vendor_id: data.vendor_id,
          display_name: data.display_name || '',
          email: data.email || '',
          phone_number: data.phone_number,
          role: data.role || 'staff',
          is_active: data.is_active || false,
          invitation_status: data.invitation_status,
        });
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
    } finally {
      setIsLoadingStaffProfile(false);
    }
  };

  const refreshVendorProfile = async () => {
    if (user?.uid) await fetchVendorProfile(user.uid);
  };

  const refreshStaffProfile = async () => {
    if (user?.uid) await fetchStaffProfile(user.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsInitializing(false);
        setUserType(null);
        setVendorProfile(null);
        setStaffProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserRole = async () => {
    if (!user) return;
    setIsLoadingUserType(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const profile = userSnap.data();
        
        // Auto-detect staff role if email matches a vendor_staff record
        // This handles the case where staff sign up via the generic form (defaulting to vendor/customer)
        if (profile.user_type !== 'staff' && profile.user_type !== 'vendor_staff' && user.email) {
            const staffQuery = query(
                collection(db, 'vendor_staff'), 
                where('email', '==', user.email)
            );
            const staffSnapshot = await getDocs(staffQuery);
            
            if (!staffSnapshot.empty) {
                console.log("Auto-detected staff account based on email. Updating user_type.");
                // Update user to staff
                await updateDoc(userRef, { user_type: 'staff' });
                // Update local profile variable for immediate use
                profile.user_type = 'staff';
                
                // Link firebase_uid to staff record if missing
                const staffDoc = staffSnapshot.docs[0];
                if (!staffDoc.data().firebase_uid) {
                    await updateDoc(staffDoc.ref, { firebase_uid: user.uid });
                }
            }
        }

        if (profile.user_type === 'vendor_staff' || profile.user_type === 'staff') {
          setUserType('staff');
          await fetchStaffProfile(user.uid);
        } else if (profile.user_type === 'vendor') {
          setUserType('vendor');
          await fetchVendorProfile(user.uid);
        } else {
          setUserType('customer');
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    } finally {
      setIsLoadingUserType(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const refreshUserType = async () => {
    await fetchUserRole();
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Sign-in Error:", error);
      let message = "An error occurred during sign-in. Please check your credentials.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Invalid email or password. Please check your credentials.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed login attempts. Please try again later.";
      } else if (error.message?.includes('400')) {
        message = "Sign-in request failed (400). This may be due to account restrictions or configuration issues.";
      }

      toast({ title: "Sign-in failed", description: message, variant: "destructive" });
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
      console.log("Starting signup for:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log("Firebase user created:", firebaseUser.uid);

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
      }

      // Explicitly fetch user role immediately after document creation to prevent race conditions
      // where onAuthStateChanged runs before the document exists
      await fetchUserRole();

      toast({ title: "Registration successful", description: "Welcome!" });
    } catch (error: any) {
      console.error("Signup Error:", error);
      let message = error.message || "An error occurred during registration";
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please sign in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "The password is too weak. Please use at least 6 characters.";
      }
      toast({ title: "Registration failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      const containerId = 'recaptcha-container';
      const container = document.getElementById(containerId);
      if (!container) throw new Error("reCAPTCHA container not found.");

      // Set language to device default
      auth.useDeviceLanguage();

      // Aggressively clear existing verifier and recreated the container element
      // This is the most reliable way to avoid "reCAPTCHA already rendered" errors
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Recaptcha clear failed, proceeding anyway:", e);
        }
        (window as any).recaptchaVerifier = null;
      }
      
      // Remove and recreate the container element to settle the SDK's internal node registry
      const existingContainer = document.getElementById(containerId);
      if (existingContainer) {
        existingContainer.remove();
      }
      const newContainer = document.createElement('div');
      newContainer.id = containerId;
      document.body.appendChild(newContainer);

      console.log("Initializing fresh RecaptchaVerifier with new DOM node");
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, newContainer, {
        'size': 'invisible',
        'callback': () => console.log("reCAPTCHA solved"),
        'expired-callback': () => {
          console.log("reCAPTCHA expired");
          const v = (window as any).recaptchaVerifier;
          if (v) {
            try { v.clear(); } catch (e) {}
            (window as any).recaptchaVerifier = null;
          }
        },
        'error-callback': (error: any) => {
          console.error("reCAPTCHA error callback:", error);
          const v = (window as any).recaptchaVerifier;
          if (v) {
            try { v.clear(); } catch (e) {}
            (window as any).recaptchaVerifier = null;
          }
        }
      });
      
      const appVerifier = (window as any).recaptchaVerifier;
      
      try {
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(confirmation);
        toast({ title: "Code Sent", description: "Please check your phone for the verification code." });
      } catch (smsError: any) {
        console.error("signInWithPhoneNumber Error:", smsError);
        
        // Reset as per documentation instead of clearing
        if (typeof (window as any).grecaptcha !== 'undefined' && (window as any).recaptchaWidgetId !== undefined) {
          try {
            (window as any).grecaptcha.reset((window as any).recaptchaWidgetId);
            console.log("reCAPTCHA reset performed");
          } catch (resetError) {
            console.error("reCAPTCHA reset failed:", resetError);
          }
        }

        let message = "Failed to send SMS.";
        if (smsError.code === 'auth/too-many-requests') {
          message = "Throttled. If on localhost, please ensure you are using a TEST phone number added in the Firebase console.";
        } else if (smsError.code === 'auth/invalid-phone-number') {
          message = "Invalid phone number setup. Use E.164 format (e.g., +16505553434).";
        } else if (smsError.code === 'auth/invalid-app-credential') {
          message = "Invalid App Credential. Please check Firebase Console: 1. Add '10.255.255.254' to Authorized Domains. 2. Verify API Key restrictions.";
        }
        
        toast({ title: "Phone auth failed", description: message, variant: "destructive" });
        throw smsError;
      }
    } catch (error: any) {
      console.error("Phone Auth Wrapper Error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string, userTypePref: 'vendor' | 'staff' | 'customer' = 'vendor') => {
    try {
      setIsLoading(true);
      if (!confirmationResult) throw new Error("No verification session found.");
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      // Check if user document exists, if not create it
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log("Creating default user record for phone login:", firebaseUser.uid);
        await setDoc(userRef, {
          email: firebaseUser.email || '',
          phone_number: firebaseUser.phoneNumber || '',
          user_type: userTypePref,
          firebase_uid: firebaseUser.uid,
          created_at: new Date().toISOString(),
        });
      }

      // Ensure vendor doc existence separately if it's a vendor
      if (userTypePref === 'vendor') {
        const vendorRef = doc(db, 'vendors', firebaseUser.uid);
        const vendorSnap = await getDoc(vendorRef);
        if (!vendorSnap.exists()) {
          console.log("Creating missing vendor record for vendor phone login:", firebaseUser.uid);
          const vendorId = `vendor_${Date.now()}`;
          await setDoc(vendorRef, {
            vendor_id: vendorId,
            firebase_uid: firebaseUser.uid,
            phone_number: firebaseUser.phoneNumber,
            is_active: false,
            status: 'onboarding_in_progress',
            created_at: new Date().toISOString(),
          });
        }
      }

      toast({ title: "Login successful", description: "Welcome!" });
      await fetchUserRole();
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast({ title: "Verification failed", description: "Invalid code.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
      navigate('/login');
    } catch (error: any) {
      toast({ title: "Error", description: "Logout failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateVendor = async (vendorId: string, updates: Partial<VendorProfile>) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), updates as any);
      await refreshVendorProfile();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Check if this email belongs to a staff member
        let userType = 'vendor';
        if (user.email) {
            const staffQuery = query(
                collection(db, 'vendor_staff'), 
                where('email', '==', user.email)
            );
            const staffSnapshot = await getDocs(staffQuery);
            if (!staffSnapshot.empty) {
                console.log("Google Sign-In: Auto-detected staff account. Setting user_type to 'staff'.");
                userType = 'staff';
                
                // Link firebase_uid
                const staffDoc = staffSnapshot.docs[0];
                 if (!staffDoc.data().firebase_uid) {
                    await updateDoc(staffDoc.ref, { firebase_uid: user.uid });
                }
            }
        }

        await setDoc(userRef, {
          email: user.email,
          user_type: userType,
          firebase_uid: user.uid,
          created_at: new Date().toISOString(),
        });
        
        // If it's a new vendor (not staff), we might want to initialize their vendor record?
        // But AuthProvider.fetchUserRole will run next and handle profiles.
      }
      
      // Explicitly fetch role to update state
      await fetchUserRole();
      
    } catch (error: any) {
      toast({ title: "Google Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Success", description: "Password reset email sent." });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to send reset email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isInitializing, isLoadingUserType, vendorProfile, staffProfile, userType,
      isLoadingVendorProfile, isLoadingStaffProfile, signIn, signUp, 
      signInWithGoogle, signInWithPhone, verifyOtp, signOut, 
      updateVendor, refreshVendorProfile, refreshStaffProfile, refreshUserType, resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
