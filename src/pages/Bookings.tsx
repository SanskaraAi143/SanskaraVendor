
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Booking {
  booking_id: string;
  user_id: string;
  event_date: string;
  event_type?: string;
  services?: string[];
  total_amount?: number;
  advance_amount_due?: number;
  paid_amount?: number;
  booking_status: string;
}

const BookingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { vendorProfile } = useAuth();
  
  useEffect(() => {
    fetchBookings();
  }, [vendorProfile]);
  
  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);
  
  const fetchBookings = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      // Fetch services for each booking
      const bookingsWithServices = await Promise.all(data.map(async (booking) => {
        const { data: serviceData, error: serviceError } = await supabase
          .from('booking_services')
          .select('vendor_service_id')
          .eq('booking_id', booking.booking_id);
          
        if (serviceError) throw serviceError;
        
        // Get service names - in a real app we would join with vendor_services table
        // but for this demo we'll just use placeholders
        const services = serviceData?.map((s, idx) => `Service ${idx + 1}`) || [];
        
        return {
          ...booking,
          event_type: 'Wedding', // placeholder
          services
        };
      }));
      
      setBookings(bookingsWithServices);
      setFilteredBookings(bookingsWithServices);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.user_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_confirmation': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
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
                  <DropdownMenuItem onClick={() => setStatusFilter('pending_confirmation')}>
                    Pending Confirmation
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
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
              <p className="ml-3 text-sanskara-maroon">Loading bookings...</p>
            </div>
          ) : (
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
                      <TableRow key={booking.booking_id}>
                        <TableCell className="font-medium">{booking.booking_id.substring(0, 8)}</TableCell>
                        <TableCell>
                          <div>
                            <div>Client #{booking.user_id.substring(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">{booking.event_type || 'Wedding'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(booking.event_date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {booking.services ? booking.services.map((service, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs">
                                Services Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>₹{(booking.total_amount || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              Paid: ₹{(booking.paid_amount || 0).toLocaleString()} / 
                              Advance: ₹{(booking.advance_amount_due || 0).toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(booking.booking_status)} border capitalize`}>
                            {getDisplayStatus(booking.booking_status)}
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
                        {searchQuery || statusFilter ? (
                          <div>
                            <p>No bookings match your search criteria.</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setSearchQuery('');
                                setStatusFilter(null);
                              }}
                            >
                              Clear filters
                            </Button>
                          </div>
                        ) : (
                          <p>No bookings found.</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!isLoading && filteredBookings.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredBookings.length} of {bookings.length} bookings
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
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingsPage;
