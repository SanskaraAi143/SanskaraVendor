
import React, { useState, useEffect } from 'react';
import StaffDashboardLayout from '@/components/staff/StaffDashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import { Calendar, CheckCircle2, Clock, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StaffDashboardStats {
  totalTasks: number;
  pendingTasks: number;
  upcomingBookings: number;
  completedTasks: number;
}

interface RecentTask {
  vendor_task_id: string;
  title: string;
  status: string;
  due_date: string | null;
  priority: string | null;
}

interface UpcomingBooking {
  booking_id: string;
  event_date: string;
  booking_status: string;
  users: {
    display_name: string | null;
  };
}

const StaffDashboard: React.FC = () => {
  const { staffProfile, user } = useAuth();
  const [stats, setStats] = useState<StaffDashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    upcomingBookings: 0,
    completedTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (staffProfile?.staff_id) {
      fetchDashboardData();
    }
  }, [staffProfile]);

  const fetchDashboardData = async () => {
    if (!staffProfile?.staff_id) return;

    setIsLoading(true);
    try {
      // Fetch task statistics
      const { data: tasksData, error: tasksError } = await supabase
        .from('vendor_tasks')
        .select('status')
        .eq('assigned_staff_id', staffProfile.staff_id);

      if (tasksError) throw tasksError;

      const totalTasks = tasksData?.length || 0;
      const pendingTasks = tasksData?.filter(task => task.status === 'Pending').length || 0;
      const completedTasks = tasksData?.filter(task => task.status === 'Completed').length || 0;

      // Fetch upcoming bookings for vendor
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_id, event_date, booking_status, users(display_name)')
        .eq('vendor_id', staffProfile.vendor_id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);

      if (bookingsError) throw bookingsError;

      const upcomingBookings = bookingsData?.length || 0;

      // Fetch recent tasks
      const { data: recentTasksData, error: recentTasksError } = await supabase
        .from('vendor_tasks')
        .select('vendor_task_id, title, status, due_date, priority')
        .eq('assigned_staff_id', staffProfile.staff_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTasksError) throw recentTasksError;

      setStats({
        totalTasks,
        pendingTasks,
        upcomingBookings,
        completedTasks
      });

      setRecentTasks(recentTasksData as RecentTask[] || []);
      setUpcomingBookings(bookingsData as UpcomingBooking[] || []);

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

  if (isLoading) {
    return (
      <StaffDashboardLayout>
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
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Welcome, {staffProfile?.display_name || 'Staff Member'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your tasks and upcoming events.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard 
            title="Total Tasks"
            value={stats.totalTasks.toString()}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="sanskara-red"
          />
          <DashboardCard 
            title="Pending Tasks"
            value={stats.pendingTasks.toString()}
            icon={<Clock className="h-5 w-5" />}
            color="sanskara-amber"
          />
          <DashboardCard 
            title="Upcoming Events"
            value={stats.upcomingBookings.toString()}
            icon={<Calendar className="h-5 w-5" />}
            color="sanskara-blue"
          />
          <DashboardCard 
            title="Completed Tasks"
            value={stats.completedTasks.toString()}
            icon={<Users className="h-5 w-5" />}
            color="sanskara-green"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map(task => (
                    <div key={task.vendor_task_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'} 
                          {task.priority && ` • ${task.priority}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No tasks assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map(booking => (
                    <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {booking.users?.display_name || 'Unknown Client'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.booking_status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming bookings.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffDashboard;
