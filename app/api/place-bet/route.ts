import { createServerClient } from '@/lib/database'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Place bet API called')
    
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
        details: authError?.message || 'No user found',
        tokenInfo: { length: token.length, start: token.substring(0, 10) + '...' }
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.email)

    // Parse request body
    const { matchId, champion, amount } = await request.json()
    
    // Validate input
    if (!matchId || !champion || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid bet data. Required: matchId, champion, amount > 0' 
      }, { status: 400 })
    }

    if (!['ChatGPT', 'Claude'].includes(champion)) {
      return NextResponse.json({ 
        error: 'Invalid champion. Must be ChatGPT or Claude' 
      }, { status: 400 })
    }

    console.log('🎯 Bet details:', { matchId, champion, amount, userId: user.id })

    // Check user's current ticket balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickets_balance, total_tickets_spent')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('❌ Failed to get user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    console.log('💰 Current balance:', profile.tickets_balance)

    // Check if user has enough tickets
    if (profile.tickets_balance < amount) {
      return NextResponse.json({ 
        error: `Insufficient tickets. You have ${profile.tickets_balance} tickets but need ${amount}` 
      }, { status: 400 })
    }

    // Handle demo match ID - try to find an existing match or create a virtual bet
    let actualMatchId = matchId
    
    if (matchId === 'demo-match-id') {
      // Try to find any existing live match
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'live')
        .limit(1)
        .single()
      
      if (existingMatch) {
        actualMatchId = existingMatch.id
        console.log('✅ Using existing live match:', actualMatchId)
      } else {
        // Create a demo match for betting
        const { data: demoMatch, error: matchError } = await supabase
          .from('matches')
          .insert([
            {
              champion_white: 'Claude',
              champion_black: 'ChatGPT',
              status: 'live',
              start_time: new Date().toISOString(),
              betting_closes_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
              total_pool: 0,
              chatgpt_pool: 0,
              claude_pool: 0
            }
          ])
          .select('id')
          .single()
        
        if (matchError || !demoMatch) {
          console.log('❌ Failed to create demo match:', matchError)
          return NextResponse.json({ error: 'Failed to create match for betting' }, { status: 500 })
        }
        
        actualMatchId = demoMatch.id
        console.log('✅ Created demo match:', actualMatchId)
      }
    }

    // Calculate potential payout (simplified odds system)
    // For demo purposes, use basic 1.8x multiplier
    const potentialPayout = amount * 1.8

    // Create the bet record
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert([
        {
          user_id: user.id,
          match_id: actualMatchId,
          champion: champion,
          amount: amount,
          potential_payout: potentialPayout,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (betError) {
      console.log('❌ Failed to create bet:', betError)
      console.log('❌ Bet error details:', JSON.stringify(betError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create bet',
        details: betError.message || 'Unknown database error'
      }, { status: 500 })
    }

    console.log('✅ Bet created:', bet)

    // Update user's ticket balance
    const newBalance = profile.tickets_balance - amount
    const newTotalSpent = (profile.total_tickets_spent || 0) + amount

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tickets_balance: newBalance,
        total_tickets_spent: newTotalSpent
      })
      .eq('id', user.id)

    if (updateError) {
      console.log('❌ Failed to update balance:', updateError)
      // We should roll back the bet here in a real system
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    console.log('✅ Balance updated:', { newBalance, newTotalSpent })

    return NextResponse.json({
      success: true,
      bet: bet,
      remainingTickets: newBalance,
      potentialPayout: potentialPayout,
      message: `Bet placed successfully! ${amount} tickets on ${champion}`
    })

  } catch (error) {
    console.error('❌ Place bet error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 