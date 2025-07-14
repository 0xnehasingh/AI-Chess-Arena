'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange, AuthUser } from '../../lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
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

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(({ user: currentUser, error: fetchError }) => {
      if (fetchError) {
        console.error('Initial user fetch error:', fetchError)
        setError(fetchError)
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    }).catch(error => {
      console.error('Unexpected error during initial user fetch:', error)
      setError('Failed to load user data')
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      console.log('Auth provider received user update:', user?.id)
      setUser(user)
      setLoading(false)
      setError(null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    refreshUser,
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
    if (!loading && !user && !error) {
      window.location.href = redirectTo
    }
  }, [user, loading, error, redirectTo])

  // If there's an auth error (like missing profile), redirect to recovery
  useEffect(() => {
    if (!loading && error && error.includes('profile')) {
      console.log('Profile error detected, redirecting to recovery')
      window.location.href = '/recover-profile'
    }
  }, [loading, error])

  return { user, loading, error }
} 