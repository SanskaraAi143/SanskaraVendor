
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { BellRing, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useNotifications } from '@/contexts/NotificationContext';

const StaffNotificationsWidget: React.FC = () => {
  const { unreadCount, isLoading } = useNotifications();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Handle case where context is not yet available or user not logged in
  if (authLoading) return (
      <div className="cursor-pointer">
          <DashboardCard
            title="Notifications"
            icon={<BellRing className="h-5 w-5" />}
            color="sanskara-red"
            value=""
          >
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-sanskara-red" />
              <span className="ml-2">Loading...</span>
            </div>
          </DashboardCard>
      </div>
  );

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
  } else if (unreadCount !== null) {
    displayValue = unreadCount;
    content = <p>{unreadCount > 0 ? `You have ${unreadCount} unread notification(s).` : 'No unread notifications.'}</p>;
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
