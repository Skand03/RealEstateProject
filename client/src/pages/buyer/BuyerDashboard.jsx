import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, CalendarCheck, CheckSquare, Star, ArrowRight, Home } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { fetchBuyerBookings, selectBuyerBookings } from '../../features/booking/bookingSlice';
import { fetchFavorites } from '../../features/favorite/favoriteSlice';
import { bookingService } from '../../services/booking.service';
import { favoriteService } from '../../services/favorite.service';
import DashboardCard from '../../components/common/DashboardCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';
import { BOOKING_STATUS } from '../../utils/constants';

const BuyerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const recentBookings = useSelector(selectBuyerBookings);

  const [stats, setStats] = useState({
    totalFavorites: 0,
    activeBookings: 0,
    completedVisits: 0,
    reviewsWritten: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoadingStats(true);
      try {
        // Fetch recent bookings (last 3)
        await dispatch(fetchBuyerBookings({ limit: 3, page: 1 }));

        // Fetch all bookings for stats
        const [bookingsRes, favRes] = await Promise.all([
          bookingService.getBuyerBookings({ limit: 100 }),
          favoriteService.getFavorites({ limit: 1 }),
        ]);

        const allBookings = bookingsRes.data.data.bookings || [];
        const activeCount = allBookings.filter(
          (b) => b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.ACCEPTED
        ).length;
        const completedCount = allBookings.filter(
          (b) => b.status === BOOKING_STATUS.COMPLETED
        ).length;
        const reviewsCount = allBookings.filter((b) => b.hasReviewed).length;

        setStats({
          totalFavorites: favRes.data.data.pagination?.total || 0,
          activeBookings: activeCount,
          completedVisits: completedCount,
          reviewsWritten: reviewsCount,
        });
      } catch {
        // silently fail — stats will just show zeros
      } finally {
        setLoadingStats(false);
      }
    };

    loadData();
  }, [dispatch]);

  return (
    <div className="page-container py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold font-heading">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="mt-1 text-primary-100">
          Here's a summary of your activity on Haikyu Heights.
        </p>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
        >
          <Home className="h-4 w-4" />
          Browse Properties
        </Link>
      </div>

      {/* Stats Grid */}
      {loadingStats ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Favorites"
            value={stats.totalFavorites}
            icon={Heart}
            color="red"
            subtitle="Saved properties"
          />
          <DashboardCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={CalendarCheck}
            color="blue"
            subtitle="Pending & accepted"
          />
          <DashboardCard
            title="Completed Visits"
            value={stats.completedVisits}
            icon={CheckSquare}
            color="green"
            subtitle="Total visits done"
          />
          <DashboardCard
            title="Reviews Written"
            value={stats.reviewsWritten}
            icon={Star}
            color="yellow"
            subtitle="Your contributions"
          />
        </div>
      )}

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link
            to="/buyer/bookings"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No bookings yet.</p>
            <Link to="/properties" className="btn-primary mt-4 inline-block text-sm">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                {/* Property thumbnail */}
                <div className="flex-shrink-0 h-14 w-14 rounded-xl overflow-hidden bg-gray-100">
                  {booking.property?.images?.[0]?.url ? (
                    <img
                      src={booking.property.images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {booking.property?.title || 'Property'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(booking.requestedDate)}
                    {booking.requestedTime && ` at ${formatTime(booking.requestedTime)}`}
                  </p>
                </div>

                <Badge variant={booking.status} text={booking.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/properties"
            className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
              <Home className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Browse Properties</p>
              <p className="text-xs text-gray-500 mt-0.5">Find your next home</p>
            </div>
          </Link>

          <Link
            to="/buyer/favorites"
            className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">My Favorites</p>
              <p className="text-xs text-gray-500 mt-0.5">Saved properties</p>
            </div>
          </Link>

          <Link
            to="/buyer/bookings"
            className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Book a Visit</p>
              <p className="text-xs text-gray-500 mt-0.5">Manage your bookings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
