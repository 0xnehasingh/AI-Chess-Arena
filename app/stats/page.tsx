'use client'

import { Target, Trophy, Clock, Zap } from 'lucide-react'

export default function AIStatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h4 className="text-4xl font-bold text-white mb-4">AI Statistics</h4>
        <p className="text-purple-200 text-lg">Performance analysis of our AI chess champions</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-cyan-400" size={24} />
            <span className="text-purple-300 font-medium">Total Matches</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">789</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-purple-400" size={24} />
            <span className="text-purple-300 font-medium">Decisive Games</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">91.2%</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-green-400" size={24} />
            <span className="text-purple-300 font-medium">Avg Game Length</span>
          </div>
          <div className="text-3xl font-bold text-green-400">43:12</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-yellow-400" size={24} />
            <span className="text-purple-300 font-medium">Avg Think Time</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">4.3s</div>
        </div>
      </div>

      {/* AI Player Statistics */}
      <div className="space-y-6">
        {/* ChatGPT */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">ChatGPT</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full">
                    <span className="text-white font-medium text-sm">#1 Ranked</span>
                  </div>
                  <div className="bg-green-500 px-3 py-1 rounded-full">
                    <span className="text-white font-medium text-sm">Excellent</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400">2847</div>
              <div className="text-purple-300 text-sm">ELO Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Record */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Match Record
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Wins:</span>
                  <span className="text-green-400 font-bold text-lg">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Losses:</span>
                  <span className="text-red-400 font-bold text-lg">98</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Draws:</span>
                  <span className="text-gray-400 font-bold text-lg">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Win Rate:</span>
                  <span className="text-white font-bold text-lg">65.8%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: '65.8%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Avg Think Time:</span>
                  <span className="text-yellow-400 font-bold text-lg">4.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Current Streak:</span>
                  <span className="text-green-400 font-bold text-lg">+7 wins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Favorite Opening:</span>
                  <span className="text-white font-bold text-lg">Sicilian Defense</span>
                </div>
              </div>
            </div>

            {/* Recent Form */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap size={20} />
                Recent Form
              </h3>
              <div className="flex gap-2 mb-3">
                {['W', 'W', 'L', 'W', 'W', 'D', 'W', 'W'].map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      result === 'W' 
                        ? 'bg-green-500 text-white' 
                        : result === 'L'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
              <div className="text-purple-300 text-sm">Last 8 matches</div>
            </div>
          </div>
        </div>

        {/* Claude */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Claude</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
                    <span className="text-white font-medium text-sm">#2 Ranked</span>
                  </div>
                  <div className="bg-blue-500 px-3 py-1 rounded-full">
                    <span className="text-white font-medium text-sm">Very Good</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">2821</div>
              <div className="text-purple-300 text-sm">ELO Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Record */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Match Record
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Wins:</span>
                  <span className="text-green-400 font-bold text-lg">138</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Losses:</span>
                  <span className="text-red-400 font-bold text-lg">104</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Draws:</span>
                  <span className="text-gray-400 font-bold text-lg">21</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Win Rate:</span>
                  <span className="text-white font-bold text-lg">62.5%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: '62.5%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Avg Think Time:</span>
                  <span className="text-yellow-400 font-bold text-lg">3.8s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Current Streak:</span>
                  <span className="text-green-400 font-bold text-lg">+3 wins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Favorite Opening:</span>
                  <span className="text-white font-bold text-lg">Queen's Gambit</span>
                </div>
              </div>
            </div>

            {/* Recent Form */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap size={20} />
                Recent Form
              </h3>
              <div className="flex gap-2 mb-3">
                {['W', 'W', 'L', 'W', 'W', 'D', 'W', 'W'].map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      result === 'W' 
                        ? 'bg-green-500 text-white' 
                        : result === 'L'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
              <div className="text-purple-300 text-sm">Last 8 matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 