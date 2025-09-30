
import React from 'react';
import { useAuth } from '../hooks/useAuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isLoadingUserType, userType, signOut } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth and user type
  if (isLoading || isLoadingUserType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // No user type or wrong user type
  if (!userType) {
    // Call signOut in a useEffect to avoid state update during render
    React.useEffect(() => {
      signOut();
    }, [signOut]);
    return null; // Let AuthContext handle the redirect after signOut
  }

  if (userType !== 'vendor') {
    // Call signOut in a useEffect to avoid state update during render
    React.useEffect(() => {
      signOut();
    }, [signOut]);
    return null; // Let AuthContext handle the redirect after signOut
  }

  return <>{children}</>;
};

export default ProtectedRoute;
