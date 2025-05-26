import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { BellRing, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

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
        const { data: staffProfile, error: staffProfileError } = await supabase
          .from('vendor_staff')
          .select('staff_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffProfileError) throw staffProfileError;
        if (!staffProfile) {
          setError('Staff profile not found.');
          return;
        }

        const { count, error: notificationsError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_staff_id', staffProfile.staff_id)
          .eq('is_read', false);

        if (notificationsError) throw notificationsError;
        
        setNotificationCount(count ?? 0);

      } catch (err: any) {
        console.error('Error fetching notification count:', err);
        setError(err.message || 'Failed to fetch notification count.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationCount();
  }, [user, authLoading, navigate]);

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
  );
};

export default StaffNotificationsWidget;
