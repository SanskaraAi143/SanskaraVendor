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
import StaffPortfolioForm from './components/staff/portfolios/StaffPortfolioForm';
import StaffProtectedRoute from './components/StaffProtectedRoute'; // Added import for StaffProtectedRoute
import StaffOnboarding from './pages/StaffOnboarding'; // Import StaffOnboarding
import StaffResetPassword from './pages/StaffResetPassword'; // Import StaffResetPassword
import StaffTasks from './pages/StaffTasks'; // Import StaffTasks
import StaffBookings from './pages/StaffBookings'; // Import StaffBookings

function App() {
  const { user, vendorProfile } = useAuth();
  
  // Check if vendor needs to complete onboarding
  const needsOnboarding = user && 
    (!vendorProfile || 
     !vendorProfile.vendor_name || 
     !vendorProfile.vendor_category || 
     !vendorProfile.description);
  
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
          <Route path="/staff/portfolio" element={<StaffPortfolioForm />} />
          <Route path="/staff/onboarding" element={<StaffOnboarding />} /> {/* Staff onboarding route */}
          <Route path="/staff/reset-password" element={<StaffResetPassword />} /> {/* Staff reset password route */}
          <Route path="/staff/tasks" element={<StaffTasks />} /> {/* Staff tasks route */}
          <Route path="/staff/bookings" element={<StaffBookings />} /> {/* Staff bookings route */}
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
