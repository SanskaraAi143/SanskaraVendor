
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Task {
  vendor_task_id: string;
  title: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low' | 'urgent'; // Fixed type to be union instead of string
  is_complete: boolean;
  booking_id: string | null;
  category: string | null;
  status: string;
  description: string | null;
}

interface UpcomingTasksProps {
  vendorId?: string;
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ vendorId }) => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!vendorId) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('vendor_tasks')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('due_date', { ascending: true })
          .limit(4);
          
        if (error) throw error;
        
        // Map data to ensure proper typing for priority field
        const typedTasks = data?.map(task => ({
          ...task,
          priority: (task.priority as 'high' | 'medium' | 'low' | 'urgent')
        }));
        
        setTaskList(typedTasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Could not load upcoming tasks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [vendorId]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const toggleTaskDone = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('vendor_tasks')
        .update({ 
          is_complete: newStatus,
          status: newStatus ? 'Completed' : 'To Do'
        })
        .eq('vendor_task_id', id);
      
      if (error) throw error;
      
      setTaskList(taskList.map(task => 
        task.vendor_task_id === id ? { ...task, is_complete: newStatus, status: newStatus ? 'Completed' : 'To Do' } : task
      ));
      
      toast({
        title: newStatus ? "Task completed" : "Task reopened",
        description: `Task has been marked as ${newStatus ? 'completed' : 'to do'}.`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Could not update task status",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Tasks</span>
          <Link to="/tasks" className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-2 rounded-md border animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : taskList.length > 0 ? (
          <div className="space-y-2">
            {taskList.map((task) => (
              <div key={task.vendor_task_id} className={`flex items-start justify-between p-2 rounded-md border ${task.is_complete ? 'bg-muted/50 border-dashed' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={task.is_complete}
                    onCheckedChange={() => toggleTaskDone(task.vendor_task_id, task.is_complete)}
                    className="mt-1"
                  />
                  <div>
                    <p className={`text-sm ${task.is_complete ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {task.booking_id && <Badge className="text-[10px] py-0 h-4" variant="outline">Booking #{task.booking_id.substring(0, 6)}</Badge>}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!task.is_complete && (
                  <Badge className={`${getPriorityColor(task.priority)} h-5 text-[10px]`}>
                    {task.priority}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-sanskara-amber/10 p-3 mb-3">
              <Clock className="h-6 w-6 text-sanskara-amber" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Upcoming Tasks</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              You don't have any tasks scheduled. Create tasks to keep track of your work.
            </p>
            <Link to="/tasks">
              <button className="mt-4 px-4 py-2 bg-sanskara-red text-white rounded hover:bg-sanskara-maroon">
                Create Tasks
              </button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;
