
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { ListTodo, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const StaffTasksWidget: React.FC = () => {
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user || !staffProfile) {
      if (!authLoading && !staffProfile) {
          setIsLoading(false);
      }
      return;
    }

    const fetchTaskCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tasksQuery = query(
          collection(db, 'vendor_tasks'),
          where('assigned_staff_id', '==', staffProfile.staff_id),
          where('status', '!=', 'Completed')
        );
        const tasksSnapshot = await getDocs(tasksQuery);

        setTaskCount(tasksSnapshot.size);

      } catch (err: any) {
        console.error('Error fetching task count:', err);
        setError(err.message || 'Failed to fetch task count.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskCount();
  }, [user, staffProfile, authLoading]);

  const handleClick = () => {
    navigate('/staff/tasks');
  };

  let content = <p>Summary of your assigned tasks and their statuses.</p>;
  let displayValue: string | number = "-";

  if (isLoading || authLoading) {
    content = (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sanskara-amber" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
    displayValue = "";
  } else if (error) {
    content = <p className="text-red-500 text-xs">{error}</p>;
    displayValue = "Error";
  } else if (taskCount !== null) {
    displayValue = taskCount;
    content = <p>{taskCount > 0 ? `You have ${taskCount} pending task(s).` : 'No pending tasks.'}</p>;
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <DashboardCard
        title="My Tasks"
        icon={<ListTodo className="h-5 w-5" />}
        color="sanskara-amber"
        value={displayValue}
        footerLink={{
          text: 'Manage tasks',
          href: '/staff/tasks',
        }}
      >
        {content}
      </DashboardCard>
    </div>
  );
};

export default StaffTasksWidget;
