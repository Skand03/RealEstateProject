import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Home from '../pages/public/Home';
import Properties from '../pages/public/Properties';
import PropertyDetails from '../pages/public/PropertyDetails';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// Buyer Pages
import BuyerDashboard from '../pages/buyer/BuyerDashboard';
import BuyerProfile from '../pages/buyer/BuyerProfile';
import Favorites from '../pages/buyer/Favorites';
import MyBookings from '../pages/buyer/MyBookings';
import BuyerMessages from '../pages/buyer/BuyerMessages';
import MyReviews from '../pages/buyer/MyReviews';

// Seller Pages
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerVerificationPage from '../pages/seller/SellerVerification';
import AddProperty from '../pages/seller/AddProperty';
import MyProperties from '../pages/seller/MyProperties';
import EditProperty from '../pages/seller/EditProperty';
import BookingRequests from '../pages/seller/BookingRequests';
import SellerMessages from '../pages/seller/SellerMessages';
import SellerProfile from '../pages/seller/SellerProfile';
import CommissionSummary from '../pages/seller/CommissionSummary';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import VerificationManagement from '../pages/admin/VerificationManagement';
import AdminProperties from '../pages/admin/AdminProperties';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminCommissions from '../pages/admin/AdminCommissions';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Routes (no layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Buyer Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['BUYER']}>
              <DashboardLayout role="BUYER" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="profile" element={<BuyerProfile />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="messages" element={<BuyerMessages />} />
        <Route path="reviews" element={<MyReviews />} />
      </Route>

      {/* Seller Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['SELLER']}>
              <DashboardLayout role="SELLER" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="verification" element={<SellerVerificationPage />} />
        <Route path="add-property" element={<AddProperty />} />
        <Route path="properties" element={<MyProperties />} />
        <Route path="properties/:id/edit" element={<EditProperty />} />
        <Route path="bookings" element={<BookingRequests />} />
        <Route path="messages" element={<SellerMessages />} />
        <Route path="profile" element={<SellerProfile />} />
        <Route path="commission" element={<CommissionSummary />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <DashboardLayout role="ADMIN" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="verifications" element={<VerificationManagement />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="commissions" element={<AdminCommissions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
