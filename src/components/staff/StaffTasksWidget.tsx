
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/DashboardCard';
import { ListTodo, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

const StaffTasksWidget: React.FC = () => {
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      console.warn("StaffTasksWidget: User not authenticated.");
      return;
    }

    const fetchTaskCount = async () => {
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

        const { count, error: tasksError } = await supabase
          .from('vendor_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_staff_id', staffProfile.staff_id)
          .not('status', 'eq', 'Completed');

        if (tasksError) throw tasksError;
        
        setTaskCount(count ?? 0);

      } catch (err: any) {
        console.error('Error fetching task count:', err);
        setError(err.message || 'Failed to fetch task count.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskCount();
  }, [user, authLoading, navigate]);

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
