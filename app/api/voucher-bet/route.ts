import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface VoucherBetRequest {
  match_id: string
  champion: 'ChatGPT' | 'Claude'
  voucher_amount: number
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== VOUCHER BET API CALLED ===')
    
    const betData: VoucherBetRequest = await request.json()
    const { match_id, champion, voucher_amount } = betData
    
    if (!match_id || !champion || !voucher_amount || voucher_amount <= 0) {
      return NextResponse.json({ 
        error: 'Match ID, champion, and valid voucher amount are required' 
      }, { status: 400 })
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract token and create Supabase client
    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('User found:', user.id, 'placing voucher bet on match:', match_id)

    // Get match details to find the tournament
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        tournaments (
          id,
          name,
          status
        )
      `)
      .eq('id', match_id)
      .single()

    if (matchError || !match || !match.tournaments) {
      return NextResponse.json({ error: 'Match not found or not part of a tournament' }, { status: 404 })
    }

    const tournament = match.tournaments
    console.log('Match belongs to tournament:', tournament.id)

    // Check if match is still accepting bets
    if (match.status !== 'upcoming' || new Date() > new Date(match.betting_closes_at)) {
      return NextResponse.json({ error: 'Betting is closed for this match' }, { status: 400 })
    }

    // Check if user is registered for this tournament
    const { data: registration, error: registrationError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('tournament_id', tournament.id)
      .eq('registration_status', 'active')
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ 
        error: 'You must be registered for this tournament to place voucher bets',
        tournament_name: tournament.name,
        tournament_id: tournament.id
      }, { status: 403 })
    }

    console.log('User registration found:', registration.id, 'Current voucher balance:', registration.voucher_balance)

    // Get tournament voucher type for validation
    const { data: voucherType, error: voucherTypeError } = await supabase
      .from('tournament_voucher_types')
      .select('*')
      .eq('tournament_id', tournament.id)
      .single()

    if (voucherTypeError || !voucherType) {
      return NextResponse.json({ error: 'Tournament voucher configuration not found' }, { status: 404 })
    }

    // Validate bet amount against voucher rules
    if (voucher_amount < voucherType.min_bet_amount) {
      return NextResponse.json({ 
        error: `Minimum bet amount is ${voucherType.min_bet_amount} ${voucherType.voucher_symbol}` 
      }, { status: 400 })
    }

    if (voucher_amount > voucherType.max_bet_amount) {
      return NextResponse.json({ 
        error: `Maximum bet amount is ${voucherType.max_bet_amount} ${voucherType.voucher_symbol}` 
      }, { status: 400 })
    }

    // Check if user has sufficient voucher balance
    if (registration.voucher_balance < voucher_amount) {
      return NextResponse.json({ 
        error: 'Insufficient voucher balance',
        current_balance: registration.voucher_balance,
        required: voucher_amount,
        voucher_symbol: voucherType.voucher_symbol
      }, { status: 400 })
    }

    // Calculate potential payout (simplified 1.8x for now, could be dynamic based on pool)
    const potential_voucher_payout = voucher_amount * 1.8

    // Create the voucher bet
    const betInsertData = {
      user_id: user.id,
      match_id: match_id,
      champion: champion,
      amount: 0, // $0 for voucher bets
      potential_payout: 0, // $0 for voucher bets  
      is_voucher_bet: true,
      registration_id: registration.id,
      voucher_amount: voucher_amount,
      voucher_payout: potential_voucher_payout,
      status: 'pending' as const
    }

    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert(betInsertData)
      .select('*')
      .single()

    if (betError) {
      console.error('Failed to create bet:', betError)
      return NextResponse.json({ 
        error: `Failed to place bet: ${betError.message}` 
      }, { status: 500 })
    }

    console.log('Voucher bet created:', bet.id)

    // Update user's voucher balance using the database function
    const { error: voucherError } = await supabase.rpc('process_voucher_transaction', {
      p_user_id: user.id,
      p_tournament_id: tournament.id,
      p_transaction_type: 'spent',
      p_amount: voucher_amount,
      p_source: 'bet_placed',
      p_reference_id: bet.id,
      p_description: `Bet placed on ${champion} in match ${match_id}`
    })

    if (voucherError) {
      console.error('Failed to process voucher transaction:', voucherError)
      
      // Rollback the bet if voucher transaction fails
      await supabase
        .from('bets')
        .delete()
        .eq('id', bet.id)
      
      return NextResponse.json({ 
        error: `Failed to process voucher transaction: ${voucherError.message}` 
      }, { status: 500 })
    }

    // Get updated registration data
    const { data: updatedRegistration } = await supabase
      .from('tournament_registrations')
      .select('voucher_balance')
      .eq('id', registration.id)
      .single()

    return NextResponse.json({ 
      success: true,
      message: 'Voucher bet placed successfully',
      bet,
      vouchers_spent: voucher_amount,
      new_voucher_balance: updatedRegistration?.voucher_balance || 0,
      potential_voucher_payout,
      voucher_symbol: voucherType.voucher_symbol
    })

  } catch (error) {
    console.error('Voucher bet error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tournament_id = searchParams.get('tournament_id')

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract token and create Supabase client
    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Build query for user's voucher bets
    let query = supabase
      .from('bets')
      .select(`
        *,
        matches (
          id,
          champion_white,
          champion_black,
          start_time,
          status,
          tournaments (
            id,
            name
          )
        ),
        tournament_registrations (
          tournament_id
        )
      `)
      .eq('user_id', user.id)
      .eq('is_voucher_bet', true)

    if (tournament_id) {
      // Filter by tournament through the registration
      query = query.eq('tournament_registrations.tournament_id', tournament_id)
    }

    const { data: voucherBets, error: betsError } = await query
      .order('created_at', { ascending: false })

    if (betsError) {
      return NextResponse.json({ 
        error: `Failed to fetch voucher bets: ${betsError.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      voucher_bets: voucherBets || []
    })

  } catch (error) {
    console.error('Get voucher bets error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 