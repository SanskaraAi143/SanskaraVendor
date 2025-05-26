import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

const StaffAvailabilityWidget: React.FC = () => {
  const [availabilityCount, setAvailabilityCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      console.warn("StaffAvailabilityWidget: User not authenticated.");
      return;
    }

    const fetchAvailabilityCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: staffProfile, error: staffProfileError } = await supabase
          .from('vendor_staff')
          .select('vendor_id') // Staff members manage vendor's availability
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffProfileError) throw staffProfileError;
        if (!staffProfile || !staffProfile.vendor_id) {
          setError('Staff profile or vendor association not found.');
          return;
        }
        
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const { count, error: availabilityError } = await supabase
          .from('vendor_availability')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', staffProfile.vendor_id)
          .eq('status', 'available') // Assuming 'available' is the status for available slots
          .gte('available_date', today.toISOString().split('T')[0])
          .lte('available_date', nextWeek.toISOString().split('T')[0]);

        if (availabilityError) throw availabilityError;
        
        setAvailabilityCount(count ?? 0);

      } catch (err: any) {
        console.error('Error fetching availability count:', err);
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilityCount();
  }, [user, authLoading, navigate]);

  let content = <p>Summary of your vendor's availability in the upcoming week.</p>;
  let displayValue: string | number = "-";

  if (isLoading || authLoading) {
    content = (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sanskara-green" />
        <span className="ml-2">Loading availability...</span>
      </div>
    );
    displayValue = "";
  } else if (error) {
    content = <p className="text-red-500 text-xs">{error}</p>;
    displayValue = "Error";
  } else if (availabilityCount !== null) {
    displayValue = availabilityCount;
    content = <p>{availabilityCount > 0 ? `Vendor has ${availabilityCount} available slot(s) next week.` : 'No available slots next week.'}</p>;
  }


  return (
    <DashboardCard
      title="Vendor Availability" // Changed title to reflect vendor availability
      icon={<CalendarDays className="h-5 w-5" />}
      color="sanskara-green"
      value={displayValue}
      footerLink={{
        text: 'Manage availability', // Updated link text
        href: '/staff/availability',
      }}
    >
      {content}
    </DashboardCard>
  );
};

export default StaffAvailabilityWidget;
