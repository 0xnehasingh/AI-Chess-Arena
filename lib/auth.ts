import { supabase } from './supabase'
import { profileService } from './database'

export interface AuthUser {
  id: string
  email: string
  username?: string
  display_name?: string
  avatar_url?: string
  total_winnings?: number
  total_bets?: number
  win_rate?: number
  user_role?: 'player' | 'partner'
  website?: string
  telegram_discord?: string
  logo_url?: string
  banner_url?: string
  short_bio?: string
  ticket_name?: string
  project_name?: string
  tickets_balance?: number
  vouchers_balance?: number
  total_tickets_earned?: number
  total_tickets_spent?: number
}

// Create profile from auth user metadata
async function createProfileFromAuthUser(user: any, userRole: 'player' | 'partner' = 'player'): Promise<{ profile: any | null; error: string | null }> {
  try {
    console.log('Creating profile from auth user metadata:', user.id)
    
    // Extract user data from auth metadata
    const userData = user.user_metadata || {}
    const identityData = user.identities?.[0]?.identity_data || {}
    
    const email = user.email || userData.email || identityData.email
    const username = userData.username || identityData.username || userData.user_name || identityData.user_name
    const displayName = userData.full_name || identityData.full_name || userData.display_name || identityData.display_name
    
    if (!email) {
      return { profile: null, error: 'No email found for user' }
    }

    // Generate username if not provided
    let finalUsername = username
    if (!finalUsername) {
      finalUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
    }

    // Ensure username is unique
    let counter = 1
    let testUsername = finalUsername
    while (true) {
      const { available } = await checkUsernameAvailability(testUsername)
      if (available) break
      testUsername = `${finalUsername}_${counter}`
      counter++
    }
    finalUsername = testUsername

    console.log('Creating profile with data:', {
      id: user.id,
      email,
      username: finalUsername,
      display_name: displayName
    })

    // Create the profile
    const { data: newProfile, error: createError } = await profileService.create({
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
    })

    if (createError) {
      console.error('Failed to create profile from auth user:', createError)
      return { profile: null, error: createError.message }
    }

    console.log('Profile created successfully from auth user')
    return { profile: newProfile, error: null }
  } catch (error) {
    console.error('Unexpected error creating profile from auth user:', error)
    return { profile: null, error: 'Failed to create profile' }
  }
}

// Twitter OAuth sign in for partners
export async function signInWithTwitter(redirectTo: string = '/signup/partner') {
  try {
    console.log('Starting Twitter OAuth sign in')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    })

    if (error) {
      console.error('Twitter OAuth error:', error)
      return { error: error.message }
    }

    console.log('Twitter OAuth initiated successfully')
    return { error: null }
  } catch (error) {
    console.error('Unexpected Twitter OAuth error:', error)
    return { error: 'An unexpected error occurred during Twitter sign in' }
  }
}

// Handle OAuth callback and create/update profile
export async function handleOAuthCallback(userType: 'player' | 'partner' = 'partner') {
  try {
    console.log('Handling OAuth callback for:', userType)
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('OAuth callback error:', error)
      return { user: null, error: 'Failed to get user information' }
    }

    console.log('OAuth user retrieved:', user.id)

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await profileService.getById(user.id)
    
    if (existingProfile && !existingError) {
      console.log('Profile already exists for OAuth user')
      return { 
        user: {
          id: user.id,
          email: user.email!,
          username: existingProfile.username,
          display_name: existingProfile.display_name,
          avatar_url: existingProfile.avatar_url,
          total_winnings: existingProfile.total_winnings,
          total_bets: existingProfile.total_bets,
          win_rate: existingProfile.win_rate,
          user_role: existingProfile.user_role,
          website: existingProfile.website,
          telegram_discord: existingProfile.telegram_discord,
          logo_url: existingProfile.logo_url,
          banner_url: existingProfile.banner_url,
          short_bio: existingProfile.short_bio,
          ticket_name: existingProfile.ticket_name,
          project_name: existingProfile.project_name,
        } as AuthUser, 
        error: null 
      }
    }

    // Create profile from auth user metadata
    const { profile, error: profileError } = await createProfileFromAuthUser(user, userType)

    if (profileError || !profile) {
      console.error('OAuth profile creation failed:', profileError)
      return { user: null, error: profileError || 'Failed to create profile' }
    }

    console.log('OAuth profile created successfully')

    return { 
      user: {
        id: user.id,
        email: user.email!,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        total_winnings: profile.total_winnings,
        total_bets: profile.total_bets,
        win_rate: profile.win_rate,
        user_role: profile.user_role,
        website: profile.website,
        telegram_discord: profile.telegram_discord,
        logo_url: profile.logo_url,
        banner_url: profile.banner_url,
        short_bio: profile.short_bio,
        ticket_name: profile.ticket_name,
        project_name: profile.project_name,
      } as AuthUser, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected OAuth callback error:', error)
    return { user: null, error: 'An unexpected error occurred during OAuth callback' }
  }
}

