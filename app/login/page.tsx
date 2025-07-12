'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, Twitter, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { signIn, signInWithTwitter, handleOAuthCallback } from '../../lib/auth'
import { useAuth } from '../../components/providers/AuthProvider'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTwitterLoading, setIsTwitterLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  // Helper function to get redirect path based on user role
  const getRedirectPath = (userRole: string | undefined) => {
    return userRole === 'partner' ? '/partner-dashboard' : '/home'
  }

  // Handle OAuth callback on component mount
  useEffect(() => {
    const handleTwitterCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')
      
      if (accessToken || refreshToken) {
        console.log('=== TWITTER OAUTH CALLBACK DETECTED ON LOGIN PAGE ===')
        setIsTwitterLoading(true)
        
        try {
          const { user: oauthUser, error } = await handleOAuthCallback('partner')
          
          if (error) {
            setError(error)
            setIsTwitterLoading(false)
            return
          }

          if (oauthUser) {
            setSuccess('Twitter sign in successful! Welcome back!')
            await refreshUser()
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
            
            setTimeout(() => {
              router.push(getRedirectPath(oauthUser.user_role))
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
      router.push(getRedirectPath(user.user_role))
    }
  }, [user, router, isTwitterLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTwitterSignIn = async () => {
    console.log('=== TWITTER SIGN IN STARTED FROM LOGIN PAGE ===')
    setIsTwitterLoading(true)
    setError('')
    
    try {
      const { error } = await signInWithTwitter('/login')
      
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

  const handleSubmit = async () => {
    console.log('=== LOGIN FORM SUBMISSION STARTED ===')
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting sign in for:', formData.email)

      const { user: signedInUser, error } = await signIn(formData.email, formData.password)

      console.log('Sign in result:', { user: signedInUser, error })

      if (error) {
        setError(error)
        setIsLoading(false)
        return
      }

      if (signedInUser) {
        setSuccess('Sign in successful! Welcome back!')
        await refreshUser()
        
        setTimeout(() => {
          router.push(getRedirectPath(signedInUser.user_role))
        }, 2000)
      }
    } catch (error) {
      console.error('Sign in error:', error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-purple-200">Sign in to your account</p>
          </div>

          {/* Twitter OAuth Button */}
          <button
            type="button"
            onClick={handleTwitterSignIn}
            disabled={isTwitterLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 mb-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Twitter size={20} />
            {isTwitterLoading ? 'Connecting...' : 'Continue with Twitter'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-purple-900 text-purple-200">or sign in with email</span>
            </div>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-12 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-purple-200">
              New player?{' '}
              <Link href="/signup/player" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up here
              </Link>
            </p>
            <p className="text-purple-200">
              Want to be a partner?{' '}
              <Link href="/signup/partner" className="text-blue-400 hover:text-blue-300 font-medium">
                Partner signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 