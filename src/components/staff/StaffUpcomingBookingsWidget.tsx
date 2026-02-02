
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
        const staffQuery = query(
          collection(db, 'vendor_staff'),
          where('supabase_auth_uid', '==', user.uid)
        );
        const staffSnapshot = await getDocs(staffQuery);

        if (staffSnapshot.empty) {
          setError('Staff profile not found.');
          return;
        }

        const staffData = staffSnapshot.docs[0].data();
        const vendorId = staffData.vendor_id;

        if (!vendorId) {
          setError('Vendor association not found.');
          return;
        }

        const today = new Date().toISOString().split('T')[0];

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('vendor_id', '==', vendorId),
          where('event_date', '>=', today)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);

        setBookingCount(bookingsSnapshot.size);

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
