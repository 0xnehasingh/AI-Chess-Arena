'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp } from 'lucide-react'

interface BetConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  champion: 'ChatGPT' | 'Claude' | null
  amount: number
  payout: number
  isLoading: boolean
}

export function BetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  champion,
  amount,
  payout,
  isLoading
}: BetConfirmationModalProps) {
  if (!champion) return null

  const odds = champion === 'ChatGPT' ? 2.1 : 1.8

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-3xl p-8 w-full max-w-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Confirm Your Bet</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Bet Details Card */}
              <div className="bg-slate-700/50 rounded-2xl p-6 mb-8 space-y-6">
                {/* Betting on */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-lg">Betting on:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <span className={`text-xl font-bold ${
                      champion === 'ChatGPT' ? 'text-cyan-400' : 'text-purple-400'
                    }`}>
                      {champion}
                    </span>
                  </div>
                </div>

                {/* Bet Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-lg">Bet Amount:</span>
                  <span className="text-green-400 font-bold text-xl">${amount}</span>
                </div>

                {/* Odds */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-lg">Odds:</span>
                  <span className="text-yellow-400 font-bold text-xl">{odds}x</span>
                </div>

                {/* Potential Payout */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-lg">Potential Payout:</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-400" size={20} />
                    <span className="text-green-400 font-bold text-xl">${payout}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white text-gray-500 font-semibold text-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-lg text-white transition-all disabled:opacity-50 ${
                    champion === 'ChatGPT' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}
                >
                  {isLoading ? 'Placing Bet...' : 'Confirm Bet'}
                </button>
              </div>

              {/* Bottom Warning */}
              <div className="text-center text-gray-400 text-sm">
                Betting closes in 30 seconds. This bet cannot be cancelled once confirmed.
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 