'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { BetConfirmationModal } from './BetConfirmationModal'

export function BettingInterface() {
  const [selectedChampion, setSelectedChampion] = useState<'ChatGPT' | 'Claude' | null>(null)
  const [betAmount, setBetAmount] = useState<string>('10')
  const [timeLeft, setTimeLeft] = useState(35) // 35 seconds left to bet
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Live odds (would come from real-time data)
  const odds = {
    ChatGPT: 2.1,
    Claude: 1.8
  }

  const quickAmounts = [5, 10, 25, 50]

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const calculatePayout = () => {
    if (!selectedChampion || !betAmount) return 0
    const amount = parseFloat(betAmount)
    return amount * odds[selectedChampion]
  }

  const handlePlaceBet = () => {
    if (!selectedChampion || !betAmount || timeLeft <= 0) return
    setShowConfirmation(true)
  }

  const confirmBet = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setShowConfirmation(false)
    // Reset form
    setSelectedChampion(null)
    setBetAmount('10')
  }

  const isBettingClosed = timeLeft <= 0

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h2 className="text-xl font-bold text-white">Place Your Bet</h2>
          </div>
          
          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl p-4 text-center">
            <div className="text-purple-200 text-sm mb-1">Betting closes in</div>
            <div className="text-white text-3xl font-bold font-mono">
              00:{timeLeft.toString().padStart(2, '0')}s
            </div>
          </div>
        </div>

        {!isBettingClosed ? (
          <>
            {/* Champion Selection */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4">Pick Your Champion:</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChampion('ChatGPT')}
                  className={`w-full p-4 rounded-xl transition-all ${
                    selectedChampion === 'ChatGPT'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-500 hover:to-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">🧠</span>
                      <span className="text-white font-semibold">Bet on ChatGPT</span>
                    </div>
                    <div className="text-white font-bold text-xl">2.1x</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChampion('Claude')}
                  className={`w-full p-4 rounded-xl transition-all ${
                    selectedChampion === 'Claude'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">🧠</span>
                      <span className="text-white font-semibold">Bet on Claude</span>
                    </div>
                    <div className="text-white font-bold text-xl">1.8x</div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4">Enter Amount:</h3>
              
              {/* Amount Input */}
              <div className="relative mb-4">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white text-xl font-semibold placeholder-purple-300 focus:border-purple-500 focus:outline-none"
                  placeholder="10"
                  min="1"
                  max="1000"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 text-xl font-bold">$</span>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount.toString())}
                    className={`py-3 px-4 rounded-xl text-lg font-medium transition-all ${
                      betAmount === amount.toString()
                        ? 'bg-white text-purple-800'
                        : 'bg-white text-purple-600 hover:bg-gray-100'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Odds */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Live Odds:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 text-lg">ChatGPT</span>
                  <span className="text-cyan-400 font-bold text-xl">2.1x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 text-lg">Claude</span>
                  <span className="text-white font-bold text-xl">1.8x</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-red-400 text-lg font-semibold mb-2">Betting Closed</div>
            <p className="text-purple-300">The match has started. Good luck to all bettors!</p>
          </div>
        )}
      </div>

      <BetConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmBet}
        champion={selectedChampion}
        amount={parseFloat(betAmount || '0')}
        payout={calculatePayout()}
        isLoading={isLoading}
      />
    </>
  )
} 