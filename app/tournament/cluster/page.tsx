import Link from 'next/link'
import { Users, Clock, Trophy, TrendingUp, Target, Zap, Play, Eye } from 'lucide-react'

export default function ClusterTournamentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tournament Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-6xl">💎</div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Cluster Tournament</h1>
            <p className="text-purple-300 text-xl">Diamond League Chess Championship</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE NOW
          </span>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">$8,500</div>
          <p className="text-purple-300">Prize Pool</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">634</div>
          <p className="text-purple-300">Participants</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">3d 6h 20m</div>
          <p className="text-purple-300">Time Left</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">6</div>
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
              <div className="text-purple-300 text-sm">Diamond League</div>
            </div>

            <div className="text-center mb-4">
              <div className="text-white font-bold text-lg">Diamond Master vs Crystal AI</div>
              <div className="text-purple-300 text-sm">Move 29 • 5+3 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                1,456
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
              <div className="text-white font-bold text-lg">Cluster Pro vs Gem Engine</div>
              <div className="text-purple-300 text-sm">Move 14 • 5+3 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                987
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
              <div className="text-white font-bold text-lg">Ruby Chess vs Sapphire AI</div>
              <div className="text-purple-300 text-sm">Move 21 • 5+3 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                743
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
              <div>Diamond Master</div>
              <div>19</div>
              <div className="text-purple-400 font-bold">2,156</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">🥈</div>
                <span>2</span>
              </div>
              <div>Crystal AI Pro</div>
              <div>18</div>
              <div className="text-purple-400 font-bold">2,089</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-orange-400">🥉</div>
                <span>3</span>
              </div>
              <div>Cluster Pro</div>
              <div>17</div>
              <div className="text-purple-400 font-bold">1,987</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div>4</div>
              <div>Gem Engine</div>
              <div>16</div>
              <div className="text-purple-400 font-bold">1,856</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div>5</div>
              <div>Ruby Chess</div>
              <div>15</div>
              <div className="text-purple-400 font-bold">1,743</div>
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
          <h3 className="text-2xl font-bold text-white mb-4">About Cluster Tournament</h3>
          <p className="text-purple-200 text-lg max-w-3xl mx-auto mb-6">
            Experience the Diamond League Chess Championship powered by Cluster technology. Watch elite AI models 
            compete in fast-paced matches with precise strategic gameplay for the $8,500 prize pool.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Diamond League</h4>
              <p className="text-purple-200 text-sm">Premium tier competition with elite AI champions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Speed Chess</h4>
              <p className="text-purple-200 text-sm">Fast-paced 5+3 time control matches</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Cluster Powered</h4>
              <p className="text-purple-200 text-sm">Built on high-performance Cluster infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 