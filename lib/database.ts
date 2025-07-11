import { supabase, createServerClient } from './supabase'
import type { Database } from './supabase'

// Re-export for use in API routes
export { createServerClient }

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Match = Tables['matches']['Row']
type Bet = Tables['bets']['Row']
type Tournament = Tables['tournaments']['Row']

// Profile operations
export const profileService = {
  async create(profile: Tables['profiles']['Insert']) {
    try {
      // First try with service role client to bypass RLS
      const serverSupabase = createServerClient()
      
      const { data, error } = await serverSupabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      if (!error) {
        return { data, error }
      }
      
      console.log('Service role creation failed, trying with regular client:', error.message)
    } catch (serviceError) {
      console.log('Service role client failed, falling back to regular client')
    }
    
    // Fallback to regular client (should work if RLS policies are correct)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      return { data, error }
    } catch (fallbackError) {
      console.error('Both service role and regular client failed')
      return { 
        data: null, 
        error: fallbackError instanceof Error ? fallbackError : new Error('Failed to create profile')
      }
    }
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async updateStats(userId: string, stats: Partial<Pick<Profile, 'total_winnings' | 'total_bets' | 'win_rate'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(stats)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  async updateTicketBalance(userId: string, tickets: Partial<Pick<Profile, 'tickets_balance' | 'vouchers_balance' | 'total_tickets_earned' | 'total_tickets_spent'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(tickets)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  async deductTickets(userId: string, amount: number): Promise<{ success: boolean; error: string | null; newBalance?: number }> {
    try {
      // Get current balance
      const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('tickets_balance, total_tickets_spent')
        .eq('id', userId)
        .single()

      if (getError || !profile) {
        return { success: false, error: 'Failed to get user profile' }
      }

      if (profile.tickets_balance < amount) {
        return { success: false, error: `Insufficient tickets. You have ${profile.tickets_balance} tickets but need ${amount}` }
      }

      // Deduct tickets and update spent total
      const newBalance = profile.tickets_balance - amount
      const newTotalSpent = (profile.total_tickets_spent || 0) + amount

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          tickets_balance: newBalance,
          total_tickets_spent: newTotalSpent
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null, newBalance }
    } catch (error) {
      return { success: false, error: 'Unexpected error during ticket deduction' }
    }
  },

  async addTickets(userId: string, amount: number, reason: 'signup_bonus' | 'winnings' | 'purchase' | 'admin' = 'admin'): Promise<{ success: boolean; error: string | null; newBalance?: number }> {
    try {
      // Get current balance
      const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('tickets_balance, total_tickets_earned')
        .eq('id', userId)
        .single()

      if (getError || !profile) {
        return { success: false, error: 'Failed to get user profile' }
      }

      // Add tickets and update earned total
      const newBalance = (profile.tickets_balance || 0) + amount
      const newTotalEarned = (profile.total_tickets_earned || 0) + amount

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          tickets_balance: newBalance,
          total_tickets_earned: newTotalEarned
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null, newBalance }
    } catch (error) {
      return { success: false, error: 'Unexpected error during ticket addition' }
    }
  },

  async getTicketBalance(userId: string): Promise<{ balance: number; error: string | null }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tickets_balance')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return { balance: 0, error: 'Failed to get ticket balance' }
      }

      return { balance: profile.tickets_balance || 0, error: null }
    } catch (error) {
      return { balance: 0, error: 'Unexpected error getting ticket balance' }
    }
  },

  async update(userId: string, updates: Partial<Tables['profiles']['Update']>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }
}

