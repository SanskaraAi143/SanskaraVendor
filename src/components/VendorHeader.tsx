
import React, { useState } from 'react';
import { Bell, ChevronDown, Menu, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const VendorHeader: React.FC = () => {
  const [notificationCount, setNotificationCount] = useState(3);
  
  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-sanskara-maroon hover:text-sanskara-red transition-colors" />
          <span className="text-xl font-semibold hidden sm:block gradient-text">Vendor Dashboard</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell 
              className="h-5 w-5 text-sanskara-maroon hover:text-sanskara-red cursor-pointer transition-colors" 
              onClick={() => setNotificationCount(0)} 
            />
            {notificationCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-sanskara-red text-white">
                {notificationCount}
              </Badge>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8 border border-sanskara-gold/50">
                <AvatarImage src="https://i.pravatar.cc/300" />
                <AvatarFallback className="bg-sanskara-amber text-sanskara-maroon">VP</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:block">Vendor Profile</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="rounded-full bg-sanskara-amber/20 p-1">
                  <User className="h-4 w-4 text-sanskara-maroon" />
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">Vendor Profile</p>
                  <p className="text-xs text-muted-foreground">vendor@example.com</p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Account Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-500 cursor-pointer flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
