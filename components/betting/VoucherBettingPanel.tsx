'use client'

import { useState, useEffect } from 'react'
import { Ticket, Coins, Trophy, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { tournamentRegistrationService, voucherBetService, voucherService } from '../../lib/database'

interface VoucherBettingPanelProps {
  matchId: string
  tournamentId: string
  tournamentName: string
  isOpen: boolean
  onBetPlaced?: () => void
}

interface RegistrationData {
  id: string
  voucher_balance: number
  registration_status: string
  tournament_voucher_types: {
    voucher_name: string
    voucher_symbol: string
    min_bet_amount: number
    max_bet_amount: number
  }[]
}

export default function VoucherBettingPanel({ 
  matchId, 
  tournamentId, 
  tournamentName, 
  isOpen, 
  onBetPlaced 
}: VoucherBettingPanelProps) {
  const [registration, setRegistration] = useState<RegistrationData | null>(null)
  const [selectedChampion, setSelectedChampion] = useState<'ChatGPT' | 'Claude'>('ChatGPT')
  const [voucherAmount, setVoucherAmount] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isBetting, setIsBetting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      checkRegistrationStatus()
    }
  }, [isOpen, tournamentId])

  const checkRegistrationStatus = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await tournamentRegistrationService.getRegistrationForTournament(tournamentId)
      
      if (error) {
        setError('Failed to check registration status')
        return
      }
      
      setRegistration(data)
    } catch (err) {
      setError('Failed to load registration data')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setError('')
    setSuccess('')
    
    try {
      const { data, error } = await tournamentRegistrationService.register(tournamentId)
      
      if (error) {
        setError(error.message || 'Failed to register')
        return
      }
      
      setSuccess(`Successfully registered! Earned ${data.vouchers_earned} ${data.voucher_type.voucher_symbol}`)
      await checkRegistrationStatus() // Refresh data
    } catch (err) {
      setError('Failed to register for tournament')
    } finally {
      setIsRegistering(false)
    }
  }

  const handlePlaceBet = async () => {
    if (!voucherAmount || !registration) return
    
    const amount = parseFloat(voucherAmount)
    const voucherType = registration.tournament_voucher_types[0]
    
    if (amount < voucherType.min_bet_amount || amount > voucherType.max_bet_amount) {
      setError(`Bet amount must be between ${voucherType.min_bet_amount} and ${voucherType.max_bet_amount} ${voucherType.voucher_symbol}`)
      return
    }
    
    if (amount > registration.voucher_balance) {
      setError('Insufficient voucher balance')
      return
    }
    
    setIsBetting(true)
    setError('')
    setSuccess('')
    
    try {
      const { data, error } = await voucherBetService.placeBet(matchId, selectedChampion, amount)
      
      if (error) {
        setError(error.message || 'Failed to place bet')
        return
      }
      
      setSuccess(`Bet placed! ${data.vouchers_spent} ${data.voucher_symbol} on ${selectedChampion}`)
      setVoucherAmount('')
      await checkRegistrationStatus() // Refresh balance
      onBetPlaced?.()
    } catch (err) {
      setError('Failed to place voucher bet')
    } finally {
      setIsBetting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-6 max-w-md w-full border border-purple-500/30">
        <div className="flex items-center gap-3 mb-6">
          <Ticket className="text-purple-400 w-6 h-6" />
          <h3 className="text-xl font-bold text-white">Voucher Betting</h3>
        </div>

        <div className="space-y-4">
          {/* Tournament Info */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-yellow-400 w-4 h-4" />
              <span className="text-purple-200 text-sm">Tournament</span>
            </div>
            <h4 className="text-white font-semibold">{tournamentName}</h4>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-purple-400 w-6 h-6" />
            </div>
          ) : !registration ? (
            /* Not Registered */
            <div className="space-y-4">
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-orange-400 w-4 h-4" />
                  <span className="text-orange-200 text-sm font-medium">Registration Required</span>
                </div>
                <p className="text-orange-100 text-sm">
                  You must register for this tournament to place voucher bets
                </p>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  <Trophy className="w-4 h-4" />
                )}
                {isRegistering ? 'Registering...' : 'Register for Tournament'}
              </button>
            </div>
          ) : (
            /* Registered - Show Betting Interface */
            <div className="space-y-4">
              {/* Voucher Balance */}
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-400 w-4 h-4" />
                  <span className="text-green-200 text-sm font-medium">Registered</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Voucher Balance:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="text-yellow-400 w-4 h-4" />
                    <span className="text-yellow-400 font-bold">
                      {registration.voucher_balance} {registration.tournament_voucher_types[0]?.voucher_symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Champion Selection */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Select Champion
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ChatGPT', 'Claude'] as const).map((champion) => (
                    <button
                      key={champion}
                      onClick={() => setSelectedChampion(champion)}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        selectedChampion === champion
                          ? 'border-purple-400 bg-purple-500/30 text-white'
                          : 'border-white/20 bg-white/5 text-purple-200 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="font-semibold">{champion}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Amount */}
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Voucher Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(e.target.value)}
                    min={registration.tournament_voucher_types[0]?.min_bet_amount}
                    max={Math.min(
                      registration.tournament_voucher_types[0]?.max_bet_amount || 20,
                      registration.voucher_balance
                    )}
                    step="0.1"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                    placeholder={`Min: ${registration.tournament_voucher_types[0]?.min_bet_amount || 1}`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 text-sm">
                    {registration.tournament_voucher_types[0]?.voucher_symbol}
                  </div>
                </div>
                <div className="text-purple-300 text-xs mt-1">
                  Available: {registration.voucher_balance} {registration.tournament_voucher_types[0]?.voucher_symbol}
                </div>
              </div>

              {/* Place Bet Button */}
              <button
                onClick={handlePlaceBet}
                disabled={!voucherAmount || isBetting || parseFloat(voucherAmount) <= 0}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isBetting ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  <Coins className="w-4 h-4" />
                )}
                {isBetting ? 'Placing Bet...' : `Bet ${voucherAmount || '0'} ${registration.tournament_voucher_types[0]?.voucher_symbol}`}
              </button>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              setError('')
              setSuccess('')
              setVoucherAmount('')
              // Close modal (parent should handle this)
            }}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 