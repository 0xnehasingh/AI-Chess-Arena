'use client'

import { useState, useEffect } from 'react'
import { Trophy, Bot, BarChart3, Brain, User, Plus, Play, TrendingUp, Activity, Settings, LogOut, Upload, Save } from 'lucide-react'
import { useRequireAuth } from '../../components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { signOut } from '../../lib/auth'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'

export default function PartnerDashboard() {
  const { user, loading } = useRequireAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('matches')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    website: '',
    telegram_discord: '',
    logo_url: '',
    banner_url: '',
    short_bio: '',
    ticket_name: ''
  })

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        website: user.website || '',
        telegram_discord: user.telegram_discord || '',
        logo_url: user.logo_url || '',
        banner_url: user.banner_url || '',
        short_bio: user.short_bio || '',
        ticket_name: user.ticket_name || ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement save functionality
      console.log('Saving partner profile:', formData)
      // For now, just show success message
      toast.success('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // This shouldn't happen due to useRequireAuth redirect
  }

  // Redirect non-partners to user dashboard
  if (user.user_role !== 'partner') {
    router.push('/home')
    return null
  }

  const getPartnerName = () => {
    if (user.project_name) return user.project_name
    if (user.display_name) return user.display_name
    if (user.username) return user.username
    return 'Partner'
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        toast.error(error)
      } else {
        toast.success('Signed out successfully')
        router.push('/')
      }
    } catch (err) {
      toast.error('Failed to sign out')
    }
  }

  const tabs = [
    { id: 'matches', label: 'Matches', icon: Trophy },
    { id: 'create-agent', label: 'Create Agent', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-stats', label: 'AI Stats', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'matches':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Match Management</h2>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
                <Plus size={20} />
                Create Match
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Active Matches */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Active Matches</h3>
                  <Play className="text-green-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">12</div>
                <p className="text-purple-200 text-sm">Currently running</p>
              </div>

              {/* Completed Matches */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Completed</h3>
                  <Trophy className="text-yellow-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">847</div>
                <p className="text-purple-200 text-sm">Total matches</p>
              </div>

              {/* Revenue */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Revenue</h3>
                  <TrendingUp className="text-blue-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">$2,847</div>
                <p className="text-purple-200 text-sm">This month</p>
              </div>
            </div>

            {/* Recent Matches Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-purple-200 py-2">Match ID</th>
                      <th className="text-left text-purple-200 py-2">Players</th>
                      <th className="text-left text-purple-200 py-2">Status</th>
                      <th className="text-left text-purple-200 py-2">Bets</th>
                      <th className="text-left text-purple-200 py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="text-white py-3">#M001</td>
                      <td className="text-white py-3">GPT-4 vs Claude</td>
                      <td className="text-green-400 py-3">Active</td>
                      <td className="text-white py-3">24</td>
                      <td className="text-white py-3">$125</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="text-white py-3">#M002</td>
                      <td className="text-white py-3">Gemini vs Llama</td>
                      <td className="text-yellow-400 py-3">Completed</td>
                      <td className="text-white py-3">18</td>
                      <td className="text-white py-3">$87</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'create-agent':
        return (
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Agent Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., GPT-Alpha, Claude-Beta"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-3">
                    LLM Model <span className="text-red-400">*</span>
                  </label>
                  <select className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg">
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3">Claude-3</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="custom">Custom Model</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-semibold mb-3">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Describe your AI agent and what makes it special..."
                  rows={6}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg resize-none"
                />
              </div>
            </div>

            {/* Prize Pool & Entry Requirements Section */}
            <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-md rounded-2xl p-8 border border-green-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Prize Pool & Entry Requirements</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Prize Pool ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Ticket Token Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="$MOON, $STAR"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Min Entry Tickets <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Time Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Time</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-3">From</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3">To</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Social Task Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Social Task</h3>
              <textarea
                placeholder="Define social media tasks or requirements for participants..."
                rows={4}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg resize-none"
              />
            </div>

            {/* Media Asset Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Media Asset</h3>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Upload className="mx-auto text-white/50 mb-4" size={64} />
                <p className="text-white/70 text-xl mb-2">Click to upload media assets</p>
                <p className="text-purple-300">Images, videos, or promotional materials for your tournament</p>
              </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-center pt-8">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 text-white py-4 px-16 rounded-2xl font-bold text-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Bets</h3>
                  <Activity className="text-blue-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">1,247</div>
                <p className="text-green-400 text-sm">+12% from last month</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Revenue</h3>
                  <TrendingUp className="text-green-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">$8,847</div>
                <p className="text-green-400 text-sm">+24% from last month</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Active Users</h3>
                  <User className="text-purple-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">342</div>
                <p className="text-green-400 text-sm">+8% from last month</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Conversion</h3>
                  <BarChart3 className="text-yellow-400" size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">68%</div>
                <p className="text-green-400 text-sm">+5% from last month</p>
              </div>
            </div>

            {/* Charts would go here */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-center justify-center">
                <p className="text-purple-200">Chart visualization would be implemented here</p>
              </div>
            </div>
          </div>
        )

      case 'ai-stats':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">AI Performance Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">GPT-4</span>
                    <span className="text-white font-semibold">Win Rate: 74%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{width: '74%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Claude-3</span>
                    <span className="text-white font-semibold">Win Rate: 68%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Gemini Pro</span>
                    <span className="text-white font-semibold">Win Rate: 62%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{width: '62%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Analysis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-purple-200">Aggressive</span>
                    <span className="text-white">65% Win Rate</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-purple-200">Defensive</span>
                    <span className="text-white">71% Win Rate</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-purple-200">Balanced</span>
                    <span className="text-white">68% Win Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-8">
            {/* Website */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Telegram/Discord */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Telegram/ Discord
              </label>
              <input
                type="text"
                name="telegram_discord"
                value={formData.telegram_discord}
                onChange={handleInputChange}
                placeholder="@your_handle or Discord invite"
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Upload Logo */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Upload Logo
              </label>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Upload className="mx-auto text-white/50 mb-3" size={48} />
                <p className="text-white/70 text-lg">Click to upload logo</p>
                <p className="text-purple-300 text-sm mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>

            {/* Upload Banner */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Upload Banner
              </label>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <Upload className="mx-auto text-white/50 mb-3" size={48} />
                <p className="text-white/70 text-lg">Click to upload banner</p>
                <p className="text-purple-300 text-sm mt-1">Recommended: 1200x400px</p>
              </div>
            </div>

            {/* Short Bio */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Short Bio
              </label>
              <textarea
                name="short_bio"
                value={formData.short_bio}
                onChange={handleInputChange}
                placeholder="Tell the community about your project and vision..."
                rows={4}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg resize-none"
              />
            </div>

            {/* Your Ticket Name */}
            <div>
              <label className="block text-white text-lg font-semibold mb-3">
                Your Ticket name
              </label>
              <input
                type="text"
                name="ticket_name"
                value={formData.ticket_name}
                onChange={handleInputChange}
                placeholder="e.g., MOONBEAM, DEFICORE"
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Partner Header */}
      <div className="backdrop-blur-md border-b border-white/10 sticky top-0 z-50" style={{ backgroundColor: '#321551' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <span className="text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Chess Arena
              </span>
              <span className="text-purple-300 text-sm">Partner Dashboard</span>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Partner Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getPartnerName().substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-white font-medium">{getPartnerName()}</div>
                  <div className="text-purple-300 text-sm">Partner</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
                            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-200 text-lg">
            Welcome back, {getPartnerName()}! Manage your AI Chess Arena partnership.
          </p>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
} 