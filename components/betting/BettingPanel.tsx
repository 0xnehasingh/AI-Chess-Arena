'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../providers/AuthProvider'

interface BettingPanelProps {
  isGameActive?: boolean
  currentPlayer?: 'ChatGPT' | 'Claude'
}

export function BettingPanel({ isGameActive = true, currentPlayer }: BettingPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState(2)
  const [selectedAgent, setSelectedAgent] = useState<'ChatGPT' | 'Claude' | null>(null)
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })
  const [isLocked, setIsLocked] = useState(false)
  const [betError, setBetError] = useState('')
  const { user, loading, refreshUser } = useAuth()

  // Get user balance from auth context
  const userBalance = user?.tickets_balance || 0
  const isLoadingBalance = loading

  // Mock data - in real app this would come from props or API
  const bettingData = {
    chatgpt: {
      staked: 12000,
      supporters: 45
    },
    claude: {
      staked: 19800,
      supporters: 67
    }
  }

  const totalPool = bettingData.chatgpt.staked + bettingData.claude.staked
  const estimatedPayout = selectedAgent && selectedAmount 
    ? (selectedAmount * totalPool) / (selectedAgent === 'ChatGPT' ? bettingData.chatgpt.staked : bettingData.claude.staked)
    : 0

  const presetAmounts = [5, 10, 25, 50]

  // Mock countdown timer
  useEffect(() => {
    if (isGameActive && !isLocked) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev.minutes === 0 && prev.seconds === 0) {
            setIsLocked(true)
            return { minutes: 0, seconds: 0 }
          }
          
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 }
          } else if (prev.minutes > 0) {
            return { minutes: prev.minutes - 1, seconds: 59 }
          }
          
          return prev
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isGameActive, isLocked])

  // Initialize with some time for demo
  useEffect(() => {
    if (isGameActive) {
      setTimeLeft({ minutes: 2, seconds: 30 })
    }
  }, [isGameActive])

  const handleAmountSelect = (amount: number) => {
    if (!isLocked) {
      setSelectedAmount(amount)
      setBetError('')
      
      // Check if user has enough tickets
      if (amount > userBalance) {
        setBetError(`Insufficient tickets. You have ${userBalance} tickets but need ${amount}`)
      }
    }
  }

  const handleAgentSelect = (agent: 'ChatGPT' | 'Claude') => {
    if (!isLocked) {
      setSelectedAgent(agent)
    }
  }

  const handleLockInBet = async () => {
    if (!user) {
      setBetError('Please sign in to place bets')
      return
    }

    if (selectedAgent && selectedAmount > 0 && selectedAmount <= userBalance) {
      setBetError('')
      setIsLocked(true)
      
      try {
        // Get current session for authorization
        const { supabase } = await import('../../lib/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log('🔍 Session debug:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          tokenLength: session?.access_token?.length
        })
        
        if (!session?.access_token) {
          setBetError('Authentication required. Please sign in again.')
          setIsLocked(false)
          return
        }

        // Test auth with debug endpoint first
        console.log('🧪 Testing auth with debug endpoint...')
        const debugResponse = await fetch('/api/debug-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        const debugResult = await debugResponse.json()
        console.log('🧪 Debug auth result:', debugResult)
        
        if (!debugResponse.ok) {
          setBetError(`Auth debug failed: ${debugResult.error}`)
          setIsLocked(false)
          return
        }

        const response = await fetch('/api/place-bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            matchId: 'demo-match-id', // In real app, this would come from props
            champion: selectedAgent,
            amount: selectedAmount
          })
        })

        const result = await response.json()

        if (response.ok) {
          console.log('Bet placed successfully:', result)
          // Refresh user data to get updated ticket balance
          await refreshUser()
          setBetError('')
          // Keep bet locked to show success
        } else {
          setBetError(result.error || 'Failed to place bet')
          setIsLocked(false)
        }
      } catch (error) {
        console.error('Error placing bet:', error)
        setBetError('Network error. Please try again.')
        setIsLocked(false)
      }
    }
  }

  const formatTime = (time: { minutes: number; seconds: number }) => {
    return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`
  }

  // Show login prompt if user is not authenticated
  if (!user && !loading) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Match</h2>
          <p className="text-purple-200 mb-6">Sign in to place bets and earn tickets!</p>
          <a 
            href="/login"
            className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Sign In to Bet
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-400 text-purple-900 px-3 py-1 rounded-lg text-sm font-bold">
          ADMIT ONE
        </div>
        <h2 className="text-2xl font-bold">Join the Match</h2>
      </div>

      {/* Balance Display */}
      <div className="bg-white/10 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-purple-200">Your Tickets:</span>
          <span className="text-yellow-400 font-bold text-lg">
            {isLoadingBalance ? 'Loading...' : `${userBalance} 🎫`}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {betError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-6">
          <p className="text-red-300 text-sm">{betError}</p>
        </div>
      )}

      {/* Countdown Timer */}
      <div className="text-center mb-8">
        <p className="text-purple-200 mb-3">Ticket Lock Closes In:</p>
        <div className="text-6xl font-bold text-yellow-400 tracking-wider">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Support Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Support Your Champion:</h3>
        
        <div className="space-y-3">
          {/* ChatGPT Option */}
          <motion.button
            onClick={() => handleAgentSelect('ChatGPT')}
            disabled={isLocked}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedAgent === 'ChatGPT'
                ? 'border-green-400 bg-green-400/20'
                : 'border-white/20 hover:border-white/40'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            whileHover={!isLocked ? { scale: 1.02 } : {}}
            whileTap={!isLocked ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🤖</div>
              <div className="flex-1 text-left">
                <div className="text-lg font-semibold">Support ChatGPT</div>
                <div className="text-purple-200">
                  {bettingData.chatgpt.staked.toLocaleString()} $BEAM staked
                </div>
              </div>
              {selectedAgent === 'ChatGPT' && (
                <div className="text-green-400">✓</div>
              )}
            </div>
          </motion.button>

          {/* Claude Option */}
          <motion.button
            onClick={() => handleAgentSelect('Claude')}
            disabled={isLocked}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedAgent === 'Claude'
                ? 'border-green-400 bg-green-400/20'
                : 'border-white/20 hover:border-white/40'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            whileHover={!isLocked ? { scale: 1.02 } : {}}
            whileTap={!isLocked ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🧠</div>
              <div className="flex-1 text-left">
                <div className="text-lg font-semibold">Support Claude</div>
                <div className="text-purple-200">
                  {bettingData.claude.staked.toLocaleString()} $BEAM staked
                </div>
              </div>
              {selectedAgent === 'Claude' && (
                <div className="text-green-400">✓</div>
              )}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Stake Amount */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Stake Tickets ($BEAM)</h3>
        
        {/* Custom Amount Input */}
        <div className="mb-4">
          <input
            type="number"
            value={selectedAmount}
            onChange={(e) => !isLocked && setSelectedAmount(Number(e.target.value))}
            disabled={isLocked}
            className="w-full p-4 bg-purple-700/50 border border-white/20 rounded-xl text-white text-center text-2xl font-bold placeholder-white/50 disabled:opacity-50"
            placeholder="Enter amount"
            min="1"
          />
        </div>

        {/* Preset Amounts */}
        <div className="grid grid-cols-4 gap-3">
          {presetAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              disabled={isLocked}
              className={`p-3 rounded-xl font-bold transition-all ${
                selectedAmount === amount
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-700/50 hover:bg-purple-600/50'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={!isLocked ? { scale: 1.05 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
            >
              {amount}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info Text */}
      <p className="text-purple-200 text-sm mb-6 text-center">
        If your chosen agent wins, you'll receive a share of the total ticket pool.
      </p>

      {/* Lock In Button */}
      <motion.button
        onClick={handleLockInBet}
        disabled={!selectedAgent || selectedAmount <= 0 || isLocked || selectedAmount > userBalance}
        className={`w-full p-4 rounded-xl font-bold text-lg transition-all ${
          isLocked
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : selectedAgent && selectedAmount > 0 && selectedAmount <= userBalance
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={!isLocked && selectedAgent && selectedAmount > 0 && selectedAmount <= userBalance ? { scale: 1.02 } : {}}
        whileTap={!isLocked && selectedAgent && selectedAmount > 0 && selectedAmount <= userBalance ? { scale: 0.98 } : {}}
      >
        {isLocked ? (
          <div className="flex items-center justify-center gap-2">
            🔒 Bet Locked
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            🔒 Lock In Your Pick
          </div>
        )}
      </motion.button>

      {/* Pool Information */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-purple-200">Total Pool:</span>
          <span className="text-xl font-bold">{totalPool.toLocaleString()} $BEAM</span>
        </div>
        
        {selectedAgent && selectedAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-purple-200">Estimated Payout:</span>
            <span className="text-xl font-bold text-green-400">
              +{estimatedPayout.toFixed(1)} $BEAM
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
} 