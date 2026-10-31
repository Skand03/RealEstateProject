import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home, Building2, User, LogOut, Menu, X, ChevronDown,
  LayoutDashboard, Heart, Calendar, MessageSquare, Star,
  Shield, Plus, List, Bell, DollarSign,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isBuyer, isSeller, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors ${
      isActive(path) ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
    }`;

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isSeller) return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const buyerMenuItems = [
    { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/buyer/favorites', label: 'Favorites', icon: Heart },
    { to: '/buyer/bookings', label: 'My Bookings', icon: Calendar },
    { to: '/buyer/messages', label: 'Messages', icon: MessageSquare },
    { to: '/buyer/reviews', label: 'My Reviews', icon: Star },
    { to: '/buyer/profile', label: 'Profile', icon: User },
  ];

  const sellerMenuItems = [
    { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/seller/verification', label: 'Verification', icon: Shield },
    { to: '/seller/add-property', label: 'Add Property', icon: Plus },
    { to: '/seller/properties', label: 'My Listings', icon: List },
    { to: '/seller/bookings', label: 'Booking Requests', icon: Calendar },
    { to: '/seller/messages', label: 'Messages', icon: MessageSquare },
    { to: '/seller/commission', label: 'Commission', icon: DollarSign },
    { to: '/seller/profile', label: 'Profile', icon: User },
  ];

  const adminMenuItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: User },
    { to: '/admin/verifications', label: 'Verifications', icon: Shield },
    { to: '/admin/properties', label: 'Properties', icon: Building2 },
    { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  ];

  const menuItems = isAdmin ? adminMenuItems : isSeller ? sellerMenuItems : buyerMenuItems;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-gray-900">
              Haikyu<span className="text-primary-600">Heights</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/properties" className={navLinkClass('/properties')}>Properties</Link>
            <Link to="/about" className={navLinkClass('/about')}>About</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-primary-700 font-semibold text-sm">
                        {user?.fullName?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user?.fullName}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                        {user?.role}
                      </span>
                    </div>
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <Link to="/" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/properties" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Properties</Link>
            <Link to="/about" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/contact" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Contact</Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs text-gray-500 font-medium px-0 pb-2 uppercase tracking-wider">Account</p>
                  {menuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2 text-sm text-gray-700"
                    >
                      <item.icon className="h-4 w-4 text-gray-400" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 text-sm text-red-600 w-full mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-2">
                <Link to="/login" className="btn-outline text-center text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-center text-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
