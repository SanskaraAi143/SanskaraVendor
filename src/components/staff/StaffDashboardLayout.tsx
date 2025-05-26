import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import StaffHeader from './StaffHeader'; // Import the new StaffHeader
import Logo from '../Logo'; // Assuming a shared Logo component exists
import { useAuth } from '@/hooks/useAuthContext';
import {
  HomeIcon,
  BookOpen,
  ListTodo,
  Calendar,
  CheckCircle,
  BellRing,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/staff/dashboard', icon: <HomeIcon className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Bookings', path: '/staff/bookings', icon: <BookOpen className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Tasks', path: '/staff/tasks', icon: <ListTodo className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Availability', path: '/staff/availability', icon: <Calendar className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Vendor Services', path: '/staff/services', icon: <CheckCircle className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Notifications', path: '/staff/notifications', icon: <BellRing className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Profile', path: '/staff/profile', icon: <User className="h-5 w-5 flex-shrink-0" /> },
  { name: 'Settings', path: '/staff/profile', icon: <Settings className="h-5 w-5 flex-shrink-0" /> }, // Changed path to /staff/profile
];

const StaffSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/staff/login'); // Redirect to staff login after sign out
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? "text-sanskara-red font-medium bg-sanskara-red/10 border-l-2 border-sanskara-red"
      : "hover:bg-sanskara-red/5 hover:text-sanskara-red";
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-sanskara-cream shadow-lg border-r border-sanskara-red/10`}
      collapsible="icon"
    >
      {/* Logo section - similar to VendorSidebar */}
      <div className={`mt-4 mb-8 flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
        {collapsed ? (
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-sanskara-red rounded-full opacity-80"></div>
            <div className="absolute inset-1 bg-sanskara-gold rounded-full"></div>
            <div className="absolute inset-3 bg-sanskara-cream rounded-full flex items-center justify-center">
              <span className="text-sanskara-maroon text-xs font-bold">S</span>
            </div>
          </div>
        ) : (
          <Logo />
        )}
        {/* SidebarTrigger is now in StaffHeader, so not needed here if we follow VendorHeader pattern */}
      </div>

      <SidebarContent className="px-2 flex-grow">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "hidden" : "block"} text-sanskara-maroon`}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={getNavClass} end={item.path === '/staff/dashboard'}>
                      <div className="flex items-center py-2 px-3 gap-3">
                        {item.icon}
                        {!collapsed && <span>{item.name}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-2 ${collapsed ? 'items-center' : ''} flex flex-col`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 p-3 rounded-md w-full transition-colors
                      text-sanskara-maroon hover:bg-sanskara-red/10 hover:text-sanskara-red
                      ${collapsed ? 'justify-center' : 'justify-start'}`}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

const StaffDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader /> {/* Use the new StaffHeader */}
          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StaffDashboardLayout;
