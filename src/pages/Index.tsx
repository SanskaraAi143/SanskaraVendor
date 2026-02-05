
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, vendorProfile, staffProfile, isLoading, isLoadingVendorProfile, isLoadingStaffProfile, userType } = useAuth();

  useEffect(() => {
    if (isLoading || isLoadingVendorProfile || isLoadingStaffProfile) return;

    if (user) {
      // Priority 1: Check Staff Profile
      if (staffProfile) {
        // User is vendor owner, check vendor onboarding
        if (staffProfile.role === 'owner') {
             const onboardingSkipped = localStorage.getItem('onboardingSkipped') === 'false';
             const needsVendorOnboarding = !vendorProfile && !onboardingSkipped;
             if (needsVendorOnboarding) navigate("/onboard");
             else navigate("/dashboard");
             return;
        }
        
        // User is staff (not owner), check staff onboarding
        const needsStaffOnboarding = !staffProfile.display_name || !staffProfile.role || staffProfile.invitation_status === 'pending';
        if (needsStaffOnboarding) navigate("/staff/onboarding");
        else navigate("/staff/dashboard");
        return;
      } 
      
      // Priority 2: Check Vendor Profile
      if (vendorProfile) {
        const onboardingSkipped = localStorage.getItem('onboardingSkipped') === 'false';
        const needsVendorOnboarding = !vendorProfile && !onboardingSkipped;
        if (needsVendorOnboarding) navigate("/onboard");
        else navigate("/dashboard");
        return;
      }

      // Priority 3: No profiles loaded yet, but user exists. Check user_type via Auth hook if available?
      // But Index receives valid user... 
      // If we are here, profiles are null but isLoading is false. This implies "New User" or "Broken State"
      
      // If the user_type logic in AuthProvider decided they are 'staff', but staffProfile failed to load?
      // We should probably rely on userType from useAuth if available
      // The useAuth hook exposes userType. Let's start using it in Index.tsx
      // Priority 3: Fallback based on User Type if profiles are missing
      // This catches new users who haven't completed onboarding or created profiles yet
      if (userType === 'staff') {
        navigate("/staff/onboarding");
      } else if (userType === 'vendor') {
        navigate("/onboard");
      } else {
         // Default catch-all
         navigate("/login");
      }
    }
  }, [user, vendorProfile, staffProfile, isLoading, isLoadingVendorProfile, isLoadingStaffProfile, navigate, userType]);

  // Show loading while checking authentication
  if (isLoading || isLoadingVendorProfile || isLoadingStaffProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading...</p>
      </div>
    );
  }

  // If no user is logged in, show the landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-sanskara-cream to-white">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-sanskara-red">Vendor</span>{" "}
              <span className="text-sanskara-gold">Management</span>{" "}
              <span className="text-sanskara-maroon">Portal</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your business operations with our comprehensive vendor management platform. 
              Manage bookings, services, staff, and grow your business efficiently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-sanskara-red hover:bg-sanskara-maroon text-white px-8 py-3"
                onClick={() => navigate('/signup')}
              >
                Get Started Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-sanskara-red text-sanskara-red hover:bg-sanskara-red hover:text-white px-8 py-3"
                onClick={() => navigate('/login')}
              >
                Login to Dashboard
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-sanskara-maroon mb-3">Manage Bookings</h3>
                <p className="text-gray-600">Keep track of all your appointments and bookings in one centralized dashboard.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-sanskara-maroon mb-3">Service Management</h3>
                <p className="text-gray-600">Easily add, edit, and manage your services with detailed descriptions and pricing.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-sanskara-maroon mb-3">Staff Coordination</h3>
                <p className="text-gray-600">Coordinate with your team members and manage staff schedules effectively.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
