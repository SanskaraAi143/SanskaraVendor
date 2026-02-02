
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import EnhancedStaffForm from '@/components/staff/EnhancedStaffForm';
import StaffList, { Staff } from '@/components/staff/StaffList';

const StaffPage: React.FC = () => {
  const { vendorProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);

  const fetchStaffMembers = async () => {
    if (!vendorProfile?.vendor_id) return;

    setIsLoading(true);

    try {
      console.log("Fetching staff for vendor:", vendorProfile.vendor_id);

      const staffQuery = query(
        collection(db, 'vendor_staff'),
        where('vendor_id', '==', vendorProfile.vendor_id),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(staffQuery);

      const transformedData: Staff[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          staff_id: doc.id,
          display_name: data.display_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          is_active: data.is_active
        };
      });

      console.log("Staff data fetched:", transformedData);
      setStaffMembers(transformedData);
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

  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchStaffMembers();
    }
  }, [vendorProfile]);

  // Set up realtime subscription for staff changes using Firestore onSnapshot
  useEffect(() => {
    if (!vendorProfile?.vendor_id) return;

    const staffQuery = query(
      collection(db, 'vendor_staff'),
      where('vendor_id', '==', vendorProfile.vendor_id)
    );

    const unsubscribe = onSnapshot(staffQuery, (snapshot) => {
      console.log('Staff changes detected via snapshot');
      const transformedData: Staff[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          staff_id: doc.id,
          display_name: data.display_name,
          email: data.email,
          phone_number: data.phone_number,
          role: data.role,
          is_active: data.is_active
        };
      });
      setStaffMembers(transformedData);
    }, (error) => {
      console.error('Error in staff snapshot:', error);
    });

    return () => {
      unsubscribe();
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
