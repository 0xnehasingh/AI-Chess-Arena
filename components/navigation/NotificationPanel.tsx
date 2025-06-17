'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Trophy, Bell, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'bet_won' | 'bet_lost' | 'match_started' | 'system'
  title: string
  message: string
  amount?: number
  timestamp: Date
  read: boolean
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'bet_won',
    title: 'Bet Won!',
    message: 'Your bet on ChatGPT vs Claude was successful',
    amount: 125.50,
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false
  },
  {
    id: '2',
    type: 'match_started',
    title: 'New Match Started',
    message: 'Battle #43: Gemini vs ChatGPT is now live',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false
  }
]

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const handleMarkAllRead = () => {
    // In a real app, this would update the state/database
    console.log('Mark all as read')
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bet_won':
        return <CheckCircle className="text-green-400" size={20} />
      case 'bet_lost':
        return <X className="text-red-400" size={20} />
      case 'match_started':
        return <Trophy className="text-purple-400" size={20} />
      default:
        return <Bell className="text-blue-400" size={20} />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-16 right-4 w-80 max-h-96 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllRead}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.length === 0 ? (
                <div className="p-6 text-center text-purple-300">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {mockNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-purple-200 text-sm mt-1">
                            {notification.message}
                          </p>
                          {notification.amount && (
                            <p className="text-green-400 font-semibold text-sm mt-1">
                              ${notification.amount}
                            </p>
                          )}
                          <p className="text-purple-400 text-xs mt-2">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 