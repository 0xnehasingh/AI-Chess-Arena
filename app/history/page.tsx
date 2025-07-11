'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Trophy, Users } from 'lucide-react'

interface MatchRecord {
  id: string
  tournament_id: string | null
  champion_white: 'ChatGPT' | 'Claude'
  champion_black: 'ChatGPT' | 'Claude'
  status: 'upcoming' | 'live' | 'finished' | 'cancelled'
  start_time: string
  end_time: string | null
  winner: 'ChatGPT' | 'Claude' | 'draw' | null
  move_count: number
  pgn: string | null
  tournaments?: {
    name: string
    sponsor: string | null
  }
  match_moves?: Array<{
    move_number: number
    champion: 'ChatGPT' | 'Claude'
    move: string
  }>
}

export default function MatchHistoryPage() {
  const [activeTab, setActiveTab] = useState('recent')
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/matches?status=finished')
        const data = await response.json()
        
        if (response.ok) {
          setMatches(data.matches || [])
        } else {
          setError(data.error || 'Failed to fetch matches')
        }
      } catch (err) {
        setError('Failed to fetch matches')
        console.error('Error fetching matches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In Progress'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`
  }

  const renderRecentMatches = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading matches...</div>
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

    if (matches.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-purple-300 text-lg">No finished matches found</div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {matches.map((match, index) => (
          <div key={match.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-white">Battle #{index + 1}</h3>
                  <div className="flex items-center gap-4 text-purple-300 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(match.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{calculateDuration(match.start_time, match.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{match.move_count} moves</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    match.winner === 'ChatGPT' 
                      ? 'bg-green-500 text-white' 
                      : match.winner === 'Claude'
                      ? 'bg-green-500 text-white'
                      : match.winner === 'draw'
                      ? 'bg-gray-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {match.winner === 'draw' ? 'Draw' : match.winner || 'Ongoing'}
                  </div>
                  <Trophy className="text-yellow-400" size={20} />
                </div>
              </div>

              {/* Players */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">{match.champion_white}</div>
                  <div className="text-cyan-400 text-sm">White</div>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-purple-200 font-medium text-lg">VS</div>
                </div>
                
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">{match.champion_black}</div>
                  <div className="text-purple-400 text-sm">Black</div>
                </div>
              </div>

              {/* Tournament info */}
              {match.tournaments && (
                <div className="mt-2 text-sm">
                  <span className="text-purple-300">Tournament: </span>
                  <span className="text-white">{match.tournaments.name}</span>
                  {match.tournaments.sponsor && (
                    <>
                      <span className="text-purple-300"> • Sponsored by </span>
                      <span className="text-cyan-400">{match.tournaments.sponsor}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const calculateStatistics = () => {
    if (matches.length === 0) return { totalMatches: 0, avgDuration: '0:00', longestMatch: '0:00' }

    const finishedMatches = matches.filter(m => m.end_time)
    
    // Calculate average duration
    let totalDurationMs = 0
    let longestDurationMs = 0
    
    finishedMatches.forEach(match => {
      if (match.end_time) {
        const duration = new Date(match.end_time).getTime() - new Date(match.start_time).getTime()
        totalDurationMs += duration
        if (duration > longestDurationMs) {
          longestDurationMs = duration
        }
      }
    })

    const avgDurationMs = finishedMatches.length > 0 ? totalDurationMs / finishedMatches.length : 0
    
    const formatDuration = (ms: number) => {
      const mins = Math.floor(ms / 60000)
      const secs = Math.floor((ms % 60000) / 1000)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return {
      totalMatches: matches.length,
      avgDuration: formatDuration(avgDurationMs),
      longestMatch: formatDuration(longestDurationMs)
    }
  }

  const renderStatistics = () => {
    const stats = calculateStatistics()
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-white font-semibold text-lg mb-4">Total Matches</h3>
          <div className="text-4xl font-bold text-cyan-400">{stats.totalMatches}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-white font-semibold text-lg mb-4">Average Duration</h3>
          <div className="text-4xl font-bold text-purple-400">{stats.avgDuration}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-white font-semibold text-lg mb-4">Longest Match</h3>
          <div className="text-4xl font-bold text-green-400">{stats.longestMatch}</div>
        </div>
      </div>
    )
  }

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