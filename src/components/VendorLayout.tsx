
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import VendorSidebar from './VendorSidebar';
import VendorHeader from './VendorHeader';
import { useAuth } from '@/hooks/useAuthContext';
import { useLocation, Navigate } from 'react-router-dom';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const { user, vendorProfile, staffProfile, isLoading, isLoadingProfile } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is staff, redirect to staff portal
  if (staffProfile) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // If user doesn't have vendor profile, redirect to onboarding
  if (!vendorProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        <VendorSidebar />
        <div className="flex-1 flex flex-col">
          <VendorHeader />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default VendorLayout;
