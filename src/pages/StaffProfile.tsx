
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import StaffProfileCard from '../components/staff/StaffProfileCard';
import StaffPortfolioManager from '../components/staff/StaffPortfolioManager';
import { Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';

interface StaffProfile {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  email: string;
  phone_number?: string;
  role: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  profile_image_url?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  joining_date?: string;
}

interface StaffProfileData {
  bio?: string;
  skills?: string[];
  experience_years?: number;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

const StaffProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    if (staffProfile?.staff_id) {
      loadProfileData();
    }
  }, [user, authLoading, navigate, staffProfile]);

  const loadProfileData = async () => {
    if (!staffProfile?.staff_id) return;

    try {
      // Get basic staff data
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('staff_id', staffProfile.staff_id)
        .single();

      if (staffError) throw staffError;

      // Get additional profile data from staff_portfolios generic_attributes
      const { data: profileData, error: profileError } = await supabase
        .from('staff_portfolios')
        .select('generic_attributes')
        .eq('staff_id', staffProfile.staff_id)
        .eq('portfolio_type', 'profile_data')
        .maybeSingle();

      // Parse additional profile data
      let additionalData: StaffProfileData = {};
      if (profileData?.generic_attributes) {
        additionalData = profileData.generic_attributes as StaffProfileData;
      }
      
      // Combine basic staff data with additional profile data
      const profileData_combined: StaffProfile = {
        staff_id: staffData.staff_id,
        vendor_id: staffData.vendor_id,
        display_name: staffData.display_name,
        email: staffData.email,
        phone_number: staffData.phone_number,
        role: staffData.role,
        bio: additionalData.bio,
        skills: additionalData.skills,
        experience_years: additionalData.experience_years,
        address: additionalData.address,
        date_of_birth: additionalData.date_of_birth,
        emergency_contact: additionalData.emergency_contact,
        emergency_phone: additionalData.emergency_phone,
        joining_date: staffData.created_at
      };
      
      setProfile(profileData_combined);
    } catch (err: any) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <StaffDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </StaffDashboardLayout>
    );
  }

  if (!profile) {
    return (
      <StaffDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-red-600 mb-4">Profile not found</p>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <StaffProfileCard profile={profile} onUpdate={loadProfileData} />
        <StaffPortfolioManager staffId={profile.staff_id} />
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffProfile;
