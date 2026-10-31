import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, Map, LayoutGrid, X, Loader2, Building2, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import {
  fetchProperties,
  selectProperties,
  selectPropertyPagination,
  selectPropertyLoading,
} from '../../features/property/propertySlice';
import PropertyCard from '../../components/property/PropertyCard';
import Pagination from '../../components/common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPrice } from '../../utils/formatters';
import { PROPERTY_TYPES, LISTING_TYPES, FURNISHING_STATUS } from '../../utils/constants';

// Fix Leaflet icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Oldest First', value: 'createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
];

// ── Loading skeleton grid ────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

// ── Sidebar filter ──────────────────────────────────────────────────────────
const SidebarFilters = ({ filters, onChange, onClear }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const activeCount = Object.values(filters).filter(
    (v) => v !== '' && v !== undefined && v !== null
  ).length;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="card sticky top-24">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary-600" />
            <h2 className="font-heading font-semibold text-gray-900">Filters</h2>
            {activeCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear All
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* City */}
          <div>
            <label className="label">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Mumbai"
                className="input-field pl-9"
                value={filters.city || ''}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
          </div>

          {/* Listing type */}
          <div>
            <label className="label">Listing Type</label>
            <select
              className="input-field"
              value={filters.listingType || ''}
              onChange={(e) => set('listingType', e.target.value)}
            >
              <option value="">Buy or Rent</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>

          {/* Property type */}
          <div>
            <label className="label">Property Type</label>
            <select
              className="input-field"
              value={filters.propertyType || ''}
              onChange={(e) => set('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className="label">Price Range (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="input-field"
                value={filters.minPrice || ''}
                onChange={(e) => set('minPrice', e.target.value)}
                min="0"
              />
              <input
                type="number"
                placeholder="Max"
                className="input-field"
                value={filters.maxPrice || ''}
                onChange={(e) => set('maxPrice', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="label">Min Bedrooms</label>
            <select
              className="input-field"
              value={filters.bedrooms || ''}
              onChange={(e) => set('bedrooms', e.target.value)}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, '5+'].map((n) => (
                <option key={n} value={n === '5+' ? 5 : n}>{n} {n === 1 ? 'Bedroom' : 'Bedrooms'}</option>
              ))}
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="label">Furnishing Status</label>
            <select
              className="input-field"
              value={filters.furnishingStatus || ''}
              onChange={(e) => set('furnishingStatus', e.target.value)}
            >
              <option value="">Any</option>
              {FURNISHING_STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="label">Sort By</label>
            <select
              className="input-field"
              value={filters.sortBy || ''}
              onChange={(e) => set('sortBy', e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Properties = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const properties = useSelector(selectProperties);
  const pagination = useSelector(selectPropertyPagination);
  const loading = useSelector(selectPropertyLoading);

  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnishingStatus: searchParams.get('furnishingStatus') || '',
    sortBy: searchParams.get('sortBy') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const debouncedFilters = useDebounce(filters, 300);

  // Fetch when debounced filters change
  useEffect(() => {
    const params = {};
    Object.entries(debouncedFilters).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) params[k] = v;
    });
    if (searchQuery.trim()) params.search = searchQuery.trim();
    params.status = 'ACTIVE';
    dispatch(fetchProperties(params));
  }, [debouncedFilters, dispatch]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      city: '', propertyType: '', listingType: '',
      minPrice: '', maxPrice: '', bedrooms: '',
      furnishingStatus: '', sortBy: '-createdAt', page: 1,
    });
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mapProperties = properties.filter(
    (p) => p.location?.coordinates?.[1] && p.location?.coordinates?.[0]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="page-container py-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city, title, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                showMap
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {showMap ? <LayoutGrid className="h-4 w-4" /> : <Map className="h-4 w-4" />}
              <span className="hidden sm:inline">{showMap ? 'Grid View' : 'Map View'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="page-container py-6">
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <SidebarFilters
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    Loading properties...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{pagination?.total ?? properties.length}</span>
                    {' '}propert{(pagination?.total ?? properties.length) === 1 ? 'y' : 'ies'} found
                  </>
                )}
              </p>
            </div>

            {/* Map */}
            {showMap && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                {mapProperties.length > 0 ? (
                  <MapContainer
                    center={[
                      mapProperties[0].location.coordinates[1],
                      mapProperties[0].location.coordinates[0],
                    ]}
                    zoom={10}
                    style={{ height: '400px', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapProperties.map((p) => (
                      <Marker
                        key={p._id}
                        position={[p.location.coordinates[1], p.location.coordinates[0]]}
                      >
                        <Popup>
                          <div className="text-sm min-w-[160px]">
                            <p className="font-semibold text-gray-900 line-clamp-2">{p.title}</p>
                            <p className="text-primary-600 font-bold mt-1">
                              {formatPrice(p.price, p.listingType)}
                            </p>
                            <Link
                              to={`/properties/${p._id}`}
                              className="text-xs text-primary-600 underline mt-1 block"
                            >
                              View Details →
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                    No properties with location data to display on map.
                  </div>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No properties found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or search query.
                </p>
                <button onClick={handleClearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
