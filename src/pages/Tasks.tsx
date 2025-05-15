import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Flag, 
  CalendarIcon, 
  Clock, 
  Filter,
  SlidersHorizontal,
  Pencil,
  Trash,
  ListFilter,
  X,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Priority = 'urgent' | 'high' | 'medium' | 'low';

interface VendorStaff {
  staff_id: string;
  display_name: string;
  email: string;
  role: string;
}

interface Task {
  vendor_task_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  category: string | null;
  is_complete: boolean;
  status: string;
  vendor_id: string;
  assigned_staff_id: string | null;
  booking_id: string | null;
  created_at: string;
}

interface Booking {
  booking_id: string;
  event_date: string;
  user_id: string;
  booking_status: string;
}

const Tasks: React.FC = () => {
  const { vendorProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'active' | 'completed'>('active');
  const [staff, setStaff] = useState<VendorStaff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Priority,
    category: '',
    status: 'To Do',
    assigned_staff_id: '',
    booking_id: ''
  });

  // Constants
  const priorityOptions = ['urgent', 'high', 'medium', 'low'];
  const statusOptions = ['To Do', 'In Progress', 'On Hold', 'Completed'];
  const categoryOptions = ['Meeting', 'Planning', 'Setup', 'Payment', 'Communication', 'Follow-up'];
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchTasks();
      fetchStaff();
      fetchBookings();
    }
  }, [vendorProfile]);
  
  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, priorityFilter, statusFilter, currentTab]);

  const fetchTasks = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vendor_tasks')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      // Ensure we cast all tasks to have a valid Priority type
      const typedTasks: Task[] = data?.map(task => ({
        ...task,
        priority: (task.priority as string || 'medium').toLowerCase() as Priority
      })) || [];
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Could not load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      const { data, error } = await supabase
        .from('vendor_staff')
        .select('staff_id, display_name, email, role')
        .eq('vendor_id', vendorProfile.vendor_id)
        .eq('is_active', true);
        
      if (error) throw error;
      
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchBookings = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_id, event_date, user_id, booking_status')
        .eq('vendor_id', vendorProfile.vendor_id)
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };
  
  const filterTasks = () => {
    if (!tasks) return;
    
    let filtered = [...tasks];
    
    // Filter by completion status
    filtered = filtered.filter(task => {
      if (currentTab === 'active') return !task.is_complete;
      return task.is_complete;
    });
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter(null);
    setStatusFilter(null);
  };
  
  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = !task.is_complete;
      const statusText = newStatus ? 'Completed' : 'To Do';
      
      const { error } = await supabase
        .from('vendor_tasks')
        .update({ 
          is_complete: newStatus, 
          status: statusText 
        })
        .eq('vendor_task_id', task.vendor_task_id);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(t => 
        t.vendor_task_id === task.vendor_task_id 
          ? { ...t, is_complete: newStatus, status: statusText } 
          : t
      ));
      
      toast({
        title: newStatus ? "Task completed" : "Task reopened",
        description: `"${task.title}" has been ${newStatus ? 'marked as completed' : 'reopened'}`,
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        title: "Error",
        description: "Could not update task status",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async () => {
    if (!vendorProfile?.vendor_id || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a task title",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newTask = {
        vendor_id: vendorProfile.vendor_id,
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date || null,
        priority: formData.priority,
        category: formData.category || null,
        status: formData.status,
        assigned_staff_id: formData.assigned_staff_id || null,
        booking_id: formData.booking_id || null,
        is_complete: false
      };
      
      const { data, error } = await supabase
        .from('vendor_tasks')
        .insert(newTask)
        .select();
        
      if (error) throw error;
      
      // Update local state - ensure the returned task has the correct priority type
      if (data && data[0]) {
        const typedTask: Task = {
          ...data[0],
          priority: data[0].priority.toLowerCase() as Priority
        };
        setTasks([...tasks, typedTask]);
      }
      
      // Reset form and close dialog
      resetForm();
      setDialogOpen(false);
      
      toast({
        title: "Task created",
        description: `"${formData.title}" has been added to your tasks`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Could not create task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!currentTask || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a task title",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updatedTask = {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date || null,
        priority: formData.priority,
        category: formData.category || null,
        status: formData.status,
        assigned_staff_id: formData.assigned_staff_id || null,
        booking_id: formData.booking_id || null
      };
      
      const { error } = await supabase
        .from('vendor_tasks')
        .update(updatedTask)
        .eq('vendor_task_id', currentTask.vendor_task_id);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.vendor_task_id === currentTask.vendor_task_id
          ? { ...task, ...updatedTask, priority: updatedTask.priority as Priority }
          : task
      ));
      
      // Reset form and close dialog
      resetForm();
      setDialogOpen(false);
      
      toast({
        title: "Task updated",
        description: `"${formData.title}" has been updated`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Could not update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .delete()
        .eq('vendor_task_id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.vendor_task_id !== taskId));
      
      toast({
        title: "Task deleted",
        description: "The task has been removed",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Could not delete task",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      priority: task.priority,
      category: task.category || '',
      status: task.status,
      assigned_staff_id: task.assigned_staff_id || '',
      booking_id: task.booking_id || ''
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsEditing(false);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      category: '',
      status: 'To Do',
      assigned_staff_id: '',
      booking_id: ''
    });
    setCurrentTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'To Do':
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStaffName = (staffId: string | null) => {
    if (!staffId) return 'Unassigned';
    const foundStaff = staff.find(s => s.staff_id === staffId);
    return foundStaff ? foundStaff.display_name : 'Unknown Staff';
  };

  const getBookingInfo = (bookingId: string | null) => {
    if (!bookingId) return null;
    const foundBooking = bookings.find(b => b.booking_id === bookingId);
    return foundBooking ? {
      id: foundBooking.booking_id.substring(0, 8),
      date: formatDate(foundBooking.event_date)
    } : null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            Organize and track your tasks
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-sanskara-red text-white hover:bg-sanskara-maroon"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Task
        </Button>
      </div>
      
      <Card className="sanskara-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>My Tasks</CardTitle>
            <div className="flex gap-2">
              <Tabs 
                defaultValue="active" 
                value={currentTab}
                onValueChange={(value) => setCurrentTab(value as 'active' | 'completed')}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="active" className="data-[state=active]:bg-sanskara-red/10 data-[state=active]:text-sanskara-red">Active</TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? null : val)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter || 'all'} onValueChange={(val) => setPriorityFilter(val === 'all' ? null : val)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2" />
                    <span>Priority</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {`${priority.charAt(0).toUpperCase()}${priority.slice(1)} Priority`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || priorityFilter || statusFilter) && (
                <Button variant="ghost" onClick={clearFilters} className="h-9 px-2 lg:px-3">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
              <p className="ml-3 text-sanskara-maroon">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-sanskara-amber/10 p-3 mb-3">
                <CheckSquare className="h-6 w-6 text-sanskara-amber" />
              </div>
              <h3 className="text-lg font-medium mb-1">No tasks found</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                {currentTab === 'active' 
                  ? "You don't have any active tasks right now. Create a new task to get started."
                  : "You don't have any completed tasks yet."}
              </p>
              {currentTab === 'active' && (
                <Button 
                  onClick={openCreateDialog}
                  className="bg-sanskara-red text-white hover:bg-sanskara-maroon"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div 
                  key={task.vendor_task_id} 
                  className={`rounded-md border p-4 hover:bg-muted/40 transition-colors ${task.is_complete ? 'bg-muted/50 border-dashed' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        className="mt-1"
                        checked={task.is_complete}
                        onCheckedChange={() => handleToggleComplete(task)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${task.is_complete ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm mt-1 ${task.is_complete ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                          {task.due_date && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                              <span>{formatDate(task.due_date)}</span>
                            </div>
                          )}
                          
                          {task.category && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                              <span>{task.category}</span>
                            </div>
                          )}
                          
                          {task.assigned_staff_id && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>{getStaffName(task.assigned_staff_id)}</span>
                            </div>
                          )}
                          
                          {task.booking_id && (
                            <div className="flex items-center text-xs">
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getBookingInfo(task.booking_id)?.date}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={`${getPriorityColor(task.priority)} capitalize text-xs`}>
                        {task.priority}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditDialog(task)}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Task</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-red-500"
                                onClick={() => handleDeleteTask(task.vendor_task_id)}
                              >
                                <Trash className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Task</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details of this task.' 
                : 'Add a new task to your workflow.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about this task..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(val) => setFormData({ ...formData, priority: val as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assigned_staff_id">Assign To Staff</Label>
                <Select 
                  value={formData.assigned_staff_id} 
                  onValueChange={(val) => setFormData({ ...formData, assigned_staff_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.staff_id} value={s.staff_id}>
                        {s.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="booking_id">Related Booking</Label>
                <Select 
                  value={formData.booking_id} 
                  onValueChange={(val) => setFormData({ ...formData, booking_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select related booking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Related Booking</SelectItem>
                    {bookings.map((b) => (
                      <SelectItem key={b.booking_id} value={b.booking_id}>
                        {format(new Date(b.event_date), 'MMM d')} - ID: {b.booking_id.substring(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={isEditing ? handleUpdateTask : handleCreateTask}
              className="bg-sanskara-red text-white hover:bg-sanskara-maroon"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
