import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card'; // CardTitle removed as title is in StaffHeader
import { Loader2, ExternalLink } from 'lucide-react';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { useAuth } from '@/hooks/useAuthContext'; // Import useAuth

// Extended Booking interface for more details
interface Booking {
  booking_id: string;
  event_date: string;
  booking_status: string;
  total_amount: number | null;
  notes_for_vendor: string | null;
  created_at: string; // Added for context
  users: { // Assuming 'users' table is related
    display_name: string | null;
    email: string | null;
    phone_number: string | null;
  };
  // Potential to add booking_services if detailed view per booking is needed later
  // booking_services: Array<{ vendor_services: { service_name: string } }>;
}

const StaffBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth(); // Get user from useAuth
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    const fetchStaffVendorAndBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('vendor_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData || !staffData.vendor_id) {
          setError('Staff profile not found or not associated with a vendor.');
          setLoading(false);
          return;
        }
        
        // Fetch bookings for this vendor, including related user details
        // Added notes_for_vendor and created_at
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            booking_id, 
            event_date, 
            booking_status, 
            total_amount, 
            notes_for_vendor,
            created_at,
            users ( display_name, email, phone_number )
          `)
          .eq('vendor_id', staffData.vendor_id)
          .order('event_date', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData as Booking[] || []); // Cast to Booking[]

      } catch (fetchError: any) {
        console.error('Error fetching vendor bookings:', fetchError);
        setError(fetchError.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffVendorAndBookings();
  }, [user, authLoading, navigate]);

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
          {/* Removed Back to Dashboard button, rely on sidebar */}
        </div>
      );
    }

    return (
      <Card className="w-full max-w-6xl mx-auto"> {/* Increased max-width for more details */}
        <CardHeader>
          <h1 className="text-2xl font-semibold text-gray-700">Vendor Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            List of all bookings associated with your vendor.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.users?.display_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.users?.email || booking.users?.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.event_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.booking_status === 'confirmed' ? 'bg-sanskara-green/20 text-sanskara-green' :
                          booking.booking_status === 'pending' ? 'bg-sanskara-amber/20 text-sanskara-amber' :
                          booking.booking_status === 'cancelled' ? 'bg-sanskara-red/20 text-sanskara-red' : 
                          'bg-gray-100 text-gray-800' // Default for other statuses
                        }`}>
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {booking.total_amount !== null ? `₹${booking.total_amount.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={booking.notes_for_vendor || undefined}>
                        {booking.notes_for_vendor || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="link" size="sm" onClick={() => alert(`View details for booking ${booking.booking_id} - Not implemented`)}>
                          Details <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-700 text-center py-10">No bookings found for your vendor.</p>
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