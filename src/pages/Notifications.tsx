
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Calendar,
  Check,
  Clock,
  Info,
  Mail,
  MessageSquare,
  User,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  notification_id: string;
  message: string;
  notification_type: string;
  related_entity_type: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const { vendorProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (vendorProfile) {
      fetchNotifications();
    }
  }, [vendorProfile]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch notifications for the vendor's staff members
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('staff_id')
        .eq('vendor_id', vendorProfile?.vendor_id);

      if (staffError) throw staffError;

      if (staffData && staffData.length > 0) {
        const staffIds = staffData.map(staff => staff.staff_id);
        
        // Fetch notifications for all staff members of this vendor
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .in('recipient_staff_id', staffIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('notification_id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );

    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadNotificationIds = notifications
        .filter(notification => !notification.is_read)
        .map(notification => notification.notification_id);

      if (unreadNotificationIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('notification_id', unreadNotificationIds);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        variant: 'success',
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.is_read;
    return notification.notification_type === activeTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'user':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'email':
        return <Mail className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with important alerts and messages
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={markAllAsRead}
          disabled={!notifications.some(n => !n.is_read)}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {notifications.filter(n => !n.is_read).length > 0 && (
                <Badge className="ml-2 bg-red-500" variant="secondary">
                  {notifications.filter(n => !n.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="booking">Bookings</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <Button variant="ghost" onClick={fetchNotifications}>
            Refresh
          </Button>
        </div>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
                  <p className="ml-3">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <div 
                      key={notification.notification_id} 
                      className={`flex items-start gap-4 p-4 border rounded-md transition ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="bg-slate-100 p-2 rounded-full">
                        {getNotificationIcon(notification.notification_type || 'default')}
                      </div>
                      <div className="flex-1">
                        <p className={`${!notification.is_read ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(notification.created_at)}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => markAsRead(notification.notification_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground mt-4">No notifications to display</p>
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
