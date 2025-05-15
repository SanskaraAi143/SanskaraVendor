
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, UserCheck, UserX, MoreHorizontal } from "lucide-react";
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
const getInvitationStatus = (status: string | undefined) => {
  if (!status) return null;
  
  switch (status.toLowerCase()) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Invite Pending</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Accepted</Badge>;
    case 'declined':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Declined</Badge>;
    default:
      return null;
  }
};

const StaffList: React.FC<StaffListProps> = ({ staffMembers, onRefresh }) => {
  const handleToggleActive = async (staffId: string, isCurrentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from('vendor_staff')
        .update({ is_active: !isCurrentlyActive })
        .eq('staff_id', staffId);
        
      if (error) throw error;
      
      toast({
        title: isCurrentlyActive ? 'Staff Deactivated' : 'Staff Activated',
        description: `Staff member has been ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully.`,
        variant: 'success',
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
    }
  };
  
  const handleResendInvitation = async (staffId: string, email: string) => {
    try {
      // In a real application, this would send a new invitation email
      toast({
        title: 'Invitation Resent',
        description: `Invitation has been resent to ${email}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };
  
  return (
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
                    {staff.is_active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
                    )}
                    {getInvitationStatus(staff.invitation_status)}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {staff.invitation_status === 'pending' && (
                      <DropdownMenuItem onClick={() => handleResendInvitation(staff.staff_id, staff.email)}>
                        Resend Invitation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleToggleActive(staff.staff_id, staff.is_active)}>
                      {staff.is_active ? (
                        <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
                      ) : (
                        <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffList;
