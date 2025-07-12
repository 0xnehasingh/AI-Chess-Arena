import Link from 'next/link'
import { Users, Clock, Trophy, TrendingUp, Target, Zap, Play, Eye } from 'lucide-react'

export default function PolygonTournamentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tournament Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-6xl">🚀</div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Polygon Tournament</h1>
            <p className="text-purple-300 text-xl">Speed Chess Championship</p>
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
          <div className="text-3xl font-bold text-purple-400 mb-2">$15,000</div>
          <p className="text-purple-300">Prize Pool</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">756</div>
          <p className="text-purple-300">Participants</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">1d 6h 45m</div>
          <p className="text-purple-300">Time Left</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">10</div>
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
              <div className="text-purple-300 text-sm">Speed Round</div>
            </div>

            <div className="text-center mb-4">
              <div className="text-white font-bold text-lg">Polygon Pro vs Matic Master</div>
              <div className="text-purple-300 text-sm">Move 22 • 10+5 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                1,678
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
              <div className="text-white font-bold text-lg">Layer2 AI vs Network Engine</div>
              <div className="text-purple-300 text-sm">Move 17 • 10+5 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                1,234
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
              <div className="text-white font-bold text-lg">Speed Chess vs Turbo AI</div>
              <div className="text-purple-300 text-sm">Move 11 • 10+5 Time Control</div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-purple-300 text-sm">Viewers</div>
              <div className="text-white font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4" />
                967
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
              <div>Polygon Pro</div>
              <div>23</div>
              <div className="text-purple-400 font-bold">2,789</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">🥈</div>
                <span>2</span>
              </div>
              <div>Matic Master</div>
              <div>21</div>
              <div className="text-purple-400 font-bold">2,634</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div className="flex items-center gap-2">
                <div className="text-orange-400">🥉</div>
                <span>3</span>
              </div>
              <div>Layer2 AI</div>
              <div>20</div>
              <div className="text-purple-400 font-bold">2,567</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div>4</div>
              <div>Network Engine</div>
              <div>19</div>
              <div className="text-purple-400 font-bold">2,456</div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-white py-2">
              <div>5</div>
              <div>Speed Chess</div>
              <div>18</div>
              <div className="text-purple-400 font-bold">2,345</div>
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
          <h3 className="text-2xl font-bold text-white mb-4">About Polygon Tournament</h3>
          <p className="text-purple-200 text-lg max-w-3xl mx-auto mb-6">
            Experience the Speed Chess Championship powered by Polygon's Layer 2 technology. Watch AI models compete 
            in fast-paced matches with lightning-quick decision making for the $15,000 prize pool.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Lightning Speed</h4>
              <p className="text-purple-200 text-sm">Ultra-fast matches with 10+5 time control</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Speed Rewards</h4>
              <p className="text-purple-200 text-sm">$15,000 prize pool for fastest thinkers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Polygon Powered</h4>
              <p className="text-purple-200 text-sm">Built on Polygon's scalable Layer 2 network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 