import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function POST() {
  try {
    const supabase = createServerClient()

    // Instead of ALTER TABLE, let's try to update the profiles table schema
    // by checking if we can select the columns first

    const results = []

    // Test if columns exist by trying to select them
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tickets_balance, vouchers_balance, total_tickets_earned, total_tickets_spent')
        .limit(1)

      if (error) {
        results.push({
          test: 'Column existence check',
          success: false,
          error: error.message,
          note: 'Columns do not exist and need to be added manually'
        })
      } else {
        results.push({
          test: 'Column existence check',
          success: true,
          error: null,
          note: 'All ticket columns already exist'
        })
      }
    } catch (err) {
      results.push({
        test: 'Column existence check',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        note: 'Error checking column existence'
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Manual schema update required',
      results,
      instructions: {
        problem: 'The ticket balance columns are missing from the profiles table',
        solution: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to Table Editor > profiles',
          '3. Add these columns:',
          '   - tickets_balance (int4, default: 0)',
          '   - vouchers_balance (int4, default: 0)', 
          '   - total_tickets_earned (int4, default: 0)',
          '   - total_tickets_spent (int4, default: 0)',
          '4. Save the changes',
          '5. Try signup again'
        ],
        alternative: 'Or run the migration file 004_add_ticket_balance.sql manually in the SQL Editor'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 