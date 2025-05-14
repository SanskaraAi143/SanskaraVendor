import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';

interface BookingEvent {
  booking_id: string;
  event_date: string;
  client_name?: string;
  location?: string;
  service_name?: string;
  booking_status: string;
  start_time?: string;
  user_id: string;
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

  // Fetch bookings and availability
  useEffect(() => {
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
            notes_for_vendor
          `)
          .eq('vendor_id', vendorProfile.vendor_id);
          
        if (bookingsError) throw bookingsError;
        
        // Fetch availability
        const { data: availData, error: availError } = await supabase
          .from('vendor_availability')
          .select('*')
          .eq('vendor_id', vendorProfile.vendor_id);
          
        if (availError) throw availError;
        
        // Process bookings data
        setBookings(bookingsData || []);
        
        // Process availability data
        const availMap: {[key: string]: string} = {};
        availData?.forEach(item => {
          availMap[item.available_date] = item.status;
        });
        setAvailability(availMap);
        
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
    
    fetchCalendarData();
  }, [vendorProfile]);

  // Update displayed events when date changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Filter bookings for selected date
      const filteredEvents = bookings.filter(booking => 
        booking.event_date === formattedDate
      );
      
      setDayEvents(filteredEvents);
      
      // Get availability info for the selected date
      const availStatus = availability[formattedDate];
      if (availStatus) {
        setAvailabilityInfo({
          availability_id: '',
          available_date: formattedDate,
          status: availStatus,
          notes: ''
        });
      } else {
        setAvailabilityInfo(null);
      }
    }
  }, [selectedDate, bookings, availability]);

  // Calendar day rendering with booking indicators
  const renderCalendarDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasBooking = bookings.some(b => b.event_date === dateStr);
    const availStatus = availability[dateStr];
    
    let className = '';
    
    if (availStatus === 'unavailable') {
      className = 'bg-red-100 text-red-800 rounded-full';
    } else if (availStatus === 'tentative') {
      className = 'bg-amber-100 text-amber-800 rounded-full';
    }
    
    if (hasBooking) {
      return <div className={`relative ${className}`}>
        {day.getDate()}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-sanskara-red rounded-full"></div>
      </div>
    }
    
    return <div className={className}>{day.getDate()}</div>;
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
                components={{
                  // Fix the TypeScript error by removing custom Day component
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
                  <Button variant="outline" size="sm">Set as Available</Button>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600">
                    Mark Unavailable
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
                          {event.booking_status.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-xs space-y-1 mt-2">
                        <div className="flex items-center text-muted-foreground">
                          <User className="h-3 w-3 mr-1.5" />
                          <span>Client ID: {event.user_id.substring(0, 8)}</span>
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
                      
                      <Button size="sm" variant="link" className="mt-1 h-auto p-0 text-sanskara-red">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No events scheduled for this day</p>
                <Button className="mt-4 bg-sanskara-red text-white hover:bg-sanskara-maroon">
                  Add Availability
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
