import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFavorites,
  removeFavorite,
  selectFavorites,
  selectFavoriteLoading,
} from '../../features/favorite/favoriteSlice';
import PropertyCard from '../../components/property/PropertyCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoriteLoading);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemove = async (propertyId) => {
    const result = await dispatch(removeFavorite(propertyId));
    if (removeFavorite.fulfilled.match(result)) {
      toast.success('Removed from favorites.');
    } else {
      toast.error('Failed to remove from favorites.');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="page-container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-heading flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          My Favorites
        </h1>
        <p className="text-gray-500 mt-1">Properties you've saved for later.</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading favorites…" />
      ) : favorites.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-red-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved properties yet</h2>
          <p className="text-gray-500 mb-6 max-w-sm">
            Start exploring properties and tap the heart icon to save your favorites here.
          </p>
          <Link to="/properties" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-5">
            {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const property = fav.property;
              if (!property) return null;
              return (
                <div key={fav._id} className="relative group">
                  <PropertyCard property={property} />

                  {/* Extra remove button overlay */}
                  <button
                    onClick={() => handleRemove(property._id)}
                    className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm"
                    title="Remove from favorites"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
