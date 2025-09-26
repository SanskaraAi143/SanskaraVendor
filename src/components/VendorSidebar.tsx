
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from './Logo';
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Settings, 
  CheckCircle, 
  BellRing, 
  Star, 
  DollarSign,
  ListTodo,
  Store,
} from 'lucide-react';

const VendorSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "text-sanskara-red font-medium bg-sanskara-red/10 border-l-2 border-sanskara-red" 
      : "hover:bg-sanskara-red/5 hover:text-sanskara-red";
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-sanskara-cream shadow-lg`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end text-sanskara-red hover:text-sanskara-maroon transition-colors" />
      
      <div className={`mt-4 mb-8 flex justify-center ${collapsed ? "px-2" : "px-6"}`}>
        {collapsed ? (
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-sanskara-red rounded-full opacity-80"></div>
            <div className="absolute inset-1 bg-sanskara-gold rounded-full"></div>
            <div className="absolute inset-3 bg-sanskara-cream rounded-full flex items-center justify-center">
              <span className="text-sanskara-maroon text-xs font-bold">V</span>
            </div>
          </div>
        ) : (
          <Logo />
        )}
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "hidden" : "block"} text-sanskara-maroon`}>
            Management
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" end className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <Store className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Dashboard</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/calendar" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <Calendar className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Calendar</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/bookings" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <BookOpen className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Bookings</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/services" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Services</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/tasks" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <ListTodo className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Tasks</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "hidden" : "block"} text-sanskara-maroon`}>
            Team & More
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/staff" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <Users className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Staff</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/notifications" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <BellRing className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Notifications</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/reviews" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <Star className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Reviews</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/payments" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <DollarSign className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Payments</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavClass}>
                    <div className="flex items-center py-2 px-3 gap-3">
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Settings</span>}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default React.memo(VendorSidebar);
