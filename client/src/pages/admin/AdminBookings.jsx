import { useEffect, useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const STATUSES = ['All', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await adminService.getBookings(params);
      setBookings(res.data.data.bookings || []);
      setPagination(res.data.data.pagination || null);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="page-container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Booking Overview</h1>
        <p className="section-subtitle">Read-only view of all platform bookings</p>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading bookings..." />
        ) : !bookings.length ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Property</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Buyer</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">
                    Seller
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">
                    Visit Date
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden xl:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">
                        {b.property?.title || '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {b.property?.city || b.property?.location?.city || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 truncate max-w-[120px]">
                        {b.buyer?.fullName || b.buyer?.name || '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">
                        {b.buyer?.email || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-900 truncate max-w-[120px]">
                        {b.seller?.fullName || b.seller?.name || '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">
                        {b.seller?.email || ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {b.requestedDate ? new Date(b.requestedDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={b.status} variant={b.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminBookings;
