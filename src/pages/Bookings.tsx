
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Filter, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Booking {
  id: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  services: string[];
  totalAmount: number;
  advanceAmount: number;
  paidAmount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

const bookingsData: Booking[] = [
  {
    id: 'BK-2024-001',
    clientName: 'Arjun & Meera',
    eventDate: '2025-06-15',
    eventType: 'Wedding',
    services: ['Photography', 'Videography'],
    totalAmount: 85000,
    advanceAmount: 25000,
    paidAmount: 25000,
    status: 'confirmed',
  },
  {
    id: 'BK-2024-002',
    clientName: 'Rahul & Priya',
    eventDate: '2025-06-20',
    eventType: 'Engagement',
    services: ['Photography'],
    totalAmount: 35000,
    advanceAmount: 15000,
    paidAmount: 15000,
    status: 'confirmed',
  },
  {
    id: 'BK-2024-003',
    clientName: 'Vikram & Ananya',
    eventDate: '2025-06-25',
    eventType: 'Wedding',
    services: ['Photography', 'Videography', 'Decor'],
    totalAmount: 120000,
    advanceAmount: 40000,
    paidAmount: 40000,
    status: 'confirmed',
  },
  {
    id: 'BK-2024-004',
    clientName: 'Siddharth & Kiara',
    eventDate: '2025-07-05',
    eventType: 'Wedding',
    services: ['Photography', 'Videography'],
    totalAmount: 95000,
    advanceAmount: 30000,
    paidAmount: 0,
    status: 'pending',
  },
  {
    id: 'BK-2024-005',
    clientName: 'Akash & Deepika',
    eventDate: '2025-07-15',
    eventType: 'Reception',
    services: ['Photography'],
    totalAmount: 45000,
    advanceAmount: 15000,
    paidAmount: 15000,
    status: 'confirmed',
  },
  {
    id: 'BK-2024-006',
    clientName: 'Rohan & Neha',
    eventDate: '2025-05-10',
    eventType: 'Wedding',
    services: ['Photography', 'Videography', 'Decor'],
    totalAmount: 135000,
    advanceAmount: 50000,
    paidAmount: 135000,
    status: 'completed',
  },
];

const BookingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const filteredBookings = bookingsData.filter(booking => {
    const matchesSearch = 
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? booking.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Bookings Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your bookings in one place.
        </p>
      </div>
      
      <Card className="sanskara-card">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 sanskara-input"
                placeholder="Search by client or booking ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Status
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
                    Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div>{booking.clientName}</div>
                          <div className="text-xs text-muted-foreground">{booking.eventType}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(booking.eventDate)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {booking.services.map((service, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>₹{booking.totalAmount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            Paid: ₹{booking.paidAmount.toLocaleString()} / 
                            Advance: ₹{booking.advanceAmount.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(booking.status)} border capitalize`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-sanskara-gold hover:text-sanskara-magenta">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredBookings.length} of {bookingsData.length} bookings
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-8 bg-muted/50">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingsPage;
