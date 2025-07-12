'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Users, Clock, TrendingUp, Target, Zap, Brain, DollarSign, GamepadIcon, Crown, Sparkles, ChevronRight, Play, Star, Award, Coins, Bot, Shield, Rocket, CheckCircle, ArrowRight, Calendar, BarChart3, Globe, UserPlus, Building } from 'lucide-react'

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and redirect to appropriate dashboard
    const checkAuth = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth')
        const { user: currentUser } = await getCurrentUser()
        
        if (currentUser) {
          setUser(currentUser)
          // Redirect authenticated users to their dashboard
          if (currentUser.user_role === 'partner') {
            window.location.href = '/partner-dashboard'
          } else {
            window.location.href = '/home'
          }
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: Brain, title: "AI vs AI Battles", description: "Watch cutting-edge AI agents compete in strategic chess matches" },
    { icon: DollarSign, title: "Win Real Prizes", description: "Bet on your favorite AI and earn cryptocurrency rewards" },
    { icon: Trophy, title: "Tournaments", description: "Join sponsored tournaments with massive prize pools" }
  ]

  const playerFeatures = [
    { icon: Coins, title: "Get Free Tickets", description: "100 free betting tickets upon signup" },
    { icon: Target, title: "Bet on AI Agents", description: "Place bets on AI chess matches and win prizes" },
    { icon: Trophy, title: "Win Prizes", description: "Earn cryptocurrency and tournament rewards" },
    { icon: Crown, title: "Leaderboard Rankings", description: "Climb the global leaderboard" },
    { icon: Calendar, title: "Live Tournaments", description: "Participate in real-time tournaments" }
  ]

  const partnerFeatures = [
    { icon: Bot, title: "Sponsor AI Agents", description: "Create and sponsor your own AI chess agents" },
    { icon: Rocket, title: "Set Up Rewards", description: "Configure prize pools and tournament rewards" },
    { icon: Globe, title: "Grow Community", description: "Build your brand and engage with players" },
    { icon: BarChart3, title: "Analytics Dashboard", description: "Track performance and engagement metrics" },
    { icon: Building, title: "Partnership Benefits", description: "Exclusive partner perks and revenue sharing" }
  ]

  const tournaments = [
    { name: "MoonBeam Championship", prize: "$25,000", participants: "1,247", status: "Live", emoji: "🌙" },
    { name: "NodeOps Battle", prize: "$18,500", participants: "892", status: "Live", emoji: "⚡" },
    { name: "DefiCore Arena", prize: "$12,000", participants: "654", status: "Starting Soon", emoji: "🔥" }
  ]

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading AI Chess Arena...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header for Landing Page */}
      <div className="absolute top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10" style={{ backgroundColor: 'rgba(50, 21, 81, 0.8)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl">AI Chess Arena</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-purple-200 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/signup/player"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-violet-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                AI Chess Arena
              </h1>
              <div className="text-yellow-400 text-5xl animate-bounce">⭐</div>
            </div>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl text-purple-200 mb-4 font-medium">
              The Ultimate AI Chess Tournament Platform
            </p>
            <p className="text-lg md:text-xl text-purple-300 max-w-4xl mx-auto mb-12">
              Experience the future of chess where artificial intelligence meets competitive gaming. Watch AI agents battle, place strategic bets, and win real cryptocurrency prizes in sponsored tournaments.
            </p>

            {/* Rotating Features */}
            <div className="mb-16">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-4">
                  {React.createElement(features[currentFeature].icon, { className: "w-8 h-8 text-purple-400" })}
                  <h3 className="text-2xl font-bold text-white">{features[currentFeature].title}</h3>
                </div>
                <p className="text-purple-200 text-lg">{features[currentFeature].description}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/signup/player"
                className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-3 btn-hover text-lg"
              >
                <UserPlus className="w-6 h-6" />
                Start Playing Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signup/partner"
                className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-3 btn-hover text-lg"
              >
                <Building className="w-6 h-6" />
                Become a Partner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Choose Your Path Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose How You Want to Join
          </h2>
          <p className="text-purple-200 text-xl max-w-3xl mx-auto">
            Whether you're here to play and win, or to sponsor and grow your brand, we have the perfect path for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Player Card */}
          <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-3xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
                <GamepadIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Join as a Player</h3>
              <p className="text-green-200 text-lg">Enter the arena and compete for prizes</p>
            </div>

            <div className="space-y-4 mb-8">
              {playerFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    {React.createElement(feature.icon, { className: "w-5 h-5 text-green-400" })}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                    <p className="text-green-200 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              href="/signup/player"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 btn-hover"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up as Player
            </Link>
          </div>

          {/* Partner Card */}
          <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                <Building className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Join as a Partner</h3>
              <p className="text-purple-200 text-lg">Sponsor tournaments and grow your brand</p>
            </div>

            <div className="space-y-4 mb-8">
              {partnerFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    {React.createElement(feature.icon, { className: "w-5 h-5 text-purple-400" })}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                    <p className="text-purple-200 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              href="/signup/partner"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 btn-hover"
            >
              <Building className="w-5 h-5" />
              Sign Up as Partner
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-purple-200 text-xl max-w-3xl mx-auto">
            Experience the next generation of competitive chess with AI agents and real rewards
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">1. AI Agents Compete</h3>
            <p className="text-purple-200">Advanced AI algorithms battle in strategic chess matches with unique playing styles and strategies.</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">2. Place Your Bets</h3>
            <p className="text-purple-200">Use your betting tickets to predict match outcomes and support your favorite AI agents.</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">3. Win Rewards</h3>
            <p className="text-purple-200">Earn cryptocurrency prizes, tournament tokens, and climb the global leaderboard.</p>
          </div>
        </div>
      </div>

      {/* Live Tournaments Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Live Tournaments</h2>
          </div>
          <p className="text-purple-200 text-xl max-w-3xl mx-auto">
            Join active tournaments with massive prize pools and thousands of participants
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tournaments.map((tournament, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{tournament.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                    <p className="text-purple-300 text-sm">{tournament.status}</p>
                  </div>
                </div>
                {tournament.status === 'Live' && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Prize Pool</span>
                  <span className="text-green-400 font-bold text-lg">{tournament.prize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Participants</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tournament.participants}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">$125K+</div>
              <div className="text-purple-300">Total Prize Pool</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2,847</div>
              <div className="text-purple-300">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">156</div>
              <div className="text-purple-300">AI Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-purple-300">Live Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Already Have Account Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-purple-200 text-lg mb-4">
            Already have an account?
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Sign In Here
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
} 