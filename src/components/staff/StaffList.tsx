
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, UserCheck, UserMinus, UserX, MoreHorizontal, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/useAuthContext';

export interface Staff {
  staff_id: string;
  display_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  invitation_status?: string;
}

interface StaffListProps {
  staffMembers: Staff[];
  onRefresh: () => void;
}

// Helper function to get role badge color
const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'manager':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'staff':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'assistant':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Helper function to get invitation status badge
const getInvitationStatus = (status: string | undefined, isActive: boolean) => {
  if (!status) return null;
  
  if (!isActive) {
    return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Deactivated</Badge>;
  }
  
  switch (status.toLowerCase()) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Invited</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    case 'declined':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Declined</Badge>;
    default:
      return null;
  }
};

const StaffList: React.FC<StaffListProps> = ({ staffMembers, onRefresh }) => {
  const { user } = useAuth();
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleActive = async (staffId: string, isCurrentlyActive: boolean) => {
    try {
      setIsProcessing(true);
      console.log("Toggling staff active status:", staffId, "Current status:", isCurrentlyActive);
      
      const { error } = await supabase
        .from('vendor_staff')
        .update({ is_active: !isCurrentlyActive })
        .eq('staff_id', staffId);
        
      if (error) throw error;
      
      toast({
        title: isCurrentlyActive ? 'Staff Deactivated' : 'Staff Activated',
        description: `Staff member has been ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully.`,
      });
      
      // Refresh the list
      onRefresh();
    } catch (error) {
      console.error('Error toggling staff status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update staff status',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleResendInvitation = async (staffId: string, email: string) => {
    try {
      setIsProcessing(true);
      console.log("Resending invitation for staff:", staffId, email);
      
      // Update the invitation status to trigger a new email
      const { error } = await supabase
        .from('vendor_staff_invite')
        .update({ invitation_status: 'pending', updated_at: new Date().toISOString() })
        .eq('email', email);
      
      if (error) {
        console.error('Error updating invitation:', error);
        throw error;
      }
      
      toast({
        title: 'Invitation Resent',
        description: `Invitation has been resent to ${email}`,
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteStaff = (staff: Staff) => {
    setStaffToDelete(staff);
    setIsAlertOpen(true);
  };
  
  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    try {
      setIsProcessing(true);
      console.log("Deleting staff member:", staffToDelete.staff_id);
      
      const { error } = await supabase
        .from('vendor_staff')
        .delete()
        .eq('staff_id', staffToDelete.staff_id);
        
      if (error) throw error;
      
      toast({
        title: 'Staff Deleted',
        description: 'Staff member has been removed successfully.',
      });
      
      // Also delete the invitation if it exists
      await supabase
        .from('vendor_staff_invite')
        .delete()
        .eq('email', staffToDelete.email);
      
      // Refresh the list
      onRefresh();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member',
        variant: 'destructive',
      });
    } finally {
      setIsAlertOpen(false);
      setStaffToDelete(null);
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>Manage your team members and their access</CardDescription>
        </CardHeader>
        <CardContent>
          {staffMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staffMembers.map(staff => (
                <div key={staff.staff_id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{staff.display_name}</h3>
                      <Badge className={getRoleBadgeColor(staff.role)}>
                        {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                      </Badge>
                      {getInvitationStatus(staff.invitation_status, staff.is_active)}
                      {staff.email === user?.email && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {staff.email}
                      </div>
                      {staff.phone_number && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {staff.phone_number}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Only show actions for other staff members */}
                  {staff.email !== user?.email && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={isProcessing}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {staff.invitation_status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleResendInvitation(staff.staff_id, staff.email)}>
                            <Mail className="mr-2 h-4 w-4" /> Resend Invitation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleActive(staff.staff_id, staff.is_active)}>
                          {staff.is_active ? (
                            <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
                          ) : (
                            <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStaff(staff)}>
                          <UserMinus className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staffToDelete?.display_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStaff} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StaffList;
