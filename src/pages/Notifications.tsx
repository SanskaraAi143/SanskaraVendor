
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Notification {
  notification_id: string;
  message: string;
  notification_type: string;
  related_entity_type: string;
  related_entity_id: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

const NotificationsPage: React.FC = () => {
  const { vendorProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (vendorProfile) {
      fetchNotifications();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('notification_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `recipient_staff_id=eq.${vendorProfile.vendor_id}` 
        }, () => {
          fetchNotifications();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [vendorProfile, activeTab]);
  
  const fetchNotifications = async () => {
    if (!vendorProfile) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('recipient_staff_id', vendorProfile.vendor_id);
      
      if (activeTab === 'unread') {
        query = query.eq('is_read', false);
      } else if (activeTab === 'read') {
        query = query.eq('is_read', true);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setNotifications(data as Notification[]);
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
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('notification_id', notificationId);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
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
      const unreadNotifications = notifications.filter(n => !n.is_read);
      if (unreadNotifications.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('recipient_staff_id', vendorProfile?.vendor_id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update all unread notifications in local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          !notification.is_read
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
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
              ) : notifications.length === 0 ? (
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
                  {notifications.map(notification => (
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
