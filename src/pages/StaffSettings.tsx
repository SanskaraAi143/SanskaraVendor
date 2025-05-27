import React from 'react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

const StaffSettings: React.FC = () => {
  return (
    <StaffDashboardLayout>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Staff Settings</h1>
        <p className="text-muted-foreground mb-2">Settings for your staff account will appear here.</p>
        {/* Add settings form or options as needed */}
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffSettings;
