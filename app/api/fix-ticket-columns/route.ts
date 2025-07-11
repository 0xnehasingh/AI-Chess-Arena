import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function POST() {
  try {
    const supabase = createServerClient()

    console.log('=== FIX TICKET COLUMNS - DEPRECATED ENDPOINT ===')

    // Most database schema changes should be done through migrations
    // This endpoint is kept for manual ticket updates only

    const results = []

    // Update existing users to have 100 welcome tickets (if they have 0)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          tickets_balance: 100,
          total_tickets_earned: 100
        })
        .eq('tickets_balance', 0)
        .eq('total_tickets_earned', 0)
        .select('id')

      const updatedCount = Array.isArray(data) ? data.length : 0

      results.push({
        command: 'Update existing users with welcome tickets',
        success: !error,
        error: error?.message || null,
        data: `Updated ${updatedCount} profiles`
      })
    } catch (err) {
      results.push({
        command: 'Update existing users with welcome tickets',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: null
      })
    }

    const successCount = results.filter(r => r.success).length
    const totalCommands = results.length

    return NextResponse.json({
      success: successCount === totalCommands,
      message: `${successCount}/${totalCommands} commands executed successfully`,
      note: 'Schema changes should be done through Supabase migrations',
      results
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 