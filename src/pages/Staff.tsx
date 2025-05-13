
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Mail, Phone, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface StaffMember {
  staff_id: string;
  display_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { vendorProfile } = useAuth();

  useEffect(() => {
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
    
    fetchStaff();
  }, [vendorProfile]);

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
        <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>
      
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
            <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
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
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
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
