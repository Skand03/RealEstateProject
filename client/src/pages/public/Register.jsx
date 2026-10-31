import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, selectAuthLoading, selectAuthError, clearError } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { Building2, User, Mail, Phone, Lock, ShoppingBag, Store } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER'
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'ADMIN' ? '/admin/dashboard' : role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard', { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    const password = formData.password
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [formData.password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email')
      return
    }

    // The API validates the confirmation server-side as well, so send the
    // complete form instead of stripping confirmPassword from the request.
    const result = await dispatch(registerUser(formData))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful!')
    }
  }

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-gray-900">
              Haikyu<span className="text-primary-600">Heights</span>
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the broker-free real estate revolution
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 bg-white p-8 rounded-2xl shadow-card space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label className="label mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'BUYER'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ShoppingBag className={`h-8 w-8 mx-auto mb-2 ${formData.role === 'BUYER' ? 'text-primary-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">Buyer</h3>
                <p className="text-xs text-gray-500 mt-1">Looking for properties</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'SELLER'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Store className={`h-8 w-8 mx-auto mb-2 ${formData.role === 'SELLER' ? 'text-primary-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-gray-900">Seller</h3>
                <p className="text-xs text-gray-500 mt-1">Listing properties</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="label">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                className="input-field"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="label">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                className="input-field"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              <Mail className="h-4 w-4 inline mr-1" />
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">
              <Lock className="h-4 w-4 inline mr-1" />
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              className="input-field"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${i <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too short'}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="label">
              <Lock className="h-4 w-4 inline mr-1" />
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="input-field"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="error-text">Passwords do not match</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
