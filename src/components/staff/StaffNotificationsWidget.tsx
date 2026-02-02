
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { BellRing, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const StaffNotificationsWidget: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      console.warn("StaffNotificationsWidget: User not authenticated.");
      return;
    }

    const fetchNotificationCount = async () => {
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

        const staffId = staffSnapshot.docs[0].id;

        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipient_staff_id', '==', staffId),
          where('is_read', '==', false)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);

        setNotificationCount(notificationsSnapshot.size);

      } catch (err: any) {
        console.error('Error fetching notification count:', err);
        setError(err.message || 'Failed to fetch notification count.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationCount();
  }, [user, authLoading, navigate]);

  const handleClick = () => {
    navigate('/staff/notifications');
  };

  let content = <p>Recent important alerts and updates relevant to your role.</p>;
  let displayValue: string | number = "-";

  if (isLoading || authLoading) {
    content = (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sanskara-red" />
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
    displayValue = "";
  } else if (error) {
    content = <p className="text-red-500 text-xs">{error}</p>;
    displayValue = "Error";
  } else if (notificationCount !== null) {
    displayValue = notificationCount;
    content = <p>{notificationCount > 0 ? `You have ${notificationCount} unread notification(s).` : 'No unread notifications.'}</p>;
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <DashboardCard
        title="Notifications"
        icon={<BellRing className="h-5 w-5" />}
        color="sanskara-red"
        value={displayValue}
        footerLink={{
          text: 'View all notifications',
          href: '/staff/notifications',
        }}
      >
        {content}
      </DashboardCard>
    </div>
  );
};

export default StaffNotificationsWidget;
