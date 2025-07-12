import Link from 'next/link'
import { Users, Clock, Trophy, TrendingUp, Target, Zap, Play, Eye } from 'lucide-react'

export default function MoonBeamTournamentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tournament Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-6xl">🌙</div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">MoonBeam Tournament</h1>
            <p className="text-purple-300 text-xl">$BEAM Championship Tournament</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE NOW
          </span>
          <span className="px-4 py-2 bg-yellow-500 text-black text-sm font-semibold rounded-full">
            FEATURED
          </span>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">$25,000</div>
          <p className="text-purple-300">Prize Pool</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">1,247</div>
          <p className="text-purple-300">Participants</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">2d 14h 30m</div>
          <p className="text-purple-300">Time Left</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">15</div>
          <p className="text-purple-300">Live Matches</p>
        </div>
      </div>

      {/* Live Matches Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Play className="text-purple-400 w-8 h-8" />
          <h2 className="text-3xl font-bold text-white">Live Matches</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Match 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
              <div className="text-purple-300 text-sm">Championship</div>
            </div>

            <div className="text-center mb-4">
              <div className="text-white font-bold text-lg">MoonBeam Alpha vs Lunar AI</div>
              <div className="text-purple-300 text-sm">Move 34 • 15+10 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                3,247
              </div>
            </div>

            <Link 
              href="/live-match"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Live
            </Link>
          </div>

          {/* Match 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
              <div className="text-purple-300 text-sm">Semi-Final</div>
            </div>

            <div className="text-center mb-4">
              <div className="text-white font-bold text-lg">Stellar Engine vs Cosmos AI</div>
              <div className="text-purple-300 text-sm">Move 19 • 15+10 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                2,089
              </div>
            </div>

            <Link 
              href="/live-match"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Live
            </Link>
          </div>

          {/* Match 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </span>
              <div className="text-purple-300 text-sm">Quarter-Final</div>
            </div>

            <div className="text-center mb-4">
              <div className="text-white font-bold text-lg">Galaxy Master vs Nebula Chess</div>
              <div className="text-purple-300 text-sm">Move 16 • 15+10 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                1,756
              </div>
            </div>

            <Link 
              href="/live-match"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Live
            </Link>
          </div>
        </div>
      </div>

      {/* Top Leaderboard */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="text-purple-400 w-8 h-8" />
          <h2 className="text-3xl font-bold text-white">Top Participants</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="space-y-4">
            {/* Leaderboard Header */}
            <div className="grid grid-cols-4 gap-4 text-purple-300 text-sm font-semibold border-b border-white/20 pb-2">
              <div>Rank</div>
              <div>AI Champion</div>
              <div>Wins</div>
              <div>Points</div>
            </div>

            {/* Leaderboard Entries */}
            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-yellow-400">🏆</div>
                <span>1</span>
              </div>
              <div>MoonBeam Alpha</div>
              <div>32</div>
              <div className="text-purple-400 font-bold">3,567</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">🥈</div>
                <span>2</span>
              </div>
              <div>Lunar AI Supreme</div>
              <div>30</div>
              <div className="text-purple-400 font-bold">3,234</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-orange-400">🥉</div>
                <span>3</span>
              </div>
              <div>Stellar Engine</div>
              <div>28</div>
              <div className="text-purple-400 font-bold">3,098</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div>4</div>
              <div>Cosmos AI</div>
              <div>26</div>
              <div className="text-purple-400 font-bold">2,945</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div>5</div>
              <div>Galaxy Master</div>
              <div>24</div>
              <div className="text-purple-400 font-bold">2,789</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/leaderboard"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Tournament Info */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">About MoonBeam Tournament</h3>
          <p className="text-purple-200 text-lg max-w-3xl mx-auto mb-6">
            The ultimate AI Chess Tournament powered by MoonBeam blockchain technology. Experience the largest prize pool 
            competition with advanced AI models competing in strategic gameplay for the $25,000 championship prize.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Championship Level</h4>
              <p className="text-purple-200 text-sm">Highest tier AI competition with elite strategies</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Largest Prize Pool</h4>
              <p className="text-purple-200 text-sm">$25,000 championship prize for ultimate winner</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">MoonBeam Powered</h4>
              <p className="text-purple-200 text-sm">Built on fast, secure MoonBeam blockchain</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 