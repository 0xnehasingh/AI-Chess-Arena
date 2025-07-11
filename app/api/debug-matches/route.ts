import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test direct query without joins
    const { data: directMatches, error: directError } = await supabase
      .from('matches')
      .select('*')
      .limit(10)

    // Test with joins like our service does
    const { data: joinedMatches, error: joinedError } = await supabase
      .from('matches')
      .select(`
        *,
        tournaments (*),
        match_moves (*)
      `)
      .limit(10)

    // Test finished matches specifically
    const { data: finishedMatches, error: finishedError } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'finished')
      .limit(10)

    return NextResponse.json({
      success: true,
      directQuery: {
        error: directError?.message || null,
        count: directMatches?.length || 0,
        data: directMatches || []
      },
      joinedQuery: {
        error: joinedError?.message || null,
        count: joinedMatches?.length || 0,
        data: joinedMatches || []
      },
      finishedQuery: {
        error: finishedError?.message || null,
        count: finishedMatches?.length || 0,
        data: finishedMatches || []
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 