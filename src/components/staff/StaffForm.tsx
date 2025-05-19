import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface StaffFormProps {
  onSuccess?: () => void;
}

interface StaffFormData {
  display_name: string;
  email: string;
  phone_number: string;
  role: string;
}

const STAFF_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff Member' },
  { value: 'assistant', label: 'Assistant' }
];

const StaffForm: React.FC<StaffFormProps> = ({ onSuccess }) => {
  const { vendorProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    display_name: '',
    email: '',
    phone_number: '',
    role: 'staff'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorProfile?.vendor_id) {
      toast({
        title: 'Error',
        description: 'Vendor profile not found',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.display_name || !formData.email) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Invite the user via email
      const { data: inviteResponse, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        formData.email
      );

      if (inviteError) {
        throw new Error('Failed to invite user: ' + inviteError.message);
      }

      // Debug log for invitation response
      console.log('Invitation response:', inviteResponse);

      // Correct the variant type for the toast
      toast({
        title: 'Invitation Sent',
        description: 'The user has been invited. They need to verify their email before being added as active staff.',
        variant: 'default' // Changed from 'info' to 'default' to match the allowed types
      });

      // Insert invitation into vendor_staff_invite table
      const { error: inviteInsertError } = await supabase
        .from('vendor_staff_invite')
        .insert({
          vendor_id: vendorProfile.vendor_id,
          email: formData.email,
          role: formData.role,
          invitation_status: 'pending',
        });

      if (inviteInsertError) {
        throw new Error('Failed to create invitation: ' + inviteInsertError.message);
      }

      // Debug log for vendor_staff_invite insertion
      console.log('Inserting into vendor_staff_invite:', {
        vendor_id: vendorProfile.vendor_id,
        email: formData.email,
        role: formData.role,
        invitation_status: 'pending'
      });
      
      // Insert directly into vendor_staff table with invited state
      // Try to get the invited user's auth UID from the invite response
      const supabase_auth_uid =
        inviteResponse?.user?.id || null;

      const { error: staffInsertError } = await supabase
        .from('vendor_staff')
        .insert({
          vendor_id: vendorProfile.vendor_id,
          email: formData.email,
          display_name: formData.display_name,
          phone_number: formData.phone_number || null,
          role: formData.role,
          is_active: true,
          invitation_status: 'pending',
          supabase_auth_uid, // Insert the auth UID if available
        });

      if (staffInsertError) {
        throw new Error('Failed to add staff member: ' + staffInsertError.message);
      }

      toast({
        title: 'Staff Invited',
        description: 'The staff member has been invited successfully.',
      });

      // Reset form
      setFormData({
        display_name: '',
        email: '',
        phone_number: '',
        role: 'staff',
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set up realtime subscription for staff changes
  React.useEffect(() => {
    if (!vendorProfile?.vendor_id) return;
    
    const channel = supabase
      .channel('public:vendor_staff')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vendor_staff',
        filter: `vendor_id=eq.${vendorProfile.vendor_id}`
      }, () => {
        // Refresh the staff list dynamically
        if (onSuccess) {
          onSuccess();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onSuccess, vendorProfile?.vendor_id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Staff Member</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              required
              placeholder="Full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone number (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              'Invite Staff Member'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StaffForm;
