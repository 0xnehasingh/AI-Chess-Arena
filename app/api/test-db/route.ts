import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test basic table access
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(1)

    return NextResponse.json({
      success: true,
      tests: {
        profiles: {
          error: profilesError?.message || null,
          hasData: profiles && profiles.length > 0,
          sampleRecord: profiles?.[0] || null
        },
        matches: {
          error: matchesError?.message || null,
          hasData: matches && matches.length > 0,
          sampleRecord: matches?.[0] || null
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 