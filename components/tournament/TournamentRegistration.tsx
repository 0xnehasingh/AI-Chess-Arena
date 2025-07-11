'use client'

import { useState, useEffect } from 'react'
import { Trophy, Coins, Users, Calendar, Ticket, CheckCircle, Clock, Loader } from 'lucide-react'
import { tournamentService, tournamentRegistrationService } from '../../lib/database'

interface Tournament {
  id: string
  name: string
  description: string
  sponsor: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'finished'
  prize_pool: number
  tournament_voucher_types: {
    voucher_name: string
    voucher_symbol: string
    initial_allocation: number
    min_bet_amount: number
    max_bet_amount: number
  }[]
}

interface Registration {
  id: string
  tournament_id: string
  voucher_balance: number
  total_vouchers_earned: number
  total_vouchers_spent: number
  registration_status: string
  tournaments: Tournament
}

export default function TournamentRegistration() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Load tournaments and user registrations in parallel
      const [tournamentsResult, registrationsResult] = await Promise.all([
        tournamentService.getActive(),
        tournamentRegistrationService.getUserRegistrations()
      ])
      
      if (tournamentsResult.error) {
        setError('Failed to load tournaments')
        return
      }
      
      setTournaments(tournamentsResult.data || [])
      setRegistrations(registrationsResult.data || [])
    } catch (err) {
      setError('Failed to load tournament data')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (tournamentId: string) => {
    setRegistering(tournamentId)
    setError('')
    setSuccess('')
    
    try {
      const { data, error } = await tournamentRegistrationService.register(tournamentId)
      
      if (error) {
        setError(error.message || 'Failed to register')
        return
      }
      
      setSuccess(`Successfully registered! Earned ${data.vouchers_earned} ${data.voucher_type.voucher_symbol}`)
      await loadData() // Refresh data
    } catch (err) {
      setError('Failed to register for tournament')
    } finally {
      setRegistering(null)
    }
  }

  const getRegistrationForTournament = (tournamentId: string) => {
    return registrations.find(reg => reg.tournament_id === tournamentId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-purple-400 w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="text-purple-400 w-8 h-8" />
        <h2 className="text-3xl font-bold text-white">Tournament Registration</h2>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {/* Active Tournaments */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => {
          const registration = getRegistrationForTournament(tournament.id)
          const voucherType = tournament.tournament_voucher_types[0]
          const isRegistered = !!registration
          const isRegistering = registering === tournament.id

          return (
            <div key={tournament.id} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {tournament.name.includes('Moonbeam') ? '🌙' : 
                     tournament.name.includes('NodeOps') ? '⚡' : 
                     tournament.name.includes('DeFi') ? '🔥' : '🏆'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                    <p className="text-purple-300 text-sm">{tournament.sponsor}</p>
                  </div>
                </div>
                
                {isRegistered && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-200 text-xs font-medium">Registered</span>
                  </div>
                )}
              </div>

              {/* Tournament Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">Prize Pool:</span>
                  <span className="text-green-400 font-bold">${tournament.prize_pool.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">Start Date:</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(tournament.start_date)}
                  </span>
                </div>

                {voucherType && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300">Initial Vouchers:</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {voucherType.initial_allocation} {voucherType.voucher_symbol}
                    </span>
                  </div>
                )}
              </div>

              {/* Voucher Info */}
              {voucherType && (
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="text-purple-400 w-4 h-4" />
                    <span className="text-purple-200 text-sm font-medium">Voucher System</span>
                  </div>
                  <div className="text-xs text-purple-300 space-y-1">
                    <div>• {voucherType.voucher_name}</div>
                    <div>• Bet Range: {voucherType.min_bet_amount}-{voucherType.max_bet_amount} {voucherType.voucher_symbol}</div>
                    <div>• Tournament-specific (non-transferable)</div>
                  </div>
                </div>
              )}

              {/* Registration Status & Balance */}
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-200">Current Balance:</span>
                      <span className="text-yellow-400 font-bold">
                        {registration.voucher_balance} {voucherType?.voucher_symbol}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-purple-300">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{registration.total_vouchers_earned}</div>
                      <div>Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold">{registration.total_vouchers_spent}</div>
                      <div>Spent</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleRegister(tournament.id)}
                  disabled={isRegistering || tournament.status === 'finished'}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : tournament.status === 'finished' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                  {isRegistering ? 'Registering...' : 
                   tournament.status === 'finished' ? 'Tournament Ended' : 
                   'Register & Get Vouchers'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="text-purple-400 w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Tournaments</h3>
          <p className="text-purple-300">Check back later for new tournaments to join!</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-200 font-semibold mb-2">How Voucher Betting Works:</h4>
        <ul className="text-blue-100 text-sm space-y-1">
          <li>• Register for tournaments to receive vouchers</li>
          <li>• Each tournament has its own unique voucher type</li>
          <li>• Vouchers can only be used within the tournament they belong to</li>
          <li>• Win matches to earn more vouchers</li>
          <li>• Vouchers cannot be transferred between tournaments</li>
        </ul>
      </div>
    </div>
  )
} 