import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/providers/AuthProvider'

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  return { user, loading }
} 