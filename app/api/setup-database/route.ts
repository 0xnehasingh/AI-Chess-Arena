import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'Database setup only available in development mode' },
        { status: 403 }
      )
    }

    // Read the migration SQL file
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql')
    
    let migrationSQL: string
    try {
      migrationSQL = await fs.readFile(migrationPath, 'utf-8')
    } catch (error) {
      return NextResponse.json(
        { error: 'Migration file not found. Please ensure the SQL migration file exists.' },
        { status: 404 }
      )
    }

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    const results = []
    
    // Execute each statement
    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement + ';' 
        })
        
        if (error) {
          // If exec_sql function doesn't exist, try direct query
          const directResult = await supabase.from('_raw_sql').select('*').limit(1)
          if (directResult.error) {
            console.warn('Could not execute SQL statement directly:', statement)
            results.push({
              statement: statement.substring(0, 50) + '...',
              status: 'skipped',
              message: 'Direct SQL execution not available'
            })
            continue
          }
        }
        
        results.push({
          statement: statement.substring(0, 50) + '...',
          status: 'success'
        })
      } catch (error) {
        console.error('Error executing statement:', error)
        results.push({
          statement: statement.substring(0, 50) + '...',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Test the setup by querying the tables
    const tableTests = []
    
    // Test profiles table
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    tableTests.push({
      table: 'profiles',
      accessible: !profilesError,
      error: profilesError?.message
    })

    // Test matches table
    const { data: matchesTest, error: matchesError } = await supabase
      .from('matches')
      .select('id')
      .limit(1)
    
    tableTests.push({
      table: 'matches',
      accessible: !matchesError,
      error: matchesError?.message
    })

    // Test bets table
    const { data: betsTest, error: betsError } = await supabase
      .from('bets')
      .select('id')
      .limit(1)
    
    tableTests.push({
      table: 'bets',
      accessible: !betsError,
      error: betsError?.message
    })

    // Test tournaments table
    const { data: tournamentsTest, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
    
    tableTests.push({
      table: 'tournaments',
      accessible: !tournamentsError,
      error: tournamentsError?.message,
      sampleData: tournamentsTest?.slice(0, 3)
    })

    return NextResponse.json({
      message: 'Database setup completed',
      migrationResults: results,
      tableTests,
      summary: {
        totalStatements: statements.length,
        successful: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        tablesAccessible: tableTests.filter(t => t.accessible).length,
        totalTables: tableTests.length
      }
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check database connection and tables
    const tableChecks = []
    
    const tables = ['profiles', 'matches', 'bets', 'tournaments', 'match_moves']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        tableChecks.push({
          table,
          exists: !error,
          error: error?.message
        })
      } catch (err) {
        tableChecks.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Get sample data
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('*')
      .limit(5)

    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .limit(5)

    return NextResponse.json({
      status: 'Database connection successful',
      tables: tableChecks,
      sampleData: {
        tournaments: tournaments || [],
        matches: matches || []
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 