import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserIcon, ListIcon, BriefcaseIcon, ClipboardListIcon, LogOutIcon, HomeIcon } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

const navItems = [
  { name: 'Dashboard', path: '/staff/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Profile', path: '/staff/profile', icon: <UserIcon className="w-5 h-5" /> },
  { name: 'Portfolio', path: '/staff/portfolio', icon: <BriefcaseIcon className="w-5 h-5" /> },
  { name: 'Tasks', path: '/staff/tasks', icon: <ClipboardListIcon className="w-5 h-5" /> },
  { name: 'Vendor Bookings', path: '/staff/bookings', icon: <ListIcon className="w-5 h-5" /> },
];

const StaffDashboardLayout: React.FC<{ children: React.ReactNode; userName?: string }> = ({ children, userName }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/staff/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-xl font-bold text-red-600">Sanskara Staff</span>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors ${location.pathname.startsWith(item.path) ? 'bg-red-100 text-red-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 m-4 p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <LogOutIcon className="w-5 h-5" /> Logout
        </button>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold capitalize">{navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, <span className="font-bold">{userName || 'Staff'}</span>!</span>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;
