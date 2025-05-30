
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Users, Loader2 } from 'lucide-react';

interface Staff {
  staff_id: string;
  display_name: string;
  email: string;
  role: string;
}

interface ServiceStaffAssignmentProps {
  serviceId: string;
  vendorId: string;
}

const ServiceStaffAssignment: React.FC<ServiceStaffAssignmentProps> = ({ serviceId, vendorId }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStaffAndAssignments();
  }, [serviceId, vendorId]);

  const loadStaffAndAssignments = async () => {
    try {
      // Load vendor staff
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('staff_id, display_name, email, role')
        .eq('vendor_id', vendorId)
        .eq('is_active', true);

      if (staffError) throw staffError;

      // Load current assignments from vendor_service_staff table
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('vendor_service_staff')
        .select('staff_id')
        .eq('service_id', serviceId);

      if (assignmentError) throw assignmentError;

      setStaff(staffData || []);
      setAssignedStaff(assignmentData?.map(a => a.staff_id) || []);
    } catch (error) {
      console.error('Error loading staff assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStaffToggle = (staffId: string, isChecked: boolean) => {
    setAssignedStaff(prev => 
      isChecked 
        ? [...prev, staffId]
        : prev.filter(id => id !== staffId)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Remove all current assignments for this service
      const { error: deleteError } = await supabase
        .from('vendor_service_staff')
        .delete()
        .eq('service_id', serviceId);

      if (deleteError) throw deleteError;

      // Insert new assignments
      if (assignedStaff.length > 0) {
        const assignments = assignedStaff.map(staffId => ({
          service_id: serviceId,
          staff_id: staffId,
          vendor_id: vendorId
        }));

        const { error: insertError } = await supabase
          .from('vendor_service_staff')
          .insert(assignments);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: 'Staff assignments updated successfully',
      });
    } catch (error) {
      console.error('Error saving staff assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to save staff assignments',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading staff...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Assign Staff to Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {staff.length > 0 ? (
          <>
            <div className="space-y-3">
              {staff.map(member => (
                <div key={member.staff_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{member.display_name}</p>
                    <p className="text-sm text-gray-500">{member.email} • {member.role}</p>
                  </div>
                  <Checkbox
                    checked={assignedStaff.includes(member.staff_id)}
                    onCheckedChange={(checked) => handleStaffToggle(member.staff_id, checked as boolean)}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Assignments'
                )}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No staff members available for assignment.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceStaffAssignment;
