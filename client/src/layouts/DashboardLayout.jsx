import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Building2, Shield, Plus, List, Calendar,
  MessageSquare, Star, DollarSign, User, Users, CheckSquare,
  LogOut, Home, Heart,
} from 'lucide-react'

const DashboardLayout = ({ role }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const buyerNav = [
    { to: '/buyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/buyer/favorites', icon: Heart, label: 'Favorites' },
    { to: '/buyer/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/buyer/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/buyer/reviews', icon: Star, label: 'My Reviews' },
    { to: '/buyer/profile', icon: User, label: 'Profile' },
  ]

  const sellerNav = [
    { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/seller/verification', icon: Shield, label: 'Verification' },
    { to: '/seller/add-property', icon: Plus, label: 'Add Property' },
    { to: '/seller/properties', icon: List, label: 'My Listings' },
    { to: '/seller/bookings', icon: Calendar, label: 'Booking Requests' },
    { to: '/seller/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/seller/commission', icon: DollarSign, label: 'Commission' },
    { to: '/seller/profile', icon: User, label: 'Profile' },
  ]

  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/verifications', icon: CheckSquare, label: 'Verifications' },
    { to: '/admin/properties', icon: Building2, label: 'Properties' },
    { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    { to: '/admin/commissions', icon: DollarSign, label: 'Commissions' },
  ]

  const navItems = role === 'ADMIN' ? adminNav : role === 'SELLER' ? sellerNav : buyerNav

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm hidden md:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-gray-900">
              Haikyu<span className="text-primary-600">Heights</span>
            </span>
          </NavLink>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-primary-700 font-semibold text-sm">{user?.fullName?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">{role}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer nav */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Home className="h-4 w-4" /> Back to site
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
          <span className="font-heading font-bold text-gray-900">
            Haikyu<span className="text-primary-600">Heights</span>
          </span>
          <button onClick={handleLogout} className="text-sm text-red-600 flex items-center gap-1">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
