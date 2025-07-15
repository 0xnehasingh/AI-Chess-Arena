'use client'

import { User, Trophy, Star, Calendar, Edit3, Mail, Shield, DollarSign, Globe, MessageCircle, Upload, FileText, Award } from 'lucide-react'
import { useRequireAuth } from '@/components/providers/AuthProvider'
import { usePartnerRedirect } from '../../hooks/usePartnerRedirect'
import { useState, useEffect } from 'react'

interface RecentActivity {
  id: string
  type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'account_created'
  description: string
  amount?: number
  created_at: string
  status?: string
  match_info?: string
}

interface ProfileData {
  created_at: string
  total_winnings: number
  total_bets: number
  win_rate: number
  tickets_balance: number
}

export default function ProfilePage() {
  const { user, loading } = useRequireAuth()
  const { isPartner, loading: partnerLoading } = usePartnerRedirect()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Fetch dynamic profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoadingData(false)
        return
      }

      try {
        setLoadingData(true)
        console.log('Fetching profile data for user:', user.id)

        // Get session for API calls
        const { supabase } = await import('../../lib/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          console.log('No session found, using user data from auth provider')
          // Fallback to user data from auth provider
          setProfileData({
            created_at: new Date().toISOString(), // Fallback date
            total_winnings: user.total_winnings || 0,
            total_bets: user.total_bets || 0,
            win_rate: user.win_rate || 0,
            tickets_balance: user.tickets_balance || 0
          })
          setLoadingData(false)
          return
        }

        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('created_at, total_winnings, total_bets, win_rate, tickets_balance')
          .eq('id', user.id)
          .single()

        if (profile && !profileError) {
          setProfileData(profile)
        } else {
          // Fallback to user data from auth provider
          setProfileData({
            created_at: new Date().toISOString(), // Fallback date
            total_winnings: user.total_winnings || 0,
            total_bets: user.total_bets || 0,
            win_rate: user.win_rate || 0,
            tickets_balance: user.tickets_balance || 0
          })
        }

        // Fetch recent betting activity with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        try {
          const response = await fetch('/api/user-bets', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            const activity: RecentActivity[] = []

            // Add account creation
            if (profile?.created_at) {
              activity.push({
                id: 'account_created',
                type: 'account_created',
                description: 'Account created',
                created_at: profile.created_at
              })
            }

            // Add recent bets (last 5)
            if (data.bets && data.bets.length > 0) {
              const recentBets = data.bets.slice(0, 5)
              recentBets.forEach((bet: any) => {
                const matchInfo = bet.matches ? 
                  `${bet.matches.champion_white} vs ${bet.matches.champion_black}` : 
                  'AI Match'
                
                if (bet.status === 'won') {
                  activity.push({
                    id: bet.id,
                    type: 'bet_won',
                    description: `Won bet on ${matchInfo}`,
                    amount: bet.payout_amount || bet.amount,
                    created_at: bet.created_at,
                    status: bet.status
                  })
                } else if (bet.status === 'lost') {
                  activity.push({
                    id: bet.id,
                    type: 'bet_lost',
                    description: `Lost bet on ${matchInfo}`,
                    amount: bet.amount,
                    created_at: bet.created_at,
                    status: bet.status
                  })
                } else {
                  activity.push({
                    id: bet.id,
                    type: 'bet_placed',
                    description: `Placed bet on ${matchInfo}`,
                    amount: bet.amount,
                    created_at: bet.created_at,
                    status: bet.status
                  })
                }
              })
            }

            // Sort by date (newest first)
            activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setRecentActivity(activity.slice(0, 5)) // Show only 5 most recent
          } else {
            console.log('Failed to fetch betting data, using fallback')
            setRecentActivity([])
          }
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            console.log('Betting data fetch timed out')
          } else {
            console.error('Error fetching betting data:', fetchError)
          }
          setRecentActivity([])
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        // Set fallback data
        setProfileData({
          created_at: new Date().toISOString(),
          total_winnings: user.total_winnings || 0,
          total_bets: user.total_bets || 0,
          win_rate: user.win_rate || 0,
          tickets_balance: user.tickets_balance || 0
        })
        setRecentActivity([])
      } finally {
        setLoadingData(false)
      }
    }

    fetchProfileData()
  }, [user])

  // Show loading state
  if (loading || partnerLoading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    )
  }

  // If no user and not loading, useRequireAuth will handle redirect
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-lg">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  // Don't render if partner (will be redirected)
  if (isPartner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-lg">Redirecting to partner dashboard...</div>
        </div>
      </div>
    )
  }

  // Calculate member days using real creation date
  const calculateMemberDays = () => {
    if (!profileData?.created_at) return 0
    const createdDate = new Date(profileData.created_at)
    const now = new Date()
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const memberDays = calculateMemberDays()

  // Generate initials for avatar
  const getInitials = () => {
    if (user.display_name) {
      return user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    return user.email.substring(0, 2).toUpperCase()
  }

  // Calculate level progress (example calculation)
  const calculateLevel = () => {
    const baseXP = user.total_bets ? user.total_bets * 10 : 0
    const winBonus = user.total_winnings ? Math.floor(user.total_winnings * 2) : 0
    const currentXP = baseXP + winBonus
    const currentLevel = Math.floor(currentXP / 100) + 1
    const nextLevelXP = currentLevel * 100
    const progress = (currentXP % 100) / 100 * 100
    
    return { currentXP, nextLevelXP, progress, level: currentLevel }
  }

  const levelInfo = calculateLevel()

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  }

  // Get activity icon and color
  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'bet_won':
        return { icon: Trophy, color: 'bg-green-500', textColor: 'text-green-400' }
      case 'bet_lost':
        return { icon: Trophy, color: 'bg-red-500', textColor: 'text-red-400' }
      case 'bet_placed':
        return { icon: Star, color: 'bg-blue-500', textColor: 'text-blue-400' }
      case 'account_created':
        return { icon: User, color: 'bg-purple-500', textColor: 'text-purple-400' }
      default:
        return { icon: Star, color: 'bg-gray-500', textColor: 'text-gray-400' }
    }
  }

  // Partner Profile Component
  const PartnerProfile = () => (
    <div className="space-y-8">
      {/* Partner Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome {user.display_name || user.username}
          </h2>
          <p className="text-purple-200 text-lg mb-4">Complete your partner profile</p>
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full">
            <Award className="w-5 h-5 mr-2 text-white" />
            <span className="text-white font-medium">Partner Status</span>
          </div>
        </div>
      </div>

      {/* Partner Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Website */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-blue-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Website</h3>
            </div>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://your-website.com"
                defaultValue={user.website || ''}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-purple-300 text-sm">Your official website or homepage</p>
            </div>
          </div>

          {/* Telegram/Discord */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-green-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Telegram / Discord</h3>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="@your_handle or Discord invite"
                defaultValue={user.telegram_discord || ''}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-purple-300 text-sm">Community contact for support and updates</p>
            </div>
          </div>

          {/* Ticket Name */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Star className="text-yellow-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Your Ticket Name</h3>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="e.g., MOONBEAM, DEFICORE"
                defaultValue={user.ticket_name || ''}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-purple-300 text-sm">Custom betting ticket identifier for your community</p>
            </div>
          </div>
        </div>

        {/* Right Column - Media & Description */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="text-cyan-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Upload Logo</h3>
            </div>
            <div className="space-y-4">
              {user.logo_url ? (
                <div className="flex items-center justify-center">
                  <img 
                    src={user.logo_url} 
                    alt="Partner Logo" 
                    className="w-24 h-24 object-contain rounded-lg bg-white/10 p-2"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                  <Upload className="mx-auto text-white/50 mb-3" size={48} />
                  <p className="text-white/70">Click to upload logo</p>
                  <p className="text-purple-300 text-sm mt-1">PNG, JPG up to 2MB</p>
                </div>
              )}
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
                Choose Logo File
              </button>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="text-pink-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Upload Banner</h3>
            </div>
            <div className="space-y-4">
              {user.banner_url ? (
                <div className="aspect-video bg-white/10 rounded-lg overflow-hidden">
                  <img 
                    src={user.banner_url} 
                    alt="Partner Banner" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="mx-auto text-white/50 mb-3" size={48} />
                    <p className="text-white/70">Click to upload banner</p>
                    <p className="text-purple-300 text-sm mt-1">Recommended: 1200x400px</p>
                  </div>
                </div>
              )}
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
                Choose Banner File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Short Bio */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-indigo-400" size={24} />
          <h3 className="text-xl font-semibold text-white">Short Bio</h3>
        </div>
        <div className="space-y-3">
          <textarea
            placeholder="Tell the community about your project and vision..."
            defaultValue={user.short_bio || ''}
            rows={4}
            className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-purple-300 text-sm">Brief description of your project and goals (max 500 characters)</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all">
          Save Partner Profile
        </button>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h4 className="text-4xl font-bold text-white mb-4">Profile</h4>
        <p className="text-purple-200 text-lg">
          {isPartner ? 'Manage your partner profile and settings' : 'Manage your account and view your achievements'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            {/* Profile Avatar */}
            <div className="text-center mb-6">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className={`w-24 h-24 ${isPartner ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-400 to-purple-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white text-2xl font-bold">{getInitials()}</span>
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-2">
                {user.display_name || user.username || 'Anonymous User'}
              </h2>
              <div className={`inline-flex items-center ${isPartner ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} px-3 py-1 rounded-full`}>
                <span className="text-white font-medium text-sm">
                  {isPartner ? 'Partner' : `Level ${levelInfo.level}`}
                </span>
              </div>
            </div>

            {/* Level Progress (only for players) */}
            {!isPartner && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-300 font-medium">Level Progress</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${levelInfo.progress}%` }}
                  ></div>
                </div>
                <div className="text-center text-purple-300 text-sm">
                  {levelInfo.currentXP} / {levelInfo.nextLevelXP} XP
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">
                  {loadingData ? '...' : profileData?.total_bets || 0}
                </div>
                <div className="text-purple-300 text-sm">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {loadingData ? '...' : `${profileData?.tickets_balance || 0} 🎫`}
                </div>
                <div className="text-purple-300 text-sm">Tickets</div>
              </div>
            </div>

            {/* Additional Ticket Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {loadingData ? '...' : user.total_tickets_earned || 0}
                </div>
                <div className="text-purple-300 text-sm">Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {user.total_tickets_spent || 0}
                </div>
                <div className="text-purple-300 text-sm">Spent</div>
              </div>
            </div>

            {/* Contact Info (for partners) */}
            {isPartner && (
              <div className="mb-6 space-y-3">
                {user.website && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <Globe size={16} />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">
                      {user.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
                {user.telegram_discord && (
                  <div className="flex items-center gap-2 text-purple-200">
                    <MessageCircle size={16} />
                    <span className="text-sm">{user.telegram_discord}</span>
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile Button */}
            <button className="w-full bg-white text-purple-900 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Right Column - Profile Content */}
        <div className="lg:col-span-2">
          {isPartner ? (
            <PartnerProfile />
          ) : (
            <>
              {/* Tabs for Players */}
              <div className="mb-8">
                <div className="flex space-x-1 bg-white rounded-xl p-1">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      activeTab === 'overview' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-transparent text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('achievements')}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      activeTab === 'achievements' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-transparent text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    Achievements
                  </button>
                  <button 
                    onClick={() => setActiveTab('statistics')}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      activeTab === 'statistics' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-transparent text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    Statistics
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      activeTab === 'settings' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-transparent text-gray-800 hover:text-gray-600'
                    }`}
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* Tab Content for Players */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Win Rate */}
                    <div className="bg-purple-600/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
                      <div className="text-center">
                        <Trophy className="text-yellow-400 mx-auto mb-3" size={32} />
                        <div className="text-3xl font-bold text-white mb-2">
                          {loadingData ? '...' : profileData?.win_rate ? `${(profileData.win_rate * 100).toFixed(1)}%` : '0%'}
                        </div>
                        <div className="text-purple-200">Win Rate</div>
                      </div>
                    </div>

                    {/* Total Winnings */}
                    <div className="bg-purple-600/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
                      <div className="text-center">
                        <DollarSign className="text-green-400 mx-auto mb-3" size={32} />
                        <div className="text-xl font-bold text-white mb-2">
                          {loadingData ? '...' : `${profileData?.total_winnings || 0} tickets`}
                        </div>
                        <div className="text-purple-200">Total Winnings</div>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="bg-purple-600/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
                      <div className="text-center">
                        <Calendar className="text-blue-400 mx-auto mb-3" size={32} />
                        <div className="text-xl font-bold text-white mb-2">
                          {loadingData ? '...' : memberDays}
                        </div>
                        <div className="text-purple-200">Days as Member</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {loadingData ? (
                        <div className="text-center text-purple-300">Loading activity...</div>
                      ) : recentActivity.length === 0 ? (
                        <div className="text-center text-purple-300">No recent activity found.</div>
                      ) : (
                        recentActivity.map((activity) => {
                          const { icon: ActivityIcon, color, textColor } = getActivityIcon(activity.type, activity.status)
                          return (
                            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-white/10">
                              <div className="flex items-center gap-3">
                                                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                                   <ActivityIcon size={20} className="text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{activity.description}</p>
                                  <p className="text-purple-300 text-sm">{formatTimeAgo(activity.created_at)}</p>
                                </div>
                              </div>
                                                             {activity.amount !== undefined && (
                                 <span className={`${textColor} font-bold`}>
                                   {activity.type === 'bet_won' ? '+' : activity.type === 'bet_lost' ? '-' : ''}{activity.amount} tickets
                                 </span>
                               )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'achievements' && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-6">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 text-center">
                      <Trophy className="text-yellow-400 mx-auto mb-2" size={32} />
                      <h4 className="text-white font-semibold">First Win</h4>
                      <p className="text-yellow-200 text-sm">Won your first bet</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 text-center">
                      <Star className="text-blue-400 mx-auto mb-2" size={32} />
                      <h4 className="text-white font-semibold">High Roller</h4>
                      <p className="text-blue-200 text-sm">Bet over $100</p>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                      <Calendar className="text-green-400 mx-auto mb-2" size={32} />
                      <h4 className="text-white font-semibold">Streak Master</h4>
                      <p className="text-green-200 text-sm">5 wins in a row</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-6">Betting Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">
                          {loadingData ? '...' : profileData?.total_bets || 0}
                        </div>
                        <div className="text-purple-300 text-sm">Total Bets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {loadingData ? '...' : profileData?.win_rate && profileData?.total_bets ? Math.round((profileData.win_rate * profileData.total_bets)) : 0}
                        </div>
                        <div className="text-purple-300 text-sm">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400 mb-1">
                          {loadingData ? '...' : profileData?.total_bets && profileData?.win_rate ? (profileData.total_bets - Math.round(profileData.win_rate * profileData.total_bets)) : 0}
                        </div>
                        <div className="text-purple-300 text-sm">Losses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">
                          {loadingData ? '...' : profileData?.win_rate ? `${(profileData.win_rate * 100).toFixed(1)}%` : '0%'}
                        </div>
                        <div className="text-purple-300 text-sm">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-purple-300 text-sm font-medium mb-2">Display Name</label>
                        <input
                          type="text"
                          defaultValue={user.display_name || ''}
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-300 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-300 text-sm font-medium mb-2">Username</label>
                        <input
                          type="text"
                          defaultValue={user.username || ''}
                          className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-6">Security</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
                        Change Password
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
                        Enable Two-Factor Authentication
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 