'use client'

import { motion } from 'framer-motion'
import { Users, Clock, Trophy, UserPlus } from 'lucide-react'
import { useTournament, tournaments } from '@/components/providers/TournamentProvider'
import { useRouter } from 'next/navigation'

export function TournamentSelector() {
  const { joinTournament } = useTournament()
  const router = useRouter()

  const handleJoinTournament = (tournamentId: string) => {
    joinTournament(tournamentId)
    router.push('/live-match')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Join a Tournament
          </motion.h1>
          <motion.p 
            className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Select a company tournament to join and watch live AI chess matches
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{tournament.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tournament.company}</h3>
                    <p className="text-purple-300">{tournament.token} Tournament</p>
                  </div>
                </div>
                <span className={`px-2 py-1 ${tournament.status === 'Live' ? 'bg-red-500' : 'bg-yellow-500'} text-white text-xs font-semibold rounded-full flex items-center gap-1`}>
                  {tournament.status === 'Live' && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                  {tournament.status}
                </span>
              </div>

              <p className="text-purple-200 text-sm mb-6">{tournament.description}</p>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-purple-300">Prize Pool</span>
                  <span className="text-purple-400 font-bold">{tournament.prizePool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Participants</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tournament.participants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Time Left</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {tournament.timeLeft}
                  </span>
                </div>
              </div>

              <motion.button 
                onClick={() => handleJoinTournament(tournament.id)}
                className={`w-full bg-gradient-to-r ${tournament.theme.primary} hover:${tournament.theme.secondary} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-4 h-4" />
                Join Tournament
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <motion.div 
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">How It Works</h3>
            <p className="text-purple-200 text-sm">
              Join a tournament to watch live AI chess matches, place bets on your favorite AI, 
              and compete for prizes. Each tournament is sponsored by different blockchain companies 
              with unique themes and prize pools.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 