import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage: React.FC = () => {
  const { vendorProfile } = useAuth();
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.is_read;
    if (activeTab === 'read') return notification.is_read;
    return true;
  });

  const getNotificationType = (type: string) => {
    switch (type) {
      case 'booking':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Booking</Badge>;
      case 'payment':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Payment</Badge>;
      case 'system':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">System</Badge>;
      case 'task':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Task</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{type || 'General'}</Badge>;
    }
  };

  const getTimeDisplay = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated on important events
          </p>
        </div>
        <Button
          variant="outline"
          onClick={markAllAsRead}
          disabled={!notifications.some(n => !n.is_read)}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All' : activeTab === 'unread' ? 'Unread' : 'Read'} Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
                  <p className="ml-3">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-2 text-lg font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === 'all'
                      ? 'You have no notifications at this time.'
                      : activeTab === 'unread'
                        ? 'You have no unread notifications.'
                        : 'You have no read notifications.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.notification_id}
                      className={`p-4 border rounded-lg ${!notification.is_read ? 'bg-muted/30' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                          <div className="p-2 rounded-full bg-sanskara-cream">
                            <Bell className="h-5 w-5 text-sanskara-maroon" />
                          </div>
                          <div>
                            <div className="flex gap-2 items-center">
                              {getNotificationType(notification.notification_type)}
                              <span className="text-xs text-muted-foreground">
                                {getTimeDisplay(notification.created_at)}
                              </span>
                            </div>
                            <p className="mt-1">{notification.message}</p>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.notification_id)}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
