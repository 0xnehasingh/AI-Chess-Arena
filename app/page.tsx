import { LiveMatch } from '@/components/live-match/LiveMatch'
import { BettingInterface } from '@/components/betting/BettingInterface'

export default function HomePage() {
  return (
    <div className="container mx-auto px-2 py-6">
      <div className="text-center mb-8">
        <h4 className="text-2xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Battle #42 - ChatGPT vs Claude
        </h4>
        <p className="text-purple-200 text-lg md:text-xl">
          Live AI Chess Championship
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* AI Champions Section */}
        <div className="xl:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">AI Champions</h2>
            
            {/* ChatGPT */}
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">ChatGPT</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">🟡 Thinking...</span>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-purple-300 font-semibold mb-4">VS</div>

            {/* Claude */}
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🧠</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Claude</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm">🟢 Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Timer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>⏱️</span>
              Match Timer
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <span className="text-cyan-400 font-medium">ChatGPT</span>
                <span className="text-white font-mono text-xl">9:26</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <span className="text-purple-400 font-medium">Claude</span>
                <span className="text-white font-mono text-xl">9:40</span>
              </div>
              <div className="text-center text-sm text-purple-300 mt-4 p-2 bg-white/5 rounded-lg">
                Next move in: <span className="font-mono text-white">00:03</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chess Board */}
        <div className="xl:col-span-1">
          <LiveMatch />
        </div>

        {/* Betting Interface */}
        <div className="xl:col-span-1">
          <BettingInterface />
        </div>
      </div>
    </div>
  )
} 