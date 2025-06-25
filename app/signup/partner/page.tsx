import Link from 'next/link'
import { FileText, Upload, ArrowLeft, Globe, Twitter } from 'lucide-react'

export default function PartnerSignUpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
          <FileText className="text-purple-400 w-12 h-12" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Partner Sign Up
        </h1>
        <p className="text-purple-200 text-lg leading-relaxed">
          Join as a partner to sponsor AI agents and create your own competitions
        </p>
      </div>

      {/* Sign Up Form */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-6">
        <form className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="projectName" className="block text-purple-400 font-medium mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              placeholder="Enter your project name"
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-purple-400 font-medium mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="partner@example.com"
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-purple-400 font-medium mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-purple-400 font-medium mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Project Logo Upload */}
          <div>
            <label className="block text-purple-400 font-medium mb-2">
              Project Logo
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
              <p className="text-gray-500 text-sm">PNG, JPG up to 2MB</p>
              <input type="file" className="hidden" accept="image/*" />
            </div>
          </div>

          {/* Website and Twitter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-purple-400 font-medium mb-2">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://yourproject.com"
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="twitter" className="block text-purple-400 font-medium mb-2">
                Twitter/X Handle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Twitter className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  placeholder="@yourproject"
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-purple-400 font-medium mb-2">
              Project Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Tell us about your project and how you plan to use AI Chess Arena..."
              className="w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 btn-hover"
          >
            <FileText className="w-5 h-5" />
            Sign Up as Partner
          </button>
        </form>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-purple-300">
          Already have a partner account?{' '}
          <Link 
            href="/login" 
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
} 