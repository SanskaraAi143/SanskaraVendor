
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const StaffAvailabilityWidget: React.FC = () => {
  const [availabilityCount, setAvailabilityCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user || !staffProfile) {
      if (!authLoading && !staffProfile) {
          setIsLoading(false);
      }
      return;
    }

    const fetchAvailabilityCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const vendorId = staffProfile.vendor_id;

        if (!vendorId) {
          setError('Vendor association not found.');
          return;
        }

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const todayStr = today.toISOString().split('T')[0];
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const availabilityQuery = query(
          collection(db, 'vendor_availability'),
          where('vendor_id', '==', vendorId),
          where('status', '==', 'available'),
          where('available_date', '>=', todayStr),
          where('available_date', '<=', nextWeekStr)
        );
        const availabilitySnapshot = await getDocs(availabilityQuery);

        setAvailabilityCount(availabilitySnapshot.size);

      } catch (err: any) {
        console.error('Error fetching availability count:', err);
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilityCount();
  }, [user, staffProfile, authLoading]);

  const handleClick = () => {
    navigate('/staff/availability');
  };

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
    <div onClick={handleClick} className="cursor-pointer">
      <DashboardCard
        title="Vendor Availability"
        icon={<CalendarDays className="h-5 w-5" />}
        color="sanskara-green"
        value={displayValue}
        footerLink={{
          text: 'Manage availability',
          href: '/staff/availability',
        }}
      >
        {content}
      </DashboardCard>
    </div>
  );
};

export default StaffAvailabilityWidget;
