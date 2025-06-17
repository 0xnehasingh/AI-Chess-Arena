'use client'

import { useState } from 'react'
import { Clock, Target, DollarSign, Trophy, HelpCircle, Shield, BarChart3, CheckCircle } from 'lucide-react'

type TabType = 'overview' | 'betting' | 'features' | 'faq'

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const renderOverviewTab = () => (
    <>
      {/* 4-Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Step 1 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-white" size={32} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Watch Live Matches</h3>
          <p className="text-purple-200 leading-relaxed">
            AI chess champions battle in real-time with live commentary and analysis
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-white" size={32} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Analyze & Predict</h3>
          <p className="text-purple-200 leading-relaxed">
            Study AI statistics, playing styles, and current form to make informed predictions
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-white" size={32} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>
          <p className="text-purple-200 leading-relaxed">
            Choose your AI champion and bet amount. Odds are calculated in real-time
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-white" size={32} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Win Rewards</h3>
          <p className="text-purple-200 leading-relaxed">
            Collect winnings when your AI wins. Build your profile and climb the leaderboards
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-12 border border-white/30 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">The Future of Competitive Chess</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-cyan-500 px-6 py-3 rounded-full">
            <span className="text-white font-semibold">Live Matches</span>
          </div>
          <div className="bg-purple-500 px-6 py-3 rounded-full">
            <span className="text-white font-semibold">Real-Time Betting</span>
          </div>
          <div className="bg-green-500 px-6 py-3 rounded-full">
            <span className="text-white font-semibold">Instant Payouts</span>
          </div>
        </div>
      </div>
    </>
  )

  const renderBettingGuideTab = () => (
    <div className="space-y-8">
      {/* Betting Basics */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Betting Basics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Understanding Odds */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Understanding Odds</h3>
            <p className="text-purple-200 mb-4 leading-relaxed">
              Odds represent the potential payout for a winning bet. Higher odds mean higher risk but greater reward.
            </p>
            <div className="bg-purple-600/30 rounded-lg p-4 font-mono text-purple-300">
              Example: $10 bet at 2.1x odds = $21 total return ($11 profit)
            </div>
          </div>

          {/* Bet Types */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Bet Types</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Winner:</span>
                <span className="text-white">Pick the match winner</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Draw:</span>
                <span className="text-white">Bet on a draw result</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Duration:</span>
                <span className="text-white">Over/under match length</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Betting Strategy Tips */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Betting Strategy Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Research AI Stats */}
          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-lg font-bold text-cyan-400 mb-3">Research AI Stats</h4>
            <p className="text-purple-200 leading-relaxed">
              Study recent performance, win rates, and head-to-head records before betting.
            </p>
          </div>

          {/* Manage Your Bankroll */}
          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-400 mb-3">Manage Your Bankroll</h4>
            <p className="text-purple-200 leading-relaxed">
              Set betting limits and stick to them. Never bet more than you can afford to lose.
            </p>
          </div>

          {/* Watch Live Matches */}
          <div className="bg-white/5 rounded-xl p-6">
            <h4 className="text-lg font-bold text-green-400 mb-3">Watch Live Matches</h4>
            <p className="text-purple-200 leading-relaxed">
              Observe AI behavior patterns and adapt your strategy based on real-time performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFeaturesTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Real-Time Matches */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Clock className="text-white" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white">Real-Time Matches</h3>
        </div>
        <p className="text-purple-200 text-lg leading-relaxed">
          Watch AI systems battle live with move-by-move analysis
        </p>
      </div>

      {/* Fair Odds */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white">Fair Odds</h3>
        </div>
        <p className="text-purple-200 text-lg leading-relaxed">
          Dynamic odds based on AI performance and real-time analysis
        </p>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white">Detailed Stats</h3>
        </div>
        <p className="text-purple-200 text-lg leading-relaxed">
          Comprehensive AI statistics to help you make informed bets
        </p>
      </div>

      {/* Secure Betting */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-white" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white">Secure Betting</h3>
        </div>
        <p className="text-purple-200 text-lg leading-relaxed">
          Safe and secure platform with transparent results
        </p>
      </div>
    </div>
  )

  const renderFAQTab = () => (
    <div className="space-y-6">
      {/* FAQ Item 1 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-purple-400" size={24} />
          <h3 className="text-xl font-bold text-white">How are the matches determined?</h3>
        </div>
        <p className="text-purple-200 leading-relaxed">
          AI systems are matched based on their current ratings and performance metrics. Each match is completely autonomous with no human intervention during gameplay.
        </p>
      </div>

      {/* FAQ Item 2 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-purple-400" size={24} />
          <h3 className="text-xl font-bold text-white">How are odds calculated?</h3>
        </div>
        <p className="text-purple-200 leading-relaxed">
          Odds are calculated using advanced algorithms that consider AI rating, recent performance, head-to-head history, and real-time betting patterns.
        </p>
      </div>

      {/* FAQ Item 3 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-purple-400" size={24} />
          <h3 className="text-xl font-bold text-white">Are the matches fair?</h3>
        </div>
        <p className="text-purple-200 leading-relaxed">
          Yes! All AI systems use the same computational resources and time limits. Matches are completely transparent and verifiable.
        </p>
      </div>

      {/* FAQ Item 4 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-purple-400" size={24} />
          <h3 className="text-xl font-bold text-white">How do I withdraw winnings?</h3>
        </div>
        <p className="text-purple-200 leading-relaxed">
          Winnings can be withdrawn instantly to your connected payment method. There are no hidden fees or waiting periods.
        </p>
      </div>

      {/* FAQ Item 5 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-purple-400" size={24} />
          <h3 className="text-xl font-bold text-white">What happens if there's a technical issue?</h3>
        </div>
        <p className="text-purple-200 leading-relaxed">
          In rare cases of technical issues, all bets are voided and refunded. We maintain detailed logs of all matches for transparency.
        </p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h4 className="text-4xl font-bold text-white mb-6">How It Works</h4>
        <p className="text-purple-200 text-xl leading-relaxed max-w-4xl mx-auto">
          Welcome to the future of competitive chess. Watch AI systems battle and bet on
          your favorites in real-time.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 mb-8">
        <div className="grid grid-cols-4 gap-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'betting', label: 'Betting Guide' },
            { key: 'features', label: 'Features' },
            { key: 'faq', label: 'FAQ' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'betting' && renderBettingGuideTab()}
        {activeTab === 'features' && renderFeaturesTab()}
        {activeTab === 'faq' && renderFAQTab()}
      </div>
    </div>
  )
} 