// Sign up new user
export async function signUp(email: string, password: string, username: string, displayName?: string, userRole: 'player' | 'partner' = 'player') {
  try {
    console.log('Starting signup process for:', { email, username, displayName, userRole })
    
    // Validate inputs
    if (!email || !password || !username) {
      return { user: null, error: 'Email, password, and username are required' }
    }
    
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters long' }
    }
    
    // Check username availability first
    const { available, error: usernameCheckError } = await checkUsernameAvailability(username)
    if (usernameCheckError) {
      return { user: null, error: `Failed to check username availability: ${usernameCheckError}` }
    }
    
    if (!available) {
      return { user: null, error: 'Username is already taken. Please choose a different username.' }
    }
    
    // Create the auth user (Supabase will handle duplicate emails)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('Auth signup result:', { authData, authError })

    if (authError) {
      console.error('Auth signup error:', authError)
      
      // Handle specific error cases
      if (authError.message.includes('already registered')) {
        return { user: null, error: 'An account with this email already exists. Please sign in instead.' }
      }
      
      if (authError.message.includes('Invalid email')) {
        return { user: null, error: 'Please enter a valid email address.' }
      }
      
      return { user: null, error: authError.message }
    }

    if (!authData.user) {
      console.error('No user returned from auth signup')
      return { user: null, error: 'Failed to create user account' }
    }

    console.log('Creating profile for user:', authData.user.id)

    // Check if profile already exists (in case this is a retry)
    const { data: existingProfile, error: existingError } = await profileService.getById(authData.user.id)
    
    if (existingProfile && !existingError) {
      console.log('Profile already exists for user')
      return { 
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: existingProfile.username,
          display_name: existingProfile.display_name,
          avatar_url: existingProfile.avatar_url,
          total_winnings: existingProfile.total_winnings,
          total_bets: existingProfile.total_bets,
          win_rate: existingProfile.win_rate,
          user_role: existingProfile.user_role,
          website: existingProfile.website,
          telegram_discord: existingProfile.telegram_discord,
          logo_url: existingProfile.logo_url,
          banner_url: existingProfile.banner_url,
          short_bio: existingProfile.short_bio,
          ticket_name: existingProfile.ticket_name,
          project_name: existingProfile.project_name,
        } as AuthUser, 
        error: null 
      }
    }

    // Create profile in our profiles table with welcome tickets
    const { data: profile, error: profileError } = await profileService.create({
      id: authData.user.id,
      email,
      username,
      display_name: displayName || null,
      avatar_url: null,
      wallet_address: null,
      total_winnings: 0,
      total_bets: 0,
      win_rate: 0,
      user_role: userRole,
      tickets_balance: 100, // Welcome bonus: 100 free tickets
      vouchers_balance: 0,
      total_tickets_earned: 100,
      total_tickets_spent: 0,
    })

    console.log('Profile creation result:', { profile, profileError })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      
      // Handle duplicate username error  
      if (profileError.message?.includes('duplicate key') && profileError.message?.includes('username')) {
        return { user: null, error: 'Username is already taken. Please choose a different username.' }
      }
      
      // Handle duplicate email error
      if (profileError.message?.includes('duplicate key') && profileError.message?.includes('email')) {
        return { user: null, error: 'An account with this email already exists.' }
      }
      
      return { user: null, error: `Failed to create user profile: ${profileError.message}` }
    }

    console.log('Signup successful for user:', authData.user.id)

    return { 
              user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: profile?.username,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          total_winnings: profile?.total_winnings,
          total_bets: profile?.total_bets,
          win_rate: profile?.win_rate,
          user_role: profile?.user_role,
          website: profile?.website,
          telegram_discord: profile?.telegram_discord,
          logo_url: profile?.logo_url,
          banner_url: profile?.banner_url,
          short_bio: profile?.short_bio,
          ticket_name: profile?.ticket_name,
          project_name: profile?.project_name,
          tickets_balance: profile?.tickets_balance,
          vouchers_balance: profile?.vouchers_balance,
          total_tickets_earned: profile?.total_tickets_earned,
          total_tickets_spent: profile?.total_tickets_spent,
        } as AuthUser, 
      error: null 
    }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return { user: null, error: `An unexpected error occurred during sign up: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Sign in user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'Failed to sign in' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await profileService.getById(data.user.id)

    if (profileError || !profile) {
      console.log('Profile not found for user:', data.user.id)
      return { user: null, error: 'Profile not found. Please go to profile recovery page to set up your profile.' }
    }

    return { 
      user: {
        id: data.user.id,
        email: data.user.email!,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        total_winnings: profile.total_winnings,
        total_bets: profile.total_bets,
        win_rate: profile.win_rate,
        user_role: profile.user_role,
        website: profile.website,
        telegram_discord: profile.telegram_discord,
        logo_url: profile.logo_url,
        banner_url: profile.banner_url,
        short_bio: profile.short_bio,
        ticket_name: profile.ticket_name,
        project_name: profile.project_name,
        tickets_balance: profile.tickets_balance,
        vouchers_balance: profile.vouchers_balance,
        total_tickets_earned: profile.total_tickets_earned,
        total_tickets_spent: profile.total_tickets_spent,
      } as AuthUser, 
      error: null 
    }
  } catch (error) {
    return { user: null, error: 'An unexpected error occurred during sign in' }
  }
}

// Sign out user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (error) {
    return { error: 'An unexpected error occurred during sign out' }
  }
}

// Get current user
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: error.message }
    }

    if (!user) {
      return { user: null, error: null }
    }

    // Get user profile
    const { data: profile, error: profileError } = await profileService.getById(user.id)

    if (profileError || !profile) {
      console.log('Profile not found for authenticated user:', user.id)
      return { user: null, error: 'Profile not found. Please complete your profile setup.' }
    }

    return { 
      user: {
        id: user.id,
        email: user.email!,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        total_winnings: profile.total_winnings,
        total_bets: profile.total_bets,
        win_rate: profile.win_rate,
        user_role: profile.user_role,
        website: profile.website,
        telegram_discord: profile.telegram_discord,
        logo_url: profile.logo_url,
        banner_url: profile.banner_url,
        short_bio: profile.short_bio,
        ticket_name: profile.ticket_name,
        project_name: profile.project_name,
        tickets_balance: profile.tickets_balance,
        vouchers_balance: profile.vouchers_balance,
        total_tickets_earned: profile.total_tickets_earned,
        total_tickets_spent: profile.total_tickets_spent,
      } as AuthUser, 
      error: null 
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return { user: null, error: 'An unexpected error occurred while fetching user data' }
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        // Get user profile
        const { data: profile, error: profileError } = await profileService.getById(session.user.id)
        
        if (profile && !profileError) {
          callback({
            id: session.user.id,
            email: session.user.email!,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            total_winnings: profile.total_winnings,
            total_bets: profile.total_bets,
            win_rate: profile.win_rate,
            user_role: profile.user_role,
            website: profile.website,
            telegram_discord: profile.telegram_discord,
            logo_url: profile.logo_url,
            banner_url: profile.banner_url,
            short_bio: profile.short_bio,
            ticket_name: profile.ticket_name,
            project_name: profile.project_name,
            tickets_balance: profile.tickets_balance,
            vouchers_balance: profile.vouchers_balance,
            total_tickets_earned: profile.total_tickets_earned,
            total_tickets_spent: profile.total_tickets_spent,
          } as AuthUser)
        } else {
          console.log('Profile not found for session user:', session.user.id)
          callback(null)
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })

  return { data: { subscription } }
}

// Check if username is available
export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { available: false, error: error.message }
    }

    return { available: !data, error: null }
  } catch (error) {
    return { available: false, error: 'Failed to check username availability' }
  }
} 