import { useEffect, useState, useCallback } from 'react';
import { Search, Download, UserX, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const ROLES = ['All', 'BUYER', 'SELLER', 'ADMIN'];
const STATUSES = ['All', 'Active', 'Suspended'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  const [confirmModal, setConfirmModal] = useState({ open: false, user: null });
  const [actioning, setActioning] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (role !== 'All') params.role = role;
      if (status !== 'All') params.isActive = status === 'Active';

      const res = await adminService.getUsers(params);
      setUsers(res.data.data.users || []);
      setPagination(res.data.data.pagination || null);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleToggleStatus = async () => {
    if (!confirmModal.user) return;
    setActioning(true);
    const { _id, isActive } = confirmModal.user;
    try {
      await adminService.updateUserStatus(_id);
      toast.success(`User ${isActive ? 'suspended' : 'activated'} successfully`);
      setConfirmModal({ open: false, user: null });
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setActioning(false);
    }
  };

  const handleExportCSV = () => {
    if (!users.length) return;
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'];
    const rows = users.map((u) => [
      u.fullName || u.name || '',
      u.email || '',
      u.phone || '',
      u.role || '',
      u.isActive ? 'Active' : 'Suspended',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage all platform users</p>
        </div>
        <button onClick={handleExportCSV} className="btn-outline flex items-center gap-2 text-sm">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>

          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : !users.length ? (
          <div className="text-center py-12 text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                          {(user.fullName || user.name || 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[120px]">
                          {user.fullName || user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge text={user.role} variant={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}
                      >
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setConfirmModal({ open: true, user })}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ml-auto ${
                          user.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-3.5 w-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, user: null })}
        title={confirmModal.user?.isActive ? 'Suspend User' : 'Activate User'}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to{' '}
          <strong>{confirmModal.user?.isActive ? 'suspend' : 'activate'}</strong>{' '}
          <strong>{confirmModal.user?.fullName || confirmModal.user?.name}</strong>?
          {confirmModal.user?.isActive &&
            ' They will lose access to the platform until reactivated.'}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setConfirmModal({ open: false, user: null })}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={actioning}
            className={confirmModal.user?.isActive ? 'btn-danger' : 'btn-primary'}
          >
            {actioning
              ? 'Processing...'
              : confirmModal.user?.isActive
              ? 'Suspend User'
              : 'Activate User'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
