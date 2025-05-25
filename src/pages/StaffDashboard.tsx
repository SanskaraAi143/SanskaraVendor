import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Loader2 } from 'lucide-react'; // For loading state

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        if (user) {
          // Attempt to get name from user_metadata or email as fallback
          const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name;
          setUserName(nameFromMeta || user.email || 'Staff Member');
        } else {
          // Should be handled by ProtectedRoute, but good to have a fallback
          navigate('/staff/login');
        }
      } catch (fetchError: any) {
        setError(fetchError.message || 'Failed to fetch user data.');
        // If user data fails to load, consider redirecting or showing error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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

  if (loading && !userName) { // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error && !userName) { // If initial data load failed
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/staff/login')}>Go to Login</Button>
      </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Staff Dashboard</CardTitle>
          {userName && (
            <CardDescription className="text-center text-lg pt-2">
              Welcome, {userName}!
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
            <p className="text-gray-700">
              Links and sections for managing your portfolio will appear here based on your role and permissions. 
              This area will allow you to upload, edit, and showcase your work.
            </p>
            {/* Placeholder for future links/components */}
            {/* Example:
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full">Manage My Portfolio</Button>
              <Button variant="outline" className="w-full">View Public Profile</Button>
            </div>
            */}
          </div>

          {error && ( // Display errors that occur after initial load (e.g. logout error)
            <p className="text-sm text-red-600 text-center">{error}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
