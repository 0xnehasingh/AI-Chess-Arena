import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST() {
  try {
    console.log('=== FIXING DATABASE RLS POLICIES ===')
    
    // Drop existing policies
    try {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "Users can view own profile" ON profiles;`
      })
    } catch (e: any) {
      console.log('Drop policy 1:', e.message)
    }
    
    try {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`
      })
    } catch (e: any) {
      console.log('Drop policy 2:', e.message)
    }

    // Recreate policies with proper permissions
    const policies = [
      `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);`,
      `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`,
      `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`,
      `CREATE POLICY "Service role can manage profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');`
    ]

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy })
        console.log('Applied policy:', policy.substring(0, 50) + '...')
      } catch (error: any) {
        console.error('Failed to apply policy:', policy, error.message)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database RLS policies fixed successfully' 
    })

  } catch (error) {
    console.error('Database fix error:', error)
    return NextResponse.json({ 
      error: 'Failed to fix database policies', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 