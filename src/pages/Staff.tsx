
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import EnhancedStaffForm from '@/components/staff/EnhancedStaffForm';
import StaffList, { Staff } from '@/components/staff/StaffList';

const StaffPage: React.FC = () => {
  const { vendorProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchStaffMembers();
    }
  }, [vendorProfile]);
  
  const fetchStaffMembers = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    setIsLoading(true);
    
    try {
      console.log("Fetching staff for vendor:", vendorProfile.vendor_id);
      
      const { data, error } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Staff data fetched:", data);
      
      if (data) {
        // Transform data to match Staff interface
        const transformedData = data.map(staff => ({
          staff_id: staff.staff_id,
          display_name: staff.display_name,
          email: staff.email,
          phone_number: staff.phone_number,
          role: staff.role,
          is_active: staff.is_active
        }));
        
        setStaffMembers(transformedData);
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up realtime subscription for staff changes
  useEffect(() => {
    if (!vendorProfile?.vendor_id) return;
    
    const channel = supabase
      .channel('public:vendor_staff')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vendor_staff',
        filter: `vendor_id=eq.${vendorProfile.vendor_id}`
      }, () => {
        console.log('Staff changes detected, refreshing list');
        fetchStaffMembers();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorProfile?.vendor_id]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Staff Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team members and their access to your vendor profile
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <EnhancedStaffForm onSuccess={fetchStaffMembers} />
        </div>
        
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
              <p className="ml-3">Loading staff members...</p>
            </div>
          ) : (
            <StaffList 
              staffMembers={staffMembers} 
              onRefresh={fetchStaffMembers} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
