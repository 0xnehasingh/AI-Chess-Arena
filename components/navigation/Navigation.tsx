'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  History, 
  DollarSign, 
  BarChart3, 
  Trophy, 
  User, 
  HelpCircle, 
  Bell,
  Menu,
  X,
  Play,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationPanel } from './NotificationPanel'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/components/providers/AuthProvider'
import { signOut } from '@/lib/auth'
import toast from 'react-hot-toast'

const navigationItems = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Live Match', href: '/', icon: Play },
  { name: 'Match History', href: '/history', icon: History },
  { name: 'My Bets', href: '/bets', icon: DollarSign },
  { name: 'AI Stats', href: '/stats', icon: BarChart3 },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'How It Works', href: '/how-it-works', icon: HelpCircle },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const notificationCount = 2 // This would come from state management

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        toast.error(error)
      } else {
        toast.success('Signed out successfully')
        router.push('/home')
      }
    } catch (err) {
      toast.error('Failed to sign out')
    }
    setShowUserMenu(false)
  }

  return (
    <>
      <nav className="backdrop-blur-md border-b border-white/10 sticky top-0 z-50" style={{ backgroundColor: '#321551' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Logo size="md" />
              <span className="text-white font-bold text-xl hidden sm:block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Chess Arena
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Notifications, Auth & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell - only show when authenticated */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-purple-200 hover:text-white transition-colors"
                  >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center notification-pulse">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* User Menu / Auth Buttons */}
              {!loading && (
                <div className="relative hidden lg:block">
                  {user ? (
                    <>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 p-2 text-purple-200 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user.display_name?.[0] || user.username?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{user.display_name || user.username}</span>
                      </button>

                      {/* User Dropdown Menu */}
                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-white/10 py-2 z-50"
                          >
                            <Link
                              href="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <User size={16} />
                              <span>Profile</span>
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <LogOut size={16} />
                              <span>Sign Out</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/login"
                        className="flex items-center space-x-1 px-3 py-2 text-purple-200 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      >
                        <LogIn size={16} />
                        <span className="text-sm font-medium">Sign In</span>
                      </Link>
                      <Link
                        href="/signup/player"
                        className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
                      >
                        <UserPlus size={16} />
                        <span className="text-sm font-medium">Sign Up</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-purple-200 hover:text-white transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden backdrop-blur-md border-t border-white/10"
              style={{ backgroundColor: '#321551' }}
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}

                {/* Mobile Auth Section */}
                <div className="border-t border-white/10 pt-4 mt-4">
                  {!loading && (
                    <>
                      {user ? (
                        <>
                          <div className="flex items-center space-x-3 px-4 py-3 text-purple-200">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {user.display_name?.[0] || user.username?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.display_name || user.username}</div>
                              <div className="text-sm text-purple-300">{user.email}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handleSignOut()
                              setIsOpen(false)
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <LogIn size={20} />
                            <span className="font-medium">Sign In</span>
                          </Link>
                          <Link
                            href="/signup/player"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
                          >
                            <UserPlus size={20} />
                            <span className="font-medium">Sign Up</span>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  )
} 