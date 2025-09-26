import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';

const StaffProtectedRoute: React.FC = () => {
  const { user, isLoading, isLoadingUserType, userType, staffProfile } = useAuth();
  const location = useLocation();

  console.log('StaffProtectedRoute Check:', {
    currentPath: location.pathname,
    userType,
    isAuthenticated: !!user,
    isLoading,
    isLoadingUserType,
    hasStaffProfile: !!staffProfile
  });

  // Show loading state while checking auth and user type
  if (isLoading || isLoadingUserType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Verifying staff credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff/login" replace />;
  }

  // Only redirect if we're sure about the user type and they're not staff
  // or if we have loaded the staff profile and it doesn't exist
  if (!isLoadingUserType && userType !== 'staff' && userType !== null) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
};

export default StaffProtectedRoute;