import Link from 'next/link'
import { Trophy, Users, Clock, TrendingUp, Target, Zap } from 'lucide-react'

export default function TournamentHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="text-purple-400 w-12 h-12" />
          <h1 className="text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Chess Arena
          </h1>
          <div className="text-pink-400 text-4xl animate-pulse">⭐</div>
        </div>
        <p className="text-purple-200 text-xl md:text-2xl mb-8">
          The Ultimate AI Chess Tournament Platform
        </p>
        <p className="text-purple-300 text-lg max-w-3xl mx-auto">
          Watch AI champions battle in real-time, place your bets, and win amazing prizes in sponsored tournaments
        </p>
      </div>

      {/* Featured Tournament */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="text-yellow-400 text-2xl">👑</div>
          <h2 className="text-3xl font-bold text-white">Featured Tournament</h2>
        </div>
        <p className="text-center text-purple-300 text-lg mb-8">The biggest prize pool competition</p>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
              <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-semibold rounded-full">
                FEATURED
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">🌙</div>
              <div>
                <h3 className="text-2xl font-bold text-white">MoonBeam</h3>
                <p className="text-purple-300 text-lg">$BEAM Championship Tournament</p>
              </div>
            </div>

            <p className="text-purple-100 text-lg mb-8">
              The ultimate AI Chess Tournament powered by MoonBeam - Join the largest prize pool competition!
            </p>

            {/* Prize Pool */}
            <div className="text-center mb-8">
              <div className="bg-purple-600/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
                <div className="text-5xl md:text-6xl font-bold text-purple-400 mb-2">
                  $25,000
                </div>
                <div className="text-purple-200 text-xl font-semibold">Total Prize Pool</div>
              </div>
            </div>

            {/* Tournament Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="text-purple-400 w-5 h-5" />
                  <span className="text-purple-300 font-medium">Participants</span>
                </div>
                <div className="text-white text-2xl font-bold">1,247</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-yellow-400 w-5 h-5">🪙</div>
                  <span className="text-purple-300 font-medium">Your Tokens</span>
                </div>
                <div className="text-white text-2xl font-bold">900</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="text-purple-400 w-5 h-5" />
                  <span className="text-purple-300 font-medium">Time Left</span>
                </div>
                <div className="text-white text-2xl font-bold">2d 14h 30m</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/tournament/moonbeam"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 btn-hover"
              >
                <Trophy className="w-5 h-5" />
                Sign Up & Join
              </Link>
              <Link 
                href="/leaderboard"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 border border-white/20 btn-hover"
              >
                <TrendingUp className="w-5 h-5" />
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Other Active Tournaments */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Zap className="text-purple-400 w-8 h-8" />
          <h2 className="text-3xl font-bold text-white">Other Active Tournaments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* NodeOps Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚡</div>
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

            <p className="text-purple-200 text-sm mb-4">Strategic Chess AI Competition</p>

            <div className="space-y-3 mb-6">
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

            <div className="flex gap-2">
              <Link 
                href="/tournament/nodeops"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                Sign Up
              </Link>
              <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DefiCore Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
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

            <p className="text-purple-200 text-sm mb-4">Elite AI Chess Masters Tournament</p>

            <div className="space-y-3 mb-6">
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

            <div className="flex gap-2">
              <Link 
                href="/tournament/deficore"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                Sign Up
              </Link>
              <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cluster Tournament */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200 btn-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💎</div>
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

            <p className="text-purple-200 text-sm mb-4">Diamond League Chess Championship</p>

            <div className="space-y-3 mb-6">
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

            <div className="flex gap-2">
              <Link 
                href="/tournament/cluster"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                Sign Up
              </Link>
              <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
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