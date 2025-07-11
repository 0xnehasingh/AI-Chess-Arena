'use client'

import { useState, useEffect } from 'react'
import { Trophy, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  display_name: string | null
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze'
  total_winnings: number
  win_rate: number
  total_bets: number
  tickets_balance: number
  vouchers_balance: number
  total_tickets_earned: number
  total_tickets_spent: number
}

type TabType = 'overall' | 'week' | 'month'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overall')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/leaderboard?period=${activeTab}&limit=20`)
        const data = await response.json()
        
        if (response.ok) {
          setLeaderboard(data.leaderboard || [])
        } else {
          setError(data.error || 'Failed to fetch leaderboard')
        }
      } catch (err) {
        setError('Failed to fetch leaderboard')
        console.error('Error fetching leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [activeTab])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500'
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'Silver':
        return 'bg-gray-500'
      case 'Bronze':
        return 'bg-gradient-to-r from-orange-600 to-red-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return '🏆'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const renderOverallTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading leaderboard...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      )
    }

    if (leaderboard.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-purple-300 text-lg">No leaderboard data available</div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {leaderboard.map((entry) => (
          <div key={entry.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              {/* Left side - Rank and user info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 text-2xl">
                  {getTrophyIcon(entry.rank)}
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {entry.display_name || entry.username}
                  </h3>
                  {entry.display_name && (
                    <div className="text-purple-300 text-sm">@{entry.username}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <div className={`px-3 py-1 rounded-full ${getTierColor(entry.tier)}`}>
                      <span className="text-white font-medium text-sm">{entry.tier}</span>
                    </div>
                    <span className="text-purple-300 text-sm">
                      Balance: {entry.tickets_balance} tickets
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Stats */}
              <div className="flex gap-8 text-right">
                <div>
                  <div className="text-purple-300 text-sm mb-1">Total Winnings</div>
                  <div className="text-green-400 font-bold text-lg">{entry.total_winnings} tickets</div>
                </div>
                
                <div>
                  <div className="text-purple-300 text-sm mb-1">Win Rate</div>
                  <div className="text-cyan-400 font-bold text-lg">{entry.win_rate.toFixed(1)}%</div>
                </div>
                
                <div>
                  <div className="text-purple-300 text-sm mb-1">Total Bets</div>
                  <div className="text-white font-bold text-lg">{entry.total_bets}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderWeeklyTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading weekly leaderboard...</div>
        </div>
      )
    }

    if (leaderboard.length === 0) {
      return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 border border-white/20 text-center">
          <Trophy className="text-yellow-400 mx-auto mb-6" size={64} />
          <h3 className="text-2xl font-bold text-white mb-4">Weekly Rankings</h3>
          <p className="text-purple-300 text-lg">No weekly activity yet</p>
        </div>
      )
    }

    return renderOverallTab() // Use the same rendering logic
  }

  const renderMonthlyTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading monthly leaderboard...</div>
        </div>
      )
    }

    if (leaderboard.length === 0) {
      return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 border border-white/20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="text-purple-400" size={64} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Monthly Champions</h3>
          <p className="text-purple-300 text-lg">No monthly activity yet</p>
        </div>
      )
    }

    return renderOverallTab() // Use the same rendering logic
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h4 className="text-4xl font-bold text-white mb-4">Leaderboard</h4>
        <p className="text-purple-200 text-lg">Top performers in the AI Chess Arena</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 mb-6">
        <div className="grid grid-cols-3 gap-1">
          {[
            { key: 'overall', label: 'Overall' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' }
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

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overall' && renderOverallTab()}
        {activeTab === 'week' && renderWeeklyTab()}
        {activeTab === 'month' && renderMonthlyTab()}
      </div>
    </div>
  )
} 