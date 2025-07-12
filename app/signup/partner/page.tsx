'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, User, Mail, Globe, Twitter, CheckCircle2, MailIcon, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { signUp, signInWithTwitter, handleOAuthCallback } from '../../../lib/auth'
import { useAuth } from '../../../components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PartnerSignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    projectName: '',
    website: '',
    twitter: '',
    description: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTwitterLoading, setIsTwitterLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  // Handle OAuth callback on component mount
  useEffect(() => {
    const handleTwitterCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')
      
      if (accessToken || refreshToken) {
        console.log('=== TWITTER OAUTH CALLBACK DETECTED ===')
        setIsTwitterLoading(true)
        
        try {
          const { user: oauthUser, error } = await handleOAuthCallback('partner')
          
          if (error) {
            setError(error)
            setIsTwitterLoading(false)
            return
          }

          if (oauthUser) {
            setSuccess('Twitter authentication successful! Welcome!')
            await refreshUser()
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
            
            setTimeout(() => {
              router.push('/partner-dashboard')
            }, 2000)
          }
        } catch (error) {
          console.error('Twitter callback error:', error)
          setError('Failed to complete Twitter authentication')
        } finally {
          setIsTwitterLoading(false)
        }
      }
    }

    handleTwitterCallback()
  }, [refreshUser, router])

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isTwitterLoading) {
      router.push('/partner-dashboard')
    }
  }, [user, router, isTwitterLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate username from project name
    if (name === 'projectName' && value) {
      const generatedUsername = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20)
      
      setFormData(prev => ({
        ...prev,
        username: generatedUsername
      }))
    }
  }

  const handleTwitterSignIn = async () => {
    console.log('=== TWITTER SIGN IN STARTED ===')
    setIsTwitterLoading(true)
    setError('')
    
    try {
      const { error } = await signInWithTwitter('/signup/partner')
      
      if (error) {
        setError(error)
        setIsTwitterLoading(false)
      }
      // If successful, user will be redirected to Twitter, then back to this page
    } catch (error) {
      console.error('Twitter sign in error:', error)
      setError('Failed to initiate Twitter authentication')
      setIsTwitterLoading(false)
    }
  }

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
    console.log('=== PARTNER FORM SUBMISSION STARTED ===')
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.projectName) {
      setError('Please fill in all required fields')
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

    try {
      console.log('Attempting to sign up partner:', { 
        email: formData.email, 
        username: formData.username,
        fullName: formData.fullName,
        projectName: formData.projectName
      })

      const { user: newUser, error } = await signUp(
        formData.email, 
        formData.password, 
        formData.username,
        formData.fullName,
        'partner'
      )

      console.log('Signup result:', { user: newUser, error })

      if (error) {
        console.error('Partner signup failed with error:', error)
        setError(error)
        return
      }

      if (newUser) {
        setSuccess('Partner account created successfully! Please check your email for verification.')
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
      console.error('Unexpected partner signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isTwitterLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Completing Twitter authentication...</p>
        </div>
      </div>
    )
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

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4 mb-6">
              <p className="text-purple-200 text-sm">
                🚀 <strong>Partner Benefits:</strong> Access to API, revenue sharing, and premium support!
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
      <div className="max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Partner Signup</h2>
            <p className="text-purple-200">Join as an AI Chess Arena Partner</p>
          </div>

          {/* Twitter Sign In */}
          <div className="mb-6">
            <button
              onClick={handleTwitterSignIn}
              disabled={isTwitterLoading}
              className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTwitterLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Twitter size={20} />
                  Continue with Twitter
                </>
              )}
            </button>
            
            <div className="text-center my-4">
              <span className="text-purple-300 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-3">or</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4 mb-6">
            <p className="text-purple-200 text-sm text-center">
              🚀 <strong>Partner Benefits:</strong> API access, revenue sharing, and premium support!
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
                Full Name *
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

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Project/Company Name *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your project/company name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Email *
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
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Auto-generated from project name"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://yourproject.com"
                />
              </div>
            </div>

            {/* Twitter Handle */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Twitter Handle
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="@yourhandle"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Project Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Tell us about your project..."
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password *
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
                Confirm Password *
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
              {isLoading ? 'Creating Account...' : 'Create Partner Account'}
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