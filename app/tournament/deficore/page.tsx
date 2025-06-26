import Link from 'next/link'
import { Users, FileText, Trophy, TrendingUp, Target, Flame } from 'lucide-react'

export default function DefiCoreSignUpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Choose How You Want to Join
        </h1>
        <p className="text-purple-200 text-lg md:text-xl max-w-3xl mx-auto">
          Join as a player to predict and win tickets, or as a partner to sponsor AI agents.
        </p>
      </div>

      {/* Two Options Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
        
        {/* Join as a Player Card */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          {/* Green accent border on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Header with Icon */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Users className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Join as a Player</h2>
            </div>

            {/* Features List */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-green-100 text-lg">Get free $DFC tokens</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-green-100 text-lg">Bet on elite AI chess masters</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-green-100 text-lg">Win from $12,000 prize pool</span>
              </div>
            </div>

            {/* Sign Up Button */}
            <Link 
              href="/signup/player"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 btn-hover"
            >
              <Users className="w-5 h-5" />
              Sign Up as User
            </Link>
          </div>
        </div>

        {/* Join as a Partner Card */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          {/* Green accent border on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Header with Icon */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <FileText className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Join as a Partner</h2>
            </div>

            {/* Features List */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-green-100 text-lg">Sponsor DefiCore elite AI models</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-green-100 text-lg">Set up $DFC token reward pools</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-green-100 text-lg">Grow DefiCore DeFi ecosystem</span>
              </div>
            </div>

            {/* Sign Up Button */}
            <Link 
              href="/signup/partner"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 btn-hover"
            >
              <FileText className="w-5 h-5" />
              Sign Up as Partner
            </Link>
          </div>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-purple-300 text-lg">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-green-400 hover:text-green-300 font-semibold transition-colors underline"
          >
            Log in here
          </Link>
        </p>
      </div>

      {/* Background Tournament Info */}
      <div className="mt-16 text-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl">🔥</div>
            <h3 className="text-xl font-bold text-white">DefiCore Tournament</h3>
          </div>
          <p className="text-purple-200 mb-4">
            Elite AI Chess Masters Tournament - Join the DefiCore DeFi ecosystem
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-green-400 font-bold text-lg">$12,000</div>
              <div className="text-purple-300 text-sm">Prize Pool</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-lg">1,589</div>
              <div className="text-purple-300 text-sm">Participants</div>
            </div>
            <div>
              <div className="text-green-400 font-bold text-lg">12h 45m</div>
              <div className="text-purple-300 text-sm">Time Left</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 