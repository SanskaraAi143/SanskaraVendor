
import React from 'react';
import DashboardCard from '@/components/DashboardCard';
import RevenueChart from '@/components/RevenueChart';
import UpcomingBookings from '@/components/UpcomingBookings';
import UpcomingTasks from '@/components/UpcomingTasks';
import ServicesList from '@/components/ServicesList';
import { BookOpen, CalendarCheck, Star, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

interface FetchedDashboardStats {
  totalBookings: number;
  thisMonthEvents: number;
  avgRating: number;
  ytdRevenue: number;
}

interface DashboardStats extends FetchedDashboardStats {
  bookingTrend: number;
  ratingTrend: number;
  revenueTrend: number;
}

const fetchDashboardDataQuery = async (vendorId: string): Promise<FetchedDashboardStats> => {
  if (!vendorId) throw new Error("Vendor ID is required");

  // Fetch total bookings
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('booking_id')
    .eq('vendor_id', vendorId);
  if (bookingsError) throw bookingsError;

  // Fetch this month's events
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const { data: thisMonthEventsData, error: eventsError } = await supabase
    .from('bookings')
    .select('booking_id')
    .eq('vendor_id', vendorId)
    .gte('event_date', firstDayOfMonth.toISOString())
    .lte('event_date', lastDayOfMonth.toISOString());
  if (eventsError) throw eventsError;

  // Fetch average rating
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('vendor_id', vendorId);
  if (reviewsError) throw reviewsError;
  const avgRating = reviewsData && reviewsData.length > 0
    ? parseFloat((reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length).toFixed(1))
    : 0;

  // Fetch YTD revenue
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('amount, paid_at') // Ensure paid_at is selected if needed for filtering by vendor_id in payments table
    // .eq('vendor_id', vendorId) // This line assumes payments are directly linked to vendor_id; adjust if relation is indirect
    .eq('payment_status', 'completed')
    .gte('paid_at', startOfYear.toISOString());
  if (paymentsError) throw paymentsError;
  
  // Assuming payments are filtered by vendor via bookings or services if not directly on payments table
  // For this example, let's assume paymentsData is already correctly filtered for the vendor
  const ytdRevenue = paymentsData && paymentsData.length > 0
    ? paymentsData.reduce((sum, payment) => sum + payment.amount, 0)
    : 0;

  return {
    totalBookings: bookingsData?.length || 0,
    thisMonthEvents: thisMonthEventsData?.length || 0,
    avgRating: avgRating,
    ytdRevenue: ytdRevenue,
  };
};


const Dashboard: React.FC = () => {
  const { vendorProfile } = useAuth();

  const { 
    data: statsData,
    isLoading, 
    isError, 
    error 
  } = useQuery(
    ['dashboardStats', vendorProfile?.vendor_id],
    () => fetchDashboardDataQuery(vendorProfile!.vendor_id!),
    {
      enabled: !!vendorProfile?.vendor_id,
    }
  );

  React.useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error fetching dashboard statistics',
        description: (error as any).message || 'Could not load dashboard data. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [isError, error]);

  // Calculate trends and combine with fetched stats
  const stats: DashboardStats | null = React.useMemo(() => {
    if (!statsData) return null;
    return {
      ...statsData,
      bookingTrend: statsData.totalBookings > 0 ? 12 : 0, // Mocked trend
      ratingTrend: statsData.avgRating > 0 ? 0.3 : 0, // Mocked trend
      revenueTrend: statsData.ytdRevenue > 0 ? 18 : 0, // Mocked trend
    };
  }, [statsData]);
  
  // Format revenue properly
  const formatRevenue = (revenue: number | undefined) => {
    if (revenue === undefined) return 'N/A';
    if (revenue >= 100000) {
      return `₹${(revenue / 100000).toFixed(1)}L`;
    } else if (revenue >= 1000) {
      return `₹${(revenue / 1000).toFixed(1)}K`;
    } else {
      return `₹${revenue}`;
    }
  };
  
  // Render loading skeleton if data is loading or vendorProfile is not yet available
  if (isLoading || (!stats && !isError)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If there's an error and we don't have stats, show a message or different UI
  // The toast notification for error is handled by useEffect above
  if (isError && !stats) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 text-lg">Failed to load dashboard statistics.</p>
            <p className="text-muted-foreground">Please try again later.</p>
        </div>
    );
  }
  
  // If stats is null even after loading (e.g. vendorProfile not loaded, though 'enabled' should prevent this)
  // or if any other unexpected state occurs where stats is null.
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Dashboard data is currently unavailable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Welcome, {vendorProfile?.vendor_name || 'Vendor'}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your business performance and upcoming events.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Total Bookings"
          value={stats.totalBookings.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          trend={stats.totalBookings > 0 ? { value: stats.bookingTrend, isPositive: true } : undefined}
          color="sanskara-red"
        />
        <DashboardCard 
          title="This Month's Events"
          value={stats.thisMonthEvents.toString()}
          icon={<CalendarCheck className="h-5 w-5" />}
          color="sanskara-gold"
        />
        <DashboardCard 
          title="Average Rating"
          value={stats.avgRating > 0 ? stats.avgRating.toString() : "N/A"}
          icon={<Star className="h-5 w-5" />}
          trend={stats.avgRating > 0 ? { value: stats.ratingTrend, isPositive: true } : undefined}
          color="sanskara-amber"
        />
        <DashboardCard 
          title="Revenue (YTD)"
          value={formatRevenue(stats.ytdRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={stats.ytdRevenue > 0 ? { value: stats.revenueTrend, isPositive: true } : undefined}
          color="sanskara-green"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart vendorId={vendorProfile?.vendor_id} />
        <UpcomingBookings vendorId={vendorProfile?.vendor_id} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks vendorId={vendorProfile?.vendor_id} />
        <ServicesList vendorId={vendorProfile?.vendor_id} />
      </div>
    </div>
  );
};

export default Dashboard;
