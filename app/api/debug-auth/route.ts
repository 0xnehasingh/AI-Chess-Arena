import { createServerClient } from '@/lib/database'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Auth Debug API called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('📋 Auth header present:', !!authHeader)
    console.log('📋 Auth header format:', authHeader?.substring(0, 20) + '...')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ Invalid auth header format')
      return NextResponse.json({ 
        error: 'Invalid authorization header format',
        hasHeader: !!authHeader,
        headerStart: authHeader?.substring(0, 20)
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🎫 Token length:', token.length)
    console.log('🎫 Token start:', token.substring(0, 20) + '...')
    
    const supabase = createServerClient()
    
    // Try to get user with the token
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    
    console.log('👤 Auth result:', {
      hasUser: !!userData?.user,
      userEmail: userData?.user?.email,
      authError: authError?.message
    })
    
    if (authError || !userData?.user) {
      return NextResponse.json({
        error: 'Authentication failed',
        authError: authError?.message,
        hasUserData: !!userData,
        hasUser: !!userData?.user
      }, { status: 401 })
    }

    // Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username, tickets_balance')
      .eq('id', userData.user.id)
      .single()

    console.log('👤 Profile result:', {
      hasProfile: !!profile,
      profileError: profileError?.message
    })

    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: userData.user.email
      },
      profile: profile,
      token: {
        length: token.length,
        start: token.substring(0, 20) + '...'
      }
    })

  } catch (error) {
    console.error('❌ Debug auth error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 