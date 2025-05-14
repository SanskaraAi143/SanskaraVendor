
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

interface Booking {
  booking_id: string;
  client: string;
  date: string;
  time: string;
  location: string;
  service: string;
  status: 'confirmed' | 'pending' | 'completed'; // Fixed type to be union instead of string
  user_id: string;
  event_date: string;
  booking_status: string;
  notes_for_vendor: string | null;
}

interface UpcomingBookingsProps {
  vendorId?: string;
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ vendorId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!vendorId) return;
      
      try {
        setIsLoading(true);
        const currentDate = new Date().toISOString();
        
        // Fetch upcoming bookings
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            booking_id,
            user_id,
            event_date,
            booking_status,
            notes_for_vendor
          `)
          .eq('vendor_id', vendorId)
          .gte('event_date', currentDate)
          .order('event_date', { ascending: true })
          .limit(3);
          
        if (error) throw error;
        
        // Transform data to match component's expected format
        const formattedBookings = data.map(booking => ({
          booking_id: booking.booking_id,
          client: `Client #${booking.user_id.substring(0, 8)}`,  // We'll use user ID as a placeholder
          date: booking.event_date,
          time: "TBD", // Time might not be available
          location: "Location details unavailable",
          service: "Various Services",
          // Map booking_status to one of the allowed status values
          status: (booking.booking_status === 'confirmed' 
            ? 'confirmed' 
            : booking.booking_status === 'completed'
              ? 'completed'
              : 'pending') as 'confirmed' | 'pending' | 'completed',
          user_id: booking.user_id,
          event_date: booking.event_date,
          booking_status: booking.booking_status,
          notes_for_vendor: booking.notes_for_vendor
        }));
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        toast({
          title: "Error",
          description: "Could not load upcoming bookings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [vendorId]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': 
      case 'pending_confirmation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Bookings</span>
          <Link to="/bookings" className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                <div className="h-4 w-32 mt-2 bg-gray-200 rounded animate-pulse"></div>
                
                <div className="space-y-2 mt-3">
                  <div className="h-3 w-36 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{booking.client}</h3>
                  <Badge className={`${getStatusColor(booking.booking_status)} border`}>
                    {getDisplayStatus(booking.booking_status)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {booking.notes_for_vendor || 'No specific notes provided.'}
                </p>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{booking.time}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    <span>{booking.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-sanskara-amber/10 p-3 mb-3">
              <Calendar className="h-6 w-6 text-sanskara-amber" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Upcoming Bookings</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              You don't have any upcoming bookings scheduled. They'll appear here when clients book your services.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBookings;
