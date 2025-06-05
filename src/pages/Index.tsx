
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, vendorProfile, staffProfile, isLoading, isLoadingProfile } = useAuth();

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (user) {
      // If user is logged in, redirect based on their role
      if (staffProfile) {
        // User is staff, redirect to staff dashboard
        navigate("/staff/dashboard");
      } else if (vendorProfile) {
        // User is vendor, redirect to vendor dashboard
        navigate("/dashboard");
      } else {
        // User exists but no profile found, redirect to onboarding
        navigate("/onboarding");
      }
    }
  }, [user, vendorProfile, staffProfile, isLoading, isLoadingProfile, navigate]);

  // Show loading while checking authentication
  if (isLoading || isLoadingProfile) {
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
