import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

interface Booking {
  booking_id: string;
  event_date: string;
  booking_status: string;
  total_amount: number | null;
  // Add other relevant fields like user name, vendor name (though vendor name might be implicit)
  users: { display_name: string | null; email: string }; // Assuming join with users table
}

const StaffBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffVendorAndBookings = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          navigate('/staff/login');
          return;
        }

        // Fetch staff details to get vendor_id
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('vendor_id')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData) {
          setError('Staff profile not found or not associated with a vendor.');
          setLoading(false);
          return;
        }

        setVendorId(staffData.vendor_id);

        // Fetch bookings for this vendor
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('booking_id, event_date, booking_status, total_amount, users(display_name, email)') // Select user details via join
          .eq('vendor_id', staffData.vendor_id);

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);

      } catch (fetchError: any) {
        console.error('Error fetching vendor bookings:', fetchError);
        setError(fetchError.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffVendorAndBookings();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/staff/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Vendor Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.length > 0 ? (
            <ul>
              {bookings.map(booking => (
                <li key={booking.booking_id} className="p-4 border rounded-lg bg-white shadow-sm">
                  <h4 className="text-lg font-semibold">Booking ID: {booking.booking_id}</h4>
                  <p className="text-gray-700 text-sm mt-1">Event Date: {new Date(booking.event_date).toLocaleDateString()}</p>
                  <p className="text-gray-700 text-sm mt-1">Status: {booking.booking_status}</p>
                  {booking.total_amount !== null && <p className="text-gray-700 text-sm mt-1">Total Amount: ${booking.total_amount.toFixed(2)}</p>}
                  {booking.users && (
                    <p className="text-gray-700 text-sm mt-1">Customer: {booking.users.display_name || booking.users.email}</p>
                  )}
                  {/* Add more booking details here */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 text-center">No bookings found for your vendor.</p>
          )}
          <Button onClick={() => navigate('/staff/dashboard')} className="w-full mt-4">Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffBookings;