import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TOURNAMENT REGISTRATION API CALLED ===')
    
    const { tournament_id } = await request.json()
    
    if (!tournament_id) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 })
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

    console.log('User found:', user.id, 'registering for tournament:', tournament_id)

    // Check if tournament exists and is open for registration
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournament_id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    if (tournament.status === 'finished') {
      return NextResponse.json({ error: 'Tournament has already finished' }, { status: 400 })
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('tournament_id', tournament_id)
      .single()

    if (existingRegistration) {
      return NextResponse.json({ 
        message: 'Already registered for this tournament',
        registration: existingRegistration 
      })
    }

    // Get tournament voucher type
    const { data: voucherType, error: voucherError } = await supabase
      .from('tournament_voucher_types')
      .select('*')
      .eq('tournament_id', tournament_id)
      .single()

    if (voucherError || !voucherType) {
      return NextResponse.json({ error: 'Tournament voucher configuration not found' }, { status: 404 })
    }

    // Create tournament registration with initial voucher balance
    const registrationData = {
      user_id: user.id,
      tournament_id: tournament_id,
      voucher_balance: voucherType.earn_on_registration,
      total_vouchers_earned: voucherType.earn_on_registration,
      registration_status: 'active' as const
    }

    const { data: registration, error: registrationError } = await supabase
      .from('tournament_registrations')
      .insert(registrationData)
      .select('*')
      .single()

    if (registrationError) {
      console.error('Failed to create registration:', registrationError)
      return NextResponse.json({ 
        error: `Failed to register: ${registrationError.message}` 
      }, { status: 500 })
    }

    console.log('Registration created:', registration.id)

    // Create initial voucher transaction
    const transactionData = {
      user_id: user.id,
      tournament_id: tournament_id,
      registration_id: registration.id,
      transaction_type: 'earned' as const,
      amount: voucherType.earn_on_registration,
      balance_before: 0,
      balance_after: voucherType.earn_on_registration,
      source: 'registration',
      description: `Initial vouchers earned for registering in ${tournament.name}`
    }

    const { error: transactionError } = await supabase
      .from('voucher_transactions')
      .insert(transactionData)

    if (transactionError) {
      console.error('Failed to create voucher transaction:', transactionError)
      // Don't fail registration if transaction logging fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully registered for tournament',
      registration,
      vouchers_earned: voucherType.earn_on_registration,
      voucher_type: voucherType
    })

  } catch (error) {
    console.error('Tournament registration error:', error)
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

    let query = supabase
      .from('tournament_registrations')
      .select(`
        *,
        tournaments (
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          prize_pool
        ),
        tournament_voucher_types!tournament_voucher_types_tournament_id_fkey (
          voucher_name,
          voucher_symbol,
          min_bet_amount,
          max_bet_amount
        )
      `)
      .eq('user_id', user.id)

    if (tournament_id) {
      query = query.eq('tournament_id', tournament_id)
    }

    const { data: registrations, error: registrationsError } = await query
      .order('created_at', { ascending: false })

    if (registrationsError) {
      return NextResponse.json({ 
        error: `Failed to fetch registrations: ${registrationsError.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      registrations: registrations || []
    })

  } catch (error) {
    console.error('Get registrations error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 