
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

const StaffUpcomingBookingsWidget: React.FC = () => {
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      console.warn("StaffUpcomingBookingsWidget: User not authenticated.");
      return;
    }

    const fetchBookingCount = async () => {
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
        
        const today = new Date().toISOString().split('T')[0];

        const { count, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', staffProfile.vendor_id)
          .gte('event_date', today);

        if (bookingsError) throw bookingsError;
        
        setBookingCount(count ?? 0);

      } catch (err: any) {
        console.error('Error fetching upcoming booking count:', err);
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingCount();
  }, [user, authLoading, navigate]);

  const handleClick = () => {
    navigate('/staff/bookings');
  };

  let content = <p>Summary of upcoming bookings for your vendor.</p>;
  let displayValue: string | number = "-";

  if (isLoading || authLoading) {
    content = (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sanskara-blue" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
    displayValue = "";
  } else if (error) {
    content = <p className="text-red-500 text-xs">{error}</p>;
    displayValue = "Error";
  } else if (bookingCount !== null) {
    displayValue = bookingCount;
    content = <p>{bookingCount > 0 ? `Your vendor has ${bookingCount} upcoming booking(s).` : 'No upcoming bookings for your vendor.'}</p>;
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <DashboardCard
        title="Upcoming Bookings"
        icon={<BookOpen className="h-5 w-5" />}
        color="sanskara-blue"
        value={displayValue}
        footerLink={{
          text: 'View all bookings',
          href: '/staff/bookings',
        }}
      >
        {content}
      </DashboardCard>
    </div>
  );
};

export default StaffUpcomingBookingsWidget;
