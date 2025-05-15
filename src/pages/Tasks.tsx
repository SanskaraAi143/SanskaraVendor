import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Clock, Filter, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { useDataCache } from '@/hooks/useDataCache';

interface Task {
  vendor_task_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  category: string;
  booking_id?: string;
  assigned_staff_id?: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface Staff {
  staff_id: string;
  name: string;
  role: string;
}

interface Booking {
  booking_id: string;
  client_name: string;
  event_date: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  category: string;
  booking_id: string;
  assigned_staff_id: string;
}

const Tasks: React.FC = () => {
  const { vendorProfile } = useAuth();
  const { getCachedData, setLoading, setData, setError } = useDataCache();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    due_date: '',
    category: 'General',
    booking_id: '',
    assigned_staff_id: '',
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchTasks();
      fetchStaff();
      fetchBookings();
    }
  }, [vendorProfile]);
  
  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);
  
  const fetchTasks = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    setIsLoading(true);
    
    // Check cache first
    const cachedTasks = getCachedData<Task[]>('tasks');
    
    if (cachedTasks?.data) {
      setTasks(cachedTasks.data);
      setIsLoading(false);
      return;
    }
    
    // If not in cache, fetch from API
    setLoading('tasks');
    
    try {
      const { data, error } = await supabase
        .from('vendor_tasks')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      
      setTasks(data || []);
      setData('tasks', data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('tasks', error as Error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('vendor_id', vendorProfile?.vendor_id)
        .eq('is_active', true);
        
      if (error) throw error;
      
      // Fix: Map the staff data to match Staff interface
      const mappedStaff = (data || []).map(staffMember => ({
        staff_id: staffMember.staff_id,
        name: staffMember.display_name, // Map display_name to name
        role: staffMember.role
      }));
      
      setStaff(mappedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };
  
  const fetchBookings = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          booking_id,
          users (display_name),
          event_date
        `)
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      const formattedBookings = data.map((booking: any) => ({
        booking_id: booking.booking_id,
        client_name: booking.users?.display_name || 'Unknown Client',
        event_date: booking.event_date
      }));
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }
    
    setFilteredTasks(filtered);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setFormData(prev => ({ ...prev, due_date: format(date, 'yyyy-MM-dd') }));
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      due_date: '',
      category: 'General',
      booking_id: '',
      assigned_staff_id: '',
    });
    setDate(undefined);
    setSelectedTask(null);
  };
  
  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    
    // Convert string date to Date object for the calendar
    let dueDate: Date | undefined = undefined;
    if (task.due_date) {
      try {
        dueDate = new Date(task.due_date);
      } catch (e) {
        console.error('Invalid date format:', task.due_date);
      }
    }
    
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      category: task.category,
      booking_id: task.booking_id || '',
      assigned_staff_id: task.assigned_staff_id || '',
    });
    
    setDate(dueDate);
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorProfile?.vendor_id) return;
    
    try {
      const updatedTask = {
        ...formData,
        assigned_staff_id: formData.assigned_staff_id,
        vendor_id: vendorProfile?.vendor_id || '',
        is_complete: formData.status === 'Completed'
      };
      
      if (selectedTask) {
        // Update existing task
        const { error } = await supabase
          .from('vendor_tasks')
          .update(updatedTask)
          .eq('vendor_task_id', selectedTask.vendor_task_id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        // Create new task
        const { error } = await supabase
          .from('vendor_tasks')
          .insert([updatedTask]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      
      // Refresh tasks
      fetchTasks();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!selectedTask) return;
    
    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .delete()
        .eq('vendor_task_id', selectedTask.vendor_task_id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      // Refresh tasks
      fetchTasks();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStaffNameById = (staffId: string) => {
    const staffMember = staff.find(s => s.staff_id === staffId);
    return staffMember ? staffMember.name : 'Unassigned';
  };
  
  const getBookingNameById = (bookingId: string) => {
    const booking = bookings.find(b => b.booking_id === bookingId);
    return booking ? `${booking.client_name} (${format(new Date(booking.event_date), 'MMM d, yyyy')})` : 'No Booking';
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    tasks.forEach(task => categories.add(task.category));
    return Array.from(categories);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Manage your tasks and to-dos
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={openCreateDialog} className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <Card key={task.vendor_task_id} className="hover:bg-muted/40 cursor-pointer" onClick={() => openEditDialog(task)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {task.is_complete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        <h3 className="font-medium">{task.title}</h3>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.category && (
                          <Badge variant="outline">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                      
                      {task.assigned_staff_id && (
                        <div className="text-xs text-muted-foreground">
                          Assigned to: {getStaffNameById(task.assigned_staff_id)}
                        </div>
                      )}
                      
                      {task.booking_id && (
                        <div className="text-xs text-muted-foreground">
                          Booking: {getBookingNameById(task.booking_id)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks found</p>
              <Button onClick={openCreateDialog} variant="link" className="mt-2">
                Create your first task
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
            </div>
          ) : filteredTasks.filter(task => !task.is_complete).length > 0 ? (
            filteredTasks
              .filter(task => !task.is_complete)
              .map(task => (
                <Card key={task.vendor_task_id} className="hover:bg-muted/40 cursor-pointer" onClick={() => openEditDialog(task)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                        
                        {task.assigned_staff_id && (
                          <div className="text-xs text-muted-foreground">
                            Assigned to: {getStaffNameById(task.assigned_staff_id)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming tasks</p>
              <Button onClick={openCreateDialog} variant="link" className="mt-2">
                Create a new task
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
            </div>
          ) : filteredTasks.filter(task => task.is_complete).length > 0 ? (
            filteredTasks
              .filter(task => task.is_complete)
              .map(task => (
                <Card key={task.vendor_task_id} className="hover:bg-muted/40 cursor-pointer" onClick={() => openEditDialog(task)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <h3 className="font-medium">{task.title}</h3>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {task.category && (
                            <Badge variant="outline">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                        
                        {task.assigned_staff_id && (
                          <div className="text-xs text-muted-foreground">
                            Assigned to: {getStaffNameById(task.assigned_staff_id)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completed tasks</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Task Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Update task details' : 'Add a new task to your list'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Booking">Booking</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="booking_id">Related Booking</Label>
                <Select
                  value={formData.booking_id}
                  onValueChange={(value) => handleSelectChange('booking_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Booking</SelectItem>
                    {bookings.map(booking => (
                      <SelectItem key={booking.booking_id} value={booking.booking_id}>
                        {booking.client_name} ({formatDate(booking.event_date)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assigned_staff_id">Assign To</Label>
                <Select
                  value={formData.assigned_staff_id}
                  onValueChange={(value) => handleSelectChange('assigned_staff_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map(staffMember => (
                      <SelectItem key={staffMember.staff_id} value={staffMember.staff_id}>
                        {staffMember.name} ({staffMember.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center pt-4">
              {selectedTask && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={() => {
                    setIsDialogOpen(false);
                    openDeleteDialog(selectedTask);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
                  {selectedTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">{selectedTask?.title}</p>
            {selectedTask?.description && (
              <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
