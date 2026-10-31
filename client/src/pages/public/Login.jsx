import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, loginWithSupabase, selectAuthLoading, selectAuthError, clearError } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (role === 'ADMIN' ? '/admin/dashboard' : role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard')
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, role, navigate, location])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    let active = true
    const exchangeGoogleSession = async () => {
      if (!supabase) return
      // A persisted Supabase session may be present from an earlier attempt.
      // Only exchange it for an application JWT after this tab initiated a
      // Google OAuth redirect; merely opening /login must not call the API.
      if (sessionStorage.getItem('hh_google_oauth_pending') !== 'true') return

      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        sessionStorage.removeItem('hh_google_oauth_pending')
        toast.error(`Unable to restore Google sign-in session: ${sessionError.message}`)
        return
      }
      if (!active) return
      if (!data.session || isAuthenticated) {
        sessionStorage.removeItem('hh_google_oauth_pending')
        return
      }
      const result = await dispatch(loginWithSupabase(data.session.access_token))
      sessionStorage.removeItem('hh_google_oauth_pending')
      if (loginWithSupabase.fulfilled.match(result)) {
        await supabase.auth.signOut()
        toast.success('Google login successful!')
      }
    }
    exchangeGoogleSession()
    return () => { active = false }
  }, [dispatch, isAuthenticated])

  const handleGoogleLogin = async () => {
    if (!supabase) {
      toast.error('Supabase is not configured. Add the client environment variables.')
      return
    }
    sessionStorage.setItem('hh_google_oauth_pending', 'true')
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    })
    if (signInError) {
      sessionStorage.removeItem('hh_google_oauth_pending')
      toast.error(signInError.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }
    const result = await dispatch(loginUser(formData))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Login successful!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-card" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                <Mail className="h-4 w-4 inline mr-1" />
                Email address
              </label>
              <input
                id="email"
                name="email"
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg py-3 text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="font-bold text-lg">G</span>
            Continue with Google
          </button>

          {/* Register link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
