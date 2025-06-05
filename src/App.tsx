import { Routes, Route, Navigate } from 'react-router-dom';
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
import { useAuth } from './hooks/useAuthContext';
import { DataCacheProvider } from './hooks/useDataCache';
import Reviews from './pages/Reviews';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import VendorOnboarding from './pages/VendorOnboarding';
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

function App() {
  const { user, vendorProfile, isLoading, isLoadingProfile } = useAuth();
  const loading = isLoading || isLoadingProfile;

  // Onboarding logic: Only require onboarding if vendorProfile is null and onboarding has not been skipped
  const onboardingSkipped = localStorage.getItem('onboardingSkipped') === 'false';
  const needsOnboarding = !loading && user && !vendorProfile && !onboardingSkipped;
  console.log('load,vendorProfile, needsOnboarding:', loading, vendorProfile, needsOnboarding); 
  if (loading) return null;

  return (
    <DataCacheProvider>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route path="/staff/login" element={<StaffLoginPage />} />
        {/* Protected Staff Routes */}
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
        {/* Vendor onboarding route */}
        <Route 
          path="/onboarding" 
          element={
            user ? (
              needsOnboarding ? 
                <VendorOnboarding /> : 
                <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            {needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <MainLayout />
            )}
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="services" element={<Services />} />
          <Route path="services/add" element={<AddService />} />
          <Route path="services/edit/:serviceId" element={<EditService />} />
          <Route path="staff" element={<Staff />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="payments" element={<Payments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reviews" element={<Reviews />} />
        </Route>
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DataCacheProvider>
  );
}

export default App;
