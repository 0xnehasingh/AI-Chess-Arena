import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all users with their ticket information
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, tickets_balance, vouchers_balance, total_tickets_earned, total_tickets_spent')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }

    // Count users by ticket balance
    const stats = {
      totalUsers: users?.length || 0,
      usersWithZeroTickets: users?.filter(u => u.tickets_balance === 0).length || 0,
      usersWithTickets: users?.filter(u => u.tickets_balance > 0).length || 0,
      usersWithNullTickets: users?.filter(u => u.tickets_balance === null).length || 0,
      averageTickets: users?.length ? Math.round(users.reduce((sum, u) => sum + (u.tickets_balance || 0), 0) / users.length) : 0
    }

    return NextResponse.json({
      success: true,
      stats,
      users: users || [],
      sampleUser: users?.[0] || null
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 