import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Loader2, CheckSquare, Square, AlertTriangle, ExternalLink, Edit, Save, X } from 'lucide-react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types'; // Import Tables type

// Define a type for the joined booking data
type JoinedBooking = {
  event_date: string | null;
  users: Array<{
    display_name: string | null;
  }> | null;
}

interface VendorTask {
  vendor_task_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  priority: string | null;
  booking_id: string | null;
  bookings: JoinedBooking | null; // This is the simplified version for the component's state
}

const taskStatusOptions = ["Pending", "In Progress", "Completed", "Blocked"];
const taskPriorityOptions = ["Low", "Medium", "High"];

const StaffTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    if (staffProfile?.staff_id) {
      fetchStaffAndTasks();
    }
  }, [user, authLoading, navigate, statusFilter, staffProfile]);

  const fetchStaffAndTasks = async () => {
    if (!staffProfile?.staff_id) return;

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('vendor_tasks')
        .select(`
          *,
          bookings (
            event_date,
            users (
              display_name
            )
          )
        `)
        .eq('assigned_staff_id', staffProfile.staff_id);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      query = query.order('due_date', { ascending: true, nullsFirst: false });

      const { data: tasksData, error: tasksError } = await query;

      if (tasksError) throw tasksError;
      setTasks(tasksData?.map((task: any) => { // Use 'any' for the raw task from Supabase
        const processedBookings: JoinedBooking | null = (task.bookings && Array.isArray(task.bookings) && task.bookings.length > 0)
          ? {
              event_date: task.bookings[0].event_date,
              users: (task.bookings[0].users && Array.isArray(task.bookings[0].users) && task.bookings[0].users.length > 0)
                ? [{ display_name: task.bookings[0].users[0].display_name }]
                : null,
            }
          : null;

        return {
          ...task,
          status: task.status === "" ? "Pending" : task.status, // Ensure status is never an empty string
          bookings: processedBookings,
        };
      }) as VendorTask[] || []);

    } catch (fetchError: any) {
      console.error('Error fetching staff tasks:', fetchError);
      setError(fetchError.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('vendor_tasks')
        .update({ status: newStatus })
        .eq('vendor_task_id', taskId);

      if (updateError) throw updateError;

      setTasks(prevTasks => prevTasks.map(task => 
        task.vendor_task_id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: 'Success',
        description: 'Task status updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating task status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update task status.',
        variant: 'destructive',
      });
    }
  };

  const handleEditDescription = (task: VendorTask) => {
    setEditingTaskId(task.vendor_task_id);
    setEditingDescription(task.description || '');
  };

  const handleSaveDescription = async (taskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('vendor_tasks')
        .update({ description: editingDescription })
        .eq('vendor_task_id', taskId);

      if (updateError) throw updateError;

      setTasks(prevTasks => prevTasks.map(task => 
        task.vendor_task_id === taskId ? { ...task, description: editingDescription } : task
      ));

      setEditingTaskId(null);
      setEditingDescription('');

      toast({
        title: 'Success',
        description: 'Task description updated successfully.',
      });
    } catch (err: any) {
      console.error('Error updating task description:', err);
      toast({
        title: 'Error',
        description: 'Failed to update task description.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingDescription('');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />;
      case 'Low': return <CheckSquare className="h-4 w-4 text-green-500 mr-1" />;
      default: return <Square className="h-4 w-4 text-gray-400 mr-1"/>;
    }
  };

  const renderContent = () => {
    if (loading && tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="ml-2 mt-4 text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      );
    }
  
    if (error && tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <p className="text-red-600 mb-4 text-center">{error}</p>
        </div>
      );
    }

    return (
      <Card className="w-full max-w-7xl mx-auto">
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
                    <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
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
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {editingTaskId === task.vendor_task_id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              className="min-h-16 text-sm"
                              placeholder="Enter task description..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveDescription(task.vendor_task_id)}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative">
                            <div className="text-xs text-gray-500 pr-8">
                              {task.description || 'No description'}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                              onClick={() => handleEditDescription(task)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 flex items-center">
                        {getPriorityIcon(task.priority)} {task.priority || 'Normal'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>{task.status}</Badge>
                      </td>
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {task.booking_id && task.bookings ? (
                          <div className="space-y-1">
                            <div className="text-xs font-medium">
                              {task.bookings?.users?.[0]?.display_name || 'Unknown Client'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {task.bookings?.event_date ? new Date(task.bookings.event_date).toLocaleDateString() : 'No date'}
                            </div>
                          </div>
                        ) : (
                          'No booking'
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Select 
                          value={task.status} 
                          onValueChange={(newStatus) => handleUpdateTaskStatus(task.vendor_task_id, newStatus)}
                          disabled={loading}
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
            <div className="text-center py-12">
              <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-lg">
                {statusFilter === "all" ? "You have no tasks assigned." : `No tasks found with status: ${statusFilter}.`}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tasks assigned to you will appear here.
              </p>
            </div>
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
