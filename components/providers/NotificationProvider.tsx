'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface NotificationContextType {
  notifications: any[]
  addNotification: (notification: any) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev])
    
    // Show toast notification
    if (notification.type === 'bet_won') {
      toast.success(`🎉 Bet Won! +$${notification.amount}`)
    } else if (notification.type === 'bet_lost') {
      toast.error(`😔 Bet Lost`)
    } else if (notification.type === 'match_started') {
      toast(`🏆 ${notification.title}`, {
        icon: '🚀',
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would come from WebSocket or Server-Sent Events
      const randomNotifications = [
        {
          id: Date.now().toString(),
          type: 'match_started',
          title: 'New Match Started',
          message: `Battle #${Math.floor(Math.random() * 100)}: AI vs AI is now live`,
          timestamp: new Date(),
          read: false
        }
      ]
      
      // Randomly add a notification every 30 seconds (for demo purposes)
      if (Math.random() > 0.7) {
        addNotification(randomNotifications[0])
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  )
} 