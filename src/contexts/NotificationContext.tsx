import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!vendorProfile && !staffProfile) return;

    try {
      const recipientId = vendorProfile?.vendor_id || staffProfile?.staff_id;
      const q = query(
        collection(db, 'notifications'),
        where('recipient_staff_id', '==', recipientId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notificationData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        notification_id: doc.id,
      })) as Notification[];

      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        is_read: true,
        read_at: new Date().toISOString()
      });

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
      const q = query(
        collection(db, 'notifications'),
        where('recipient_staff_id', '==', recipientId),
        where('is_read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      });

      await batch.commit();

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
      const recipientId = vendorProfile?.vendor_id || staffProfile?.staff_id;

      const q = query(
        collection(db, 'notifications'),
        where('recipient_staff_id', '==', recipientId),
        orderBy('created_at', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          notification_id: doc.id,
        })) as Notification[];

        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(n => !n.is_read).length);
        setIsLoading(false);
      }, (error) => {
        console.error('Error with notification snapshot:', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [vendorProfile, staffProfile]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
