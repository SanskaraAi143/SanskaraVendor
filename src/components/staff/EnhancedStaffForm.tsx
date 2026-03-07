import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';
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
      const staffQuery = query(
        collection(db, 'vendor_staff'),
        where('email', '==', email)
      );
      const staffSnapshot = await getDocs(staffQuery);

      if (!staffSnapshot.empty) {
        const staffData = staffSnapshot.docs[0].data();
        if (staffData.vendor_id === vendorProfile?.vendor_id) {
          setEmailStatus('exists');
          return;
        }
      }

      // Check if email is a vendor
      const vendorQuery = query(
        collection(db, 'vendors'),
        where('contact_email', '==', email)
      );
      const vendorSnapshot = await getDocs(vendorQuery);

      if (!vendorSnapshot.empty) {
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
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', formData.email)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        // User exists
        toast({
          title: 'User Found',
          description: 'User already exists in system. Adding to your staff directly.',
          variant: 'default'
        });
      } else {
        // In Firebase client SDK, we cannot invite users by email directly like Supabase.
        // We add them to vendor_staff, and they will be linked when they sign up with the same email.
        toast({
          title: 'Staff Record Created',
          description: 'Staff member added. They will need to sign up for an account to access the portal.',
          variant: 'default'
        });
      }

      // Insert into vendor_staff collection
      await addDoc(collection(db, 'vendor_staff'), {
        vendor_id: vendorProfile.vendor_id,
        email: formData.email,
        display_name: formData.display_name,
        phone_number: formData.phone_number || null,
        role: formData.role,
        is_active: true,
        created_at: new Date().toISOString()
      });

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
    } catch (error: any) {
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
