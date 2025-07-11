import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test login API called')
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password required' 
      }, { status: 400 })
    }

    console.log('🔐 Testing login for:', email)
    
    const result = await signIn(email, password)
    
    console.log('🔐 Login result:', {
      hasUser: !!result.user,
      error: result.error,
      userEmail: result.user?.email
    })

    return NextResponse.json({
      success: !result.error,
      hasUser: !!result.user,
      error: result.error,
      userInfo: result.user ? {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        tickets_balance: result.user.tickets_balance
      } : null
    })

  } catch (error) {
    console.error('❌ Test login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 