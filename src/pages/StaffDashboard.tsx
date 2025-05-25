import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Loader2 } from 'lucide-react'; // For loading state
import StaffProfile from './StaffProfile';

interface StaffDetails {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  role: string;
  email: string;
}

interface VendorTask {
  vendor_task_id: string;
  title: string;
  due_date: string | null;
  status: string;
  booking_id: string;
}

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [staffDetails, setStaffDetails] = useState<StaffDetails | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndTasks = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }

        if (!user) {
          navigate('/staff/login');
          return;
        }

        // Fetch staff details
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id, vendor_id, display_name, role, email')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) {
          throw staffError;
        }

        if (staffData) {
          setStaffDetails(staffData);
          setUserName(staffData.display_name || staffData.email || 'Staff Member');

          // Fetch tasks assigned to this staff member
          const { data: tasksData, error: tasksError } = await supabase
            .from('vendor_tasks')
            .select('vendor_task_id, title, due_date, status, booking_id')
            .eq('assigned_staff_id', staffData.staff_id);

          if (tasksError) {
            throw tasksError;
          }
          setAssignedTasks(tasksData || []);

        } else {
           // If user is logged in via auth but not found in vendor_staff
           // This might indicate an incomplete onboarding or incorrect user type
           setError('Staff profile not found. Please contact support.');
           // Optionally, redirect or show a specific message
        }

      } catch (fetchError: any) {
        console.error('Error fetching staff data or tasks:', fetchError);
        setError(fetchError.message || 'Failed to load dashboard data.');
        // If user data fails to load, consider redirecting or showing error
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndTasks();
  }, [navigate]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      navigate('/staff/login');
    } catch (logoutError: any) {
      setError(logoutError.message || 'Failed to logout. Please try again.');
      setLoading(false); // Only set loading to false if error on logout
    }
    // setLoading(false) is not needed here if navigation is successful as component will unmount
  };

  if (loading && !staffDetails) { // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error && !staffDetails) { // If initial data load failed
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/staff/login')}>Go to Login</Button>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Welcome, {userName || 'Staff Member'}{staffDetails?.role && ` (${staffDetails.role})`}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your profile and assigned tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Details Section */}
        {staffDetails && (
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Name:</strong> {staffDetails.display_name}</p>
              <p><strong>Role:</strong> {staffDetails.role}</p>
              <p><strong>Email:</strong> {staffDetails.email}</p>
              {/* Add more staff details here if needed */}
            </CardContent>
          </Card>
        )}

        {/* Assigned Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks ({assignedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignedTasks.length > 0 ? (
              <ul className="space-y-2">
                {assignedTasks.map(task => (
                  <li key={task.vendor_task_id} className="pb-2 border-b last:border-b-0">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-gray-600">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Status: {task.status}</p>
                    {/* Link to booking details could be added here */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No tasks currently assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Section */}
      <div className="dashboard-section">
        <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
        <StaffProfile />
      </div>

      {/* Navigation Buttons Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button onClick={() => navigate('/staff/tasks')} className="w-full" variant="outline">View All Tasks</Button>
        <Button onClick={() => navigate('/staff/bookings')} className="w-full" variant="outline">View Vendor Bookings</Button>
      </div>

      {error && staffDetails && (
        <p className="text-sm text-red-600 text-center mt-4">Error: {error}</p>
      )}

      <Button
        onClick={handleLogout}
        className="w-full mt-4"
        variant="destructive"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Logout
      </Button>
    </div>
  );
};

export default StaffDashboard;
