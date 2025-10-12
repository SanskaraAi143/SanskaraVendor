import React from 'react';
import { StaffOnboarding as NewStaffOnboarding } from '@/ai-venue-onboarding-agent/features/staff/StaffOnboarding';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AiStaffOnboardingProps {
  onBack: () => void;
  onComplete: (data: any) => void;
  onError: (title: string, description: string) => void;
}

export const StaffOnboarding: React.FC<AiStaffOnboardingProps> = ({ onBack, onComplete, onError }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      if (!user) {
        onError("Authentication Error", "User not authenticated.");
        return;
      }

      let { data: vendorStaff, error: staffError } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('supabase_auth_uid', user.id)
        .single();

      if (staffError && staffError.code === 'PGRST116') {
        const { data: personalVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            supabase_auth_uid: user.id,
            vendor_name: `${data.name || 'Staff'} Services`,
            vendor_category: 'Staff Services',
            contact_email: user.email || '',
            description: `Personal services by ${data.name || 'staff member'}`,
            details: {
              status: 'active',
              is_personal_staff_vendor: true
            }
          })
          .select()
          .single();

        if (vendorError) {
          throw new Error(`Failed to create personal vendor: ${vendorError.message}`);
        }

        const { data: newStaff, error: createError } = await supabase
          .from('vendor_staff')
          .insert({
            supabase_auth_uid: user.id,
            vendor_id: personalVendor.vendor_id,
            email: user.email || '',
            display_name: data.name || '',
            role: data.role || 'staff',
            phone_number: ''
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create vendor staff entry: ${createError.message}`);
        }
        vendorStaff = newStaff;
      } else if (staffError) {
        throw new Error(`Failed to get vendor staff entry: ${staffError.message}`);
      }

      let vendorId = vendorStaff.vendor_id;
      if (!vendorId) {
        const { data: personalVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            supabase_auth_uid: user.id,
            vendor_name: `${data.name || 'Staff'} Services`,
            vendor_category: 'Staff Services',
            contact_email: user.email || '',
            description: `Personal services by ${data.name || 'staff member'}`,
            details: {
              status: 'active',
              is_personal_staff_vendor: true
            }
          })
          .select()
          .single();

        if (vendorError) {
          throw new Error(`Failed to create personal vendor: ${vendorError.message}`);
        }

        vendorId = personalVendor.vendor_id;

        const { error: updateError } = await supabase
          .from('vendor_staff')
          .update({ vendor_id: vendorId })
          .eq('staff_id', vendorStaff.staff_id);

        if (updateError) {
          console.warn('Failed to update vendor_staff with vendor_id:', updateError);
        }
      }

      const { data: portfolio, error: portfolioError } = await supabase
        .from('staff_portfolios')
        .insert({
          staff_id: vendorStaff.staff_id,
          vendor_id: vendorId,
          portfolio_type: data.portfolioType || 'individual',
          title: data.portfolioTitle || `${data.name || 'Staff'} Portfolio`,
          description: data.portfolioDescription || '',
          generic_attributes: {
            name: data.name,
            role: data.role,
            food_options: data.food_options,
            pricing_details: data.pricing_details,
            service_type: data.service_type
          }
        })
        .select()
        .single();

      if (portfolioError) {
        throw new Error(`Failed to create staff portfolio: ${portfolioError.message}`);
      }

      toast({
        title: "Staff Onboarding Completed!",
        description: "Your portfolio has been successfully created with SanskaraAi.",
        variant: "default",
      });

      onComplete({ portfolioId: portfolio?.portfolio_id, navigate: navigate });
    } catch (error: any) {
      console.error('Error submitting staff onboarding:', error);
      onError("Submission Error", error.message || "Failed to complete staff onboarding.");
    }
  };

  return <NewStaffOnboarding onBack={onBack} onSubmit={handleSubmit} />;
};