import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const STATUSES = ['All', 'ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'];
const PROPERTY_TYPES = ['All', 'APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND'];
const LISTING_TYPES = ['All', 'SALE', 'RENT'];

const AdminProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [propertyType, setPropertyType] = useState('All');
  const [listingType, setListingType] = useState('All');
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({ open: false, property: null });
  const [statusModal, setStatusModal] = useState({ open: false, property: null, newStatus: '' });
  const [actioning, setActioning] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (propertyType !== 'All') params.propertyType = propertyType;
      if (listingType !== 'All') params.listingType = listingType;

      const res = await adminService.getProperties(params);
      setProperties(res.data.data.properties || []);
      setPagination(res.data.data.pagination || null);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, propertyType, listingType]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 300);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  const handleDelete = async () => {
    setActioning(true);
    try {
      await adminService.deleteProperty(deleteModal.property._id);
      toast.success('Property deleted');
      setDeleteModal({ open: false, property: null });
      fetchProperties();
    } catch {
      toast.error('Failed to delete property');
    } finally {
      setActioning(false);
    }
  };

  const handleStatusChange = async () => {
    setActioning(true);
    try {
      await adminService.updatePropertyStatus(statusModal.property._id, {
        status: statusModal.newStatus,
      });
      toast.success(`Property set to ${statusModal.newStatus}`);
      setStatusModal({ open: false, property: null, newStatus: '' });
      fetchProperties();
    } catch {
      toast.error('Failed to update property status');
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="page-container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Property Management</h1>
        <p className="section-subtitle">Manage all listings on the platform</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <select
            value={propertyType}
            onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
            ))}
          </select>
          <select
            value={listingType}
            onChange={(e) => { setListingType(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            {LISTING_TYPES.map((l) => (
              <option key={l} value={l}>{l === 'All' ? 'Sale & Rent' : l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading properties..." />
        ) : !properties.length ? (
          <div className="text-center py-12 text-gray-400">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No properties found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Property</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">
                    City
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden xl:table-cell">
                    Seller
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden xl:table-cell">
                    Listed
                  </th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="h-10 w-14 object-cover rounded-lg shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <Home className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 truncate max-w-[140px]">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {p.city || p.location?.city || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${(p.price || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        {p.propertyType && <Badge text={p.propertyType} variant={p.propertyType} />}
                        {p.listingType && <Badge text={p.listingType} variant={p.listingType} />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={p.status} variant={p.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">
                      {p.seller?.fullName || p.seller?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/properties/${p._id}`)}
                          title="View listing"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setStatusModal({
                              open: true,
                              property: p,
                              newStatus: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            })
                          }
                          title="Toggle status"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          {p.status === 'ACTIVE' ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, property: p })}
                          title="Delete property"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, property: null })}
        title="Delete Property"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to permanently delete{' '}
          <strong>{deleteModal.property?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteModal({ open: false, property: null })}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button onClick={handleDelete} disabled={actioning} className="btn-danger">
            {actioning ? 'Deleting...' : 'Delete Property'}
          </button>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, property: null, newStatus: '' })}
        title="Change Property Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Set status for <strong>{statusModal.property?.title}</strong> to:
          </p>
          <select
            value={statusModal.newStatus}
            onChange={(e) => setStatusModal((prev) => ({ ...prev, newStatus: e.target.value }))}
            className="input-field"
          >
            {STATUSES.filter((s) => s !== 'All').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setStatusModal({ open: false, property: null, newStatus: '' })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              disabled={actioning}
              className="btn-primary"
            >
              {actioning ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProperties;
