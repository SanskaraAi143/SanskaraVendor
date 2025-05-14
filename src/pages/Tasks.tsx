
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  CheckCircle,
  Clock,
  Calendar as CalendarIcon,
  Flag,
  ListFilter,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  vendor_task_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  is_complete: boolean;
  category: string;
  assigned_staff_id: string | null;
}

const statusOptions = ["To Do", "In Progress", "Under Review", "Completed", "On Hold"];
const priorityOptions = ["low", "medium", "high", "urgent"];

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const { vendorProfile } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!vendorProfile?.vendor_id) return;

      try {
        setIsLoading(true);
        let query = supabase
          .from('vendor_tasks')
          .select('*')
          .eq('vendor_id', vendorProfile.vendor_id);
        
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        if (priorityFilter) {
          query = query.eq('priority', priorityFilter);
        }
        
        const { data, error } = await query.order('due_date', { ascending: true });

        if (error) throw error;
        setTasks(data || []);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [vendorProfile, statusFilter, priorityFilter]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .update({ status: newStatus, is_complete: newStatus === 'Completed' })
        .eq('vendor_task_id', taskId);

      if (error) throw error;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.vendor_task_id === taskId
            ? { ...task, status: newStatus, is_complete: newStatus === 'Completed' }
            : task
        )
      );

      toast({
        title: 'Task updated',
        description: `Task status set to "${newStatus}"`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and track your team's tasks</p>
        </div>
        <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select value={statusFilter || ''} onValueChange={(val) => setStatusFilter(val || null)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center">
              <ListFilter className="h-4 w-4 mr-2" />
              {statusFilter || 'Filter by status'}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter || ''} onValueChange={(val) => setPriorityFilter(val || null)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center">
              <Flag className="h-4 w-4 mr-2" />
              {priorityFilter ? `${priorityFilter.charAt(0).toUpperCase()}${priorityFilter.slice(1)} Priority` : 'Filter by priority'}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {`${priority.charAt(0).toUpperCase()}${priority.slice(1)} Priority`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          <p className="ml-3 text-sanskara-maroon">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-sanskara-amber/20 p-3 mb-4">
              <PlusCircle className="h-8 w-8 text-sanskara-amber" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Tasks Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {statusFilter || priorityFilter
                ? "No tasks match your current filters. Try changing your filters or create a new task."
                : "You haven't created any tasks yet. Add your first task to start managing your workflow."}
            </p>
            <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.vendor_task_id}
                  className={`p-4 border rounded-lg ${
                    task.is_complete ? 'bg-gray-50 border-gray-200' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start">
                      <div
                        className={`mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full border ${
                          task.is_complete
                            ? 'bg-green-500 border-green-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {task.is_complete && (
                          <CheckCircle className="h-full w-full text-white" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-medium ${
                            task.is_complete ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            <Flag className="h-3 w-3 mr-1" /> {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                          </Badge>
                          <div className="text-xs flex items-center text-muted-foreground">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                          {task.category && (
                            <div className="text-xs flex items-center text-muted-foreground">
                              <span>#{task.category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 ml-auto"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuItem>Assign Staff</DropdownMenuItem>
                          <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(task.vendor_task_id, status)}
                              disabled={task.status === status}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="text-red-600">
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tasks;
