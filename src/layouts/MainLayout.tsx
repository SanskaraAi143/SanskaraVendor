
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import VendorSidebar from '@/components/VendorSidebar';
import VendorHeader from '@/components/VendorHeader';
import { useAuth } from '@/hooks/useAuthContext';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <div className="flex h-screen overflow-hidden bg-sanskara-cream/10">
      {/* Sidebar */}
      {/* We need to check what props VendorSidebar actually accepts */}
      <VendorSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* We need to check what props VendorHeader actually accepts */}
        <VendorHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
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
  );
};

export default MainLayout;
