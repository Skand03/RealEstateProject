import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Edit2, Trash2, Building2, MapPin, Calendar, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMyProperties,
  deleteProperty,
  selectMyProperties,
  selectPropertyLoading,
  selectPropertyPagination,
} from '../../features/property/propertySlice';
import { useAuth } from '../../hooks/useAuth';
import { VERIFICATION_STATUS, PROPERTY_STATUS } from '../../utils/constants';
import { formatPrice, formatDate, getPrimaryImage } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: PROPERTY_STATUS.ACTIVE, label: 'Active' },
  { key: PROPERTY_STATUS.SOLD, label: 'Sold' },
  { key: PROPERTY_STATUS.RENTED, label: 'Rented' },
  { key: PROPERTY_STATUS.INACTIVE, label: 'Inactive' },
];

const getStatusBadgeClass = (status) => {
  const map = {
    [PROPERTY_STATUS.ACTIVE]: 'badge-success',
    [PROPERTY_STATUS.SOLD]: 'badge-info',
    [PROPERTY_STATUS.RENTED]: 'badge-warning',
    [PROPERTY_STATUS.INACTIVE]: 'badge-gray',
    [PROPERTY_STATUS.PENDING]: 'badge-warning',
  };
  return map[status] || 'badge-gray';
};

const EmptyState = ({ status }) => (
  <div className="text-center py-16">
    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 text-sm font-medium">
      {status === 'ALL'
        ? 'You have no listings yet.'
        : `No ${status.toLowerCase()} properties.`}
    </p>
    <Link to="/seller/add-property" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
      <Plus className="h-4 w-4" />
      Add Property
    </Link>
  </div>
);

const MyProperties = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { verificationStatus } = useAuth();
  const properties = useSelector(selectMyProperties);
  const loading = useSelector(selectPropertyLoading);
  const pagination = useSelector(selectPropertyPagination);

  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, property: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (activeTab !== 'ALL') params.status = activeTab;
    dispatch(fetchMyProperties(params));
  }, [dispatch, activeTab, page]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModal.property) return;
    setDeleting(true);
    const result = await dispatch(deleteProperty(deleteModal.property._id));
    setDeleting(false);
    if (deleteProperty.fulfilled.match(result)) {
      toast.success('Property deleted.');
      setDeleteModal({ open: false, property: null });
    } else {
      toast.error(result.payload || 'Failed to delete property.');
    }
  };

  if (loading && properties.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your listings in one place.</p>
        </div>
        {verificationStatus === VERIFICATION_STATUS.APPROVED && (
          <Link
            to="/seller/add-property"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : properties.length === 0 ? (
        <EmptyState status={activeTab} />
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <div
              key={property._id}
              className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-20 w-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  src={getPrimaryImage(property.images)}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {property.title}
                  </h3>
                  <span className={getStatusBadgeClass(property.status)}>
                    {property.status}
                  </span>
                  <span className="badge-gray">{property.listingType}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="h-3 w-3" />
                  {property.location?.city}, {property.location?.state}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-primary-600">
                    {formatPrice(property.price, property.listingType)}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{property.propertyType}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Calendar className="h-3 w-3" />
                  Listed {formatDate(property.createdAt)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/seller/properties/${property._id}/edit`)}
                  className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, property })}
                  className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, property: null })}
        title="Delete Property"
        size="sm"
      >
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-gray-700 text-sm mb-1 font-medium">
            Are you sure you want to delete:
          </p>
          <p className="text-gray-900 font-semibold text-base mb-4">
            "{deleteModal.property?.title}"
          </p>
          <p className="text-gray-500 text-xs mb-6">
            This action cannot be undone. All associated bookings and data will also be removed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ open: false, property: null })}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyProperties;
