import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { DataCacheProvider } from './hooks/useDataCache';
import { Loader2 } from 'lucide-react';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Services from './pages/Services';
import AddService from './pages/AddService';
import EditService from './pages/EditService';
import Staff from './pages/Staff';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Reviews from './pages/Reviews';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
// import VendorOnboarding from './pages/VendorOnboarding';
// import ManualVendorOnboarding from './pages/ManualVendorOnboarding';
import StaffLoginPage from './pages/StaffLoginPage';
import StaffDashboard from './pages/StaffDashboard';
import StaffProtectedRoute from './components/StaffProtectedRoute';
import StaffOnboarding from './pages/StaffOnboarding';
import StaffResetPassword from './pages/StaffResetPassword';
import StaffTasks from './pages/StaffTasks';
import StaffBookings from './pages/StaffBookings';
import StaffAvailabilityPage from './pages/StaffAvailabilityPage';
import StaffVendorServicesPage from './pages/StaffVendorServicesPage';
import StaffNotifications from './pages/StaffNotifications';
import StaffProfile from './pages/StaffProfile';
import StaffSettings from './pages/StaffSettings';
import OnboardingLayout from './layouts/OnboardingLayout';
import CompletionStep from './components/onboarding/CompletionStep';
import DocumentUploadStep from './components/onboarding/DocumentUploadStep';
import AiChatStep from './components/onboarding/AiChatStep';
import AutofillVendorOnboarding from './components/onboarding/AutofillVendorOnboarding';
import { VendorOnboarding } from './components/onboarding/VendorOnboarding';
// Removed empty vendor-onboarding step imports

import UserGuide from './pages/UserGuide';

import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const { user, isInitializing, userType } = useAuth();

  console.log('App Route State:', {
    isInitializing,
    userType,
    isAuthenticated: !!user
  });

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DataCacheProvider>
      <NotificationProvider>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage />
            ) : userType === 'staff' ? (
              <Navigate to="/staff/dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !user ? (
              <LoginPage />
            ) : userType === 'staff' ? (
              <Navigate to="/staff/dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Protected Staff Routes - All staff routes must be under /staff/ */}
        <Route element={<StaffProtectedRoute />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/onboarding" element={<StaffOnboarding />} />
          <Route path="/staff/reset-password" element={<StaffResetPassword />} />
          <Route path="/staff/tasks" element={<StaffTasks />} />
          <Route path="/staff/bookings" element={<StaffBookings />} />
          <Route path="/staff/availability" element={<StaffAvailabilityPage />} />
          <Route path="/staff/services" element={<StaffVendorServicesPage />} />
          <Route path="/staff/notifications" element={<StaffNotifications />} />
          <Route path="/staff/profile" element={<StaffProfile />} />
          <Route path="/staff/settings" element={<StaffSettings />} />
        </Route>

        {/* Onboarding Routes - Updated to use new AI onboarding */}
        <Route path="/onboard" element={<VendorOnboarding onBack={() => {}} />} />

        {/* Protected Vendor Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/dashboard/bookings" element={<Bookings />} />
          <Route path="/dashboard/calendar" element={<Calendar />} />
          <Route path="/dashboard/services" element={<Services />} />
          <Route path="/dashboard/services/add" element={<AddService />} />
          <Route path="/dashboard/services/edit/:serviceId" element={<EditService />} />
          <Route path="/dashboard/staff" element={<Staff />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/dashboard/payments" element={<Payments />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/profile/edit" element={<EditProfile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/reviews" element={<Reviews />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </NotificationProvider>
    </DataCacheProvider>
  );
}

export default App;
