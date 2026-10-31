import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBuyerBookings, cancelBooking, selectBuyerBookings, selectBookingLoading, selectBookingError } from '../../features/booking/bookingSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import Badge from '../../components/common/Badge'
import { Calendar, MapPin, Home, Phone, Mail, X, Check, Clock, AlertCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Link } from 'react-router-dom'

const MyBookings = () => {
  const dispatch = useDispatch()
  const bookings = useSelector(selectBuyerBookings)
  const loading = useSelector(selectBookingLoading)
  const error = useSelector(selectBookingError)
  const [filter, setFilter] = useState('ALL')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    dispatch(fetchBuyerBookings())
  }, [dispatch])

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', icon: Clock },
      ACCEPTED: { variant: 'success', icon: Check },
      REJECTED: { variant: 'danger', icon: X },
      CANCELLED: { variant: 'danger', icon: X },
      COMPLETED: { variant: 'info', icon: Check }
    }
    const config = statusMap[status] || { variant: 'gray', icon: AlertCircle }
    return { ...config, label: status }
  }

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  const handleCancelBooking = async () => {
    setCancelling(true)
    try {
      const result = await dispatch(cancelBooking(selectedBooking._id))
      if (cancelBooking.fulfilled.match(result)) {
        toast.success('Booking cancelled successfully')
        setShowCancelModal(false)
        setSelectedBooking(null)
      } else {
        toast.error(result.payload || 'Failed to cancel booking')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setCancelling(false)
    }
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'ALL' ? true : booking.status === filter
  )

  const filterOptions = [
    { value: 'ALL', label: 'All Bookings', count: bookings.length },
    { value: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { value: 'ACCEPTED', label: 'Accepted', count: bookings.filter(b => b.status === 'ACCEPTED').length },
    { value: 'REJECTED', label: 'Rejected', count: bookings.filter(b => b.status === 'REJECTED').length },
    { value: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { value: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length }
  ]

  if (loading && !bookings.length) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Track and manage your property bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === option.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 text-sm ${
                filter === option.value ? 'text-primary-100' : 'text-gray-500'
              }`}>
                ({option.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'ALL' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'ALL' 
              ? 'Start exploring properties and make your first booking'
              : 'You don\'t have any bookings with this status'}
          </p>
          {filter === 'ALL' && (
            <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              Browse Properties
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map(booking => {
            const status = getStatusBadge(booking.status)
            const StatusIcon = status.icon

            return (
              <div key={booking._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Property Image */}
                    <Link 
                      to={`/properties/${booking.property._id}`}
                      className="w-full lg:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0 group"
                    >
                      <img
                        src={booking.property?.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=Property'}
                        alt={booking.property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Link 
                            to={`/properties/${booking.property._id}`}
                            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {booking.property.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">
                              {booking.property?.address}, {booking.property?.city}
                            </span>
                          </div>
                        </div>
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Visit Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.requestedDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Visit Time</p>
                            <p className="font-semibold text-gray-900">{booking.requestedTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* Seller Contact */}
                      {booking.status === 'ACCEPTED' && (
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Seller Contact</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="h-4 w-4 text-primary-600" />
                              <a href={`tel:${booking.seller?.phone}`} className="hover:text-primary-600">
                                {booking.seller?.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="h-4 w-4 text-primary-600" />
                              <a href={`mailto:${booking.seller?.email}`} className="hover:text-primary-600">
                                {booking.seller?.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.message && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm">Your Notes</h4>
                          <p className="text-sm text-gray-600">{booking.message}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/buyer/messages?propertyId=${booking.property._id}`}
                          className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message Seller
                        </Link>
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="btn-danger text-sm px-4 py-2 flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel Booking
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && !booking.hasReviewed && (
                          <Link
                            to={`/buyer/reviews/add?propertyId=${booking.property._id}`}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Write Review
                          </Link>
                        )}
                      </div>

                      {/* Booking Date */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !cancelling && setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Are you sure?</h4>
                <p className="text-sm text-red-700">
                  This action cannot be undone. The seller will be notified about the cancellation.
                </p>
              </div>
            </div>
          </div>
          {selectedBooking && (
            <div className="text-sm text-gray-600">
              <p><strong>Property:</strong> {selectedBooking.property.title}</p>
              <p><strong>Visit Date:</strong> {new Date(selectedBooking.requestedDate).toLocaleDateString('en-IN')}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
              className="btn-outline px-4 py-2"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="btn-danger px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Yes, Cancel
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MyBookings
