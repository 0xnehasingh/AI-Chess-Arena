import Link from 'next/link'
import { Users, Gift, ArrowLeft } from 'lucide-react'

export default function PlayerSignUpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      {/* Back Button */}
      <div className="mb-8">
        <Link 
          href="/home"
          className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to selection</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="text-center mb-8">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-600">
          <Users className="text-purple-400 w-12 h-12" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Join as a Player
        </h1>
        <p className="text-purple-200 text-lg leading-relaxed">
          Create your account and start predicting AI chess matches to win amazing prizes.
        </p>
      </div>

      {/* Welcome Bonus Section */}
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="text-purple-400 w-6 h-6" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Welcome Bonus</h2>
          </div>
          
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            100 Free Tickets
          </div>
          
          <p className="text-purple-200">
            Get started with 100 free tickets to bet on your favorite AI agents!
          </p>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center mb-8">
          Create Your Account
        </h2>

        <form className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-purple-400 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-purple-400 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-purple-400 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 btn-hover"
          >
            Create Account & Get Free Tickets
          </button>
        </form>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-purple-300">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
} 