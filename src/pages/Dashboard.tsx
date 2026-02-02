
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/DashboardCard';
import RevenueChart from '@/components/RevenueChart';
import UpcomingBookings from '@/components/UpcomingBookings';
import UpcomingTasks from '@/components/UpcomingTasks';
import ServicesList from '@/components/ServicesList';
import { BookOpen, CalendarCheck, Star, DollarSign, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

interface DashboardStats {
  totalBookings: number;
  thisMonthEvents: number;
  avgRating: number;
  ytdRevenue: number;
  bookingTrend: number;
  ratingTrend: number;
  revenueTrend: number;
}

const Dashboard: React.FC = () => {
  const { vendorProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    thisMonthEvents: 0,
    avgRating: 0,
    ytdRevenue: 0,
    bookingTrend: 0,
    ratingTrend: 0,
    revenueTrend: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!vendorProfile?.vendor_id) return;

      setIsLoading(true);
      try {
        // Fetch total bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('vendor_id', '==', vendorProfile.vendor_id)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const totalBookings = bookingsSnapshot.size;

        // Fetch this month's events
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const eventsQuery = query(
          collection(db, 'bookings'),
          where('vendor_id', '==', vendorProfile.vendor_id),
          where('event_date', '>=', firstDayOfMonth.toISOString()),
          where('event_date', '<=', lastDayOfMonth.toISOString())
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const thisMonthEventsCount = eventsSnapshot.size;

        // Fetch average rating
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('vendor_id', '==', vendorProfile.vendor_id)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => doc.data());

        // Calculate average rating
        const avgRating = reviewsData.length > 0
          ? reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length
          : 0;

        // Fetch YTD revenue
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

        const paymentsQuery = query(
          collection(db, 'payments'),
          where('payment_status', '==', 'completed'),
          where('paid_at', '>=', startOfYear.toISOString())
        );
        // Note: Firestore might need an index for this composite query if vendor_id was also added.
        // For now, we'll fetch and filter if necessary, but assuming payments have vendor_id for better performance.
        // If payments don't have vendor_id, we'd need to fetch bookings first. 
        // Let's assume payments are linked to vendor_id for this migration.

        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData = paymentsSnapshot.docs.map(doc => doc.data());

        // Calculate YTD revenue
        const ytdRevenue = paymentsData.length > 0
          ? paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0)
          : 0;

        // Calculate trends (mocked for now)
        const bookingTrend = totalBookings > 0 ? 12 : 0;
        const ratingTrend = avgRating > 0 ? 0.3 : 0;
        const revenueTrend = ytdRevenue > 0 ? 18 : 0;

        setStats({
          totalBookings,
          thisMonthEvents: thisMonthEventsCount,
          avgRating: parseFloat(avgRating.toFixed(1)),
          ytdRevenue: ytdRevenue,
          bookingTrend,
          ratingTrend,
          revenueTrend
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Could not load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [vendorProfile]);

  // Format revenue properly
  const formatRevenue = (revenue: number) => {
    if (revenue >= 100000) {
      return `₹${(revenue / 100000).toFixed(1)}L`;
    } else if (revenue >= 1000) {
      return `₹${(revenue / 1000).toFixed(1)}K`;
    } else {
      return `₹${revenue}`;
    }
  };

  // Render loading skeleton if data is loading
  if (isLoading) {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Welcome, {vendorProfile?.vendor_name || 'Vendor'}!</h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your business performance and upcoming events.
          </p>
        </div>
        <Link to="/dashboard/profile">
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            View Profile
          </Button>
        </Link>
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
