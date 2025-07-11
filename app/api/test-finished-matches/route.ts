import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Direct query for finished matches
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        tournaments (*),
        match_moves (*)
      `)
      .eq('status', 'finished')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      matches: data || [],
      count: data?.length || 0
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching finished matches:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      matches: []
    }, { status: 500 })
  }
} 