// Match operations
export const matchService = {
  async getUpcoming() {
    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('matches')
      .select(`
        *,
        tournaments (*)
      `)
      .eq('status', 'upcoming')
      .order('start_time', { ascending: true })
    
    return { data, error }
  },

  async getLive() {
    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('matches')
      .select(`
        *,
        tournaments (*),
        match_moves (*)
      `)
      .eq('status', 'live')
      .order('start_time', { ascending: true })
    
    return { data, error }
  },

  async getById(id: string) {
    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('matches')
      .select(`
        *,
        tournaments (*),
        match_moves (*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async updateStatus(id: string, status: Match['status'], winner?: Match['winner']) {
    const updateData: any = { status }
    if (winner) updateData.winner = winner
    if (status === 'finished') updateData.end_time = new Date().toISOString()

    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('matches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async addMove(move: Tables['match_moves']['Insert']) {
    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('match_moves')
      .insert(move)
      .select()
      .single()
    
    return { data, error }
  },

  async getFinished() {
    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('matches')
      .select(`
        *,
        tournaments (*),
        match_moves (*)
      `)
      .eq('status', 'finished')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getAll() {
    const serverSupabase = createServerClient()
    const { data, error } = await serverSupabase
      .from('matches')
      .select(`
        *,
        tournaments (*),
        match_moves (*)
      `)
      .order('start_time', { ascending: false })
    
    return { data, error }
  }
}

// Betting operations
export const betService = {
  async placeBet(bet: Tables['bets']['Insert']): Promise<{ success: boolean; data?: any; error: string | null; remainingTickets?: number }> {
    try {
      // First check if user has enough tickets
      const { balance, error: balanceError } = await profileService.getTicketBalance(bet.user_id)
      
      if (balanceError) {
        return { success: false, error: balanceError }
      }
      
      if (balance < bet.amount) {
        return { 
          success: false, 
          error: `Insufficient tickets. You have ${balance} tickets but need ${bet.amount}` 
        }
      }
      
      // Deduct tickets from user balance
      const { success: deductSuccess, error: deductError, newBalance } = await profileService.deductTickets(bet.user_id, bet.amount)
      
      if (!deductSuccess) {
        return { success: false, error: deductError }
      }
      
      // Place the bet
      const serverSupabase = createServerClient()
      const { data, error } = await serverSupabase
        .from('bets')
        .insert(bet)
        .select()
        .single()
      
      if (error) {
        // If bet placement fails, restore the tickets
        await profileService.addTickets(bet.user_id, bet.amount, 'admin')
        return { success: false, error: error.message }
      }
      
      return { 
        success: true, 
        data, 
        error: null, 
        remainingTickets: newBalance 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred while placing the bet' 
      }
    }
  },

  async getUserBets(userId: string) {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        matches (
          *,
          tournaments (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getMatchBets(matchId: string) {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
    
    return { data, error }
  },

  async updateBetStatus(id: string, status: Bet['status'], payoutAmount?: number) {
    const updateData: any = { status }
    if (payoutAmount) updateData.payout_amount = payoutAmount

    const { data, error } = await supabase
      .from('bets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  }
}

// Tournament operations
export const tournamentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        matches (*)
      `)
      .order('start_date', { ascending: true })
    
    return { data, error }
  },

  async getActive() {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        matches (*)
      `)
      .eq('status', 'active')
      .order('start_date', { ascending: true })
    
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        matches (*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  }
}

// Statistics and analytics
export const statsService = {
  async getLeaderboard(limit: number = 10) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('total_winnings', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async getMatchStats(matchId: string) {
    const { data: bets, error } = await supabase
      .from('bets')
      .select('champion, amount')
      .eq('match_id', matchId)
    
    if (error) return { data: null, error }

    const stats = {
      total_bets: bets.length,
      total_amount: bets.reduce((sum, bet) => sum + bet.amount, 0),
      chatgpt_bets: bets.filter(bet => bet.champion === 'ChatGPT').length,
      claude_bets: bets.filter(bet => bet.champion === 'Claude').length,
      chatgpt_amount: bets.filter(bet => bet.champion === 'ChatGPT').reduce((sum, bet) => sum + bet.amount, 0),
      claude_amount: bets.filter(bet => bet.champion === 'Claude').reduce((sum, bet) => sum + bet.amount, 0)
    }

    return { data: stats, error: null }
  },

  async getWeeklyLeaderboard(limit: number = 10) {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        bets!inner(created_at, status, payout_amount)
      `)
      .gte('bets.created_at', oneWeekAgo.toISOString())
      .order('total_winnings', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async getMonthlyLeaderboard(limit: number = 10) {
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        bets!inner(created_at, status, payout_amount)
      `)
      .gte('bets.created_at', oneMonthAgo.toISOString())
      .order('total_winnings', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }
}

// Real-time subscriptions
export const subscriptionService = {
  subscribeToMatch(matchId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        callback
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'match_moves', filter: `match_id=eq.${matchId}` },
        callback
      )
      .subscribe()
  },

  subscribeToUserBets(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-bets:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bets', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe()
  }
} 