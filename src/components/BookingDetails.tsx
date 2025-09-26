
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, User, MapPin, Package, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingDetailsProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookingData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventDate: string;
  status: string;
  weddingId: string;
  totalAmount?: number;
  paidAmount?: number;
  services: Array<{
    serviceName: string;
    price: number;
    quantity?: number;
  }>;
  tasks: Array<{
    taskId: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    isComplete: boolean;
  }>;
  notes?: string;
  location?: string;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId, open, onOpenChange }) => {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open && bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, open]);
  
  const fetchBookingDetails = async () => {
    setIsLoading(true);
    
    try {
      // Fetch the booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, wedding_id')
        .eq('booking_id', bookingId)
        .single();
        
      if (bookingError) throw bookingError;
      
      // Fetch the client (user) info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', bookingData.user_id)
        .single();
        
      if (userError) throw userError;
      
      // Fetch booking services
      const { data: servicesData, error: servicesError } = await supabase
        .from('booking_services')
        .select(`
          negotiated_price,
          quantity,
          vendor_services (
            service_name
          )
        `)
        .eq('booking_id', bookingId);
        
      if (servicesError) throw servicesError;
      
      // Fetch related tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('vendor_tasks')
        .select('*')
        .eq('booking_id', bookingId);
        
      if (tasksError) throw tasksError;
      
      // Format the data
      const formattedBooking: BookingData = {
        bookingId: bookingData.booking_id,
        clientName: userData.display_name || 'Unknown Client',
        clientEmail: userData.email || 'N/A',
        clientPhone: 'N/A', // Default to N/A since it might not exist in users table
        eventDate: bookingData.event_date,
        status: bookingData.booking_status,
        weddingId: bookingData.wedding_id,
        totalAmount: bookingData.total_amount,
        paidAmount: bookingData.paid_amount,
        services: servicesData.map((service: any) => ({
          serviceName: service.vendor_services?.service_name || 'Unknown Service',
          price: service.negotiated_price || 0,
          quantity: service.quantity || 1
        })),
        tasks: tasksData.map((task: any) => ({
          taskId: task.vendor_task_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          isComplete: task.is_complete
        })),
        notes: bookingData.notes_for_vendor,
        location: bookingData.notes_for_user || 'No location specified' // Use notes_for_user as a fallback for location
      };
      
      setBooking(formattedBooking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast({
        title: "Error",
        description: "Could not load booking details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'to do':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
  
  const getDisplayStatus = (status: string) => {
    // Convert snake_case to Title Case
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Information about booking #{bookingId.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          </div>
        ) : booking ? (
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Booking Summary</h3>
                  <Badge 
                    variant="outline"
                    className={getStatusColor(booking.status)}
                  >
                    {getDisplayStatus(booking.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Event Date: {formatDate(booking.eventDate)}</span>
                    </div>
                    
                    {booking.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Location: {booking.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>Client: {booking.clientName}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Package className="h-4 w-4 mr-2" />
                      <span>Services: {booking.services.length}</span>
                    </div>
                  </div>
                </div>
                
                {booking.totalAmount !== undefined && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-medium">${booking.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Paid Amount</p>
                          <p className="font-medium">${(booking.paidAmount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-medium">${(booking.totalAmount - (booking.paidAmount || 0)).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {booking.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{booking.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="services">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Booked Services</h3>
                
                {booking.services.length > 0 ? (
                  <div className="space-y-3">
                    {booking.services.map((service, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{service.serviceName}</h4>
                            <p className="font-medium">${service.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>Quantity: {service.quantity || 1}</span>
                            <span>Total: ${((service.price || 0) * (service.quantity || 1)).toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No services found for this booking.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tasks">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Related Tasks</h3>
                
                {booking.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {booking.tasks.map((task) => (
                      <Card key={task.taskId}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              {task.isComplete ? 
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" /> : 
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                              }
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline"
                                className={getTaskStatusColor(task.status)}
                              >
                                {task.status}
                              </Badge>
                              
                              <Badge 
                                variant="outline"
                                className={getPriorityColor(task.priority)}
                              >
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-muted-foreground mt-3">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Due: {formatDate(task.dueDate)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tasks found for this booking.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="client">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Client Information</h3>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{booking.clientName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{booking.clientEmail}</p>
                      </div>
                      
                      {booking.clientPhone && booking.clientPhone !== 'N/A' && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p>{booking.clientPhone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Could not load booking information.</p>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetails;
