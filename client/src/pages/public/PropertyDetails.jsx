import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, BedDouble, Bath, Maximize2, Building2, CheckCircle,
  Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight,
  MessageSquare, Calendar, Star, Loader2, User, Shield,
  Tag, Home, Layers,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import toast from 'react-hot-toast';

import {
  fetchPropertyById,
  selectCurrentProperty,
  selectPropertyLoading,
} from '../../features/property/propertySlice';
import {
  addFavorite, removeFavorite, selectFavoriteIds,
} from '../../features/favorite/favoriteSlice';
import {
  selectIsAuthenticated, selectCurrentUser,
} from '../../features/auth/authSlice';
import { createBooking } from '../../features/booking/bookingSlice';
import { reviewService } from '../../services/review.service';
import { conversationService } from '../../services/conversation.service';
import Modal from '../../components/common/Modal';
import RatingStars from '../../components/common/RatingStars';
import { formatPrice, formatDate, timeAgo } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

// Fix Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ── Image gallery ────────────────────────────────────────────────────────────
const ImageGallery = ({ images }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-80 sm:h-[420px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <Building2 className="h-16 w-16 text-gray-300" />
      </div>
    );
  }

  const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  const prev = () => setActiveIdx((i) => (i === 0 ? sorted.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === sorted.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative h-80 sm:h-[420px] bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={sorted[activeIdx]?.url}
          alt={`Property image ${activeIdx + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop';
          }}
        />
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activeIdx + 1} / {sorted.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img._id || i}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 h-16 w-24 rounded-xl overflow-hidden border-2 transition-colors ${
                i === activeIdx ? 'border-primary-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Detail chip ──────────────────────────────────────────────────────────────
const DetailChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
    <div className="h-9 w-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-primary-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
    </div>
  </div>
);

// ── Review card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div className="border border-gray-100 rounded-xl p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {review.buyer?.fullName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{review.buyer?.fullName || 'User'}</p>
          <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
        </div>
      </div>
      <RatingStars rating={review.rating} size="sm" />
    </div>
    {review.comment && (
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{review.comment}</p>
    )}
  </div>
);

// ── Booking modal ────────────────────────────────────────────────────────────
const BookingModal = ({ isOpen, onClose, property, onSubmit, loading }) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ visitDate: '', visitTime: '', notes: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.visitDate) { setError('Please select a visit date.'); return; }
    if (!form.visitTime) { setError('Please select a visit time.'); return; }
    if (new Date(`${form.visitDate}T00:00:00`) < new Date(`${today}T00:00:00`)) {
      setError('Visit date cannot be in the past.');
      return;
    }
    onSubmit({
      propertyId: property._id,
      requestedDate: form.visitDate,
      requestedTime: form.visitTime,
      message: form.notes,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a Property Visit" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{property?.title}</p>
            <p className="text-xs text-gray-500">{property?.city}, {property?.state}</p>
          </div>
        </div>

        <div>
          <label className="label">Visit Date *</label>
          <input
            type="date"
            className="input-field"
            min={today}
            value={form.visitDate}
            onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Visit Time *</label>
          <input
            type="time"
            className="input-field"
            value={form.visitTime}
            onChange={(e) => setForm((f) => ({ ...f, visitTime: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            rows={3}
            placeholder="Any specific requirements or questions for the seller..."
            className="input-field resize-none"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Visit
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Write review modal ────────────────────────────────────────────────────────
const WriteReviewModal = ({ isOpen, onClose, propertyId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    try {
      setLoading(true);
      await reviewService.createReview({ propertyId, rating, comment });
      toast.success('Review submitted!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Review" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Your Rating</label>
          <RatingStars rating={rating} size="lg" interactive onChange={setRating} />
        </div>
        <div>
          <label className="label">Your Review</label>
          <textarea
            rows={4}
            placeholder="Share your experience with this property..."
            className="input-field resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Review
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const property = useSelector(selectCurrentProperty);
  const loading = useSelector(selectPropertyLoading);
  const favoriteIds = useSelector(selectFavoriteIds);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const isBuyer = user?.role === ROLES.BUYER;
  const isFavorited = favoriteIds.includes(id);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [hasCompletedBooking, setHasCompletedBooking] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchPropertyById(id));
  }, [id, dispatch]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setReviewsLoading(true);
        const res = await reviewService.getPropertyReviews(id, { limit: 20 });
        const data = res.data.data;
        setReviews(data.reviews || []);
        // Calculate average
        const rev = data.reviews || [];
        if (rev.length > 0) {
          const avg = rev.reduce((s, r) => s + r.rating, 0) / rev.length;
          setReviewStats({ avg: Math.round(avg * 10) / 10, count: rev.length });
        }
      } catch {
        // ignore
      } finally {
        setReviewsLoading(false);
      }
    };
    load();
  }, [id]);

  // Check if buyer has a completed booking
  useEffect(() => {
    if (!isAuthenticated || !isBuyer || !id) return;
    const check = async () => {
      try {
        const { bookingService } = await import('../../services/booking.service');
        const res = await bookingService.getBuyerBookings({ propertyId: id, status: 'COMPLETED' });
        const bookings = res.data.data.bookings || [];
        setHasCompletedBooking(bookings.length > 0);
      } catch {
        // ignore
      }
    };
    check();
  }, [id, isAuthenticated, isBuyer]);

  const handleFavorite = () => {
    if (!isAuthenticated) { toast.error('Please login to save favorites'); return; }
    if (!isBuyer) { toast.error('Only buyers can save favorites'); return; }
    if (isFavorited) {
      dispatch(removeFavorite(id));
      toast.success('Removed from favorites');
    } else {
      dispatch(addFavorite(id));
      toast.success('Added to favorites');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleBookVisit = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async (data) => {
    try {
      setBookingLoading(true);
      await dispatch(createBooking(data)).unwrap();
      toast.success('Visit request sent to the seller!');
      setBookingModalOpen(false);
    } catch (err) {
      toast.error(err || 'Failed to book visit');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMessageSeller = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role === ROLES.BUYER) {
      try {
        const response = await conversationService.createOrGetConversation(id);
        navigate(`/buyer/messages?conversationId=${response.data.data.conversation._id}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to start a conversation');
      }
    } else {
      toast.error('Only buyers can message sellers');
    }
  };

  const refreshReviews = async () => {
    try {
      const res = await reviewService.getPropertyReviews(id, { limit: 20 });
      const rev = res.data.data.reviews || [];
      setReviews(rev);
      if (rev.length > 0) {
        const avg = rev.reduce((s, r) => s + r.rating, 0) / rev.length;
        setReviewStats({ avg: Math.round(avg * 10) / 10, count: rev.length });
      }
    } catch { /* ignore */ }
  };

  if (loading && !property) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!property && !loading) {
    return (
      <div className="page-container py-20 text-center">
        <Building2 className="h-14 w-14 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Property not found</h2>
        <p className="text-gray-500 mb-6">This property may have been removed or is unavailable.</p>
        <Link to="/properties" className="btn-primary">Browse Properties</Link>
      </div>
    );
  }

  if (!property) return null;

  const lat = property.location?.coordinates?.[1];
  const lng = property.location?.coordinates?.[0];

  const statusBadge = {
    ACTIVE: 'badge-success',
    SOLD: 'badge-danger',
    RENTED: 'badge-warning',
    INACTIVE: 'badge-gray',
    PENDING: 'badge-warning',
  }[property.status] || 'badge-gray';

  return (
    <div className="bg-gray-50 pb-16">
      {/* Back button */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-gray-300">/</span>
          <Link to="/properties" className="text-sm text-gray-600 hover:text-primary-600">Properties</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-900 truncate max-w-xs">{property.title}</span>
        </div>
      </div>

      <div className="page-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <ImageGallery images={property.images} />
            </div>

            {/* Header info */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={property.listingType === 'SALE' ? 'badge-success' : 'badge-info'}>
                      FOR {property.listingType}
                    </span>
                    <span className={statusBadge}>{property.status}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-2 text-gray-500">
                    <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <span className="text-sm">
                      {property.address && `${property.address}, `}
                      {property.city}, {property.state}
                    </span>
                  </div>
                  {reviewStats.count > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <RatingStars rating={Math.round(reviewStats.avg)} size="sm" />
                      <span className="text-sm font-medium text-gray-700">{reviewStats.avg}</span>
                      <span className="text-sm text-gray-400">({reviewStats.count} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {isBuyer && (
                    <button
                      onClick={handleFavorite}
                      className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${
                        isFavorited
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
                      }`}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="h-10 w-10 rounded-xl border border-gray-200 text-gray-400 flex items-center justify-center hover:text-primary-600 hover:border-primary-200 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-3xl font-bold font-heading text-primary-700 mt-5">
                {formatPrice(property.price, property.listingType)}
              </p>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.bedrooms != null && (
                  <DetailChip icon={BedDouble} label="Bedrooms" value={property.bedrooms} />
                )}
                {property.bathrooms != null && (
                  <DetailChip icon={Bath} label="Bathrooms" value={property.bathrooms} />
                )}
                {property.area && (
                  <DetailChip icon={Maximize2} label="Area" value={`${property.area.toLocaleString()} sq.ft`} />
                )}
                {property.propertyType && (
                  <DetailChip icon={Building2} label="Property Type" value={property.propertyType} />
                )}
                {property.furnishingStatus && (
                  <DetailChip icon={Home} label="Furnishing" value={property.furnishingStatus} />
                )}
                {property.totalFloors != null && (
                  <DetailChip icon={Layers} label="Total Floors" value={property.totalFloors} />
                )}
                {property.floorNumber != null && (
                  <DetailChip icon={Layers} label="Floor" value={property.floorNumber} />
                )}
                {property.facing && (
                  <DetailChip icon={Tag} label="Facing" value={property.facing} />
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="text-lg font-heading font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {property.description}
                </p>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">Location</h2>
              {lat && lng ? (
                <MapContainer
                  center={[lat, lng]}
                  zoom={15}
                  style={{ height: '320px', width: '100%' }}
                  className="rounded-xl z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{property.title}</p>
                        <p className="text-primary-600">{formatPrice(property.price, property.listingType)}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  Exact location not available
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.address && `${property.address}, `}{property.city}, {property.state}
              </p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-gray-900">Reviews</h2>
                  {reviewStats.count > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={Math.round(reviewStats.avg)} size="sm" />
                      <span className="text-sm text-gray-600">
                        {reviewStats.avg} out of 5 ({reviewStats.count} reviews)
                      </span>
                    </div>
                  )}
                </div>
                {isAuthenticated && isBuyer && hasCompletedBooking && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="btn-outline text-sm flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" /> Write a Review
                  </button>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — sticky sidebar */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-2xl p-6 shadow-card sticky top-24">
              <p className="text-2xl font-bold font-heading text-primary-700 mb-1">
                {formatPrice(property.price, property.listingType)}
              </p>
              <p className="text-sm text-gray-500 mb-5">
                {property.area ? `₹${Math.round(property.price / property.area).toLocaleString('en-IN')} / sq.ft` : 'Negotiable'}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleBookVisit}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" /> Book a Visit
                </button>
                <button
                  onClick={handleMessageSeller}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> Message Seller
                </button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  <Link to="/login" className="text-primary-600 hover:underline">Login</Link> to contact seller or book a visit
                </p>
              )}
            </div>

            {/* Seller card */}
            {property.seller && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="font-heading font-semibold text-gray-900 mb-4">About the Seller</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {property.seller.avatar?.url ? (
                      <img src={property.seller.avatar.url} alt={property.seller.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-primary-700 font-bold text-lg">
                        {property.seller.fullName?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{property.seller.fullName}</p>
                    <p className="text-xs text-gray-500">Property Owner</p>
                  </div>
                </div>
                {property.seller.isVerified && (
                  <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 mb-4">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium">Verified Seller</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  {property.seller.phone && (
                    <p className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Member since {new Date(property.seller.createdAt).getFullYear?.() || '2024'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Commission note */}
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <p className="text-xs text-primary-700 font-medium mb-1">Platform Fee</p>
              <p className="text-sm text-primary-600">
                A transparent 2.5% commission applies upon successful deal — no hidden charges.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={property}
        onSubmit={handleBookingSubmit}
        loading={bookingLoading}
      />

      {/* Review modal */}
      <WriteReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        propertyId={id}
        onSuccess={refreshReviews}
      />
    </div>
  );
};

export default PropertyDetails;
