'use client'

import { useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from './providers/AuthProvider'

export default function ProfileRecovery() {
  const [isRecovering, setIsRecovering] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRole, setSelectedRole] = useState<'player' | 'partner'>('player')
  const { refreshUser } = useAuth()

  const handleRecovery = async () => {
    setIsRecovering(true)
    setError('')
    setSuccess('')

    try {
      // Get the current session token
      const { data: { session } } = await import('../lib/supabase').then(({ supabase }) => 
        supabase.auth.getSession()
      )

      if (!session?.access_token) {
        setError('No valid session found. Please sign in again.')
        setIsRecovering(false)
        return
      }

      // Call our simplified profile recovery API
      const response = await fetch('/api/create-profile-direct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRole: selectedRole
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to recover profile')
        setIsRecovering(false)
        return
      }

      setSuccess('Profile recovered successfully!')
      
      // Refresh the auth context
      await refreshUser()
      
      // Redirect to profile after a short delay
      setTimeout(() => {
        window.location.href = '/profile'
      }, 2000)

    } catch (error) {
      console.error('Profile recovery error:', error)
      setError('An unexpected error occurred during profile recovery')
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile Recovery</h2>
            <p className="text-purple-200">
              It looks like your profile data is missing. Don't worry, we can recover it from your account information.
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
            <div className="text-center">
              <p className="text-purple-300 text-sm mb-6">
                This will recreate your profile using your account information. Your account will remain intact.
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">What type of account do you have?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRole('player')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'player'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-purple-200 hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="font-medium">Player</div>
                    <div className="text-xs mt-1 opacity-80">Betting & gaming account</div>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedRole('partner')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedRole === 'partner'
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-purple-200 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🤝</div>
                    <div className="font-medium">Partner</div>
                    <div className="text-xs mt-1 opacity-80">Business partnership</div>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleRecovery}
              disabled={isRecovering}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecovering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Recovering Profile...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Recover My Profile
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-purple-300 text-xs">
                If this doesn't work, please contact support with your email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 