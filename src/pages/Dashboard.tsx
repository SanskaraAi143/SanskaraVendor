
import React from 'react';
import DashboardCard from '@/components/DashboardCard';
import RevenueChart from '@/components/RevenueChart';
import UpcomingBookings from '@/components/UpcomingBookings';
import UpcomingTasks from '@/components/UpcomingTasks';
import ServicesList from '@/components/ServicesList';
import { BookOpen, CalendarCheck, Star, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Welcome, Sanskara Vendor!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your business performance and upcoming events.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Total Bookings"
          value="24"
          icon={<BookOpen className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          color="sanskara-red"
        />
        <DashboardCard 
          title="This Month's Events"
          value="8"
          icon={<CalendarCheck className="h-5 w-5" />}
          color="sanskara-gold"
        />
        <DashboardCard 
          title="Average Rating"
          value="4.8"
          icon={<Star className="h-5 w-5" />}
          trend={{ value: 0.3, isPositive: true }}
          color="sanskara-amber"
        />
        <DashboardCard 
          title="Revenue (YTD)"
          value="₹5.2L"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 18, isPositive: true }}
          color="sanskara-green"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <UpcomingBookings />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks />
        <ServicesList />
      </div>
    </div>
  );
};

export default Dashboard;
