
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock, MapPin, User, Plus, Info } from 'lucide-react';
import { format } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface BookingEvent {
  booking_id: string;
  event_date: string;
  client_name?: string;
  location?: string;
  service_name?: string;
  booking_status: string;
  start_time?: string;
  user_id: string;
  wedding_id?: string;
  notes_for_vendor?: string;
}

interface AvailabilityInfo {
  availability_id: string;
  available_date: string;
  status: string;
  notes?: string;
}

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [availability, setAvailability] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dayEvents, setDayEvents] = useState<BookingEvent[]>([]);
  const [availabilityInfo, setAvailabilityInfo] = useState<AvailabilityInfo | null>(null);
  const { vendorProfile } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);

  // New availability state
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    fetchCalendarData();
  }, [vendorProfile]);

  // Fetch bookings and availability
  const fetchCalendarData = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    setIsLoading(true);
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          booking_id,
          event_date,
          booking_status,
          user_id,
          notes_for_vendor,
          wedding_id
        `)
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (bookingsError) throw bookingsError;

      // Fetch user info for each booking
      const enhancedBookings = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: userData } = await supabase
            .from('users')
            .select('display_name')
            .eq('user_id', booking.user_id)
            .single();
          
          return {
            ...booking,
            client_name: userData?.display_name || 'Unknown Client'
          };
        })
      );
      
      // Fetch availability
      const { data: availData, error: availError } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (availError) throw availError;
      
      // Process bookings data
      setBookings(enhancedBookings);
      
      // Process availability data
      const availMap: {[key: string]: string} = {};
      availData?.forEach(item => {
        availMap[item.available_date] = item.status;
      });
      setAvailability(availMap);
      
      // Update day events for the currently selected date
      if (selectedDate) {
        updateDayEvents(selectedDate, enhancedBookings, availMap);
      }
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: "Error",
        description: "Could not load calendar data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update displayed events when date changes
  useEffect(() => {
    if (selectedDate) {
      updateDayEvents(selectedDate, bookings, availability);
    }
  }, [selectedDate]);

  const updateDayEvents = (date: Date, bookings: BookingEvent[], availability: {[key: string]: string}) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Filter bookings for selected date
    const filteredEvents = bookings.filter(booking => 
      booking.event_date === formattedDate
    );
    
    setDayEvents(filteredEvents);
    
    // Get availability info for the selected date
    const availStatus = availability[formattedDate];
    if (availStatus) {
      const availabilityData = {
        availability_id: '',
        available_date: formattedDate,
        status: availStatus,
        notes: ''
      };
      setAvailabilityInfo(availabilityData);
    } else {
      setAvailabilityInfo(null);
    }
  };

  const setAvailabilityStatus = async (status: string) => {
    if (!vendorProfile?.vendor_id || !selectedDate) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      // Check if there's already an availability record for this date
      const { data: existingData, error: checkError } = await supabase
        .from('vendor_availability')
        .select('availability_id')
        .eq('vendor_id', vendorProfile.vendor_id)
        .eq('available_date', formattedDate);
        
      if (checkError) throw checkError;
      
      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        result = await supabase
          .from('vendor_availability')
          .update({ status })
          .eq('availability_id', existingData[0].availability_id);
      } else {
        // Insert new record
        result = await supabase
          .from('vendor_availability')
          .insert({
            vendor_id: vendorProfile.vendor_id,
            available_date: formattedDate,
            status
          });
      }
      
      if (result.error) throw result.error;
      
      // Update local state
      const newAvailability = { ...availability };
      newAvailability[formattedDate] = status;
      setAvailability(newAvailability);
      
      // Update availability info
      if (availabilityInfo) {
        setAvailabilityInfo({
          ...availabilityInfo,
          status
        });
      } else {
        setAvailabilityInfo({
          availability_id: '',
          available_date: formattedDate,
          status,
          notes: ''
        });
      }
      
      toast({
        title: "Availability updated",
        description: `You are now marked as ${status} on ${format(selectedDate, 'MMMM d, yyyy')}`,
      });
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Could not update availability",
        variant: "destructive",
      });
    }
  };

  const handleAddAvailability = async () => {
    if (!vendorProfile?.vendor_id || !newAvailability.date) {
      toast({
        title: "Error",
        description: "Date is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('vendor_availability')
        .insert({
          vendor_id: vendorProfile.vendor_id,
          available_date: newAvailability.date,
          status: newAvailability.status,
          notes: newAvailability.notes || null
        });
        
      if (error) throw error;
      
      // Update local state
      const newAvailabilityMap = { ...availability };
      newAvailabilityMap[newAvailability.date] = newAvailability.status;
      setAvailability(newAvailabilityMap);
      
      // If the added availability is for the selected date, update the availabilityInfo
      if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === newAvailability.date) {
        setAvailabilityInfo({
          availability_id: '',
          available_date: newAvailability.date,
          status: newAvailability.status,
          notes: newAvailability.notes || ''
        });
      }
      
      // Reset form and close dialog
      setNewAvailability({
        date: '',
        status: 'available',
        notes: ''
      });
      setAvailabilityDialogOpen(false);
      
      toast({
        title: "Availability added",
        description: `Availability for ${format(new Date(newAvailability.date), 'MMMM d, yyyy')} has been set to ${newAvailability.status}`,
      });
    } catch (error) {
      console.error('Error adding availability:', error);
      toast({
        title: "Error",
        description: "Could not add availability",
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
  
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'tentative':
        return 'bg-amber-100 text-amber-800 border-amber-200';
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

  const handleViewEventDetails = (event: BookingEvent) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  // Function to render day cells with appropriate indicators
  const dayHasEvent = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasBooking = bookings.some(b => b.event_date === dateStr);
    const availStatus = availability[dateStr];
    
    let classNames = '';
    
    if (availStatus === 'unavailable') {
      classNames += 'bg-red-50 ';
    } else if (availStatus === 'tentative') {
      classNames += 'bg-amber-50 ';
    }
    
    if (hasBooking) {
      classNames += 'font-bold text-sanskara-red';
    }
    
    return classNames;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Manage your bookings and availability
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Event Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
              </div>
            ) : (
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  hasEvent: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return bookings.some(b => b.event_date === dateStr);
                  },
                  unavailable: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return availability[dateStr] === 'unavailable';
                  },
                  tentative: (date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return availability[dateStr] === 'tentative';
                  }
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                    textDecorationColor: 'var(--sanskara-red)',
                  },
                  unavailable: {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  },
                  tentative: {
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Day details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availabilityInfo && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Availability Status</p>
                <Badge
                  variant="outline"
                  className={getAvailabilityColor(availabilityInfo.status)}
                >
                  {availabilityInfo.status.charAt(0).toUpperCase() + availabilityInfo.status.slice(1)}
                </Badge>
                
                <div className="mt-2 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAvailabilityStatus('available')}
                    className={availabilityInfo.status === 'available' ? 'bg-green-50 border-green-200' : ''}
                  >
                    Set as Available
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAvailabilityStatus('unavailable')}
                    className={`${availabilityInfo.status === 'unavailable' ? 'bg-red-50' : ''} border-red-200 text-red-600`}
                  >
                    Mark Unavailable
                  </Button>
                </div>
                <div className="mt-2 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAvailabilityStatus('tentative')}
                    className={availabilityInfo.status === 'tentative' ? 'bg-amber-50 border-amber-200' : ''}
                  >
                    Mark as Tentative
                  </Button>
                </div>
              </div>
            )}
            
            {dayEvents.length > 0 ? (
              <div>
                <h3 className="font-medium mb-2">Events ({dayEvents.length})</h3>
                <div className="space-y-3">
                  {dayEvents.map((event) => (
                    <div key={event.booking_id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Booking #{event.booking_id.substring(0, 8)}</h4>
                        <Badge
                          variant="outline"
                          className={getStatusColor(event.booking_status)}
                        >
                          {getDisplayStatus(event.booking_status)}
                        </Badge>
                      </div>
                      
                      <div className="text-xs space-y-1 mt-2">
                        <div className="flex items-center text-muted-foreground">
                          <User className="h-3 w-3 mr-1.5" />
                          <span>{event.client_name || `Client ID: ${event.user_id.substring(0, 8)}`}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 mr-1.5" />
                          <span>{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
                        </div>
                        {event.start_time && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1.5" />
                            <span>{event.start_time}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1.5" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.notes_for_vendor && (
                        <div className="mt-3 bg-gray-50 p-2 rounded-md">
                          <div className="flex items-start">
                            <Info className="h-3 w-3 mt-1 mr-1.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{event.notes_for_vendor}</p>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="mt-1 h-auto p-0 text-sanskara-red"
                        onClick={() => handleViewEventDetails(event)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No events scheduled for this day</p>
                <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4 bg-sanskara-red text-white hover:bg-sanskara-maroon">
                      <Plus className="h-4 w-4 mr-2" /> Add Availability
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Availability</DialogTitle>
                      <DialogDescription>
                        Set your availability for specific dates.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          className="col-span-3"
                          value={newAvailability.date}
                          onChange={(e) => setNewAvailability({...newAvailability, date: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select
                          value={newAvailability.status}
                          onValueChange={(value) => setNewAvailability({...newAvailability, status: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                            <SelectItem value="tentative">Tentative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any notes about this day"
                          className="col-span-3"
                          value={newAvailability.notes}
                          onChange={(e) => setNewAvailability({...newAvailability, notes: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAvailabilityDialogOpen(false)}>Cancel</Button>
                      <Button 
                        onClick={handleAddAvailability} 
                        className="bg-sanskara-red hover:bg-sanskara-maroon text-white"
                      >
                        Add Availability
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Details for booking #{selectedEvent?.booking_id?.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Status</p>
              <Badge
                variant="outline"
                className={selectedEvent?.booking_status ? getStatusColor(selectedEvent.booking_status) : ''}
              >
                {selectedEvent?.booking_status ? getDisplayStatus(selectedEvent.booking_status) : 'Unknown'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="font-medium">Client</p>
              <p>{selectedEvent?.client_name || 'Unknown Client'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="font-medium">Event Date</p>
              <p>{selectedEvent?.event_date ? format(new Date(selectedEvent.event_date), 'MMMM d, yyyy') : 'Unknown Date'}</p>
            </div>
            
            {selectedEvent?.notes_for_vendor && (
              <div className="space-y-1">
                <p className="font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{selectedEvent.notes_for_vendor}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              className="w-full bg-sanskara-red hover:bg-sanskara-maroon text-white"
              onClick={() => setEventDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
