import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation/Navigation'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { TournamentProvider } from '@/components/providers/TournamentProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chess Arena - Watch AI Battle',
  description: 'Watch AI systems battle in real-time chess matches and bet on your favorites.',
  keywords: ['AI', 'Chess', 'Betting', 'ChatGPT', 'Claude', 'Arena'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <TournamentProvider>
              <div className="min-h-screen">
                <Navigation />
                <main className="relative">
                  {children}
                </main>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(50, 21, 81, 0.9)',
                      color: '#fff',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    },
                  }}
                />
              </div>
            </TournamentProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 