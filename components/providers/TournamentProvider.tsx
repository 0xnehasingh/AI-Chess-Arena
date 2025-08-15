'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Tournament {
  id: string
  name: string
  company: string
  emoji: string
  prizePool: string
  participants: string
  timeLeft: string
  status: 'Live' | 'Starting Soon' | 'Ended'
  description: string
  token: string
  theme: {
    primary: string
    secondary: string
    gradient: string
  }
}

export const tournaments: Tournament[] = [
  {
    id: 'metis',
    name: 'Metis Tournament',
    company: 'Metis',
    emoji: '⚡',
    prizePool: '$18,500',
    participants: '892',
    timeLeft: '5d 8h 15m',
    status: 'Live',
    description: 'Strategic Chess AI Competition',
    token: '$OPS',
    theme: {
      primary: 'from-yellow-500 to-orange-500',
      secondary: 'from-yellow-600 to-orange-600',
      gradient: 'from-yellow-500/20 to-orange-500/20'
    }
  },
  {
    id: 'deficore',
    name: 'DefiCore Tournament',
    company: 'DefiCore',
    emoji: '🔥',
    prizePool: '$12,000',
    participants: '1,589',
    timeLeft: '12h 45m',
    status: 'Live',
    description: 'Elite AI Chess Masters Tournament',
    token: '$DFC',
    theme: {
      primary: 'from-red-500 to-pink-500',
      secondary: 'from-red-600 to-pink-600',
      gradient: 'from-red-500/20 to-pink-500/20'
    }
  },
  {
    id: 'cluster',
    name: 'Cluster Tournament',
    company: 'Cluster',
    emoji: '💎',
    prizePool: '$8,500',
    participants: '634',
    timeLeft: '3d 6h 20m',
    status: 'Live',
    description: 'Diamond League Chess Championship',
    token: '$CLST',
    theme: {
      primary: 'from-cyan-500 to-blue-500',
      secondary: 'from-cyan-600 to-blue-600',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    }
  },
  {
    id: 'moonbeam',
    name: 'MoonBeam Tournament',
    company: 'MoonBeam',
    emoji: '🌙',
    prizePool: '$25,000',
    participants: '1,247',
    timeLeft: '2d 14h 30m',
    status: 'Live',
    description: 'Championship Tournament',
    token: '$BEAM',
    theme: {
      primary: 'from-purple-500 to-indigo-500',
      secondary: 'from-purple-600 to-indigo-600',
      gradient: 'from-purple-500/20 to-indigo-500/20'
    }
  },
  {
    id: 'polygon',
    name: 'Polygon Tournament',
    company: 'Polygon',
    emoji: '🚀',
    prizePool: '$15,000',
    participants: '1,134',
    timeLeft: '1d 18h 45m',
    status: 'Live',
    description: 'Speed Chess Championship',
    token: '$MATIC',
    theme: {
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-purple-600 to-pink-600',
      gradient: 'from-purple-500/20 to-pink-500/20'
    }
  },
  {
    id: 'fantom',
    name: 'Fantom Tournament',
    company: 'Fantom',
    emoji: '🔮',
    prizePool: '$9,500',
    participants: '423',
    timeLeft: '4d 2h 15m',
    status: 'Live',
    description: 'Blitz Chess Masters',
    token: '$FTM',
    theme: {
      primary: 'from-blue-500 to-purple-500',
      secondary: 'from-blue-600 to-purple-600',
      gradient: 'from-blue-500/20 to-purple-500/20'
    }
  }
]

interface TournamentContextType {
  selectedTournament: Tournament | null
  setSelectedTournament: (tournament: Tournament | null) => void
  joinTournament: (tournamentId: string) => void
  leaveTournament: () => void
  isJoined: boolean
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined)

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)

  // Load selected tournament from localStorage on mount
  useEffect(() => {
    const savedTournamentId = localStorage.getItem('selectedTournament')
    if (savedTournamentId) {
      const tournament = tournaments.find(t => t.id === savedTournamentId)
      if (tournament) {
        setSelectedTournament(tournament)
      }
    }
  }, [])

  // Save selected tournament to localStorage whenever it changes
  useEffect(() => {
    if (selectedTournament) {
      localStorage.setItem('selectedTournament', selectedTournament.id)
    } else {
      localStorage.removeItem('selectedTournament')
    }
  }, [selectedTournament])

  const joinTournament = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId)
    if (tournament) {
      setSelectedTournament(tournament)
    }
  }

  const leaveTournament = () => {
    setSelectedTournament(null)
  }

  const isJoined = selectedTournament !== null

  return (
    <TournamentContext.Provider value={{
      selectedTournament,
      setSelectedTournament,
      joinTournament,
      leaveTournament,
      isJoined
    }}>
      {children}
    </TournamentContext.Provider>
  )
}

export function useTournament() {
  const context = useContext(TournamentContext)
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
} 