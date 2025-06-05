import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AssignedService {
  service_id: string;
  service_name: string;
  service_category: string;
  vendor_name: string;
}

const VendorServicesWidget: React.FC = () => {
  const [assignedServices, setAssignedServices] = useState<AssignedService[]>([]);
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

    const fetchAssignedServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First get the staff ID
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id, vendor_id, vendors(vendor_name)')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData) {
          setError('Staff profile not found.');
          return;
        }

        // Get assigned services with full details from vendor_services
        const { data: serviceAssignments, error: assignmentError } = await supabase
          .from('vendor_service_staff')
          .select(`
            service_id,
            vendor_services(
              service_id,
              service_name,
              service_category,
              description,
              base_price,
              price_unit,
              is_negotiable,
              vendor_id
            )
          `)
          .eq('staff_id', staffData.staff_id);
        if (assignmentError) throw assignmentError;

        const services = (serviceAssignments || [])
          .map(assignment => assignment.vendor_services)
          .filter(Boolean)
          .map(service => ({
            service_id: service.service_id,
            service_name: service.service_name || 'Unknown Service',
            service_category: service.service_category || 'Unknown',
            vendor_name: (staffData.vendors as any)?.vendor_name || 'Unknown Vendor'
          }));

        setAssignedServices(services);
      } catch (err: any) {
        console.error('Error fetching assigned services:', err);
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedServices();
  }, [user, authLoading]);

  let content = <p>Services you are assigned to work on.</p>;
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
  } else if (assignedServices.length > 0) {
    displayValue = assignedServices.length;
    content = (
      <div className="space-y-2">
        <p>You are assigned to {assignedServices.length} service(s):</p>
        <div className="text-xs space-y-1">
          {assignedServices.slice(0, 3).map(service => (
            <div key={service.service_id} className="truncate">
              • {service.service_name}
            </div>
          ))}
          {assignedServices.length > 3 && (
            <div className="text-gray-500">
              +{assignedServices.length - 3} more...
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = <p>No services assigned to you yet.</p>;
    displayValue = 0;
  }

  return (
    <DashboardCard
      title="My Assigned Services"
      icon={<CheckCircle2 className="h-5 w-5" />}
      color="sanskara-purple"
      value={displayValue}
      footerLink={{
        text: 'View all services',
        href: '/staff/services',
      }}
    >
      {content}
    </DashboardCard>
  );
};

export default VendorServicesWidget;
