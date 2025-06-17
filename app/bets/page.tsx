'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react'

interface BetRecord {
  id: string
  battleNumber: number
  timestamp: string
  matchup: string
  champion: string
  amount: number
  odds: number
  status: 'active' | 'won' | 'lost'
  result?: number
  confidence?: number
}

const mockBets: BetRecord[] = [
  {
    id: '1',
    battleNumber: 42,
    timestamp: '2024-06-12 14:30',
    matchup: 'ChatGPT vs Claude',
    champion: 'ChatGPT',
    amount: 50,
    odds: 2.1,
    status: 'active',
    confidence: 85
  },
  {
    id: '2',
    battleNumber: 41,
    timestamp: '2024-06-11 16:45',
    matchup: 'ChatGPT vs Claude',
    champion: 'ChatGPT',
    amount: 25,
    odds: 2.1,
    status: 'won',
    result: 52.5
  },
  {
    id: '3',
    battleNumber: 40,
    timestamp: '2024-06-11 13:20',
    matchup: 'Gemini vs Claude',
    champion: 'Gemini',
    amount: 75,
    odds: 2.0,
    status: 'lost',
    result: 0
  }
]

type TabType = 'all' | 'active' | 'won' | 'lost'

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const totalInvested = 150
  const totalWon = 52.5
  const totalLost = 75
  const winRate = 50

  const getFilteredBets = () => {
    switch (activeTab) {
      case 'active':
        return mockBets.filter(bet => bet.status === 'active')
      case 'won':
        return mockBets.filter(bet => bet.status === 'won')
      case 'lost':
        return mockBets.filter(bet => bet.status === 'lost')
      default:
        return mockBets
    }
  }

  const filteredBets = getFilteredBets()

  const getStatusBadge = (status: BetRecord['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500 text-white'
      case 'won':
        return 'bg-green-500 text-white'
      case 'lost':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: BetRecord['status']) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'won':
        return 'Won'
      case 'lost':
        return 'Lost'
      default:
        return status
    }
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
          <div className="text-3xl font-bold text-white">${totalInvested}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" size={24} />
            <span className="text-purple-300 font-medium">Total Won</span>
          </div>
          <div className="text-3xl font-bold text-green-400">${totalWon}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-red-400" size={24} />
            <span className="text-purple-300 font-medium">Total Lost</span>
          </div>
          <div className="text-3xl font-bold text-red-400">${totalLost}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-cyan-400" size={24} />
            <span className="text-purple-300 font-medium">Win Rate</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{winRate}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
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
        {filteredBets.map((bet) => (
          <div key={bet.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              {/* Left side - Battle info and bet details */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-white font-bold text-lg">Battle #{bet.battleNumber}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(bet.status)}`}>
                    {getStatusText(bet.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-purple-300" size={16} />
                  <span className="text-purple-300 text-sm">{bet.timestamp}</span>
                </div>

                <div className="mb-4">
                  <div className="text-white font-semibold mb-2">
                    Bet on: {bet.matchup}
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-purple-300 text-sm">Amount:</div>
                      <div className="text-white font-semibold">${bet.amount}</div>
                    </div>
                    <div>
                      <div className="text-purple-300 text-sm">Odds:</div>
                      <div className="text-white font-semibold">{bet.odds}x</div>
                    </div>
                  </div>
                </div>

                {/* Confidence bar for active bets */}
                {bet.status === 'active' && bet.confidence && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-300 text-sm">Confidence</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${bet.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Result or potential win */}
              <div className="text-right">
                {bet.status === 'active' ? (
                  <>
                    <div className="text-purple-300 text-sm mb-1">Potential Win</div>
                    <div className="text-cyan-400 font-bold text-2xl">
                      ${(bet.amount * bet.odds).toFixed(0)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-purple-300 text-sm mb-1">Result</div>
                    <div className={`font-bold text-2xl ${
                      bet.status === 'won' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${bet.result || 0}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 