import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Loader2 } from 'lucide-react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

interface VendorTask {
  vendor_task_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  booking_id: string;
}

const StaffTasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffAndTasks = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          navigate('/staff/login');
          return;
        }

        // Fetch staff details to get staff_id
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData) {
          setError('Staff profile not found.');
          setLoading(false);
          return;
        }

        setStaffId(staffData.staff_id);

        // Fetch tasks assigned to this staff member
        const { data: tasksData, error: tasksError } = await supabase
          .from('vendor_tasks')
          .select('vendor_task_id, title, description, due_date, status, booking_id')
          .eq('assigned_staff_id', staffData.staff_id);

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);

      } catch (fetchError: any) {
        console.error('Error fetching staff tasks:', fetchError);
        setError(fetchError.message || 'Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffAndTasks();
  }, [navigate]);

  // TODO: Implement task status update functionality
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    // Placeholder for update logic
    console.log(`Updating task ${taskId} to status ${newStatus}`);
    // Example: await supabase.from('vendor_tasks').update({ status: newStatus }).eq('vendor_task_id', taskId);
    // Refetch tasks or update state locally after successful update
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/staff/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">My Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length > 0 ? (
              <ul>
                {tasks.map(task => (
                  <li key={task.vendor_task_id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="text-lg font-semibold">{task.title}</h4>
                    {task.description && <p className="text-gray-700 text-sm mt-1">{task.description}</p>}
                    <p className="text-gray-600 text-sm mt-1">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
                    <p className={`text-sm font-medium mt-1 ${task.status === 'Complete' ? 'text-green-600' : task.status === 'In Progress' ? 'text-blue-600' : 'text-yellow-600'}`}>Status: {task.status}</p>
                    {/* Add buttons/dropdown for status update here */}
                    {/* Example: <Button size="sm" className="mt-2">Mark Complete</Button> */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 text-center">You have no tasks assigned.</p>
            )}
            <Button onClick={() => navigate('/staff/dashboard')} className="w-full mt-4">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffTasks;
