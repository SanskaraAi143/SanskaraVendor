import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';

interface AvailabilityRecord {
  availability_id: string;
  available_date: string;
  status: 'available' | 'booked_tentative' | 'booked_confirmed' | 'unavailable_custom' | string; // Allow for other statuses
  notes: string | null;
}

const StaffAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    const fetchAvailability = async () => {
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

        const { data, error: availabilityError } = await supabase
          .from('vendor_availability')
          .select('availability_id, available_date, status, notes')
          .eq('vendor_id', staffData.vendor_id)
          .order('available_date', { ascending: true });

        if (availabilityError) throw availabilityError;
        setAvailability(data as AvailabilityRecord[] || []);

      } catch (err: any) {
        console.error('Error fetching availability:', err);
        setError(err.message || 'Failed to load availability data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user, authLoading, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-sanskara-green/20 text-sanskara-green';
      case 'booked_tentative': return 'bg-sanskara-amber/30 text-sanskara-amber'; // Lighter amber for tentative
      case 'booked_confirmed': return 'bg-sanskara-orange/20 text-sanskara-orange'; 
      case 'unavailable_custom': return 'bg-sanskara-red/20 text-sanskara-red';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading availability...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      );
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-8 w-8 text-sanskara-blue" />
            <CardTitle asChild>
              <h1 className="text-2xl font-semibold text-gray-700">Vendor Availability Records</h1>
            </CardTitle>
          </div>
           <p className="text-sm text-muted-foreground mt-1">
            List of all availability records for your vendor. Full calendar view coming soon.
          </p>
        </CardHeader>
        <CardContent>
          {availability.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availability.map(record => (
                    <tr key={record.availability_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(record.available_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(record.status)} text-xs`}>{record.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={record.notes || undefined}>
                        {record.notes || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No availability records found for your vendor.</p>
              <p className="text-sm text-muted-foreground mt-2">
                You can manage vendor availability from the main vendor portal or upcoming tools here.
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

export default StaffAvailabilityPage;
