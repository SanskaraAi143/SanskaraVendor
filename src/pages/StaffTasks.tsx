import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Loader2, CheckSquare, Square, AlertTriangle, ExternalLink } from 'lucide-react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge'; // For status display
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For status filter

interface VendorTask {
  vendor_task_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string | null; // Added priority
  booking_id: string | null; // Can be null
  bookings: { // For displaying event date from related booking
    event_date: string | null;
  } | null;
}

const taskStatusOptions = ["Pending", "In Progress", "Completed", "Blocked"];
const taskPriorityOptions = ["Low", "Medium", "High"];


const StaffTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    const fetchStaffAndTasks = async () => {
      setLoading(true);
      setError(null);
      try {
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

        let query = supabase
          .from('vendor_tasks')
          .select('*, bookings(event_date)') // Fetch related booking event_date
          .eq('assigned_staff_id', staffData.staff_id);

        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }
        
        query = query.order('due_date', { ascending: true, nullsFirst: false });

        const { data: tasksData, error: tasksError } = await query;

        if (tasksError) throw tasksError;
        setTasks(tasksData as VendorTask[] || []);

      } catch (fetchError: any) {
        console.error('Error fetching staff tasks:', fetchError);
        setError(fetchError.message || 'Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffAndTasks();
  }, [user, authLoading, navigate, statusFilter]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    setLoading(true); // Indicate loading state for the specific update action
    try {
      const { error: updateError } = await supabase
        .from('vendor_tasks')
        .update({ status: newStatus })
        .eq('vendor_task_id', taskId);

      if (updateError) throw updateError;

      // Refetch tasks to show updated status or update locally
      setTasks(prevTasks => prevTasks.map(task => 
        task.vendor_task_id === taskId ? { ...task, status: newStatus } : task
      ));
      // Or trigger a full refetch:
      // const event = new Event('staleData'); window.dispatchEvent(event); // if using a global state/effect
    } catch (err: any) {
      console.error('Error updating task status:', err);
      setError(err.message || 'Failed to update task.'); // Show error specific to this action
    } finally {
      setLoading(false); // Reset loading state for the update action
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-sanskara-green/20 text-sanskara-green';
      case 'In Progress': return 'bg-sanskara-blue/20 text-sanskara-blue'; // Using sanskara-blue
      case 'Pending': return 'bg-sanskara-amber/20 text-sanskara-amber';
      case 'Blocked': return 'bg-sanskara-red/20 text-sanskara-red';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="h-4 w-4 text-sanskara-red mr-1" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-sanskara-amber mr-1" />;
      case 'Low': return <CheckSquare className="h-4 w-4 text-sanskara-green mr-1" />;
      default: return <Square className="h-4 w-4 text-gray-400 mr-1"/>;
    }
  };

  const renderContent = () => {
    if (loading && tasks.length === 0) { // Show full page loader only on initial load
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="ml-2 mt-4 text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      );
    }
  
    if (error && tasks.length === 0) { // Show full page error if initial load fails
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <p className="text-red-600 mb-4 text-center">{error}</p>
        </div>
      );
    }

    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-700">My Assigned Tasks</h1>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {taskStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tasks assigned to you. Use the filter to narrow down by status.
          </p>
           {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map(task => (
                    <tr key={task.vendor_task_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        {task.description && <div className="text-xs text-gray-500 truncate max-w-xs" title={task.description}>{task.description}</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 flex items-center">
                        {getPriorityIcon(task.priority)} {task.priority || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>{task.status}</Badge>
                      </td>
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {task.booking_id ? (
                          <Button variant="link" size="xs" className="p-0 h-auto text-xs" onClick={() => navigate(`/staff/bookings/${task.booking_id}`)}>
                            Event: {task.bookings?.event_date ? new Date(task.bookings.event_date).toLocaleDateString() : task.booking_id}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Select 
                          value={task.status} 
                          onValueChange={(newStatus) => handleUpdateTaskStatus(task.vendor_task_id, newStatus)}
                          disabled={loading} // Disable select while any task update is loading
                        >
                          <SelectTrigger className="h-8 text-xs w-36">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatusOptions.map(option => (
                              <SelectItem key={option} value={option} className="text-xs">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-700 text-center py-10">
              {statusFilter === "all" ? "You have no tasks assigned." : `No tasks found with status: ${statusFilter}.`}
            </p>
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

export default StaffTasks;
