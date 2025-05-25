import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Loader2 } from 'lucide-react'; // Using lucide-react for loader icon

const StaffProtectedRoute: React.FC = () => {
  const [isCheckingStaffStatus, setIsCheckingStaffStatus] = useState(true);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStaffStatus = async () => {
      setIsCheckingStaffStatus(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsStaff(false);
          return;
        }

        if (!session || !session.user) {
          setIsStaff(false); // No active session, not a staff member
          return;
        }

        // User is authenticated, now check if they are in vendor_staff
        const { data: staffEntry, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id') // Select any column to check for existence
          .eq('supabase_auth_uid', session.user.id)
          .maybeSingle(); // Use maybeSingle as there should be at most one entry

        if (staffError) {
          console.error('Error checking vendor_staff:', staffError);
          setIsStaff(false); // Error during check, assume not staff for safety
          return;
        }

        if (staffEntry) {
          setIsStaff(true); // User has an entry in vendor_staff
        } else {
          setIsStaff(false); // User is authenticated but not in vendor_staff
        }
      } catch (error) {
        console.error('Unexpected error during staff check:', error);
        setIsStaff(false);
      } finally {
        setIsCheckingStaffStatus(false);
      }
    };

    checkStaffStatus();
  }, []);

  if (isCheckingStaffStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Verifying staff credentials...</p>
      </div>
    );
  }

  if (!isStaff) {
    // Redirect them to the staff login page if not staff.
    // Pass the current location so that login can redirect back after success.
    return <Navigate to="/staff/login" replace />;
  }

  // If authenticated and confirmed as staff, render the child routes
  return <Outlet />;
};

export default StaffProtectedRoute;
