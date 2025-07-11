import { NextRequest, NextResponse } from 'next/server'
import { profileService } from '../../../lib/database'
import { supabase } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET BALANCE API CALLED ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return NextResponse.json({ error: 'User not found or invalid token' }, { status: 401 })
    }

    console.log('Getting balance for user:', user.id)

    // Get user's full profile with balance info
    const { data: profile, error: profileError } = await profileService.getById(user.id)

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'Failed to get user profile' 
      }, { status: 500 })
    }

    const balanceInfo = {
      tickets_balance: profile.tickets_balance || 0,
      vouchers_balance: profile.vouchers_balance || 0,
      total_tickets_earned: profile.total_tickets_earned || 0,
      total_tickets_spent: profile.total_tickets_spent || 0,
      total_winnings: profile.total_winnings || 0,
      total_bets: profile.total_bets || 0,
      win_rate: profile.win_rate || 0
    }

    console.log('Balance retrieved:', balanceInfo)

    return NextResponse.json({ 
      success: true,
      balance: balanceInfo
    })

  } catch (error) {
    console.error('Get balance error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred while getting balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 