'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, User, Mail, CheckCircle2, MailIcon, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { signUp, checkUsernameAvailability } from '../../../lib/auth'
import { useAuth } from '../../../components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PlayerSignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Check username availability when username changes
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length >= 3) {
        setCheckingUsername(true)
        const { available } = await checkUsernameAvailability(formData.username)
        setUsernameAvailable(available)
        setCheckingUsername(false)
      } else {
        setUsernameAvailable(null)
      }
    }

    const debounceTimer = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.username])

  const handleResendVerification = async () => {
    setIsResendingEmail(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      })

      if (error) {
        setError(`Failed to resend verification email: ${error.message}`)
      } else {
        setSuccess('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleSubmit = async () => {
    console.log('=== PLAYER FORM SUBMISSION STARTED ===')
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (usernameAvailable === false) {
      setError('Username is already taken. Please choose a different username.')
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting to sign up player:', { 
        email: formData.email, 
        username: formData.username,
        fullName: formData.fullName
      })

      const { user: newUser, error } = await signUp(
        formData.email, 
        formData.password, 
        formData.username,
        formData.fullName,
        'player'
      )

      console.log('Signup result:', { user: newUser, error })

      if (error) {
        console.error('Signup failed with error:', error)
        setError(error)
        return
      }

      if (newUser) {
        setSuccess('Account created successfully! Please check your email for verification.')
        setShowEmailVerification(true)
        
        // Refresh user state after successful signup
        setTimeout(async () => {
          try {
            await refreshUser()
          } catch (refreshError) {
            console.error('Error refreshing user:', refreshError)
            // Don't show error to user as signup was successful
          }
        }, 1000)
      } else {
        setError('Account creation succeeded but no user data was returned. Please try signing in.')
      }
    } catch (error) {
      console.error('Unexpected signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show email verification screen after successful signup
  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <div className="mb-6">
              <MailIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email!</h2>
              <p className="text-purple-200">
                We've sent a verification link to:
              </p>
              <p className="text-white font-semibold mt-2">{formData.email}</p>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                🎁 <strong>Welcome Bonus:</strong> 100 free betting tickets waiting for you after verification!
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="text-purple-300 text-sm space-y-2">
                <p>📧 <strong>Click the verification link</strong> in your email to activate your account.</p>
                <p>⏰ The link will expire in 24 hours.</p>
                <p>📱 Check your spam folder if you don't see it.</p>
              </div>

              <button
                onClick={handleResendVerification}
                disabled={isResendingEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResendingEmail ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Resend Verification Email
                  </>
                )}
              </button>

              <Link 
                href="/login"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-center transition-all"
              >
                Go to Login Page
              </Link>
            </div>

            <div className="text-center mt-6">
              <p className="text-purple-300 text-xs">
                Already verified? <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Player Signup</h2>
            <p className="text-purple-200">Join the AI Chess Arena</p>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
            <p className="text-blue-200 text-sm text-center">
              🎁 <strong>Welcome Bonus:</strong> Get 100 free betting tickets upon signup!
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Choose a username"
                  autoComplete="username"
                />
                {/* Username availability indicator */}
                {formData.username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checkingUsername ? (
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : usernameAvailable === true ? (
                      <CheckCircle2 className="text-green-400" size={20} />
                    ) : usernameAvailable === false ? (
                      <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    ) : null}
                  </div>
                )}
              </div>
              {formData.username.length >= 3 && usernameAvailable === false && (
                <p className="text-red-400 text-sm mt-1">Username is already taken</p>
              )}
              {formData.username.length >= 3 && usernameAvailable === true && (
                <p className="text-green-400 text-sm mt-1">Username is available</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Player Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-purple-200">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 