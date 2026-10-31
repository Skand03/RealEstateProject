import { useState, useEffect } from 'react'
import { Star, Edit, Trash2, MessageSquare, Home, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import Modal from '../../components/common/Modal'
import RatingStars from '../../components/common/RatingStars'
import toast from 'react-hot-toast'
import api from '../../services/api'

const MyReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [editData, setEditData] = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMyReviews()
  }, [])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/reviews/my')
      setReviews(response.data.data?.reviews || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews')
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (review) => {
    setSelectedReview(review)
    setEditData({ rating: review.rating, comment: review.comment })
    setShowEditModal(true)
  }

  const handleDeleteClick = (review) => {
    setSelectedReview(review)
    setShowDeleteModal(true)
  }

  const handleUpdateReview = async () => {
    if (editData.rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!editData.comment.trim()) {
      toast.error('Please write a review')
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/reviews/${selectedReview._id}`, editData)
      toast.success('Review updated successfully')
      setShowEditModal(false)
      fetchMyReviews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/reviews/${selectedReview._id}`)
      toast.success('Review deleted successfully')
      setShowDeleteModal(false)
      fetchMyReviews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">Manage your property reviews and ratings</p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card p-12 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            Share your experience by reviewing properties you've visited
          </p>
          <Link to="/buyer/bookings" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            View Your Bookings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image */}
                  <Link 
                    to={`/properties/${review.property._id}`}
                    className="w-full lg:w-48 h-36 rounded-xl overflow-hidden flex-shrink-0 group"
                  >
                    <img
                      src={review.property.images?.[0] || 'https://via.placeholder.com/400x300?text=Property'}
                      alt={review.property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </Link>

                  {/* Review Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link 
                          to={`/properties/${review.property._id}`}
                          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {review.property.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {review.property.location?.city}, {review.property.location?.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(review)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit review"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(review)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-3">
                      <RatingStars rating={review.rating} size="lg" />
                      <span className="text-lg font-bold text-gray-900">{review.rating}.0</span>
                    </div>

                    {/* Comment */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {review.updatedAt !== review.createdAt && (
                        <span className="text-gray-400">(Edited)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => !submitting && setShowEditModal(false)}
        title="Edit Review"
      >
        <div className="space-y-6">
          {selectedReview && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">{selectedReview.property.title}</h4>
              <p className="text-sm text-gray-600">{selectedReview.property.location?.city}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="label mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditData({ ...editData, rating: star })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= editData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="label">Your Review</label>
            <textarea
              rows={6}
              className="input-field resize-none"
              placeholder="Share your experience with this property..."
              value={editData.comment}
              onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">
              {editData.comment.length} characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowEditModal(false)}
              disabled={submitting}
              className="btn-outline px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateReview}
              disabled={submitting}
              className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Review'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !submitting && setShowDeleteModal(false)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
          </div>
          {selectedReview && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">{selectedReview.property.title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={selectedReview.rating} />
                <span className="text-sm text-gray-600">{selectedReview.rating}.0</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
              className="btn-outline px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteReview}
              disabled={submitting}
              className="btn-danger px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Review
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MyReviews
