import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2, Calendar, DollarSign, Plus, List, CheckCircle,
  Clock, XCircle, AlertCircle, Shield, ArrowRight, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyProperties, selectMyProperties, selectPropertyLoading } from '../../features/property/propertySlice';
import { fetchSellerBookings, selectSellerBookings, selectBookingLoading } from '../../features/booking/bookingSlice';
import { fetchMyVerificationStatus, selectMyVerification } from '../../features/sellerVerification/sellerVerificationSlice';
import { commissionService } from '../../services/commission.service';
import { VERIFICATION_STATUS, BOOKING_STATUS, PROPERTY_STATUS } from '../../utils/constants';
import { formatDate, formatPrice, formatPriceShort, getPrimaryImage } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useState } from 'react';

const VerificationBanner = ({ verificationStatus, rejectionReason }) => {
  if (verificationStatus === VERIFICATION_STATUS.APPROVED) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-green-800 text-sm font-medium">
          Your account is verified. You can list and manage properties freely.
        </p>
      </div>
    );
  }

  if (verificationStatus === VERIFICATION_STATUS.PENDING) {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
        <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <div>
          <p className="text-yellow-800 text-sm font-medium">Verification under review</p>
          <p className="text-yellow-700 text-xs mt-0.5">
            Your documents are being reviewed. This usually takes 1–2 business days.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === VERIFICATION_STATUS.REJECTED) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-800 text-sm font-medium">Verification rejected</p>
          {rejectionReason && (
            <p className="text-red-700 text-xs mt-0.5">Reason: {rejectionReason}</p>
          )}
          <Link to="/seller/verification" className="text-red-700 text-xs underline mt-1 inline-block font-medium">
            Resubmit documents →
          </Link>
        </div>
      </div>
    );
  }

  // NOT_SUBMITTED
  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
      <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-blue-800 text-sm font-medium">Complete your seller verification</p>
        <p className="text-blue-700 text-xs mt-0.5">
          Verify your identity and ownership documents to start listing properties.
        </p>
      </div>
      <Link to="/seller/verification" className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
        Verify Now
      </Link>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, to }) => (
  <Link to={to} className="card hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <div className="mt-3 flex items-center text-xs text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      View details <ArrowRight className="h-3 w-3 ml-1" />
    </div>
  </Link>
);

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { user, verificationStatus } = useAuth();
  const properties = useSelector(selectMyProperties);
  const propLoading = useSelector(selectPropertyLoading);
  const bookings = useSelector(selectSellerBookings);
  const bookLoading = useSelector(selectBookingLoading);
  const myVerification = useSelector(selectMyVerification);
  const [commissions, setCommissions] = useState([]);
  const [commLoading, setCommLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyProperties({ limit: 100 }));
    dispatch(fetchSellerBookings({ limit: 100 }));
    dispatch(fetchMyVerificationStatus());

    const loadCommissions = async () => {
      setCommLoading(true);
      try {
        const res = await commissionService.getSellerCommissions({ limit: 100 });
        setCommissions(res.data?.data?.commissions || []);
      } catch (_) {
        // silently fail — commissions may not exist yet
      } finally {
        setCommLoading(false);
      }
    };
    loadCommissions();
  }, [dispatch]);

  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.status === PROPERTY_STATUS.ACTIVE).length;
  const pendingBookings = bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length;
  const totalCommission = commissions.reduce((sum, c) => sum + (c.sellerCommissionAmount || 0), 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const rejectionReason = myVerification?.rejectionReason || '';

  const isLoading = propLoading && bookLoading;

  const getBookingStatusBadge = (status) => {
    const map = {
      [BOOKING_STATUS.PENDING]: 'badge-warning',
      [BOOKING_STATUS.ACCEPTED]: 'badge-success',
      [BOOKING_STATUS.REJECTED]: 'badge-danger',
      [BOOKING_STATUS.COMPLETED]: 'badge-info',
      [BOOKING_STATUS.CANCELLED]: 'badge-gray',
    };
    return map[status] || 'badge-gray';
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your listings.</p>
        </div>
        {verificationStatus === VERIFICATION_STATUS.APPROVED && (
          <Link to="/seller/add-property" className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        )}
      </div>

      {/* Verification Banner */}
      <VerificationBanner
        verificationStatus={verificationStatus}
        rejectionReason={rejectionReason}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Listings"
          value={totalListings}
          icon={Building2}
          color="bg-blue-100 text-blue-600"
          to="/seller/properties"
        />
        <StatCard
          label="Active Listings"
          value={activeListings}
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
          to="/seller/properties"
        />
        <StatCard
          label="Pending Bookings"
          value={pendingBookings}
          icon={Calendar}
          color="bg-yellow-100 text-yellow-600"
          to="/seller/bookings"
        />
        <StatCard
          label="Commission Earned"
          value={commLoading ? '...' : formatPriceShort(totalCommission)}
          icon={DollarSign}
          color="bg-purple-100 text-purple-600"
          to="/seller/commission"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Booking Requests */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Booking Requests</h2>
            <Link to="/seller/bookings" className="text-sm text-primary-600 hover:underline font-medium">
              View all
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No booking requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    <img
                      src={getPrimaryImage(booking.property?.images)}
                      alt={booking.property?.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.property?.title || 'Property'}
                    </p>
                    <p className="text-xs text-gray-500">
                      By {booking.buyer?.fullName} · {formatDate(booking.requestedDate)}
                    </p>
                  </div>
                  <span className={getBookingStatusBadge(booking.status)}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {verificationStatus === VERIFICATION_STATUS.APPROVED ? (
              <Link
                to="/seller/add-property"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                    Add Property
                  </p>
                  <p className="text-xs text-gray-500">Create a new listing</p>
                </div>
              </Link>
            ) : (
              <Link
                to="/seller/verification"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">
                    Get Verified
                  </p>
                  <p className="text-xs text-gray-500">Submit your documents</p>
                </div>
              </Link>
            )}

            <Link
              to="/seller/properties"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <List className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  View Listings
                </p>
                <p className="text-xs text-gray-500">Manage your properties</p>
              </div>
            </Link>

            <Link
              to="/seller/bookings"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">
                  View Bookings
                </p>
                <p className="text-xs text-gray-500">{pendingBookings} pending requests</p>
              </div>
            </Link>

            <Link
              to="/seller/commission"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
            >
              <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                  View Commission
                </p>
                <p className="text-xs text-gray-500">Track your earnings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
