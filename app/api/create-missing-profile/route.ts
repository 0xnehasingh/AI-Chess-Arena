import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE MISSING PROFILE API CALLED ===')
    
    // Get request body for role parameter
    const requestBody = await request.json().catch(() => ({}))
    const userRole: 'player' | 'partner' = requestBody.userRole || 'player'
    console.log('Creating missing profile with role:', userRole)
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract token
    const token = authHeader.substring(7)
    
    // Create server client and get user
    const supabase = createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('User found:', user.id)

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (existingProfile && !existingError) {
      console.log('Profile already exists')
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists',
        profile: existingProfile 
      })
    }

    // Extract user data from auth metadata
    const userData = user.user_metadata || {}
    const identityData = user.identities?.[0]?.identity_data || {}
    
    const email = user.email || userData.email || identityData.email
    const username = userData.username || identityData.username || userData.user_name || identityData.user_name
    const displayName = userData.full_name || identityData.full_name || userData.display_name || identityData.display_name
    
    if (!email) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 })
    }

    // Generate username if not provided
    let finalUsername = username
    if (!finalUsername) {
      finalUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
    }

    // Ensure username is unique by checking existing usernames
    let counter = 1
    let testUsername = finalUsername
    while (true) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', testUsername)
        .single()
      
      if (!existing) break
      testUsername = `${finalUsername}_${counter}`
      counter++
    }
    finalUsername = testUsername

    const profileData = {
      id: user.id,
      email,
      username: finalUsername,
      display_name: displayName || null,
      avatar_url: userData.avatar_url || identityData.avatar_url || null,
      wallet_address: null,
      total_winnings: 0,
      total_bets: 0,
      win_rate: 0,
      user_role: userRole,
      tickets_balance: 100, // Welcome tickets
      vouchers_balance: 0,
      total_tickets_earned: 100,
      total_tickets_spent: 0,
    }

    console.log('Creating profile with data:', profileData)

    // Create the profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error('Failed to create profile:', createError)
      return NextResponse.json({ error: `Failed to create profile: ${createError.message}` }, { status: 500 })
    }

    console.log('Profile created successfully:', newProfile)

    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile: newProfile 
    })

  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating profile' },
      { status: 500 }
    )
  }
} 