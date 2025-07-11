import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function POST() {
  try {
    const supabase = createServerClient()

    // First, try to update all existing users with 100 tickets
    // Even if the schema check doesn't show the columns, they might exist
    try {
      const { data: allUsers, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, username, tickets_balance')

      if (fetchError) {
        return NextResponse.json({
          success: false,
          error: `Could not fetch users: ${fetchError.message}`,
          note: 'The ticket columns might not exist yet. Please add them manually via Supabase dashboard.'
        })
      }

      console.log(`Found ${allUsers?.length || 0} users to update`)

      // Update users who have 0 or null tickets
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          tickets_balance: 100,
          vouchers_balance: 0,
          total_tickets_earned: 100,
          total_tickets_spent: 0
        })
        .or('tickets_balance.is.null,tickets_balance.eq.0')
        .select('id, username, tickets_balance')

      if (updateError) {
        return NextResponse.json({
          success: false,
          error: `Could not update users: ${updateError.message}`,
          note: 'The ticket columns might not exist. Please add them via Supabase dashboard first.'
        })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully gave 100 welcome tickets to ${updateResult?.length || 0} users`,
        updatedUsers: updateResult || [],
        totalUsers: allUsers?.length || 0
      })

    } catch (directError) {
      return NextResponse.json({
        success: false,
        error: directError instanceof Error ? directError.message : 'Unknown error',
        note: 'Could not access ticket columns. Please ensure they are added via Supabase dashboard.',
        sqlToRun: `
-- Run this SQL in your Supabase SQL Editor:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tickets_balance INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vouchers_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_tickets_earned INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_tickets_spent INTEGER DEFAULT 0;

-- Update existing users
UPDATE profiles SET 
  tickets_balance = 100,
  vouchers_balance = 0,
  total_tickets_earned = 100,
  total_tickets_spent = 0
WHERE tickets_balance IS NULL OR tickets_balance = 0;
        `
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 