import { supabase, createServerClient } from './supabase'
import type { Database } from './supabase'

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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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

    const { data, error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async addMove(move: Tables['match_moves']['Insert']) {
    const { data, error } = await supabase
      .from('match_moves')
      .insert(move)
      .select()
      .single()
    
    return { data, error }
  }
}

// Betting operations
export const betService = {
  async placeBet(bet: Tables['bets']['Insert']) {
    const serverSupabase = createServerClient()
    
    const { data, error } = await serverSupabase
      .from('bets')
      .insert(bet)
      .select()
      .single()
    
    return { data, error }
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