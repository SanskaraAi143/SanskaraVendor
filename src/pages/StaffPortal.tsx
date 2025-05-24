
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import StaffProfileSection from '@/components/staff-portal/StaffProfileSection';
import StaffPortfolioSection from '@/components/staff-portal/StaffPortfolioSection';
import { createStoredProcedures } from '@/utils/supabaseHelpers';

const StaffPortal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          navigate('/staff-login');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Fetch staff data
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select(`
            *,
            vendors:vendor_id(*)
          `)
          .eq('supabase_auth_uid', userId)
          .single();
        
        if (staffError) {
          throw staffError;
        }
        
        if (!staffData) {
          toast({
            title: "Profile not found",
            description: "Your staff profile could not be found. Please contact your administrator.",
            variant: "destructive",
          });
          return;
        }
        
        // Create stored procedures for portfolio management
        await createStoredProcedures();
        
        setStaffData(staffData);
      } catch (error: any) {
        console.error('Error loading staff data:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load staff data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaffData();
  }, [navigate]);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red"></div>
          <p className="ml-3">Loading...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!staffData) {
    return (
      <MainLayout>
        <div className="flex h-96 flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">No Staff Profile Found</h1>
          <p className="text-muted-foreground">Please contact your administrator to set up your staff profile.</p>
          <Button className="mt-4" onClick={() => navigate('/staff-login')}>Return to Login</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text">Staff Portal</h1>
          <p className="text-muted-foreground mt-1">
            Welcome {staffData.display_name} - Manage your profile and portfolio
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          
          {/* Fixed TabsContent by rendering the children directly inside */}
          <TabsContent value="profile" className="py-6">
            <StaffProfileSection staffData={staffData} />
          </TabsContent>
          
          <TabsContent value="portfolio" className="py-6">
            <StaffPortfolioSection staffData={staffData} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StaffPortal;
