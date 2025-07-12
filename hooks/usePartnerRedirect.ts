import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/providers/AuthProvider'

export function usePartnerRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.user_role === 'partner') {
      router.push('/partner-dashboard')
    }
  }, [user, loading, router])

  return { isPartner: user?.user_role === 'partner', loading }
} 