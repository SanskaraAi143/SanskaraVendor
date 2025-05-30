
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Loader2, ExternalLink, Calendar, MapPin, Phone, Mail, User, FileText } from 'lucide-react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BookingUser {
  display_name: string | null;
  email: string | null;
}

interface BookingService {
  service_name: string;
  price: number;
}

interface Booking {
  booking_id: string;
  event_date: string;
  booking_status: string;
  total_amount: number | null;
  notes_for_vendor: string | null;
  created_at: string;
  users: BookingUser | null;
}

interface TaskBooking extends Booking {
  vendor_tasks: {
    vendor_task_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string | null;
  }[];
}

const StaffBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<TaskBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<TaskBooking | null>(null);
  const [bookingServices, setBookingServices] = useState<BookingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    if (staffProfile?.staff_id) {
      fetchStaffBookings();
    }
  }, [user, authLoading, navigate, staffProfile]);

  const fetchStaffBookings = async () => {
    if (!staffProfile?.staff_id) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch bookings that have tasks assigned to this staff member
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          booking_id, 
          event_date, 
          booking_status, 
          total_amount, 
          notes_for_vendor,
          created_at,
          users ( display_name, email ),
          vendor_tasks!inner (
            vendor_task_id,
            title,
            description,
            status,
            priority
          )
        `)
        .eq('vendor_tasks.assigned_staff_id', staffProfile.staff_id)
        .order('event_date', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData as TaskBooking[] || []);

    } catch (fetchError: any) {
      console.error('Error fetching staff bookings:', fetchError);
      setError(fetchError.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (bookingId: string) => {
    setDetailsLoading(true);
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('booking_services')
        .select(`
          vendor_services (
            service_name,
            base_price
          )
        `)
        .eq('booking_id', bookingId);

      if (servicesError) throw servicesError;
      
      const services = servicesData?.map(item => ({
        service_name: item.vendor_services?.service_name || 'Unknown Service',
        price: item.vendor_services?.base_price || 0
      })).filter(Boolean) as BookingService[] || [];
      setBookingServices(services);
    } catch (err: any) {
      console.error('Error fetching booking services:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = (booking: TaskBooking) => {
    setSelectedBooking(booking);
    fetchBookingDetails(booking.booking_id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="ml-2 mt-4 text-lg text-muted-foreground">Loading bookings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <p className="text-red-600 mb-4 text-center">{error}</p>
        </div>
      );
    }

    return (
      <Card className="w-full max-w-7xl mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-gray-700">My Assigned Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bookings where you have assigned tasks to complete.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">My Tasks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.users?.display_name || 'Unknown Client'}
                            </div>
                            <div className="text-xs text-gray-500">{booking.users?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(booking.event_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(booking.booking_status)} text-xs`}>
                          {booking.booking_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {booking.vendor_tasks?.slice(0, 2).map(task => (
                            <div key={task.vendor_task_id} className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 truncate max-w-32">{task.title}</span>
                              <Badge className={`${getPriorityColor(task.priority)} text-[10px] ml-1`}>
                                {task.priority || 'Normal'}
                              </Badge>
                            </div>
                          ))}
                          {booking.vendor_tasks && booking.vendor_tasks.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{booking.vendor_tasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {booking.total_amount !== null ? `₹${booking.total_amount.toFixed(2)}` : 'TBD'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="link" 
                              size="sm" 
                              onClick={() => handleViewDetails(booking)}
                            >
                              Details <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Booking Details - #{booking.booking_id.substring(0, 8)}</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-6">
                                {/* Client Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <h3 className="font-medium">Client Information</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{selectedBooking.users?.display_name || 'Unknown'}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{selectedBooking.users?.email || 'No email'}</span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader className="pb-3">
                                      <h3 className="font-medium">Event Information</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{new Date(selectedBooking.event_date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Badge className={`${getStatusColor(selectedBooking.booking_status)}`}>
                                          {selectedBooking.booking_status}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Services */}
                                {detailsLoading ? (
                                  <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                  </div>
                                ) : bookingServices.length > 0 && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <h3 className="font-medium">Booked Services</h3>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        {bookingServices.map((service, index) => (
                                          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <span>{service.service_name}</span>
                                            <span className="font-medium">₹{service.price}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Tasks */}
                                <Card>
                                  <CardHeader className="pb-3">
                                    <h3 className="font-medium">My Assigned Tasks</h3>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {selectedBooking.vendor_tasks?.map(task => (
                                        <div key={task.vendor_task_id} className="border rounded-lg p-3">
                                          <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">{task.title}</h4>
                                            <div className="flex gap-2">
                                              <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                                                {task.priority || 'Normal'}
                                              </Badge>
                                              <Badge variant="outline" className="text-xs">
                                                {task.status}
                                              </Badge>
                                            </div>
                                          </div>
                                          {task.description && (
                                            <p className="text-sm text-gray-600">{task.description}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Notes */}
                                {selectedBooking.notes_for_vendor && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <h3 className="font-medium flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Vendor Notes
                                      </h3>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm text-gray-600">{selectedBooking.notes_for_vendor}</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-lg">No bookings found with assigned tasks.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Bookings will appear here when you have tasks assigned to you.
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

export default StaffBookings;
