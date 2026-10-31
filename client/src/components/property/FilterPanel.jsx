import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { PROPERTY_TYPES, LISTING_TYPES, FURNISHING_STATUS, SORT_OPTIONS } from '../../utils/constants';

const FilterPanel = ({ filters, onFilterChange, onClear }) => {
  const [open, setOpen] = useState(false);

  const handle = (key, value) => onFilterChange({ ...filters, [key]: value });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 btn-secondary border border-gray-200"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {Object.values(filters).some(Boolean) && (
          <span className="h-2 w-2 rounded-full bg-primary-600" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-30 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter Properties</h3>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Listing Type */}
            <div>
              <label className="label">Listing Type</label>
              <select
                className="input-field"
                value={filters.listingType || ''}
                onChange={(e) => handle('listingType', e.target.value)}
              >
                <option value="">All</option>
                {Object.values(LISTING_TYPES).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="label">Property Type</label>
              <select
                className="input-field"
                value={filters.propertyType || ''}
                onChange={(e) => handle('propertyType', e.target.value)}
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min (₹)"
                  className="input-field"
                  value={filters.minPrice || ''}
                  onChange={(e) => handle('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max (₹)"
                  className="input-field"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handle('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="label">Min Bedrooms</label>
              <select
                className="input-field"
                value={filters.bedrooms || ''}
                onChange={(e) => handle('bedrooms', e.target.value)}
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label className="label">Furnishing Status</label>
              <select
                className="input-field"
                value={filters.furnishingStatus || ''}
                onChange={(e) => handle('furnishingStatus', e.target.value)}
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
                onChange={(e) => handle('sortBy', e.target.value)}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { onClear(); setOpen(false); }}
                className="btn-secondary flex-1 text-sm"
              >
                Clear All
              </button>
              <button
                onClick={() => setOpen(false)}
                className="btn-primary flex-1 text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
