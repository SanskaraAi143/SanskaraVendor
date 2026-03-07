import React from 'react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BellRing, Loader2, Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const StaffNotifications: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading notifications...</p>
        </div>
      );
    }

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-1">
            <BellRing className="h-7 w-7 text-sanskara-blue" />
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
                  className={`p-4 rounded-lg shadow-sm border ${notification.is_read ? 'bg-gray-50' : 'bg-white hover:shadow-md'
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
                        onClick={() => markAsRead(notification.notification_id)}
                        className="ml-4 text-xs text-sanskara-blue hover:underline whitespace-nowrap"
                        title="Mark as read"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <p className="text-gray-700 mt-2">You have no new notifications.</p>
            </div>
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
