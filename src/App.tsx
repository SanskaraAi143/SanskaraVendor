
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
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

function App() {
  const { user } = useAuth();
  
  return (
    <DataCacheProvider>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
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
          <Route path="profile" element={<Profile />} />
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
