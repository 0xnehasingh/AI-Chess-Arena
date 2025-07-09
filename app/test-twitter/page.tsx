'use client'

import { useState } from 'react'
import { Twitter } from 'lucide-react'
import { signInWithTwitter } from '../../lib/auth'

export default function TestTwitterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTwitterTest = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const { error } = await signInWithTwitter('/test-twitter')
      
      if (error) {
        setError(error)
        setIsLoading(false)
      }
      // If successful, user will be redirected to Twitter
    } catch (error) {
      console.error('Twitter test error:', error)
      setError('Failed to initiate Twitter authentication')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Twitter OAuth Test</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleTwitterTest}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Twitter size={20} />
            {isLoading ? 'Connecting to Twitter...' : 'Test Twitter Login'}
          </button>
          
          <div className="mt-6 text-purple-200 text-sm">
            <p>This page tests Twitter OAuth configuration.</p>
            <p>Make sure you've configured the callback URLs properly.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 