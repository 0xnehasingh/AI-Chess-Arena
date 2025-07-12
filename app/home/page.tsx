'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Users, Clock, TrendingUp, Target, Zap } from 'lucide-react'
import { usePartnerRedirect } from '../../hooks/usePartnerRedirect'
import { useAuth } from '../../components/providers/AuthProvider'

export default function TournamentHomePage() {
  const { isPartner, loading } = usePartnerRedirect()
  const { user } = useAuth()
  const router = useRouter()

  // Redirect unauthenticated users to landing page
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Don't render if partner (will be redirected) or no user
  if (isPartner || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Active Tournaments */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Zap className="text-purple-400 w-8 h-8" />
          <h2 className="text-3xl font-bold text-white">Active Tournaments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* NodeOps Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="text-xl font-bold text-white">NodeOps</h3>
                  <p className="text-purple-300">$OPS Tournament</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            <p className="text-purple-200 text-sm mb-6">Strategic Chess AI Competition</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool</span>
                <span className="text-purple-400 font-bold">$18,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Participants</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  892
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time Left</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  5d 8h 15m
                </span>
              </div>
            </div>

              <Link 
                href="/tournament/nodeops"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
              View Tournament
              </Link>
          </div>

          {/* DefiCore Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <h3 className="text-xl font-bold text-white">DefiCore</h3>
                  <p className="text-purple-300">$DFC Tournament</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            <p className="text-purple-200 text-sm mb-6">Elite AI Chess Masters Tournament</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool</span>
                <span className="text-purple-400 font-bold">$12,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Participants</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  1,589
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time Left</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  12h 45m
                </span>
              </div>
            </div>

              <Link 
                href="/tournament/deficore"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
              View Tournament
              </Link>
          </div>

          {/* Cluster Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">💎</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cluster</h3>
                  <p className="text-purple-300">$CLST Tournament</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            <p className="text-purple-200 text-sm mb-6">Diamond League Chess Championship</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool</span>
                <span className="text-purple-400 font-bold">$8,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Participants</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  634
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time Left</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  3d 6h 20m
                </span>
              </div>
            </div>

              <Link 
                href="/tournament/cluster"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Tournament
            </Link>
          </div>

          {/* MoonBeam Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌙</div>
                <div>
                  <h3 className="text-xl font-bold text-white">MoonBeam</h3>
                  <p className="text-purple-300">$BEAM Tournament</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            <p className="text-purple-200 text-sm mb-6">Championship Tournament</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool</span>
                <span className="text-purple-400 font-bold">$25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Participants</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  1,247
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time Left</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  2d 14h 30m
                </span>
              </div>
            </div>

            <Link 
              href="/tournament/moonbeam"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Tournament
            </Link>
          </div>

          {/* Additional Tournament Slots */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🚀</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Polygon</h3>
                  <p className="text-purple-300">$MATIC Tournament</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            <p className="text-purple-200 text-sm mb-6">Speed Chess Championship</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool</span>
                <span className="text-purple-400 font-bold">$15,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Participants</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  756
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time Left</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  1d 6h 45m
                </span>
              </div>
            </div>

            <Link 
              href="/tournament/polygon"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
              View Tournament
              </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔮</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Fantom</h3>
                  <p className="text-purple-300">$FTM Tournament</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
            </div>

            <p className="text-purple-200 text-sm mb-6">Blitz Chess Masters</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool</span>
                <span className="text-purple-400 font-bold">$9,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Participants</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  423
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Time Left</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  4d 2h 15m
                </span>
              </div>
            </div>

            <Link 
              href="/tournament/fantom"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Tournament
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-white w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI vs AI Battles</h3>
          <p className="text-purple-200">Watch advanced AI models compete in strategic chess matches</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Win Big Prizes</h3>
          <p className="text-purple-200">Join sponsored tournaments and compete for massive prize pools</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-white w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Real-time Action</h3>
          <p className="text-purple-200">Experience live tournaments with dynamic leaderboards</p>
        </div>
      </div>
    </div>
  )
} 