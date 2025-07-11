import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get a sample profile to see what columns exist
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      return NextResponse.json({
        success: false,
        error: profilesError.message,
        profiles: null
      })
    }

    // Get the column names from the first profile
    const columnNames = profiles && profiles.length > 0 ? Object.keys(profiles[0]) : []

    // Check if tickets_balance exists
    const hasTicketsBalance = columnNames.includes('tickets_balance')
    const hasVouchersBalance = columnNames.includes('vouchers_balance')
    const hasTotalTicketsEarned = columnNames.includes('total_tickets_earned')
    const hasTotalTicketsSpent = columnNames.includes('total_tickets_spent')

    return NextResponse.json({
      success: true,
      columnNames,
      ticketColumns: {
        tickets_balance: hasTicketsBalance,
        vouchers_balance: hasVouchersBalance,
        total_tickets_earned: hasTotalTicketsEarned,
        total_tickets_spent: hasTotalTicketsSpent
      },
      sampleProfile: profiles?.[0] || null,
      totalProfiles: profiles?.length || 0
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 