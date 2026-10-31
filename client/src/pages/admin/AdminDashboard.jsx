import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Shield,
  Clock,
  Building2,
  Home,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const KpiCard = ({ icon: Icon, label, value, subText, highlight }) => (
  <div className={`card flex items-start gap-4 ${highlight ? 'border-l-4 border-yellow-400' : ''}`}>
    <div
      className={`p-3 rounded-xl ${
        highlight ? 'bg-yellow-100 text-yellow-600' : 'bg-primary-50 text-primary-600'
      }`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">
        {value !== undefined && value !== null ? value.toLocaleString() : '—'}
      </p>
      {subText && <p className="text-xs text-gray-400 mt-0.5">{subText}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data.data.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await adminService.approveVerification(id);
      toast.success('Verification approved');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve verification');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason?.trim()) return;
    setActioning(id);
    try {
      await adminService.rejectVerification(id, { adminNote: reason.trim() });
      toast.success('Verification rejected');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject verification');
    } finally {
      setActioning(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const kpis = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.users?.total,
    },
    {
      icon: UserCheck,
      label: 'Total Sellers',
      value: stats?.users?.sellers,
    },
    {
      icon: Shield,
      label: 'Verified Sellers',
      value: stats?.verifications?.approved,
      subText: 'Approved verifications',
    },
    {
      icon: Clock,
      label: 'Pending Verifications',
      value: stats?.verifications?.pending,
      highlight: (stats?.verifications?.pending ?? 0) > 0,
      subText: (stats?.verifications?.pending ?? 0) > 0 ? 'Needs attention' : undefined,
    },
    {
      icon: Building2,
      label: 'Total Properties',
      value: stats?.properties?.total,
    },
    {
      icon: Home,
      label: 'Active Properties',
      value: stats?.properties?.active,
    },
    {
      icon: Calendar,
      label: 'Total Bookings',
      value: stats?.bookings?.total,
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: stats?.commissions?.totalPlatformRevenue,
      subText: 'Platform commissions',
    },
  ];

  return (
    <div className="page-container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Platform overview and key metrics</p>
        </div>
        <button onClick={fetchStats} className="btn-outline flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Verifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              Pending Verifications
            </h2>
            <button
              onClick={() => navigate('/admin/verifications')}
              className="text-sm text-primary-600 hover:underline"
            >
              View all
            </button>
          </div>

          {!stats?.recentPendingVerifications?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending verifications</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPendingVerifications.slice(0, 3).map((v) => (
                <div
                  key={v._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {v.seller?.fullName || v.seller?.name || 'Unknown Seller'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{v.seller?.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => handleApprove(v._id)}
                      disabled={actioning === v._id}
                      className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReject(v._id)}
                      disabled={actioning === v._id}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent New Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Recent Users
            </h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-primary-600 hover:underline"
            >
              View all
            </button>
          </div>

          {!stats?.recentUsers?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No recent users</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
                    {(user.fullName || user.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName || user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="shrink-0">
                    <Badge text={user.role} variant={user.role} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
