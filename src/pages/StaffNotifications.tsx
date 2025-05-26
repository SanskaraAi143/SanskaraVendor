import React, { useState, useEffect } from 'react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BellRing, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client'; // Assuming supabase client for fetching
import { useAuth } from '@/hooks/useAuthContext'; // To get current staff user
import { useNavigate } from 'react-router-dom';

interface Notification {
  notification_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  notification_type: string;
  related_entity_id: string | null;
  // Add other fields as necessary, e.g., sender_name, link_url
}

const StaffNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get the authenticated user
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        navigate('/staff/login', { replace: true });
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // First, get the staff_id for the current Supabase auth user
        const { data: staffProfile, error: staffProfileError } = await supabase
          .from('vendor_staff')
          .select('staff_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffProfileError) throw staffProfileError;
        if (!staffProfile) {
          setError('Staff profile not found.');
          setLoading(false);
          return;
        }
        
        // Then, fetch notifications for that staff_id
        const { data, error: notificationsError } = await supabase
          .from('notifications')
          .select('*') // Adjust selection as needed
          .eq('recipient_staff_id', staffProfile.staff_id)
          .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;
        setNotifications(data || []);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(err.message || 'Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('notification_id', notificationId);
      if (error) throw error;
      // Update local state to reflect change
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Optionally show an error toast/message to the user
    }
  };


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading notifications...</p>
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

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-1"> {/* Added mb-1 for slight separation from potential subtitle */}
            <BellRing className="h-7 w-7 text-sanskara-blue" /> {/* Slightly smaller icon for h1 */}
            <h1 className="text-2xl font-semibold text-gray-700">Notifications</h1>
          </div>
           <p className="text-sm text-muted-foreground">
            Recent alerts and updates relevant to your role.
          </p>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map(notification => (
                <li 
                  key={notification.notification_id} 
                  className={`p-4 rounded-lg shadow-sm border ${
                    notification.is_read ? 'bg-gray-50' : 'bg-white hover:shadow-md'
                  } transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()} - Type: {notification.notification_type}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        className="ml-4 text-xs text-sanskara-blue hover:underline whitespace-nowrap"
                        title="Mark as read"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  {/* Optionally, add a link if related_entity_id and type provide enough info */}
                  {/* e.g., if (notification.related_entity_id && notification.link_url) navigate(notification.link_url) */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 text-center py-8">You have no new notifications.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <StaffDashboardLayout>
      {renderContent()}
    </StaffDashboardLayout>
  );
};

export default StaffNotifications;
