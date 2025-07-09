import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes (with fallback)
export const createServerClient = () => {
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key')
    // Fallback to anon key for development
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string | null
          avatar_url: string | null
          wallet_address: string | null
          total_winnings: number
          total_bets: number
          win_rate: number
          user_role: 'player' | 'partner'
          website: string | null
          telegram_discord: string | null
          logo_url: string | null
          banner_url: string | null
          short_bio: string | null
          ticket_name: string | null
          project_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          wallet_address?: string | null
          total_winnings?: number
          total_bets?: number
          win_rate?: number
          user_role?: 'player' | 'partner'
          website?: string | null
          telegram_discord?: string | null
          logo_url?: string | null
          banner_url?: string | null
          short_bio?: string | null
          ticket_name?: string | null
          project_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          wallet_address?: string | null
          total_winnings?: number
          total_bets?: number
          win_rate?: number
          user_role?: 'player' | 'partner'
          website?: string | null
          telegram_discord?: string | null
          logo_url?: string | null
          banner_url?: string | null
          short_bio?: string | null
          ticket_name?: string | null
          project_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string | null
          champion_white: 'ChatGPT' | 'Claude'
          champion_black: 'ChatGPT' | 'Claude'
          status: 'upcoming' | 'live' | 'finished' | 'cancelled'
          start_time: string
          end_time: string | null
          winner: 'ChatGPT' | 'Claude' | 'draw' | null
          move_count: number
          pgn: string | null
          betting_closes_at: string
          total_pool: number
          chatgpt_pool: number
          claude_pool: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id?: string | null
          champion_white: 'ChatGPT' | 'Claude'
          champion_black: 'ChatGPT' | 'Claude'
          status?: 'upcoming' | 'live' | 'finished' | 'cancelled'
          start_time: string
          end_time?: string | null
          winner?: 'ChatGPT' | 'Claude' | 'draw' | null
          move_count?: number
          pgn?: string | null
          betting_closes_at: string
          total_pool?: number
          chatgpt_pool?: number
          claude_pool?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string | null
          champion_white?: 'ChatGPT' | 'Claude'
          champion_black?: 'ChatGPT' | 'Claude'
          status?: 'upcoming' | 'live' | 'finished' | 'cancelled'
          start_time?: string
          end_time?: string | null
          winner?: 'ChatGPT' | 'Claude' | 'draw' | null
          move_count?: number
          pgn?: string | null
          betting_closes_at?: string
          total_pool?: number
          chatgpt_pool?: number
          claude_pool?: number
          created_at?: string
          updated_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          match_id: string
          champion: 'ChatGPT' | 'Claude'
          amount: number
          potential_payout: number
          status: 'pending' | 'won' | 'lost' | 'cancelled'
          payout_amount: number | null
          transaction_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          champion: 'ChatGPT' | 'Claude'
          amount: number
          potential_payout: number
          status?: 'pending' | 'won' | 'lost' | 'cancelled'
          payout_amount?: number | null
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          champion?: 'ChatGPT' | 'Claude'
          amount?: number
          potential_payout?: number
          status?: 'pending' | 'won' | 'lost' | 'cancelled'
          payout_amount?: number | null
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          sponsor: string | null
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'finished'
          prize_pool: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sponsor?: string | null
          start_date: string
          end_date: string
          status?: 'upcoming' | 'active' | 'finished'
          prize_pool?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sponsor?: string | null
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'active' | 'finished'
          prize_pool?: number
          created_at?: string
          updated_at?: string
        }
      }
      match_moves: {
        Row: {
          id: string
          match_id: string
          move_number: number
          champion: 'ChatGPT' | 'Claude'
          move: string
          position_after: string
          thinking_time: number | null
          evaluation: number | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          move_number: number
          champion: 'ChatGPT' | 'Claude'
          move: string
          position_after: string
          thinking_time?: number | null
          evaluation?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          move_number?: number
          champion?: 'ChatGPT' | 'Claude'
          move?: string
          position_after?: string
          thinking_time?: number | null
          evaluation?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 