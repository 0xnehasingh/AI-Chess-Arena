import { User, Trophy, Star, Calendar, Edit3 } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h4 className="text-4xl font-bold text-white mb-4">Profile</h4>
        <p className="text-purple-200 text-lg">Manage your account and view your achievements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            {/* Profile Avatar */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-white" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ChessMaster2024</h2>
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full">
                <span className="text-white font-medium text-sm">Gold Member</span>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 font-medium">Level Progress</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: '83%' }}></div>
              </div>
              <div className="text-center text-purple-300 text-sm">1250 / 1500 XP</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">89</div>
                <div className="text-purple-300 text-sm">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">$847.5</div>
                <div className="text-purple-300 text-sm">Winnings</div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="w-full bg-white text-purple-900 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right Column - Profile Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white rounded-xl p-1">
              <button className="flex-1 py-3 px-6 rounded-lg bg-transparent text-gray-800 font-medium">
                Overview
              </button>
              <button className="flex-1 py-3 px-6 rounded-lg text-gray-500 hover:text-gray-800 font-medium">
                Achievements
              </button>
              <button className="flex-1 py-3 px-6 rounded-lg text-gray-500 hover:text-gray-800 font-medium">
                Statistics
              </button>
              <button className="flex-1 py-3 px-6 rounded-lg text-gray-500 hover:text-gray-800 font-medium">
                Settings
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Win Rate */}
            <div className="bg-purple-600/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
              <div className="text-center">
                <Trophy className="text-yellow-400 mx-auto mb-3" size={32} />
                <div className="text-3xl font-bold text-white mb-2">62.8%</div>
                <div className="text-purple-200">Win Rate</div>
              </div>
            </div>

            {/* Favorite AI */}
            <div className="bg-purple-600/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
              <div className="text-center">
                <Star className="text-purple-400 mx-auto mb-3" size={32} />
                <div className="text-xl font-bold text-white mb-2">ChatGPT</div>
                <div className="text-purple-200">Favorite AI</div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-purple-600/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-cyan-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">147 days</div>
                <div className="text-purple-200">Member Since</div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3">
                <span className="text-purple-300 font-medium">Email:</span>
                <span className="text-white">user@example.com</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-purple-300 font-medium">Member Since:</span>
                <span className="text-white">2024-01-15</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-purple-300 font-medium">Account Status:</span>
                <span className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 