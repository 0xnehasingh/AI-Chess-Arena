import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function POST() {
  try {
    const supabase = createServerClient()

    // Create some test finished matches with simple data
    const testMatches = [
      {
        champion_white: 'ChatGPT' as const,
        champion_black: 'Claude' as const,
        status: 'finished' as const,
        start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 45 mins later
        winner: 'ChatGPT' as const,
        move_count: 67,
        betting_closes_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
        total_pool: 150,
        chatgpt_pool: 85,
        claude_pool: 65
      },
      {
        champion_white: 'Claude' as const,
        champion_black: 'ChatGPT' as const,
        status: 'finished' as const,
        start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 32 * 60 * 1000).toISOString(), // 32 mins later
        winner: 'Claude' as const,
        move_count: 52,
        betting_closes_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
        total_pool: 200,
        chatgpt_pool: 120,
        claude_pool: 80
      },
      {
        champion_white: 'ChatGPT' as const,
        champion_black: 'Claude' as const,
        status: 'finished' as const,
        start_time: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        end_time: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000 + 58 * 60 * 1000).toISOString(), // 58 mins later
        winner: 'draw' as const,
        move_count: 89,
        betting_closes_at: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
        total_pool: 300,
        chatgpt_pool: 150,
        claude_pool: 150
      }
    ]

    let createdMatches = []
    
    for (const match of testMatches) {
      const { data, error } = await supabase
        .from('matches')
        .insert(match)
        .select()
        .single()
      
      if (error) {
        console.error('Error inserting match:', error)
        return NextResponse.json({ 
          error: `Failed to insert match: ${error.message}` 
        }, { status: 500 })
      }
      
      createdMatches.push(data)
    }

    return NextResponse.json({ 
      message: 'Test matches created successfully',
      matches: createdMatches,
      count: createdMatches.length
    })

  } catch (error) {
    console.error('Error creating test matches:', error)
    return NextResponse.json({ 
      error: `Failed to create test matches: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
} 