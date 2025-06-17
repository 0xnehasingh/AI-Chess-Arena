'use client'

import { useState } from 'react'
import { Trophy, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  username: string
  tier: 'Diamond' | 'Gold' | 'Silver'
  streak: number
  totalWinnings: number
  winRate: number
  totalBets: number
}

const overallLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'ChessMaster2024',
    tier: 'Diamond',
    streak: 8,
    totalWinnings: 2450.50,
    winRate: 68.5,
    totalBets: 127
  },
  {
    rank: 2,
    username: 'AIBetKing',
    tier: 'Gold',
    streak: 3,
    totalWinnings: 2180.25,
    winRate: 64.2,
    totalBets: 156
  },
  {
    rank: 3,
    username: 'StrategicPlayer',
    tier: 'Gold',
    streak: 12,
    totalWinnings: 1950.75,
    winRate: 71.3,
    totalBets: 98
  },
  {
    rank: 4,
    username: 'ChessAnalyst',
    tier: 'Silver',
    streak: 2,
    totalWinnings: 1720.00,
    winRate: 59.8,
    totalBets: 189
  },
  {
    rank: 5,
    username: 'BettingPro',
    tier: 'Silver',
    streak: 5,
    totalWinnings: 1540.30,
    winRate: 66.7,
    totalBets: 145
  }
]

type TabType = 'overall' | 'week' | 'month'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overall')

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500'
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'Silver':
        return 'bg-gray-500'
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

  const renderOverallTab = () => (
    <div className="space-y-4">
      {overallLeaderboard.map((entry) => (
        <div key={entry.rank} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            {/* Left side - Rank and user info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 text-2xl">
                {getTrophyIcon(entry.rank)}
              </div>
              
              <div>
                <h3 className="text-white font-bold text-lg">{entry.username}</h3>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full ${getTierColor(entry.tier)}`}>
                    <span className="text-white font-medium text-sm">{entry.tier}</span>
                  </div>
                  <span className="text-purple-300 text-sm">Streak: {entry.streak}</span>
                </div>
              </div>
            </div>

            {/* Right side - Stats */}
            <div className="flex gap-8 text-right">
              <div>
                <div className="text-purple-300 text-sm mb-1">Total Winnings</div>
                <div className="text-green-400 font-bold text-lg">${entry.totalWinnings.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-purple-300 text-sm mb-1">Win Rate</div>
                <div className="text-cyan-400 font-bold text-lg">{entry.winRate}%</div>
              </div>
              
              <div>
                <div className="text-purple-300 text-sm mb-1">Total Bets</div>
                <div className="text-white font-bold text-lg">{entry.totalBets}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderWeeklyTab = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 border border-white/20 text-center">
      <Trophy className="text-yellow-400 mx-auto mb-6" size={64} />
      <h3 className="text-2xl font-bold text-white mb-4">Weekly Rankings</h3>
      <p className="text-purple-300 text-lg">Updated every Monday at midnight</p>
    </div>
  )

  const renderMonthlyTab = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 border border-white/20 text-center">
      <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <Trophy className="text-purple-400" size={64} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Monthly Champions</h3>
      <p className="text-purple-300 text-lg">Hall of fame for top monthly performers</p>
    </div>
  )

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