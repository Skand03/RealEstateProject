import { Calendar, Clock, MapPin, Phone, User } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, formatTime, getPrimaryImage } from '../../utils/formatters';
import { BOOKING_STATUS } from '../../utils/constants';

const BookingCard = ({
  booking,
  onCancel,
  onAccept,
  onReject,
  onComplete,
  onWriteReview,
  role = 'BUYER',
}) => {
  const property = booking.property || {};
  const seller = booking.seller || {};
  const buyer = booking.buyer || {};
  const image = getPrimaryImage(property.images);
  const status = booking.status;

  const canCancel =
    role === 'BUYER' &&
    (status === BOOKING_STATUS.PENDING || status === BOOKING_STATUS.ACCEPTED);

  const canAccept = role === 'SELLER' && status === BOOKING_STATUS.PENDING;
  const canReject = role === 'SELLER' && status === BOOKING_STATUS.PENDING;
  const canComplete = role === 'SELLER' && status === BOOKING_STATUS.ACCEPTED;
  const canReview =
    role === 'BUYER' && status === BOOKING_STATUS.COMPLETED && !booking.hasReviewed;

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Property Image */}
        <div className="flex-shrink-0">
          <img
            src={image}
            alt={property.title}
            className="w-full sm:w-28 h-24 object-cover rounded-xl"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">
                {property.title || 'Property'}
              </h3>
              {property.address && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {property.address}, {property.city}
                  </span>
                </div>
              )}
            </div>
            <Badge variant={status} text={status} />
          </div>

          {/* Visit Details */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary-500" />
              {formatDate(booking.requestedDate)}
            </span>
            {booking.requestedTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary-500" />
                {formatTime(booking.requestedTime)}
              </span>
            )}
          </div>

          {/* Contact Info */}
          {role === 'BUYER' && seller.fullName && (
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {seller.fullName}
              </span>
              {seller.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {seller.phone}
                </span>
              )}
            </div>
          )}

          {role === 'SELLER' && buyer.fullName && (
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {buyer.fullName}
              </span>
              {buyer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {buyer.phone}
                </span>
              )}
            </div>
          )}

          {/* Rejection / Notes */}
          {booking.rejectionReason && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mb-3">
              Reason: {booking.rejectionReason}
            </p>
          )}
          {booking.message && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 mb-3">
              Note: {booking.message}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {canCancel && (
              <button
                onClick={() => onCancel && onCancel(booking._id)}
                className="btn-danger text-sm py-1.5"
              >
                Cancel Booking
              </button>
            )}
            {canAccept && (
              <button
                onClick={() => onAccept && onAccept(booking._id)}
                className="btn-primary text-sm py-1.5"
              >
                Accept
              </button>
            )}
            {canReject && (
              <button
                onClick={() => onReject && onReject(booking._id)}
                className="btn-outline text-sm py-1.5"
              >
                Reject
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => onComplete && onComplete(booking._id)}
                className="btn-secondary text-sm py-1.5"
              >
                Mark Complete
              </button>
            )}
            {canReview && (
              <button
                onClick={() => onWriteReview && onWriteReview(booking)}
                className="btn-outline text-sm py-1.5"
              >
                ✍️ Write Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
