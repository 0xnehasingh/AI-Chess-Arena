'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react'
import { useRequireAuth } from '../../components/providers/AuthProvider'

interface BetRecord {
  id: string
  user_id: string
  match_id: string
  champion: 'ChatGPT' | 'Claude'
  amount: number
  potential_payout: number
  status: 'pending' | 'won' | 'lost' | 'cancelled'
  payout_amount: number | null
  transaction_hash: string | null
  created_at: string
  updated_at: string
  matches?: {
    id: string
    champion_white: 'ChatGPT' | 'Claude'
    champion_black: 'ChatGPT' | 'Claude'
    status: 'upcoming' | 'live' | 'finished' | 'cancelled'
    start_time: string
    winner: 'ChatGPT' | 'Claude' | 'draw' | null
    tournaments?: {
      name: string
      sponsor: string | null
    }
  }
}

interface BetStatistics {
  totalInvested: number
  totalWon: number
  totalLost: number
  winRate: number
  totalBets: number
}

type TabType = 'all' | 'active' | 'won' | 'lost'

export default function MyBetsPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [bets, setBets] = useState<BetRecord[]>([])
  const [statistics, setStatistics] = useState<BetStatistics>({
    totalInvested: 0,
    totalWon: 0,
    totalLost: 0,
    winRate: 0,
    totalBets: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserBets = async () => {
      if (!user) {
        console.log('❌ No user found, skipping bet fetch')
        return
      }

      try {
        console.log('🎯 Starting to fetch user bets...')
        setLoading(true)
        
        // Get current session for authorization
        const { supabase } = await import('../../lib/supabase')
        console.log('📦 Supabase imported, getting session...')
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log('🔑 Session result:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          tokenLength: session?.access_token?.length
        })
        
        if (!session?.access_token) {
          console.log('❌ No valid session found')
          setError('Authentication required. Please sign in again.')
          setLoading(false)
          return
        }
        
        console.log('📡 Making API call to /api/user-bets...')
        const response = await fetch('/api/user-bets', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        console.log('📡 API response:', {
          status: response.status,
          ok: response.ok
        })
        
        const data = await response.json()
        console.log('📊 API response data:', data)
        
        if (response.ok) {
          console.log('✅ API call successful, setting bets:', data.bets?.length || 0, 'bets found')
          setBets(data.bets || [])
          setStatistics(data.statistics || {
            totalInvested: 0,
            totalWon: 0,
            totalLost: 0,
            winRate: 0,
            totalBets: 0
          })
        } else {
          console.log('❌ API call failed:', data.error)
          setError(data.error || 'Failed to fetch bets')
        }
      } catch (err) {
        console.log('❌ Exception in fetchUserBets:', err)
        setError('Failed to fetch your bets')
        console.error('Error fetching user bets:', err)
      } finally {
        console.log('🏁 Setting loading to false')
        setLoading(false)
      }
    }

    console.log('🔄 useEffect triggered:', {
      hasUser: !!user,
      authLoading,
      shouldFetchBets: !!(user && !authLoading)
    })

    if (user && !authLoading) {
      fetchUserBets()
    }
  }, [user, authLoading])

  const getFilteredBets = () => {
    switch (activeTab) {
      case 'active':
        return bets.filter(bet => bet.status === 'pending')
      case 'won':
        return bets.filter(bet => bet.status === 'won')
      case 'lost':
        return bets.filter(bet => bet.status === 'lost')
      default:
        return bets
    }
  }

  const filteredBets = getFilteredBets()

  const getStatusBadge = (status: BetRecord['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500 text-white'
      case 'won':
        return 'bg-green-500 text-white'
      case 'lost':
        return 'bg-red-500 text-white'
      case 'cancelled':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: BetRecord['status']) => {
    switch (status) {
      case 'pending':
        return 'Active'
      case 'won':
        return 'Won'
      case 'lost':
        return 'Lost'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  console.log('🔍 Render state check:', { authLoading, loading, hasUser: !!user })

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-lg">
            Loading your bets... 
            {authLoading ? ' (Auth loading)' : ' (API loading)'}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // This shouldn't happen due to useRequireAuth redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h4 className="text-4xl font-bold text-white mb-4">My Bets</h4>
        <p className="text-purple-200 text-lg">Track your betting history and performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-blue-400" size={24} />
            <span className="text-purple-300 font-medium">Total Invested</span>
          </div>
          <div className="text-3xl font-bold text-white">{statistics.totalInvested} tickets</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" size={24} />
            <span className="text-purple-300 font-medium">Total Won</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{statistics.totalWon} tickets</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-red-400" size={24} />
            <span className="text-purple-300 font-medium">Total Lost</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{statistics.totalLost} tickets</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-cyan-400" size={24} />
            <span className="text-purple-300 font-medium">Win Rate</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{statistics.winRate}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${statistics.winRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 mb-6">
        <div className="grid grid-cols-4 gap-1">
          {[
            { key: 'all', label: 'All Bets' },
            { key: 'active', label: 'Active' },
            { key: 'won', label: 'Won' },
            { key: 'lost', label: 'Lost' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bet Records */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
            <div className="text-red-400">{error}</div>
          </div>
        )}
        
        {filteredBets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-purple-300 text-lg">
              {activeTab === 'all' ? 'No bets found' : `No ${activeTab} bets found`}
            </div>
          </div>
        ) : (
          filteredBets.map((bet, index) => {
            const matchup = bet.matches 
              ? `${bet.matches.champion_white} vs ${bet.matches.champion_black}`
              : 'Match data unavailable'
            
            return (
              <div key={bet.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  {/* Left side - Battle info and bet details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-white font-bold text-lg">Battle #{index + 1}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(bet.status)}`}>
                        {getStatusText(bet.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="text-purple-300" size={16} />
                      <span className="text-purple-300 text-sm">{new Date(bet.created_at).toLocaleString()}</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-white font-semibold mb-2">
                        Bet on: {bet.champion} in {matchup}
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <div className="text-purple-300 text-sm">Amount:</div>
                          <div className="text-white font-semibold">{bet.amount} tickets</div>
                        </div>
                        <div>
                          <div className="text-purple-300 text-sm">Potential Payout:</div>
                          <div className="text-white font-semibold">{bet.potential_payout} tickets</div>
                        </div>
                      </div>
                    </div>

                    {/* Tournament info */}
                    {bet.matches?.tournaments && (
                      <div className="mb-4 text-sm">
                        <span className="text-purple-300">Tournament: </span>
                        <span className="text-cyan-400">{bet.matches.tournaments.name}</span>
                        {bet.matches.tournaments.sponsor && (
                          <>
                            <span className="text-purple-300"> • </span>
                            <span className="text-white">{bet.matches.tournaments.sponsor}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right side - Result or potential win */}
                  <div className="text-right">
                    {bet.status === 'pending' ? (
                      <>
                        <div className="text-purple-300 text-sm mb-1">Potential Win</div>
                        <div className="text-cyan-400 font-bold text-2xl">
                          {bet.potential_payout} tickets
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-purple-300 text-sm mb-1">Result</div>
                        <div className={`font-bold text-2xl ${
                          bet.status === 'won' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {bet.payout_amount || 0} tickets
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 