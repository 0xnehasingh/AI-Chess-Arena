import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Check user bets debug API called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createServerClient()
    
    // Set the session using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message)
      return NextResponse.json({ 
        error: 'User not found or invalid token',
        details: authError?.message || 'No user found'
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email, 'ID:', user.id)

    // Get user profile to check current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, tickets_balance, total_tickets_spent, total_tickets_earned')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('❌ Failed to get profile:', profileError)
      return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
    }

    // Get ALL bets for this user (no filters)
    const { data: allBets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (betsError) {
      console.log('❌ Failed to fetch bets:', betsError)
    }

    // Get recent bets (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentBets, error: recentError } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })

    // Get any demo matches created recently
    const { data: demoMatches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile,
      bets: {
        total: allBets?.length || 0,
        recent24h: recentBets?.length || 0,
        allBets: allBets || [],
        recentBets: recentBets || []
      },
      matches: {
        recentDemo: demoMatches || []
      },
      errors: {
        bets: betsError?.message || null,
        recent: recentError?.message || null,
        matches: matchError?.message || null
      }
    })

  } catch (error) {
    console.error('❌ Check user bets error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 