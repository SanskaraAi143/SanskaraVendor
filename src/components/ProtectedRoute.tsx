
import React from 'react';
import { useAuth } from '../hooks/useAuthContext';
import { supabase } from '../integrations/supabase/client';
import { useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, vendorProfile } = useAuth();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const checkStaff = async () => {
      if (user) {
        // Check if user is a staff (not owner)
        const { data: staffData } = await supabase
          .from('vendor_staff')
          .select('role')
          .eq('supabase_auth_uid', user.id)
          .single();
        if (staffData && staffData.role && staffData.role !== 'owner') {
          await supabase.auth.signOut();
          setShowPopup(true);
          setTimeout(() => setRedirect(true), 2000);
        }
      }
    };
    checkStaff();
  }, [user]);

  if (showPopup) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="mb-4 text-lg font-semibold">Access Restricted</p>
          <p className="mb-2">Staff members cannot access vendor portal. Please log in as a vendor.</p>
          <p>Redirecting to vendor login...</p>
        </div>
      </div>
    );
  }
  if (redirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
