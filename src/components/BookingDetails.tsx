
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock, MapPin, User, Phone, Mail, DollarSign, FileText, CheckCircle, CircleDot } from 'lucide-react';

interface BookingDetailsProps {
  bookingId: string;
  onClose: () => void;
}

interface Booking {
  booking_id: string;
  user_id: string;
  vendor_id: string;
  event_date: string;
  total_amount: number | null;
  advance_amount_due: number | null;
  paid_amount: number | null;
  booking_status: string;
  notes_for_vendor: string | null;
  notes_for_user: string | null;
  created_at: string;
  updated_at: string;
}

interface BookingService {
  booking_service_id: string;
  service_name: string;
  negotiated_price: number | null;
  quantity: number;
  service_specific_notes: string | null;
}

interface UserDetails {
  user_id: string;
  display_name: string | null;
  email: string;
  phone_number?: string;
  wedding_date?: string | null;
  wedding_location?: string | null;
}

interface Task {
  vendor_task_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_complete: boolean;
  priority: string;
  status: string;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [services, setServices] = useState<BookingService[]>([]);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
        
      if (bookingError) throw bookingError;
      
      setBooking(bookingData);
      
      if (bookingData) {
        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id, display_name, email, phone_number, wedding_date, wedding_location')
          .eq('supabase_auth_uid', bookingData.user_id)
          .single();
          
        if (!userError && userData) {
          setUser(userData);
        }
        
        // Fetch services
        const { data: serviceData, error: serviceError } = await supabase
          .from('booking_services')
          .select(`
            booking_service_id,
            negotiated_price,
            quantity,
            service_specific_notes,
            vendor_services(service_name)
          `)
          .eq('booking_id', bookingId);
          
        if (!serviceError && serviceData) {
          setServices(serviceData.map((item: any) => ({
            booking_service_id: item.booking_service_id,
            service_name: item.vendor_services?.service_name || 'Unnamed Service',
            negotiated_price: item.negotiated_price,
            quantity: item.quantity,
            service_specific_notes: item.service_specific_notes
          })));
        }
        
        // Fetch tasks
        const { data: taskData, error: taskError } = await supabase
          .from('vendor_tasks')
          .select('vendor_task_id, title, description, due_date, is_complete, priority, status')
          .eq('booking_id', bookingId);
          
        if (!taskError && taskData) {
          setTasks(taskData);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast({
        title: "Error",
        description: "Could not load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('booking_id', bookingId);
        
      if (error) throw error;
      
      // Update local state
      if (booking) {
        setBooking({
          ...booking,
          booking_status: status
        });
      }
      
      toast({
        title: "Status updated",
        description: `Booking status has been updated to ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Could not update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_confirmation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDisplayStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '₹0.00';
    return `₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': 
      case 'urgent': 
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
        <p className="ml-3 text-sanskara-maroon">Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Booking not found</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Booking Details</h2>
          <p className="text-muted-foreground">ID: {booking.booking_id}</p>
        </div>
        <Badge variant="outline" className={getStatusColor(booking.booking_status)}>
          {getDisplayStatus(booking.booking_status)}
        </Badge>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="info">Basic Info</TabsTrigger>
          <TabsTrigger value="services">Services & Payments</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sanskara-maroon">{user.display_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <p>{user.email}</p>
                      </div>
                    </div>
                    {user.phone_number && (
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <p>{user.phone_number}</p>
                        </div>
                      </div>
                    )}
                    {user.wedding_date && (
                      <div>
                        <p className="text-sm font-medium">Wedding Date</p>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <p>{format(new Date(user.wedding_date), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}
                    {user.wedding_location && (
                      <div>
                        <p className="text-sm font-medium">Wedding Location</p>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <p>{user.wedding_location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No client information available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Event Date</p>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <p>{format(new Date(booking.event_date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Booking Created</p>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(booking.created_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(booking.updated_at), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Notes for Vendor</p>
                    <div className="bg-muted/50 rounded p-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {booking.notes_for_vendor || 'No notes provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map(service => (
                      <div key={service.booking_service_id} className="border rounded-md p-3">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{service.service_name}</h4>
                          <p>{formatCurrency(service.negotiated_price)} × {service.quantity}</p>
                        </div>
                        {service.service_specific_notes && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            {service.service_specific_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No services associated with this booking</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Total Amount</p>
                    <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Advance Amount Due</p>
                    <p className="font-medium">{formatCurrency(booking.advance_amount_due)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Amount Paid</p>
                    <p className="font-medium text-green-600">{formatCurrency(booking.paid_amount)}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Balance Due</p>
                    <p className="font-bold text-sanskara-red">
                      {formatCurrency((booking.total_amount || 0) - (booking.paid_amount || 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Tasks for this Booking
                </div>
                <Button variant="outline" size="sm">
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div 
                      key={task.vendor_task_id} 
                      className={`border rounded-md p-3 ${task.is_complete ? 'bg-muted/40 border-dashed' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <CircleDot className={`h-5 w-5 mt-0.5 ${task.is_complete ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <div>
                            <h4 className={`font-medium ${task.is_complete ? 'text-muted-foreground line-through' : ''}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {task.due_date && (
                                <div className="flex items-center text-xs">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No tasks created for this booking yet</p>
                  <Button variant="outline" size="sm">
                    Create Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex justify-between border-t">
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
        <div className="flex gap-2">
          {booking.booking_status !== 'confirmed' && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => updateBookingStatus('confirmed')}
            >
              Confirm Booking
            </Button>
          )}
          {booking.booking_status !== 'completed' && booking.booking_status !== 'cancelled' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => updateBookingStatus('completed')}
            >
              Mark Completed
            </Button>
          )}
          {booking.booking_status !== 'cancelled' && (
            <Button 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => updateBookingStatus('cancelled')}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
