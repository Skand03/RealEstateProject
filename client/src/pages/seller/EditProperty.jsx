import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Building2, MapPin, Image as ImageIcon, X, Upload, Save, ArrowLeft, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { updateProperty, fetchPropertyById, selectPropertyLoading } from '../../features/property/propertySlice'
import { PROPERTY_TYPES, FURNISHING_STATUS } from '../../utils/constants'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../services/api'

const AMENITIES = [
  'Parking', 'Swimming Pool', 'Gym', 'Security', 'Power Backup',
  'Lift', 'Garden', 'Clubhouse', 'Wi-Fi', 'Play Area', 'CCTV'
]

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES = 10

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
)

const EditProperty = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectPropertyLoading)
  const imageInputRef = useRef(null)
  const [initialLoading, setInitialLoading] = useState(true)

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
    amenities: []
  })
  const [existingImages, setExistingImages] = useState([]) // URLs from server
  const [newImages, setNewImages] = useState([]) // { file, preview }
  const [removedImages, setRemovedImages] = useState([]) // URLs to remove
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setInitialLoading(true)
      const response = await api.get(`/properties/${id}`)
      const property = response.data.data
      
      // Populate form with existing data
      setForm({
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || PROPERTY_TYPES[0],
        listingType: property.listingType || 'SALE',
        price: property.price || '',
        area: property.area || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        furnishingStatus: property.furnishingStatus || FURNISHING_STATUS[2],
        city: property.location?.city || '',
        state: property.location?.state || '',
        address: property.location?.address || '',
        latitude: property.location?.coordinates?.[1] || '',
        longitude: property.location?.coordinates?.[0] || '',
        amenities: property.amenities || []
      })
      setExistingImages(property.images || [])
    } catch (err) {
      toast.error('Failed to load property details')
      navigate('/seller/my-properties')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleRemoveExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url))
    setRemovedImages(prev => [...prev, url])
  }

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files)
    const totalImages = existingImages.length + newImages.length

    if (totalImages + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    const validFiles = []
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`)
        continue
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`)
        continue
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      })
    }

    setNewImages(prev => [...prev, ...validFiles])
    e.target.value = ''
  }

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required'
    if (!form.area || form.area <= 0) newErrors.area = 'Valid area is required'
    if (!form.bedrooms || form.bedrooms < 0) newErrors.bedrooms = 'Valid bedroom count required'
    if (!form.bathrooms || form.bathrooms < 0) newErrors.bathrooms = 'Valid bathroom count required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (!form.state.trim()) newErrors.state = 'State is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    
    const totalImages = existingImages.length + newImages.length
    if (totalImages === 0) newErrors.images = 'At least one image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix all errors')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      
      // Append all form fields
      Object.keys(form).forEach(key => {
        if (key === 'amenities') {
          formData.append(key, JSON.stringify(form[key]))
        } else if (key === 'latitude' || key === 'longitude') {
          if (form[key]) formData.append(key, form[key])
        } else {
          formData.append(key, form[key])
        }
      })

      // Append existing images that weren't removed
      formData.append('existingImages', JSON.stringify(existingImages))
      
      // Append new image files
      newImages.forEach(img => {
        formData.append('images', img.file)
      })

      const response = await api.put(`/properties/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Property updated successfully!')
      navigate('/seller/my-properties')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update property')
    } finally {
      setSubmitting(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/seller/my-properties"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Properties
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
        <p className="text-gray-600">Update your property details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <SectionTitle
            icon={Building2}
            title="Basic Information"
            subtitle="Property title, type, and description"
          />
          
          <div className="space-y-4">
            <div>
              <label className="label">Property Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Spacious 3BHK Apartment in Andheri"
              />
              {errors.title && <p className="error-text">{errors.title}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Property Type *</label>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="input-field"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Listing Type *</label>
                <select
                  name="listingType"
                  value={form.listingType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe your property in detail..."
              />
              {errors.description && <p className="error-text">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card">
          <SectionTitle
            icon={Building2}
            title="Property Details"
            subtitle="Specifications and features"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Price ({form.listingType === 'RENT' ? 'per month' : 'total'}) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                placeholder="Enter amount in ₹"
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
                className={`input-field ${errors.area ? 'border-red-500' : ''}`}
                placeholder="e.g., 1200"
              />
              {errors.area && <p className="error-text">{errors.area}</p>}
            </div>

            <div>
              <label className="label">Bedrooms *</label>
              <input
                type="number"
                name="bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
                className={`input-field ${errors.bedrooms ? 'border-red-500' : ''}`}
                placeholder="Number of bedrooms"
              />
              {errors.bedrooms && <p className="error-text">{errors.bedrooms}</p>}
            </div>

            <div>
              <label className="label">Bathrooms *</label>
              <input
                type="number"
                name="bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                className={`input-field ${errors.bathrooms ? 'border-red-500' : ''}`}
                placeholder="Number of bathrooms"
              />
              {errors.bathrooms && <p className="error-text">{errors.bathrooms}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="label">Furnishing Status *</label>
              <select
                name="furnishingStatus"
                value={form.furnishingStatus}
                onChange={handleChange}
                className="input-field"
              >
                {FURNISHING_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-6">
            <label className="label mb-3">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.amenities.includes(amenity)
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <SectionTitle
            icon={MapPin}
            title="Location"
            subtitle="Property address and coordinates"
          />

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                  placeholder="e.g., Mumbai"
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
                  className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                  placeholder="e.g., Maharashtra"
                />
                {errors.state && <p className="error-text">{errors.state}</p>}
              </div>
            </div>

            <div>
              <label className="label">Full Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                className={`input-field resize-none ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Complete street address"
              />
              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Latitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 19.0760"
                />
              </div>

              <div>
                <label className="label">Longitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 72.8777"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <SectionTitle
            icon={ImageIcon}
            title="Property Images"
            subtitle={`Upload up to ${MAX_IMAGES} high-quality photos`}
          />

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(url)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">New Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {(existingImages.length + newImages.length) < MAX_IMAGES && (
            <div>
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={handleImageAdd}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload images
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or WEBP (max 5MB each)
                </p>
              </button>
            </div>
          )}
          {errors.images && <p className="error-text mt-2">{errors.images}</p>}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/seller/my-properties')}
            className="btn-outline px-8 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-8 py-3 flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Update Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProperty
