import { useEffect, useState, useCallback } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const StarRating = ({ rating, size = 'sm' }) => {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${px} ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({ open: false, review: null });
  const [actioning, setActioning] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (ratingFilter !== 'All') params.rating = ratingFilter;
      const res = await adminService.getReviews(params);
      setReviews(res.data.data.reviews || []);
      setPagination(res.data.data.pagination || null);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async () => {
    setActioning(true);
    try {
      await adminService.deleteReview(deleteModal.review._id);
      toast.success('Review deleted');
      setDeleteModal({ open: false, review: null });
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="page-container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Review Moderation</h1>
        <p className="section-subtitle">Manage and moderate platform reviews</p>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by rating:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setRatingFilter('All'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                ratingFilter === 'All'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => { setRatingFilter(String(r)); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  ratingFilter === String(r)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${ratingFilter === String(r) ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <LoadingSpinner text="Loading reviews..." />
      ) : !reviews.length ? (
        <div className="card text-center py-12 text-gray-400">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          No reviews found
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Property & Reviewer */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {review.property?.title || 'Property'}
                    </p>
                    <span className="text-sm text-gray-400">·</span>
                    <p className="text-sm text-gray-600">
                      by{' '}
                      <span className="font-medium">
                        {review.reviewer?.fullName || review.reviewer?.name || review.user?.fullName || review.user?.name || 'Anonymous'}
                      </span>
                    </p>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {review.comment}
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteModal({ open: true, review })}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0"
                  title="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, review: null })}
        title="Delete Review"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this review by{' '}
          <strong>
            {deleteModal.review?.reviewer?.fullName ||
              deleteModal.review?.reviewer?.name ||
              deleteModal.review?.user?.fullName ||
              'this user'}
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteModal({ open: false, review: null })}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button onClick={handleDelete} disabled={actioning} className="btn-danger">
            {actioning ? 'Deleting...' : 'Delete Review'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminReviews;
