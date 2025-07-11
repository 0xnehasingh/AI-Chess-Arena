import { NextRequest, NextResponse } from 'next/server'
import { statsService } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // 'overall', 'week', 'month'
    const limit = parseInt(searchParams.get('limit') || '10')

    let leaderboard

    if (period === 'week') {
      // Get weekly leaderboard (last 7 days)
      const { data, error } = await statsService.getWeeklyLeaderboard(limit)
      if (error) throw error
      leaderboard = data
    } else if (period === 'month') {
      // Get monthly leaderboard (last 30 days)
      const { data, error } = await statsService.getMonthlyLeaderboard(limit)
      if (error) throw error
      leaderboard = data
    } else {
      // Get overall leaderboard
      const { data, error } = await statsService.getLeaderboard(limit)
      if (error) throw error
      leaderboard = data
    }

    // Add ranking and tier calculation
    const rankedLeaderboard = (leaderboard || []).map((user, index) => ({
      ...user,
      rank: index + 1,
      tier: calculateTier(user.total_winnings, user.win_rate)
    }))

    return NextResponse.json({ leaderboard: rankedLeaderboard }, { status: 200 })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

function calculateTier(totalWinnings: number, winRate: number): 'Diamond' | 'Gold' | 'Silver' | 'Bronze' {
  if (totalWinnings >= 2000 && winRate >= 65) return 'Diamond'
  if (totalWinnings >= 1000 && winRate >= 60) return 'Gold'
  if (totalWinnings >= 500 && winRate >= 55) return 'Silver'
  return 'Bronze'
} 