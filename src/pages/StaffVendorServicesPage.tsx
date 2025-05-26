import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import ServicesList from '@/components/ServicesList'; // Import the ServicesList component
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';

const StaffVendorServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    const fetchVendorId = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('vendor_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData || !staffData.vendor_id) {
          setError('Staff profile not found or not associated with a vendor.');
          setLoading(false);
          return;
        }
        setVendorId(staffData.vendor_id);
      } catch (err: any) {
        console.error('Error fetching vendor_id:', err);
        setError(err.message || 'Failed to load vendor information.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorId();
  }, [user, authLoading, navigate]);

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading vendor data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      );
    }

    if (!vendorId) {
       return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-gray-500">Could not determine vendor to display services for.</p>
        </div>
      );
    }
    
    // The ServicesList component has its own Card structure, header, and data fetching.
    // We might want to adjust ServicesList or embed its core logic here if we need a different title/header.
    // For now, we pass vendorId and a prop to show all services.
    return <ServicesList vendorId={vendorId} showAll={true} />;
  };

  return (
    <StaffDashboardLayout>
      {/* The Card and title structure will be handled by ServicesList if we use it directly.
          If ServicesList is modified to be more of a "dumb" component, then we'd wrap it here.
          For this iteration, let's assume ServicesList will be adapted to show its own title.
          If not, we'd add Card, CardHeader, CardTitle here.
      */}
      {renderContent()}
    </StaffDashboardLayout>
  );
};

export default StaffVendorServicesPage;
