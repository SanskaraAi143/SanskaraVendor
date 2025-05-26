import React from 'react';
import StaffUpcomingBookingsWidget from '@/components/staff/StaffUpcomingBookingsWidget';
import StaffTasksWidget from '@/components/staff/StaffTasksWidget';
import StaffAvailabilityWidget from '@/components/staff/StaffAvailabilityWidget';
import VendorServicesWidget from '@/components/staff/VendorServicesWidget';
import StaffNotificationsWidget from '@/components/staff/StaffNotificationsWidget';

const StaffDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
      <p className="text-muted-foreground mt-1">
        Key metrics and quick access to your modules.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1 */}
        <div className="lg:col-span-2">
          <StaffUpcomingBookingsWidget />
        </div>
        <div className="lg:col-span-1">
          <StaffTasksWidget />
        </div>

        {/* Row 2 */}
        <div className="lg:col-span-1">
          <StaffAvailabilityWidget />
        </div>
        <div className="lg:col-span-1">
          <VendorServicesWidget />
        </div>
        <div className="lg:col-span-1">
          <StaffNotificationsWidget />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
