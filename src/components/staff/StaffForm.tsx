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

  // Function to check if a user with the given email exists in Supabase Auth by querying the 'users' table
  const checkIfUserExists = async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('supabase_auth_uid')
      .eq('email', email);

    if (error) {
      throw new Error('Error checking for existing user: ' + error.message);
    }
    return data && data.length > 0 ? data[0].supabase_auth_uid : null; // Return user's auth_uid if found
  };

  const createStaffFromExistingUser = async (existingUserId: string) => {
    console.log('Creating staff from existing user:', existingUserId);

    // Insert directly into vendor_staff table
    const { error: staffInsertError } = await supabase
      .from('vendor_staff')
      .insert({
        vendor_id: vendorProfile?.vendor_id,
        email: formData.email,
        display_name: formData.display_name,
        phone_number: formData.phone_number || null,
        role: formData.role,
        is_active: true, // Assuming existing users are active by default or handle separately
        invitation_status: 'accepted', // Or a new status like 're-added'
        supabase_auth_uid: existingUserId,
      });

    if (staffInsertError) {
      throw new Error('Failed to add existing user as staff: ' + staffInsertError.message);
    }

    toast({
      title: 'Staff Added Successfully',
      description: 'The existing user has been added as staff member.',
    });
  };

  const inviteNewUser = async () => {
    console.log('Inviting new user');

    // Try to invite the user via email
    const { data: inviteResponse, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      formData.email
    );

    let supabase_auth_uid = null;

    if (inviteError) {
      console.log('Invitation failed:', inviteError.message);
       toast({
        title: 'Invitation Failed',
        description: 'Failed to send invitation: ' + inviteError.message,
        variant: 'destructive'
      });
       throw new Error('Invitation failed: ' + inviteError.message); // Propagate error if invitation is critical
    } else {
      console.log('Invitation successful:', inviteResponse);
      supabase_auth_uid = inviteResponse?.user?.id || null;

      toast({
        title: 'Invitation Sent',
        description: 'The user has been invited. They need to verify their email.',
        variant: 'default'
      });
    }

    // Insert invitation into vendor_staff_invite table
    const { error: inviteInsertError } = await supabase
      .from('vendor_staff_invite')
      .insert({
        vendor_id: vendorProfile?.vendor_id,
        email: formData.email,
        role: formData.role,
        invitation_status: 'pending',
      });

    if (inviteInsertError) {
      console.error('Failed to create invitation record:', inviteInsertError.message);
       toast({
        title: 'Error',
        description: 'Failed to create invitation record: ' + inviteInsertError.message,
        variant: 'destructive'
      });
       throw new Error('Failed to create invitation record: ' + inviteInsertError.message);
    }

    // Insert into vendor_staff table
    const { error: staffInsertError } = await supabase
      .from('vendor_staff')
      .insert({
        vendor_id: vendorProfile?.vendor_id,
        email: formData.email,
        display_name: formData.display_name,
        phone_number: formData.phone_number || null,
        role: formData.role,
        is_active: false, // New users are inactive until email verified via trigger
        invitation_status: 'pending',
        supabase_auth_uid,
      });

    if (staffInsertError) {
      throw new Error('Failed to add staff member: ' + staffInsertError.message);
    }

    toast({
      title: 'Staff Invited',
      description: 'The staff member has been invited successfully.',
    });
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
      // First check if this email already exists as staff for this vendor
      const { data: existingStaff, error: existingStaffError } = await supabase
        .from('vendor_staff')
        .select('staff_id')
        .eq('vendor_id', vendorProfile.vendor_id)
        .eq('email', formData.email);
      if (!existingStaffError && existingStaff && existingStaff.length > 0) {
        toast({
          title: 'Staff Already Exists',
          description: 'This email is already registered as staff for your vendor.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return; // Stop the process if they are already staff for this vendor
      }

      // --- Corrected LOGIC ---
      // Check if user already exists in Supabase auth by querying 'users' table
      const existingUserAuthUid = await checkIfUserExists(formData.email);

      if (existingUserAuthUid) {
        // User exists in auth.users, add them directly to vendor_staff
        await createStaffFromExistingUser(existingUserAuthUid);
      } else {
        // User doesn't exist, proceed with inviting them
        await inviteNewUser();
      }
      // --- END Corrected LOGIC ---


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
        schema: 'public', // Added missing comma here
        table: 'vendor_staff',
        filter: `vendor_id=eq.${vendorProfile.vendor_id}`
      }, () => {
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
                Adding Staff...
              </>
            ) : (
              'Add Staff Member'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StaffForm;
