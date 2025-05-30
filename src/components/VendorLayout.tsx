
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import VendorSidebar from './VendorSidebar';
import VendorHeader from './VendorHeader';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
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
