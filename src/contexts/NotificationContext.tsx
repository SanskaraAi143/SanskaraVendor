
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';

interface Notification {
  notification_id: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vendorProfile, staffProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!vendorProfile && !staffProfile) return;

    try {
      const recipientId = vendorProfile?.vendor_id || staffProfile?.staff_id;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_staff_id', recipientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notificationData = data || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('notification_id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const recipientId = vendorProfile?.vendor_id || staffProfile?.staff_id;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_staff_id', recipientId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (vendorProfile || staffProfile) {
      fetchNotifications();

      // Set up realtime subscription
      const recipientId = vendorProfile?.vendor_id || staffProfile?.staff_id;
      const channel = supabase
        .channel('notification_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_staff_id=eq.${recipientId}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [vendorProfile, staffProfile]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
