
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info } from 'lucide-react';

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

const EnhancedStaffForm: React.FC<StaffFormProps> = ({ onSuccess }) => {
  const { vendorProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    display_name: '',
    email: '',
    phone_number: '',
    role: 'staff'
  });
  const [emailStatus, setEmailStatus] = useState<'checking' | 'exists' | 'vendor' | 'available' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      setEmailStatus(null);
    }
  };

  const checkEmailStatus = async (email: string) => {
    if (!email) return;
    
    setEmailStatus('checking');
    
    try {
      // Check if email exists in vendor_staff
      const { data: staffData } = await supabase
        .from('vendor_staff')
        .select('staff_id, vendor_id')
        .eq('email', email)
        .single();

      if (staffData) {
        if (staffData.vendor_id === vendorProfile?.vendor_id) {
          setEmailStatus('exists');
          return;
        }
      }

      // Check if email is a vendor
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('vendor_id')
        .eq('contact_email', email)
        .single();

      if (vendorData) {
        setEmailStatus('vendor');
        return;
      }

      setEmailStatus('available');
    } catch (error) {
      setEmailStatus('available');
    }
  };

  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailStatus(formData.email);
    }
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
      if (emailStatus === 'exists') {
        toast({
          title: 'Email already exists',
          description: 'This email is already associated with your vendor staff',
          variant: 'destructive',
        });
        return;
      }

      if (emailStatus === 'vendor') {
        toast({
          title: 'Cannot add vendor email',
          description: 'This email belongs to a vendor. Ask them to use the vendor portal to login.',
          variant: 'destructive',
        });
        return;
      }

      // Check if user already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id, supabase_auth_uid')
        .eq('email', formData.email)
        .single();
      
      let supabase_auth_uid = null;
      
      if (existingUser) {
        // User exists, directly add to staff
        supabase_auth_uid = existingUser.supabase_auth_uid;
        
        toast({
          title: 'User Found',
          description: 'User already exists in system. Adding to your staff directly.',
          variant: 'default'
        });
      } else {
        // Invite new user
        const { data: inviteResponse, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
          formData.email
        );

        if (inviteError) {
          throw new Error('Failed to invite user: ' + inviteError.message);
        }

        supabase_auth_uid = inviteResponse?.user?.id || null;
        
        toast({
          title: 'Invitation Sent',
          description: 'The user has been invited and will need to verify their email.',
          variant: 'default'
        });
      }

      // Insert into vendor_staff table
      const { error: staffInsertError } = await supabase
        .from('vendor_staff')
        .insert({
          vendor_id: vendorProfile.vendor_id,
          email: formData.email,
          display_name: formData.display_name,
          phone_number: formData.phone_number || null,
          role: formData.role,
          is_active: true,
          supabase_auth_uid,
        });

      if (staffInsertError) {
        throw new Error('Failed to add staff member: ' + staffInsertError.message);
      }

      toast({
        title: 'Staff Added',
        description: 'The staff member has been added successfully.',
      });

      // Reset form
      setFormData({
        display_name: '',
        email: '',
        phone_number: '',
        role: 'staff',
      });
      setEmailStatus(null);

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

  const renderEmailStatusAlert = () => {
    if (emailStatus === 'checking') {
      return (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking email availability...</AlertDescription>
        </Alert>
      );
    }

    if (emailStatus === 'exists') {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This email is already associated with your vendor staff.
          </AlertDescription>
        </Alert>
      );
    }

    if (emailStatus === 'vendor') {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This email belongs to a vendor account. They should use the vendor portal to login.
          </AlertDescription>
        </Alert>
      );
    }

    if (emailStatus === 'available') {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Email is available. User will be invited to join your staff.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

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
              onBlur={handleEmailBlur}
              required
              placeholder="Email address"
            />
            {renderEmailStatusAlert()}
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
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
          <Button 
            type="submit" 
            disabled={isSubmitting || emailStatus === 'exists' || emailStatus === 'vendor'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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

export default EnhancedStaffForm;
