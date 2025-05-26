import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

const VendorServicesWidget: React.FC = () => {
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      console.warn("VendorServicesWidget: User not authenticated.");
      return;
    }

    const fetchServiceCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: staffProfile, error: staffProfileError } = await supabase
          .from('vendor_staff')
          .select('vendor_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffProfileError) throw staffProfileError;
        if (!staffProfile || !staffProfile.vendor_id) {
          setError('Staff profile or vendor association not found.');
          return;
        }
        
        const { count, error: servicesError } = await supabase
          .from('vendor_services')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', staffProfile.vendor_id)
          .eq('is_active', true);

        if (servicesError) throw servicesError;
        
        setServiceCount(count ?? 0);

      } catch (err: any) {
        console.error('Error fetching service count:', err);
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCount();
  }, [user, authLoading, navigate]);

  let content = <p>Overview of services offered by your vendor.</p>;
  let displayValue: string | number = "-";

  if (isLoading || authLoading) {
    content = (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sanskara-purple" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
    displayValue = "";
  } else if (error) {
    content = <p className="text-red-500 text-xs">{error}</p>;
    displayValue = "Error";
  } else if (serviceCount !== null) {
    displayValue = serviceCount;
    content = <p>{serviceCount > 0 ? `Your vendor offers ${serviceCount} active service(s).` : 'No active services listed for your vendor.'}</p>;
  }

  return (
    <DashboardCard
      title="Vendor Services"
      icon={<CheckCircle2 className="h-5 w-5" />}
      color="sanskara-purple"
      value={displayValue}
      footerLink={{
        text: 'Manage services',
        href: '/staff/services',
      }}
    >
      {content}
    </DashboardCard>
  );
};

export default VendorServicesWidget;
