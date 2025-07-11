import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 User bets API called')
    
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
      console.log('❌ Authentication failed:', {
        authError: authError?.message,
        hasUser: !!user,
        tokenLength: token.length
      })
      return NextResponse.json({ 
        error: 'User not found or invalid token',
        details: authError?.message || 'No user found'
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email)

    // Get user's bets with match information
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select(`
        *,
        matches (
          id,
          champion_white,
          champion_black,
          status,
          start_time,
          winner,
          tournaments (
            name,
            sponsor
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (betsError) {
      console.log('❌ Failed to fetch user bets:', betsError)
      return NextResponse.json({ 
        error: 'Failed to fetch user bets',
        details: betsError.message
      }, { status: 500 })
    }

    console.log('✅ Found', bets?.length || 0, 'bets for user')

    // Calculate user statistics
    const totalInvested = bets?.reduce((sum, bet) => sum + bet.amount, 0) || 0
    const wonBets = bets?.filter(bet => bet.status === 'won') || []
    const lostBets = bets?.filter(bet => bet.status === 'lost') || []
    const totalWon = wonBets.reduce((sum, bet) => sum + (bet.payout_amount || 0), 0)
    const totalLost = lostBets.reduce((sum, bet) => sum + bet.amount, 0)
    const totalBets = bets?.length || 0
    const winRate = totalBets > 0 ? Math.round((wonBets.length / totalBets) * 100) : 0

    const statistics = {
      totalInvested,
      totalWon,
      totalLost,
      winRate,
      totalBets
    }

    console.log('📊 User statistics:', statistics)

    return NextResponse.json({ 
      bets: bets || [], 
      statistics 
    }, { status: 200 })

  } catch (error) {
    console.error('❌ User bets error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 