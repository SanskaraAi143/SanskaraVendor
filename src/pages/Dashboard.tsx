
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
  totalBookingsCount: number;
  thisMonthEventsCount: number;
  allTimeRatings: { rating: number }[];
  ytdRevenueSum: number;
  previousPeriodBookingsCount: number;
  previousPeriodRatings: { rating: number }[];
  previousYTDRevenueSum: number;
}

interface DashboardStats {
  totalBookings: number; // Renamed from totalBookingsCount for UI consistency
  thisMonthEvents: number; // Renamed from thisMonthEventsCount
  currentAvgRating: number;
  previousPeriodAvgRating: number;
  ytdRevenue: number; // Renamed from ytdRevenueSum
  
  // Trends will be calculated later, but historical data is now available
  // For now, keeping the mocked trend fields as per instruction
  bookingTrend: number; 
  ratingTrend: number;
  revenueTrend: number;
  
  // Raw historical data for actual trend calculation later
  previousPeriodBookingsCount: number;
  previousYTDRevenue: number; // Renamed from previousYTDRevenueSum
}


const fetchDashboardDataQuery = async (vendorId: string): Promise<FetchedDashboardStats> => {
  if (!vendorId) throw new Error("Vendor ID is required");

  const currentDate = new Date();

  // 1. Current Total Bookings (Count)
  const { count: totalBookingsCount, error: totalBookingsError } = await supabase
    .from('bookings')
    .select('booking_id', { count: 'exact', head: true })
    .eq('vendor_id', vendorId);
  if (totalBookingsError) throw totalBookingsError;

  // 2. Current This Month's Events (Count)
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const { count: thisMonthEventsCount, error: thisMonthEventsError } = await supabase
    .from('bookings')
    .select('booking_id', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)
    .gte('event_date', firstDayOfMonth.toISOString())
    .lte('event_date', lastDayOfMonth.toISOString());
  if (thisMonthEventsError) throw thisMonthEventsError;

  // 3. Current All-Time Ratings (Array of ratings)
  const { data: allTimeRatings, error: allTimeRatingsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('vendor_id', vendorId);
  if (allTimeRatingsError) throw allTimeRatingsError;

  // 4. Current YTD Revenue (Sum)
  const startOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);
  // Fetch booking_ids for the vendor in the current YTD period
  const { data: currentYearVendorBookings, error: currentYVBError } = await supabase
    .from('bookings')
    .select('booking_id')
    .eq('vendor_id', vendorId)
    .gte('event_date', startOfCurrentYear.toISOString())
    .lte('event_date', currentDate.toISOString());
  if (currentYVBError) throw currentYVBError;

  let ytdRevenueSum = 0;
  if (currentYearVendorBookings && currentYearVendorBookings.length > 0) {
    const bookingIds = currentYearVendorBookings.map(b => b.booking_id);
    const { data: ytdPayments, error: ytdPaymentsError } = await supabase
      .from('payments')
      .select('amount')
      .in('booking_id', bookingIds)
      .eq('payment_status', 'completed');
    if (ytdPaymentsError) throw ytdPaymentsError;
    ytdRevenueSum = ytdPayments ? ytdPayments.reduce((sum, p) => sum + p.amount, 0) : 0;
  }
  
  // --- Historical Data for Trends ---

  // 5. Previous Period Bookings (Count)
  const endDatePrevBookings = new Date(currentDate);
  endDatePrevBookings.setDate(currentDate.getDate() - 30);
  const startDatePrevBookings = new Date(currentDate);
  startDatePrevBookings.setDate(currentDate.getDate() - 60);
  
  const { count: previousPeriodBookingsCount, error: prevBookingsError } = await supabase
    .from('bookings')
    .select('booking_id', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)
    .gte('event_date', startDatePrevBookings.toISOString())
    .lte('event_date', endDatePrevBookings.toISOString());
  if (prevBookingsError) throw prevBookingsError;

  // 6. Previous Period Ratings (Array of ratings)
  const endDatePrevRatings = new Date(currentDate);
  endDatePrevRatings.setDate(currentDate.getDate() - 30);
  const startDatePrevRatings = new Date(currentDate);
  startDatePrevRatings.setDate(currentDate.getDate() - 60);

  const { data: previousPeriodRatings, error: prevRatingsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('vendor_id', vendorId)
    .gte('created_at', startDatePrevRatings.toISOString())
    .lte('created_at', endDatePrevRatings.toISOString());
  if (prevRatingsError) throw prevRatingsError;

  // 7. Previous YTD Revenue (Sum)
  const prevYear = currentDate.getFullYear() - 1;
  const startDatePrevYTD = new Date(prevYear, 0, 1); // Jan 1st of last year
  const endDatePrevYTD = new Date(prevYear, currentDate.getMonth(), currentDate.getDate()); // Current month/day of last year

  // Fetch booking_ids for the vendor in the previous YTD period
   const { data: prevYearVendorBookings, error: prevYVBError } = await supabase
    .from('bookings')
    .select('booking_id')
    .eq('vendor_id', vendorId)
    .gte('event_date', startDatePrevYTD.toISOString())
    .lte('event_date', endDatePrevYTD.toISOString());
  if (prevYVBError) throw prevYVBError;

  let previousYTDRevenueSum = 0;
  if (prevYearVendorBookings && prevYearVendorBookings.length > 0) {
    const prevBookingIds = prevYearVendorBookings.map(b => b.booking_id);
    const { data: prevYtdPayments, error: prevYtdPaymentsError } = await supabase
      .from('payments')
      .select('amount')
      .in('booking_id', prevBookingIds)
      .eq('payment_status', 'completed');
    if (prevYtdPaymentsError) throw prevYtdPaymentsError;
    previousYTDRevenueSum = prevYtdPayments ? prevYtdPayments.reduce((sum, p) => sum + p.amount, 0) : 0;
  }

  return {
    totalBookingsCount: totalBookingsCount || 0,
    thisMonthEventsCount: thisMonthEventsCount || 0,
    allTimeRatings: allTimeRatings || [],
    ytdRevenueSum: ytdRevenueSum,
    previousPeriodBookingsCount: previousPeriodBookingsCount || 0,
    previousPeriodRatings: previousPeriodRatings || [],
    previousYTDRevenueSum: previousYTDRevenueSum,
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

    const calculateAverage = (ratings: { rating: number }[] | undefined) => {
      if (!ratings || ratings.length === 0) return 0;
      const sum = ratings.reduce((acc, review) => acc + review.rating, 0);
      return parseFloat((sum / ratings.length).toFixed(1));
    };

    const currentAvgRating = calculateAverage(statsData.allTimeRatings);
    const previousPeriodAvgRating = calculateAverage(statsData.previousPeriodRatings);

    // Booking Trend Calculation
    let bookingTrend = 0;
    if (statsData.previousPeriodBookingsCount > 0) {
      bookingTrend = ((statsData.totalBookingsCount - statsData.previousPeriodBookingsCount) / statsData.previousPeriodBookingsCount) * 100;
    } else if (statsData.totalBookingsCount > 0) {
      bookingTrend = 100; // Growth from zero
    }
    // If both totalBookingsCount and previousPeriodBookingsCount are 0, trend remains 0.

    // Rating Trend Calculation
    const ratingTrend = currentAvgRating - previousPeriodAvgRating;

    // Revenue Trend Calculation
    let revenueTrend = 0;
    if (statsData.previousYTDRevenueSum > 0) {
      revenueTrend = ((statsData.ytdRevenueSum - statsData.previousYTDRevenueSum) / statsData.previousYTDRevenueSum) * 100;
    } else if (statsData.ytdRevenueSum > 0) {
      revenueTrend = 100; // Growth from zero
    }
    // If both ytdRevenueSum and previousYTDRevenueSum are 0, trend remains 0.

    return {
      totalBookings: statsData.totalBookingsCount,
      thisMonthEvents: statsData.thisMonthEventsCount,
      currentAvgRating: currentAvgRating,
      previousPeriodAvgRating: previousPeriodAvgRating,
      ytdRevenue: statsData.ytdRevenueSum,
      
      bookingTrend: parseFloat(bookingTrend.toFixed(1)),
      ratingTrend: parseFloat(ratingTrend.toFixed(1)),
      revenueTrend: parseFloat(revenueTrend.toFixed(1)),

      // Pass through raw historical data if needed elsewhere, though trends are now calculated
      previousPeriodBookingsCount: statsData.previousPeriodBookingsCount,
      previousYTDRevenue: statsData.previousYTDRevenueSum,
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
          trend={
            typeof stats.bookingTrend === 'number' && !isNaN(stats.bookingTrend)
              ? { value: stats.bookingTrend, isPositive: stats.bookingTrend > 0 }
              : undefined
          }
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
          value={stats.currentAvgRating > 0 ? stats.currentAvgRating.toString() : "N/A"}
          icon={<Star className="h-5 w-5" />}
          trend={
            typeof stats.ratingTrend === 'number' && !isNaN(stats.ratingTrend)
              ? { value: stats.ratingTrend, isPositive: stats.ratingTrend > 0 }
              : undefined
          }
          color="sanskara-amber"
        />
        <DashboardCard 
          title="Revenue (YTD)"
          value={formatRevenue(stats.ytdRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={
            typeof stats.revenueTrend === 'number' && !isNaN(stats.revenueTrend)
              ? { value: stats.revenueTrend, isPositive: stats.revenueTrend > 0 }
              : undefined
          }
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
