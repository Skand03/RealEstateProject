import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Save, Shield, Calendar, Home } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'
import { VERIFICATION_STATUS } from '../../utils/constants'
import { Link } from 'react-router-dom'

const SellerProfile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalBookings: 0,
    totalEarnings: 0
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/auth/me')
      const data = response.data.data
      const profile = { ...data.user, verificationStatus: data.verificationStatus }
      setProfileData(profile)
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: '', city: '', state: '', pincode: ''
      })
    } catch (err) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/properties/seller/mine', { params: { limit: 100 } })
      const properties = response.data.data?.properties || []
      setStats((current) => ({
        ...current,
        totalProperties: properties.length,
        activeListings: properties.filter((property) => property.status === 'ACTIVE').length,
      }))
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/auth/profile', formData)
      toast.success('Profile updated successfully')
      fetchProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getVerificationBadge = (status) => {
    const badgeMap = {
      [VERIFICATION_STATUS.NOT_SUBMITTED]: { variant: 'gray', label: 'Not Submitted' },
      [VERIFICATION_STATUS.PENDING]: { variant: 'warning', label: 'Pending' },
      [VERIFICATION_STATUS.APPROVED]: { variant: 'success', label: 'Verified' },
      [VERIFICATION_STATUS.REJECTED]: { variant: 'danger', label: 'Rejected' }
    }
    return badgeMap[status] || { variant: 'gray', label: status }
  }

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  const verificationBadge = getVerificationBadge(profileData?.verificationStatus)

  return (
    <div className="page-container max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Verification */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card text-center">
            <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{profileData?.fullName}</h2>
            <p className="text-sm text-gray-600 mb-3">{profileData?.email}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-4 w-4" />
              <Badge variant={verificationBadge.variant}>
                {verificationBadge.label}
              </Badge>
            </div>
            {profileData?.verificationStatus !== VERIFICATION_STATUS.APPROVED && (
              <Link to="/seller/verification" className="btn-primary text-sm w-full">
                {profileData?.verificationStatus === VERIFICATION_STATUS.NOT_SUBMITTED 
                  ? 'Start Verification' 
                  : 'View Verification Status'}
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary-600" />
              Your Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Properties</span>
                <span className="font-bold text-gray-900">{stats.totalProperties}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Listings</span>
                <span className="font-bold text-primary-600">{stats.activeListings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-bold text-gray-900">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-bold text-green-600">
                  ₹{stats.totalEarnings?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              Account Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Member Since</span>
                <p className="font-semibold text-gray-900">
                  {new Date(profileData?.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Role</span>
                <p className="font-semibold text-gray-900">Seller</p>
              </div>
              <div>
                <span className="text-gray-600">Account Status</span>
                <Badge variant="success" className="mt-1">Active</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Personal Information</h3>
            
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="label">
                  <User className="h-4 w-4 inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="label">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData?.email}
                  className="input-field bg-gray-50 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="label">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="label">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Street address"
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="400001"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Password Section */}
          <div className="card mt-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Security</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Password</p>
                <p className="text-sm text-gray-600">••••••••</p>
              </div>
              <button className="btn-outline text-sm px-4 py-2">
                Change Password
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card mt-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Quick Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/seller/my-properties" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                <Home className="h-5 w-5 text-primary-600 mb-2" />
                <h4 className="font-semibold text-gray-900">My Properties</h4>
                <p className="text-sm text-gray-600">Manage your listings</p>
              </Link>
              <Link to="/seller/booking-requests" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                <Calendar className="h-5 w-5 text-primary-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Booking Requests</h4>
                <p className="text-sm text-gray-600">View visit requests</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerProfile
