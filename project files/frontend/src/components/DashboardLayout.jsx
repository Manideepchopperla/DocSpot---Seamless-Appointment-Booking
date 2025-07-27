// src/components/DashboardLayout.jsx
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';

// Define the links for each role
const navLinks = {
  user: [
    { text: 'Find Doctors', to: '/user-dashboard/doctors' },
    { text: 'My Appointments', to: '/user-dashboard/appointments' },
    { text: 'My Profile', to: '/user-dashboard/profile' },
  ],
  doctor: [
    { text: 'Appointments', to: '/doctor-dashboard/appointments' },
    { text: 'Profile', to: '/doctor-dashboard/profile' },
  ],
  admin: [
    { text: 'Overview', to: '/admin-dashboard' },
    { text: 'Approve Doctors', to: '/admin-dashboard/approve-doctors' },
    { text: 'Manage Users', to: '/admin-dashboard/users' },
    { text: 'All Appointments', to: '/admin-dashboard/appointments' },
  ],
};

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
      }`
    }
  >
    {children}
  </NavLink>
);

export default function DashboardLayout({ children, role }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const links = navLinks[role] || [];
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  
  // Close profile dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <NavLink to={`/${role}-dashboard`} className="flex items-center gap-2">
                <Stethoscope className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-800">DocSpot</span>
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {links.map((link) => (
                <NavItem key={link.to} to={link.to}>{link.text}</NavItem>
              ))}
            </nav>

            {/* Right side: Profile & Mobile Menu Button */}
            <div className="flex items-center gap-4">
               {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={user?.avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                  />
                   <ChevronDown size={20} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="font-bold truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="flex flex-col p-4 space-y-2">
              {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                        `px-4 py-3 rounded-md text-base font-semibold ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`
                    }
                >
                  {link.text}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}