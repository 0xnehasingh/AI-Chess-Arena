import { NextRequest, NextResponse } from 'next/server'
import { statsService, matchService } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    if (matchId) {
      // Get statistics for a specific match
      const { data: matchStats, error: statsError } = await statsService.getMatchStats(matchId)
      const { data: match, error: matchError } = await matchService.getById(matchId)
      
      if (statsError || matchError) {
        throw new Error(statsError?.message || matchError?.message || 'Failed to fetch match data')
      }

      return NextResponse.json({ 
        matchStats,
        match,
        success: true
      }, { status: 200 })
    } else {
      // Get overall statistics across all matches
      const { data: allMatches, error: matchesError } = await matchService.getAll()
      
      if (matchesError) {
        throw new Error('Failed to fetch matches')
      }

      // Calculate overall statistics
      const totalMatches = allMatches?.length || 0
      const finishedMatches = allMatches?.filter(m => m.status === 'finished') || []
      const liveMatches = allMatches?.filter(m => m.status === 'live') || []
      const upcomingMatches = allMatches?.filter(m => m.status === 'upcoming') || []

      // Calculate AI performance
      const chatgptWins = finishedMatches.filter(m => m.winner === 'ChatGPT').length
      const claudeWins = finishedMatches.filter(m => m.winner === 'Claude').length
      const draws = finishedMatches.filter(m => m.winner === 'draw').length

      // Calculate average game duration
      const gamesWithDuration = finishedMatches.filter(m => m.end_time)
      let averageDuration = 0
      let longestDuration = 0

      if (gamesWithDuration.length > 0) {
        const totalDuration = gamesWithDuration.reduce((sum, match) => {
          const duration = new Date(match.end_time!).getTime() - new Date(match.start_time).getTime()
          if (duration > longestDuration) longestDuration = duration
          return sum + duration
        }, 0)
        averageDuration = totalDuration / gamesWithDuration.length
      }

      // Calculate average moves per game
      const averageMoves = finishedMatches.length > 0 
        ? finishedMatches.reduce((sum, match) => sum + match.move_count, 0) / finishedMatches.length 
        : 0

      const statistics = {
        totalMatches,
        finishedMatches: finishedMatches.length,
        liveMatches: liveMatches.length,
        upcomingMatches: upcomingMatches.length,
        chatgptWins,
        claudeWins,
        draws,
        chatgptWinRate: finishedMatches.length > 0 ? (chatgptWins / finishedMatches.length) * 100 : 0,
        claudeWinRate: finishedMatches.length > 0 ? (claudeWins / finishedMatches.length) * 100 : 0,
        drawRate: finishedMatches.length > 0 ? (draws / finishedMatches.length) * 100 : 0,
        averageDuration: Math.floor(averageDuration / 60000), // Convert to minutes
        longestDuration: Math.floor(longestDuration / 60000), // Convert to minutes
        averageMoves: Math.round(averageMoves),
        totalMoves: finishedMatches.reduce((sum, match) => sum + match.move_count, 0)
      }

      return NextResponse.json({ 
        statistics,
        success: true
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Error fetching match statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match statistics', success: false },
      { status: 500 }
    )
  }
} 