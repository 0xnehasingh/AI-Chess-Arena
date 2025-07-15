'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange, AuthUser, signOut as authSignOut } from '../../lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      setError(null)
      const { user: currentUser, error: fetchError } = await getCurrentUser()
      
      if (fetchError) {
        console.error('Error fetching user:', fetchError)
        setError(fetchError)
        setUser(null)
      } else {
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setError('Failed to refresh user data')
      setUser(null)
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthProvider: Starting sign out process...')
      
      // Immediately clear user state
      setUser(null)
      setLoading(false)
      setError(null)
      
      // Call the auth service to sign out
      const { error: signOutError } = await authSignOut()
      
      if (signOutError) {
        console.error('Sign out error:', signOutError)
        // Even if there's an error, we've cleared local state
      }
      
      // Immediate redirect to landing page
      console.log('AuthProvider: Redirecting to landing page...')
      window.location.href = '/'
      
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      // Still clear state and redirect even on error
      setUser(null)
      setLoading(false)
      setError(null)
      window.location.href = '/'
    }
  }

  useEffect(() => {
    let isInitialLoad = true
    
    // Get initial user
    getCurrentUser().then(({ user: currentUser, error: fetchError }) => {
      if (isInitialLoad) {
        if (fetchError) {
          console.error('Initial user fetch error:', fetchError)
          setError(fetchError)
          setUser(null)
        } else {
          setUser(currentUser)
        }
        setLoading(false)
      }
    }).catch(error => {
      if (isInitialLoad) {
        console.error('Unexpected error during initial user fetch:', error)
        setError('Failed to load user data')
        setUser(null)
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      console.log('Auth provider received user update:', user?.id)
      setUser(user)
      if (!isInitialLoad) {
        setLoading(false)
      }
      setError(null)
    })

    return () => {
      isInitialLoad = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    refreshUser,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to require authentication
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading, error } = useAuth()
  
  useEffect(() => {
    // Only redirect if we're definitely not loading and have no user
    if (!loading && !user) {
      console.log('useRequireAuth: No user found, redirecting to:', redirectTo)
      
      // If there's a profile error, redirect to recovery instead
      if (error && error.includes('profile')) {
        console.log('Profile error detected, redirecting to recovery')
        window.location.href = '/recover-profile'
      } else if (!error) {
        // Only redirect to login if there's no error (clean logout)
        window.location.href = redirectTo
      }
    }
  }, [user, loading, error, redirectTo])

  return { user, loading, error }
} 