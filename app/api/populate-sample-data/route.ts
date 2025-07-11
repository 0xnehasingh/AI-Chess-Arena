import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function POST() {
  try {
    const supabase = createServerClient()

    // First, let's insert some sample users if they don't exist
    const sampleUsers = [
      {
        id: 'sample-user-1',
        email: 'alice@example.com',
        username: 'alice_chess',
        display_name: 'Alice Chen',
        total_winnings: 2450,
        total_bets: 127,
        win_rate: 68.5,
        tickets_balance: 150,
        vouchers_balance: 5,
        total_tickets_earned: 2600,
        total_tickets_spent: 2450
      },
      {
        id: 'sample-user-2',
        email: 'bob@example.com',
        username: 'bob_strategist',
        display_name: 'Bob Martinez',
        total_winnings: 1820,
        total_bets: 95,
        win_rate: 72.3,
        tickets_balance: 200,
        vouchers_balance: 3,
        total_tickets_earned: 2020,
        total_tickets_spent: 1820
      },
      {
        id: 'sample-user-3',
        email: 'carol@example.com',
        username: 'chess_master_c',
        display_name: 'Carol Thompson',
        total_winnings: 1650,
        total_bets: 156,
        win_rate: 61.2,
        tickets_balance: 85,
        vouchers_balance: 2,
        total_tickets_earned: 1735,
        total_tickets_spent: 1650
      }
    ]

    // Insert sample users
    for (const user of sampleUsers) {
      const { error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error inserting user ${user.username}:`, error)
      }
    }

    // Insert some sample matches
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const sampleMatches = [
      {
        id: 'match-1',
        tournament_id: null,
        champion_white: 'ChatGPT',
        champion_black: 'Claude',
        status: 'finished',
        start_time: threeDaysAgo.toISOString(),
        end_time: new Date(threeDaysAgo.getTime() + 45 * 60 * 1000).toISOString(), // 45 minutes later
        winner: 'ChatGPT',
        move_count: 67,
        pgn: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6...',
        betting_closes_at: new Date(threeDaysAgo.getTime() - 5 * 60 * 1000).toISOString(),
        total_pool: 150,
        chatgpt_pool: 85,
        claude_pool: 65
      },
      {
        id: 'match-2',
        tournament_id: null,
        champion_white: 'Claude',
        champion_black: 'ChatGPT',
        status: 'finished',
        start_time: twoDaysAgo.toISOString(),
        end_time: new Date(twoDaysAgo.getTime() + 32 * 60 * 1000).toISOString(), // 32 minutes later
        winner: 'Claude',
        move_count: 52,
        pgn: '1.d4 d5 2.c4 e6 3.Nc3 Nf6...',
        betting_closes_at: new Date(twoDaysAgo.getTime() - 5 * 60 * 1000).toISOString(),
        total_pool: 200,
        chatgpt_pool: 120,
        claude_pool: 80
      },
      {
        id: 'match-3',
        tournament_id: null,
        champion_white: 'ChatGPT',
        champion_black: 'Claude',
        status: 'finished',
        start_time: yesterday.toISOString(),
        end_time: new Date(yesterday.getTime() + 58 * 60 * 1000).toISOString(), // 58 minutes later
        winner: 'draw',
        move_count: 89,
        pgn: '1.e4 c5 2.Nf3 d6 3.d4 cxd4...',
        betting_closes_at: new Date(yesterday.getTime() - 5 * 60 * 1000).toISOString(),
        total_pool: 300,
        chatgpt_pool: 150,
        claude_pool: 150
      }
    ]

    // Insert sample matches
    for (const match of sampleMatches) {
      const { error } = await supabase
        .from('matches')
        .upsert(match, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error inserting match ${match.id}:`, error)
      }
    }

    // Insert some sample bets
    const sampleBets = [
      // Alice's bets
      {
        id: 'bet-1',
        user_id: 'sample-user-1',
        match_id: 'match-1',
        champion: 'ChatGPT',
        amount: 50,
        potential_payout: 85,
        status: 'won',
        payout_amount: 85,
        created_at: new Date(threeDaysAgo.getTime() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'bet-2',
        user_id: 'sample-user-1',
        match_id: 'match-2',
        champion: 'ChatGPT',
        amount: 75,
        potential_payout: 120,
        status: 'lost',
        payout_amount: 0,
        created_at: new Date(twoDaysAgo.getTime() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'bet-3',
        user_id: 'sample-user-1',
        match_id: 'match-3',
        champion: 'Claude',
        amount: 25,
        potential_payout: 50,
        status: 'lost',
        payout_amount: 0,
        created_at: new Date(yesterday.getTime() - 10 * 60 * 1000).toISOString()
      },
      // Bob's bets
      {
        id: 'bet-4',
        user_id: 'sample-user-2',
        match_id: 'match-1',
        champion: 'Claude',
        amount: 30,
        potential_payout: 45,
        status: 'lost',
        payout_amount: 0,
        created_at: new Date(threeDaysAgo.getTime() - 8 * 60 * 1000).toISOString()
      },
      {
        id: 'bet-5',
        user_id: 'sample-user-2',
        match_id: 'match-2',
        champion: 'Claude',
        amount: 60,
        potential_payout: 105,
        status: 'won',
        payout_amount: 105,
        created_at: new Date(twoDaysAgo.getTime() - 8 * 60 * 1000).toISOString()
      },
      // Carol's bets
      {
        id: 'bet-6',
        user_id: 'sample-user-3',
        match_id: 'match-2',
        champion: 'Claude',
        amount: 40,
        potential_payout: 70,
        status: 'won',
        payout_amount: 70,
        created_at: new Date(twoDaysAgo.getTime() - 12 * 60 * 1000).toISOString()
      },
      {
        id: 'bet-7',
        user_id: 'sample-user-3',
        match_id: 'match-3',
        champion: 'ChatGPT',
        amount: 35,
        potential_payout: 70,
        status: 'lost',
        payout_amount: 0,
        created_at: new Date(yesterday.getTime() - 12 * 60 * 1000).toISOString()
      }
    ]

    // Insert sample bets
    for (const bet of sampleBets) {
      const { error } = await supabase
        .from('bets')
        .upsert(bet, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error inserting bet ${bet.id}:`, error)
      }
    }

    return NextResponse.json({ 
      message: 'Sample data populated successfully',
      data: {
        users: sampleUsers.length,
        matches: sampleMatches.length,
        bets: sampleBets.length
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error populating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to populate sample data' },
      { status: 500 }
    )
  }
} 