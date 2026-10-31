import { useEffect, useState, useCallback } from 'react';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const SummaryCard = ({ icon: Icon, label, value, sub }) => (
  <div className="card flex items-start gap-4">
    <div className="p-3 rounded-xl bg-primary-50 text-primary-600 shrink-0">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">
        {value !== undefined && value !== null ? `$${Number(value).toLocaleString()}` : '—'}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (roleFilter !== 'All') params.role = roleFilter;

      const res = await adminService.getCommissions(params);
      const data = res.data.data;
      setCommissions(data.commissions || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || null);
    } catch {
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  }, [page, fromDate, toDate, roleFilter]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  // Compute totals from current page if no server-side summary
  const totalRevenue = summary?.totalRevenue ?? commissions.reduce((acc, c) => acc + (c.amount || 0), 0);
  const sellerTotal = summary?.sellerTotal ?? commissions.filter((c) => c.role === 'SELLER').reduce((acc, c) => acc + (c.amount || 0), 0);
  const buyerTotal = summary?.buyerTotal ?? commissions.filter((c) => c.role === 'BUYER').reduce((acc, c) => acc + (c.amount || 0), 0);

  return (
    <div className="page-container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Commission Dashboard</h1>
        <p className="section-subtitle">Platform revenue and commission breakdown</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={DollarSign}
          label="Total Platform Revenue"
          value={totalRevenue}
          sub="All commissions combined"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Seller Commissions"
          value={sellerTotal}
          sub="From seller transactions"
        />
        <SummaryCard
          icon={Users}
          label="Buyer Commissions"
          value={buyerTotal}
          sub="From buyer transactions"
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="input-field"
            >
              <option value="All">All Roles</option>
              <option value="SELLER">Seller</option>
              <option value="BUYER">Buyer</option>
            </select>
          </div>
          {(fromDate || toDate || roleFilter !== 'All') && (
            <button
              onClick={() => { setFromDate(''); setToDate(''); setRoleFilter('All'); setPage(1); }}
              className="btn-secondary text-sm self-end"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading commissions..." />
        ) : !commissions.length ? (
          <div className="text-center py-12 text-gray-400">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No commission records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">
                    Property
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">
                    Property Price
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">
                    Commission (2.5%)
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden xl:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {commissions.map((c) => {
                  const user = c.user || c.seller || c.buyer || {};
                  const property = c.property || {};
                  const commissionAmt = c.amount ?? (property.price ? property.price * 0.025 : null);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {(user.fullName || user.name || 'U')[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[120px]">
                              {user.fullName || user.name || '—'}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">
                              {user.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge text={c.role} variant={c.role} />
                      </td>
                      <td className="px-4 py-3 text-gray-700 hidden md:table-cell max-w-[160px] truncate">
                        {property.title || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 hidden lg:table-cell">
                        {property.price ? `$${Number(property.price).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">
                        {commissionAmt !== null && commissionAmt !== undefined
                          ? `$${Number(commissionAmt).toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminCommissions;
