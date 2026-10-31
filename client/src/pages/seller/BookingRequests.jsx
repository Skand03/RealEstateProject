import { useState, useEffect } from 'react'
import { Calendar, MapPin, Home, Check, X, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { Link } from 'react-router-dom'

const BookingRequests = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionType, setActionType] = useState(null) // 'ACCEPT' or 'REJECT'
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchBookingRequests()
  }, [])

  const fetchBookingRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/seller/mine')
      setBookings(response.data.data?.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking requests')
      toast.error('Failed to load booking requests')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', icon: Clock },
      ACCEPTED: { variant: 'success', icon: Check },
      REJECTED: { variant: 'danger', icon: X },
      CANCELLED: { variant: 'danger', icon: X },
      COMPLETED: { variant: 'info', icon: Check }
    }
    const config = statusMap[status] || { variant: 'gray', icon: Clock }
    return { ...config, label: status }
  }

  const handleActionClick = (booking, type) => {
    setSelectedBooking(booking)
    setActionType(type)
    setShowActionModal(true)
  }

  const handleConfirmAction = async () => {
    setProcessing(true)
    try {
      const endpoint = actionType === 'ACCEPT'
        ? `/bookings/${selectedBooking._id}/accept`
        : `/bookings/${selectedBooking._id}/reject`
      
      await api.patch(endpoint)
      toast.success(`Booking ${actionType === 'ACCEPT' ? 'accepted' : 'rejected'} successfully`)
      setShowActionModal(false)
      fetchBookingRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setProcessing(false)
    }
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'ALL' ? true : booking.status === filter
  )

  const filterOptions = [
    { value: 'ALL', label: 'All Requests', count: bookings.length },
    { value: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { value: 'ACCEPTED', label: 'Accepted', count: bookings.filter(b => b.status === 'ACCEPTED').length },
    { value: 'REJECTED', label: 'Rejected', count: bookings.filter(b => b.status === 'REJECTED').length },
    { value: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
    { value: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length }
  ]

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Requests</h1>
        <p className="text-gray-600">Manage property visit requests from buyers</p>
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
            {filter === 'ALL' ? 'No booking requests yet' : `No ${filter.toLowerCase()} bookings`}
          </h3>
          <p className="text-gray-600">
            {filter === 'ALL' 
              ? 'Booking requests will appear here when buyers want to visit your properties'
              : 'You don\'t have any bookings with this status'}
          </p>
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

                      {/* Visit Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Requested Visit Date</p>
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

                      {/* Buyer Information */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">Buyer Information</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">{booking.buyer?.fullName}</span>
                          </div>
                          {booking.status === 'ACCEPTED' && (
                            <>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="h-4 w-4 text-primary-600" />
                                <a href={`tel:${booking.buyer?.phone}`} className="hover:text-primary-600">
                                  {booking.buyer?.phone}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="h-4 w-4 text-primary-600" />
                                <a href={`mailto:${booking.buyer?.email}`} className="hover:text-primary-600">
                                  {booking.buyer?.email}
                                </a>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm">Buyer's Notes</h4>
                          <p className="text-sm text-gray-600">{booking.message}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleActionClick(booking, 'ACCEPT')}
                              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Accept Booking
                            </button>
                            <button
                              onClick={() => handleActionClick(booking, 'REJECT')}
                              className="btn-danger text-sm px-4 py-2 flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </button>
                          </>
                        )}
                        <Link
                          to={`/seller/messages?buyerId=${booking.buyer._id}`}
                          className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message Buyer
                        </Link>
                      </div>

                      {/* Booking Date */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Requested on {new Date(booking.createdAt).toLocaleDateString('en-IN', {
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

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => !processing && setShowActionModal(false)}
        title={actionType === 'ACCEPT' ? 'Accept Booking' : 'Reject Booking'}
      >
        <div className="space-y-4">
          <div className={`border-2 rounded-lg p-4 ${
            actionType === 'ACCEPT' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={actionType === 'ACCEPT' ? 'text-green-900' : 'text-red-900'}>
              {actionType === 'ACCEPT'
                ? 'Are you sure you want to accept this booking? The buyer can then contact you directly.'
                : 'Are you sure you want to reject this booking request?'}
            </p>
          </div>
          {selectedBooking && (
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Property:</strong> {selectedBooking.property.title}</p>
              <p><strong>Buyer:</strong> {selectedBooking.buyer?.fullName}</p>
              <p><strong>Visit Date:</strong> {new Date(selectedBooking.requestedDate).toLocaleDateString('en-IN')}</p>
              <p><strong>Visit Time:</strong> {selectedBooking.requestedTime}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowActionModal(false)}
              disabled={processing}
              className="btn-outline px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={processing}
              className={`px-4 py-2 flex items-center gap-2 disabled:opacity-50 ${
                actionType === 'ACCEPT' ? 'btn-primary' : 'btn-danger'
              }`}
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'ACCEPT' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {actionType === 'ACCEPT' ? 'Accept' : 'Reject'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BookingRequests
