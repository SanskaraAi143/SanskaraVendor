
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing, isLoadingUserType, userType, signOut } = useAuth();
  const location = useLocation();

  // If authenticated but no user type, they need to onboard
  const needsOnboarding = user && !isInitializing && !isLoadingUserType && !userType;

  // Sign out ONLY if they have a type but it's not vendor
  const shouldSignOut =
    user && !isInitializing && !isLoadingUserType && userType && userType !== 'vendor';

  React.useEffect(() => {
    if (shouldSignOut) {
      console.warn('ProtectedRoute: Redirecting to login because userType is invalid for vendor portal:', userType);
      signOut();
    }
  }, [shouldSignOut, signOut]);

  // Show loading state while checking auth and user type
  if (isInitializing || isLoadingUserType) {
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

  // Authenticated but no profile yet -> Onboard
  if (needsOnboarding) {
    return <Navigate to="/onboard" replace />;
  }

  if (shouldSignOut) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
