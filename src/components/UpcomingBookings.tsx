
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: number;
  client: string;
  date: string;
  time: string;
  location: string;
  service: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const bookings: Booking[] = [
  {
    id: 1,
    client: 'Arjun & Meera',
    date: '2025-06-15',
    time: '09:00 AM',
    location: 'Taj Palace, New Delhi',
    service: 'Wedding Photography',
    status: 'confirmed',
  },
  {
    id: 2,
    client: 'Rahul & Priya',
    date: '2025-06-20',
    time: '10:30 AM',
    location: 'Radisson Blu, Mumbai',
    service: 'Catering Services',
    status: 'pending',
  },
  {
    id: 3,
    client: 'Vikram & Ananya',
    date: '2025-06-25',
    time: '06:00 PM',
    location: 'ITC Gardenia, Bangalore',
    service: 'Decor & Mandap',
    status: 'confirmed',
  },
];

const UpcomingBookings: React.FC = () => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Bookings</span>
          <span className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{booking.client}</h3>
                <Badge className={`${getStatusColor(booking.status)} border`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{booking.service}</p>
              
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
      </CardContent>
    </Card>
  );
};

export default UpcomingBookings;
