
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Mail, Phone, MoreVertical, Loader2, X, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StaffMember {
  staff_id: string;
  display_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  invitation_sent?: boolean;
  invitation_status?: string;
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { vendorProfile } = useAuth();

  // New staff member dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    display_name: '',
    email: '',
    phone_number: '',
    role: 'staff'
  });
  const [error, setError] = useState<string | null>(null);
  const [showInviteInfo, setShowInviteInfo] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [vendorProfile]);

  const fetchStaff = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id)
        .order('role', { ascending: false });
        
      if (error) throw error;
      
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Could not load your staff members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    // Validation
    if (!newStaff.display_name || !newStaff.email) {
      setError('Name and email are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if email already exists
      const { data: existingStaff } = await supabase
        .from('vendor_staff')
        .select('email')
        .eq('email', newStaff.email)
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (existingStaff && existingStaff.length > 0) {
        setError('A staff member with this email already exists');
        setIsSubmitting(false);
        return;
      }
      
      // Create temporary supabase_auth_uid - in a production app, you would
      // invite the user to create an account via email
      const tempUserId = crypto.randomUUID();
      
      // Add staff to database
      const { data, error } = await supabase
        .from('vendor_staff')
        .insert({
          vendor_id: vendorProfile.vendor_id,
          display_name: newStaff.display_name,
          email: newStaff.email,
          phone_number: newStaff.phone_number || null,
          role: newStaff.role,
          supabase_auth_uid: tempUserId, // This would be replaced with a proper auth ID after invitation acceptance
          invitation_status: 'pending'
        })
        .select();
        
      if (error) throw error;
      
      // Update staff list
      const newStaffMember = {
        ...data[0],
        invitation_sent: true,
        invitation_status: 'pending'
      };
      
      setStaff([...staff, newStaffMember]);
      
      // Close dialog and reset form
      setDialogOpen(false);
      setNewStaff({
        display_name: '',
        email: '',
        phone_number: '',
        role: 'staff'
      });
      
      // Show invite info dialog
      setShowInviteInfo(true);
      
      toast({
        title: "Success",
        description: "Staff member has been added",
      });
    } catch (error) {
      console.error('Error adding staff:', error);
      setError('Failed to add staff member. Please try again.');
      toast({
        title: "Error",
        description: "Could not add staff member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (staffId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('vendor_staff')
        .update({ role })
        .eq('staff_id', staffId);
        
      if (error) throw error;
      
      // Update local state
      setStaff(staff.map(member => 
        member.staff_id === staffId ? { ...member, role } : member
      ));
      
      toast({
        title: "Role updated",
        description: `Staff member's role has been updated to ${role}`,
      });
    } catch (error) {
      console.error('Error updating staff role:', error);
      toast({
        title: "Error",
        description: "Could not update staff role",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (staffId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('vendor_staff')
        .update({ is_active: newStatus })
        .eq('staff_id', staffId);
        
      if (error) throw error;
      
      // Update local state
      setStaff(staff.map(member => 
        member.staff_id === staffId ? { ...member, is_active: newStatus } : member
      ));
      
      toast({
        title: newStatus ? "Staff activated" : "Staff deactivated",
        description: `Staff member has been ${newStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling staff active status:', error);
      toast({
        title: "Error",
        description: "Could not update staff status",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to remove ${staffName} from your staff?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('vendor_staff')
        .delete()
        .eq('staff_id', staffId);
        
      if (error) throw error;
      
      // Update local state
      setStaff(staff.filter(member => member.staff_id !== staffId));
      
      toast({
        title: "Staff removed",
        description: `${staffName} has been removed from your staff`,
      });
    } catch (error) {
      console.error('Error removing staff:', error);
      toast({
        title: "Error",
        description: "Could not remove staff member",
        variant: "destructive",
      });
    }
  };

  const handleResendInvitation = (staffEmail: string) => {
    // In a production app, you would call a function to resend the invitation email
    toast({
      title: "Invitation resent",
      description: `An invitation has been resent to ${staffEmail}`,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-sanskara-amber text-sanskara-maroon';
      case 'admin':
        return 'bg-sanskara-red/20 text-sanskara-red';
      default:
        return 'bg-sanskara-cream text-sanskara-maroon';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-sanskara-gold/20 text-sanskara-gold border-sanskara-gold';
      case 'admin':
        return 'bg-sanskara-red/10 text-sanskara-red border-sanskara-red';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and permissions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Add a new staff member to your team. They will receive an email invitation.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
                <p className="text-sm">{error}</p>
                <button onClick={() => setError(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Full Name"
                  className="col-span-3"
                  value={newStaff.display_name}
                  onChange={e => setNewStaff({...newStaff, display_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="col-span-3"
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="col-span-3"
                  value={newStaff.phone_number}
                  onChange={e => setNewStaff({...newStaff, phone_number: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newStaff.role}
                  onValueChange={value => setNewStaff({...newStaff, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {staff.length === 0 && <SelectItem value="owner">Owner</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddStaff}
                disabled={isSubmitting}
                className="bg-sanskara-red hover:bg-sanskara-maroon text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>Add Team Member</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invite Information Dialog */}
      <Dialog open={showInviteInfo} onOpenChange={setShowInviteInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Member Added</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert className="mb-4">
              <AlertTitle>Staff member has been added</AlertTitle>
              <AlertDescription>
                In a production environment, an invitation email would be sent to the new staff member with instructions to create their account.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mb-4">
              For this demo, staff accounts are added directly to the database. In a real application, you would need to:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Configure email sending in Supabase</li>
              <li>Create an invitation link with a secure token</li>
              <li>Send an email to the staff member with the invitation link</li>
              <li>Create a page to handle the invitation acceptance process</li>
            </ol>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInviteInfo(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          <p className="ml-3 text-sanskara-maroon">Loading team members...</p>
        </div>
      ) : staff.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-sanskara-amber/20 p-3 mb-4">
              <PlusCircle className="h-8 w-8 text-sanskara-amber" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Team Members</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven't added any team members yet. Add staff to delegate tasks and manage your business more efficiently.
            </p>
            <Button 
              className="bg-sanskara-red hover:bg-sanskara-maroon text-white"
              onClick={() => setDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({staff.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {staff.map((member) => (
                <div key={member.staff_id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className={`h-10 w-10 ${getAvatarColor(member.role)}`}>
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitials(member.display_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.display_name}</h3>
                        <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                        {!member.is_active && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500">
                            Inactive
                          </Badge>
                        )}
                        {member.invitation_status === 'pending' && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            Pending Invitation
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-4 mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </span>
                        {member.phone_number && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {member.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => alert('Edit functionality would go here')}>
                        Edit Details
                      </DropdownMenuItem>
                      
                      {member.invitation_status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleResendInvitation(member.email)}>
                          <div className="flex items-center">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </div>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem>
                        <div className="flex items-center w-full">
                          Change Role
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateRole(member.staff_id, value)}
                          >
                            <SelectTrigger className="ml-2 h-6 border-none shadow-none p-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(member.staff_id, member.is_active)}
                      >
                        {member.is_active ? 'Deactivate Account' : 'Activate Account'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleRemoveStaff(member.staff_id, member.display_name)}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Staff;
