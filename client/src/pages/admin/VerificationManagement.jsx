import { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const TABS = ['All', 'PENDING', 'APPROVED', 'REJECTED'];

const VerificationManagement = () => {
  const [verifications, setVerifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);

  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [actioning, setActioning] = useState(null);

  const [docModal, setDocModal] = useState({ open: false, url: null, title: '' });

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (activeTab !== 'All') params.status = activeTab;
      const res = await adminService.getVerifications(params);
      setVerifications(res.data.data.verifications || []);
      setPagination(res.data.data.pagination || null);
    } catch {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await adminService.approveVerification(id);
      toast.success('Verification approved');
      fetchVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setActioning(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectReason('');
    setRejectError('');
    setRejectModal({ open: true, id });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required.');
      return;
    }
    if (rejectReason.trim().length > 500) {
      setRejectError('Reason must be 500 characters or fewer.');
      return;
    }
    setActioning(rejectModal.id);
    try {
      await adminService.rejectVerification(rejectModal.id, { adminNote: rejectReason.trim() });
      toast.success('Verification rejected');
      setRejectModal({ open: false, id: null });
      fetchVerifications();
    } catch {
      toast.error('Rejection failed');
    } finally {
      setActioning(null);
    }
  };

  const openDoc = (url, title) => {
    if (!url) { toast.error('Document not available'); return; }
    // Try to open in new tab; fall back to lightbox
    const win = window.open(url, '_blank');
    if (!win) setDocModal({ open: true, url, title });
  };

  return (
    <div className="page-container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Seller Verifications</h1>
        <p className="section-subtitle">Review and manage seller verification requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading verifications..." />
      ) : !verifications.length ? (
        <div className="card text-center py-12 text-gray-400">
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
          No verifications found
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => {
            const seller = v.seller || {};
            return (
              <div key={v._id} className="card space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
                      {(seller.fullName || seller.name || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {seller.fullName || seller.name || 'Unknown Seller'}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {seller.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            {seller.email}
                          </span>
                        )}
                        {seller.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            {seller.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          Submitted{' '}
                          {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge text={v.status} variant={v.status} />
                </div>

                {/* Documents */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openDoc(v.identityProof?.url, 'Identity Proof')}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Identity Proof
                  </button>
                  <button
                    onClick={() => openDoc(v.ownershipProof?.url, 'Ownership Proof')}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Ownership Proof
                  </button>
                </div>

                {/* Status-specific info */}
                {v.status === 'APPROVED' && v.reviewedAt && (
                  <p className="text-sm text-green-600 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Approved on {new Date(v.reviewedAt).toLocaleDateString()}
                  </p>
                )}
                {v.status === 'REJECTED' && v.adminNote && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm text-red-700 flex items-start gap-1.5">
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Rejection reason:</strong> {v.adminNote}
                      </span>
                    </p>
                  </div>
                )}

                {/* Actions for PENDING */}
                {v.status === 'PENDING' && (
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => handleApprove(v._id)}
                      disabled={actioning === v._id}
                      className="btn-primary flex items-center gap-2 text-sm py-1.5"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actioning === v._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => openRejectModal(v._id)}
                      disabled={actioning === v._id}
                      className="btn-danger flex items-center gap-2 text-sm py-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null })}
        title="Reject Verification"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Please provide a reason for rejecting this verification. The seller will be notified.
          </p>
          <div>
            <label className="label">Rejection Reason *</label>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
              placeholder="Enter rejection reason (required, max 500 characters)..."
              className="input-field resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-1">
              {rejectError ? (
                <p className="text-xs text-red-500">{rejectError}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {rejectReason.length}/500
              </span>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setRejectModal({ open: false, id: null })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actioning === rejectModal.id}
              className="btn-danger"
            >
              {actioning === rejectModal.id ? 'Rejecting...' : 'Reject Verification'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Lightbox */}
      <Modal
        isOpen={docModal.open}
        onClose={() => setDocModal({ open: false, url: null, title: '' })}
        title={docModal.title}
        size="xl"
      >
        {docModal.url && (
          <div className="flex flex-col items-center gap-3">
            <img
              src={docModal.url}
              alt={docModal.title}
              className="max-w-full max-h-[65vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <p className="hidden text-sm text-gray-500">
              Cannot preview this file.{' '}
              <a
                href={docModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline"
              >
                Open in new tab
              </a>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VerificationManagement;
