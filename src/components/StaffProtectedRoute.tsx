
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';

const StaffProtectedRoute: React.FC = () => {
  const { user, isLoading: authLoading, staffProfile, isLoadingProfile } = useAuth();
  const [isCheckingStaffStatus, setIsCheckingStaffStatus] = useState(true);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (authLoading || isLoadingProfile) return;

      setIsCheckingStaffStatus(true);
      try {
        if (!user) {
          setIsStaff(false);
          return;
        }

        // Check if staffProfile exists from AuthContext
        if (staffProfile) {
          setIsStaff(true);
          return;
        }

        // Fallback: Direct database check
        const { data: staffEntry, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id')
          .eq('supabase_auth_uid', user.id)
          .maybeSingle();

        if (staffError) {
          console.error('Error checking vendor_staff:', staffError);
          setIsStaff(false);
          return;
        }

        setIsStaff(!!staffEntry);
      } catch (error) {
        console.error('Unexpected error during staff check:', error);
        setIsStaff(false);
      } finally {
        setIsCheckingStaffStatus(false);
      }
    };

    checkStaffStatus();
  }, [user, authLoading, isLoadingProfile, staffProfile]);

  if (authLoading || isLoadingProfile || isCheckingStaffStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Verifying staff credentials...</p>
      </div>
    );
  }

  if (!isStaff) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
};

export default StaffProtectedRoute;
