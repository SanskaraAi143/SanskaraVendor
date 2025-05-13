
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import VendorSidebar from '@/components/VendorSidebar';
import VendorHeader from '@/components/VendorHeader';

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider collapsedWidth={56} defaultCollapsed={false}>
      <div className="min-h-screen flex w-full">
        <VendorSidebar />
        
        <div className="flex-1">
          <VendorHeader />
          
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
