import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2, MapPin, Image as ImageIcon, X, Upload, Shield,
  ChevronRight, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createProperty, selectPropertyLoading } from '../../features/property/propertySlice';
import { useAuth } from '../../hooks/useAuth';
import { VERIFICATION_STATUS, PROPERTY_TYPES, FURNISHING_STATUS } from '../../utils/constants';

const AMENITIES = [
  'Parking', 'Swimming Pool', 'Gym', 'Security', 'Power Backup',
  'Lift', 'Garden', 'Clubhouse', 'Wi-Fi',
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
    <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
      <Icon className="h-4 w-4 text-primary-600" />
    </div>
    <div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const VerificationGate = () => (
  <div className="page-container py-16 text-center max-w-lg">
    <div className="card">
      <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield className="h-8 w-8 text-yellow-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h2>
      <p className="text-gray-500 text-sm mb-6">
        You need to complete seller verification before you can list properties.
      </p>
      <Link to="/seller/verification" className="btn-primary inline-flex items-center gap-2">
        Complete Verification
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
);

const AddProperty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { verificationStatus } = useAuth();
  const loading = useSelector(selectPropertyLoading);
  const imageInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: PROPERTY_TYPES[0],
    listingType: 'SALE',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    furnishingStatus: FURNISHING_STATUS[2],
    city: '',
    state: '',
    address: '',
    latitude: '',
    longitude: '',
    amenities: [],
  });
  const [images, setImages] = useState([]); // { file, preview }
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    return <VerificationGate />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const current = images.length;
    const remaining = MAX_IMAGES - current;

    if (remaining <= 0) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const valid = [];
    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Only JPEG, PNG, or WebP allowed.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name}: File must be under 5MB.`);
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...valid]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price.';
    if (!form.area || Number(form.area) <= 0) errs.area = 'Enter a valid area.';
    if (!form.city.trim()) errs.city = 'City is required.';
    if (!form.state.trim()) errs.state = 'State is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (form.latitude === '' || Number(form.latitude) < -90 || Number(form.latitude) > 90) {
      errs.latitude = 'Enter a latitude between -90 and 90.';
    }
    if (form.longitude === '' || Number(form.longitude) < -180 || Number(form.longitude) > 180) {
      errs.longitude = 'Enter a longitude between -180 and 180.';
    }
    if (images.length === 0) errs.images = 'At least one image is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'amenities') {
        formData.append('amenities', JSON.stringify(val));
      } else if (!['bedrooms', 'bathrooms'].includes(key) || val !== '') {
        formData.append(key, val);
      }
    });
    images.forEach(({ file }) => formData.append('images', file));

    setSubmitting(true);
    const result = await dispatch(createProperty(formData));
    setSubmitting(false);

    if (createProperty.fulfilled.match(result)) {
      toast.success('Property listed successfully!');
      navigate('/seller/properties');
    } else {
      toast.error(result.payload || 'Failed to create property.');
    }
  };

  return (
    <div className="page-container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in all the details to list your property.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="card">
          <SectionTitle icon={Building2} title="Basic Information" />
          <div className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Spacious 3BHK Apartment in Bandra"
                className="input-field"
              />
              {errors.title && <p className="error-text">{errors.title}</p>}
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your property, its features, surroundings, and any highlights…"
                className="input-field resize-none"
              />
              {errors.description && <p className="error-text">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Property Details */}
        <div className="card">
          <SectionTitle icon={Building2} title="Property Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Property Type *</label>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input-field">
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Listing Type *</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                {['SALE', 'RENT'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, listingType: type }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      form.listingType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    For {type === 'SALE' ? 'Sale' : 'Rent'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 5000000"
                min="0"
                className="input-field"
              />
              {errors.price && <p className="error-text">{errors.price}</p>}
            </div>

            <div>
              <label className="label">Area (sq ft) *</label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. 1200"
                min="0"
                className="input-field"
              />
              {errors.area && <p className="error-text">{errors.area}</p>}
            </div>

            <div>
              <label className="label">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
                placeholder="e.g. 3"
                min="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                placeholder="e.g. 2"
                min="0"
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Furnishing Status</label>
              <select name="furnishingStatus" value={form.furnishingStatus} onChange={handleChange} className="input-field">
                {FURNISHING_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className="card">
          <SectionTitle icon={MapPin} title="Location" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="input-field"
              />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>

            <div>
              <label className="label">State *</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                className="input-field"
              />
              {errors.state && <p className="error-text">{errors.state}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label">Full Address *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Flat 12B, Sea View Towers, Bandra West"
                className="input-field"
              />
              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>

            <div>
              <label className="label">Latitude *</label>
              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 19.0596"
                step="any"
                className="input-field"
              />
              {errors.latitude && <p className="error-text">{errors.latitude}</p>}
            </div>

            <div>
              <label className="label">Longitude *</label>
              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 72.8296"
                step="any"
                className="input-field"
              />
              {errors.longitude && <p className="error-text">{errors.longitude}</p>}
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-600">
                  Tip: Use{' '}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Google Maps
                  </a>{' '}
                  to find exact coordinates for your property. Right-click the pin and copy the coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Amenities */}
        <div className="card">
          <SectionTitle icon={Building2} title="Amenities" subtitle="Check all that apply" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 5: Images */}
        <div className="card">
          <SectionTitle
            icon={ImageIcon}
            title="Property Images"
            subtitle={`Upload up to ${MAX_IMAGES} images (JPEG, PNG, WebP · max 5MB each)`}
          />

          {images.length < MAX_IMAGES && (
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors mb-4"
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                Click to add images ({images.length}/{MAX_IMAGES})
              </p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5MB each</p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageAdd}
              />
            </div>
          )}

          {images.length > 0 && (
            <>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg mb-3">
                <Info className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  First image will be set as the primary display image.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                    <img
                      src={img.preview}
                      alt={`preview-${idx}`}
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded font-medium">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {errors.images && <p className="error-text mt-2">{errors.images}</p>}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || loading}
            className="btn-primary flex items-center gap-2 px-8"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Listing Property…
              </>
            ) : (
              'List Property'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
