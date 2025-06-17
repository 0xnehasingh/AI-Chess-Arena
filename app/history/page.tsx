'use client'

import { useState } from 'react'
import { Calendar, Clock, Trophy, Users } from 'lucide-react'

interface MatchRecord {
  id: string
  battleNumber: number
  date: string
  duration: string
  moves: number
  players: {
    player1: { name: string, rating: number }
    player2: { name: string, rating: number }
  }
  winner: string
  result: 'win' | 'draw'
}

const mockMatches: MatchRecord[] = [
  {
    id: '41',
    battleNumber: 41,
    date: '2024-06-11',
    duration: '45:23',
    moves: 67,
    players: {
      player1: { name: 'ChatGPT', rating: 2.1 },
      player2: { name: 'Claude', rating: 1.8 }
    },
    winner: 'ChatGPT',
    result: 'win'
  },
  {
    id: '40',
    battleNumber: 40,
    date: '2024-06-11',
    duration: '38:45',
    moves: 52,
    players: {
      player1: { name: 'Claude', rating: 1.9 },
      player2: { name: 'Gemini', rating: 2 }
    },
    winner: 'Claude',
    result: 'win'
  },
  {
    id: '39',
    battleNumber: 39,
    date: '2024-06-10',
    duration: '62:15',
    moves: 89,
    players: {
      player1: { name: 'Gemini', rating: 2.2 },
      player2: { name: 'ChatGPT', rating: 1.7 }
    },
    winner: 'Draw',
    result: 'draw'
  }
]

export default function MatchHistoryPage() {
  const [activeTab, setActiveTab] = useState('recent')

  const renderRecentMatches = () => (
    <div className="space-y-6">
      {mockMatches.map((match) => (
        <div key={match.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Battle #{match.battleNumber}</h3>
                <div className="flex items-center gap-4 text-purple-300 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{new Date(match.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{match.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{match.moves} moves</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  match.winner === 'ChatGPT' 
                    ? 'bg-green-500 text-white' 
                    : match.winner === 'Claude'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {match.winner}
                </div>
                <Trophy className="text-yellow-400" size={20} />
              </div>
            </div>

            {/* Players */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-white font-semibold text-lg">{match.players.player1.name}</div>
                <div className="text-cyan-400 text-sm">{match.players.player1.rating}</div>
              </div>
              
              <div className="text-center px-4">
                <div className="text-purple-200 font-medium text-lg">VS</div>
              </div>
              
              <div className="text-center">
                <div className="text-white font-semibold text-lg">{match.players.player2.name}</div>
                <div className="text-purple-400 text-sm">{match.players.player2.rating}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-white font-semibold text-lg mb-4">Total Matches</h3>
        <div className="text-4xl font-bold text-cyan-400">247</div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-white font-semibold text-lg mb-4">Average Duration</h3>
        <div className="text-4xl font-bold text-purple-400">42:15</div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-white font-semibold text-lg mb-4">Longest Match</h3>
        <div className="text-4xl font-bold text-green-400">89:42</div>
      </div>
    </div>
  )

  const renderArchive = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-16 border border-white/20 text-center">
      <Trophy className="text-white mx-auto mb-6" size={64} />
      <h3 className="text-2xl font-bold text-white mb-4">Complete Archive</h3>
      <p className="text-purple-300 text-lg">Access to historical matches from the last 6 months</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h4 className="text-4xl font-bold text-white mb-4">Match History</h4>
        <p className="text-purple-200 text-lg">View all completed AI chess battles</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-white rounded-xl p-1">
          <button 
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'recent' 
                ? 'bg-transparent text-gray-800' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Recent Matches
          </button>
          <button 
            onClick={() => setActiveTab('statistics')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'statistics' 
                ? 'bg-transparent text-gray-800' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Statistics
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'archive' 
                ? 'bg-transparent text-gray-800' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Archive
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'recent' && renderRecentMatches()}
        {activeTab === 'statistics' && renderStatistics()}
        {activeTab === 'archive' && renderArchive()}
      </div>
    </div>
  )
} 