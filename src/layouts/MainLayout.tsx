
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import VendorSidebar from '@/components/VendorSidebar';
import VendorHeader from '@/components/VendorHeader';
import { useAuth } from '@/hooks/useAuthContext';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';

const MainLayout: React.FC = () => {
  const { vendorProfile, isLoadingProfile } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();

  // Toggle sidebar when screen size changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Add a class to the body for route transitions
  useEffect(() => {
    document.body.classList.add('page-transition');
    const timeout = setTimeout(() => {
      document.body.classList.remove('page-transition');
    }, 300);
    
    return () => {
      clearTimeout(timeout);
      document.body.classList.remove('page-transition');
    };
  }, [location.pathname]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen overflow-hidden bg-sanskara-cream/10">
        {/* Sidebar */}
        <VendorSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <VendorHeader 
            vendorProfile={vendorProfile}
            isLoadingProfile={isLoadingProfile}
          />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
