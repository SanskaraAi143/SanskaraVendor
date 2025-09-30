import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CalendarIcon, User, FileText, PlusCircle } from 'lucide-react';
import BookingDetails from '@/components/BookingDetails';
import BookingNotes from '@/components/bookings/BookingNotes';
import { ManualBookingForm } from '@/components/bookings/ManualBookingForm';
import { Tables, Json } from '@/integrations/supabase/types';

// Define a type for custom customer details for clarity and type safety
type CustomCustomerDetails = {
  name: string;
  email: string;
  phone?: string;
};

interface Booking {
  booking_id: string;
  user_id: string | null;
  event_date: string;
  booking_status: string;
  total_amount: number | null;
  paid_amount: number | null;
  created_at: string;
  display_name?: string;
  notes_for_vendor?: string | null;
  wedding_id?: string | null;
  booking_source: Tables<'bookings'>['booking_source'];
  custom_customer_details: CustomCustomerDetails | null;
}

const statusColors: Record<string, string> = {
  pending_confirmation: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { vendorProfile } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState<Booking | null>(null);
  const [isManualBookingFormOpen, setIsManualBookingFormOpen] = useState(false);

  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchBookings();
    }
  }, [vendorProfile, statusFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    
    try {
      // Build the query
      let query = supabase
        .from('bookings')
        .select('*, custom_customer_details, booking_source')
        .eq('vendor_id', vendorProfile?.vendor_id);
      
      // Apply status filter if selected
      if (statusFilter) {
        query = query.eq('booking_status', statusFilter);
      }
      
      // Fetch bookings
      const { data, error } = await query.order('event_date', { ascending: true });
      
      if (error) throw error;
      
      // Fetch user names for each booking
      const enhancedBookings = await Promise.all(
        (data || []).map(async (booking) => {
          // Cast booking for easier type handling
          const typedBooking = booking as Tables<'bookings'>;

          let customCustomerDetails: CustomCustomerDetails | null = null;
          if (typedBooking.custom_customer_details) {
            customCustomerDetails = typedBooking.custom_customer_details as CustomCustomerDetails;
          }

          if (typedBooking.booking_source === 'vendor_manual' && customCustomerDetails) {
            return {
              ...typedBooking,
              display_name: customCustomerDetails.name,
              custom_customer_details: customCustomerDetails,
            };
          }

          if (typedBooking.user_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('display_name')
              .eq('user_id', typedBooking.user_id)
              .single();
            
            return {
              ...typedBooking,
              display_name: userData?.display_name || 'Unknown Client'
            };
          }
          
          return {
            ...typedBooking,
            display_name: 'Unknown Client'
          };
        })
      );
      
      setBookings(enhancedBookings as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Could not load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('booking_id', bookingId);
      
      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, booking_status: status }
          : booking
      ));
      
      toast({
        title: "Status updated",
        description: `Booking status set to ${status.replace('_', ' ')}`,
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDetailsDialogOpen(true);
  };

  const handleViewNotes = (booking: Booking) => {
    setSelectedBookingForNotes(booking);
    setNotesDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client bookings and events
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsManualBookingFormOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Manual Booking
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
            <p className="ml-3 text-sanskara-maroon">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Bookings Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {statusFilter
                  ? `No ${statusFilter.replace('_', ' ')} bookings found. Try selecting a different status filter.`
                  : "You don't have any bookings yet. They will appear here when clients book your services."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.booking_id} className="overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={statusColors[booking.booking_status] || ''}>
                      {booking.booking_status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Booking #{booking.booking_id.substring(0, 8)}
                    </span>
                     {booking.booking_source === 'vendor_manual' && (
                      <Badge variant="secondary">Manual</Badge>
                    )}
                  </div>
                  <Select
                    defaultValue={booking.booking_status}
                    onValueChange={(value) => updateBookingStatus(booking.booking_id, value)}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="flex space-x-3 items-start">
                      <Calendar className="h-5 w-5 mt-0.5 text-sanskara-red" />
                      <div>
                        <p className="font-medium">Event Date</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.event_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 items-start">
                      <User className="h-5 w-5 mt-0.5 text-sanskara-red" />
                      <div>
                        <p className="font-medium">Client</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.display_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 items-start">
                      <CalendarIcon className="h-5 w-5 mt-0.5 text-sanskara-red" />
                      <div>
                        <p className="font-medium">Booked On</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p className="text-sm text-muted-foreground">
                        ${booking.total_amount?.toFixed(2) || '0.00'} (Paid: ${booking.paid_amount?.toFixed(2) || '0.00'})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-sanskara-red border-sanskara-red hover:bg-sanskara-red/10"
                        onClick={() => handleViewDetails(booking.booking_id)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        className="text-sanskara-blue border-sanskara-blue hover:bg-sanskara-blue/10"
                        onClick={() => handleViewNotes(booking)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Notes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedBookingId && (
          <BookingDetails
            bookingId={selectedBookingId}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
        )}

        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Notes</DialogTitle>
            </DialogHeader>
            {selectedBookingForNotes && (
              <BookingNotes
                bookingId={selectedBookingForNotes.booking_id}
                initialNotes={selectedBookingForNotes.notes_for_vendor || ''}
                onUpdate={() => {
                  fetchBookings();
                  setNotesDialogOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <ManualBookingForm
        open={isManualBookingFormOpen}
        onOpenChange={setIsManualBookingFormOpen}
        onBookingCreated={fetchBookings}
      />
    </>
  );
};

export default Bookings;
