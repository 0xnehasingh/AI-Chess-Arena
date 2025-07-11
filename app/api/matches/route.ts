import { NextRequest, NextResponse } from 'next/server'
import { matchService } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'finished', 'live', 'upcoming', or null for all

    let matches

    if (status === 'finished') {
      // Get finished matches
      const { data, error } = await matchService.getFinished()
      if (error) throw error
      matches = data
    } else if (status === 'live') {
      // Get live matches
      const { data, error } = await matchService.getLive()
      if (error) throw error
      matches = data
    } else if (status === 'upcoming') {
      // Get upcoming matches
      const { data, error } = await matchService.getUpcoming()
      if (error) throw error
      matches = data
    } else {
      // Get all matches
      const { data, error } = await matchService.getAll()
      if (error) throw error
      matches = data
    }

    return NextResponse.json({ matches }, { status: 200 })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
} 