import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, BedDouble, Bath, Maximize2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { addFavorite, removeFavorite, selectFavoriteIds } from '../../features/favorite/favoriteSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';
import { formatPrice, getPrimaryImage } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

const PropertyCard = ({ property }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const favoriteIds = useSelector(selectFavoriteIds);

  const isBuyer = user?.role === ROLES.BUYER;
  const isFavorited = favoriteIds.includes(property._id);

  const imageUrl = getPrimaryImage(
    property.images,
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop'
  );

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    if (!isBuyer) {
      toast.error('Only buyers can save favorites');
      return;
    }

    if (isFavorited) {
      dispatch(removeFavorite(property._id));
      toast.success('Removed from favorites');
    } else {
      dispatch(addFavorite(property._id));
      toast.success('Added to favorites');
    }
  };

  const listingBadgeClass =
    property.listingType === 'SALE' ? 'badge-success' : 'badge-info';

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group block bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop';
          }}
        />

        {/* Listing type badge */}
        <div className="absolute top-3 left-3">
          <span className={listingBadgeClass}>
            {property.listingType}
          </span>
        </div>

        {/* Favorite button — shown for authenticated buyers (or all users with redirect) */}
        {(isAuthenticated ? isBuyer : true) && (
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`}
            />
          </button>
        )}

        {/* Status badge (non-active) */}
        {property.status && property.status !== 'ACTIVE' && (
          <div className="absolute bottom-3 left-3">
            <span className="badge-warning">{property.status}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <p className="text-xl font-bold text-primary-700 font-heading">
          {formatPrice(property.price, property.listingType)}
        </p>

        {/* Title */}
        <h3 className="text-gray-900 font-semibold mt-1 leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary-500" />
          <span className="truncate">
            {property.city}{property.state ? `, ${property.state}` : ''}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-gray-400" />
              <span>{property.bedrooms} Bed</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-gray-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
              <span>{property.area.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Property type */}
        {property.propertyType && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="badge-gray text-xs">{property.propertyType}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
