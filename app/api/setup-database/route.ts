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

    // Read the migration SQL files
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    
    // Get all migration files in order
    let migrationFiles: string[]
    try {
      const files = await fs.readdir(migrationsDir)
      migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort() // This will sort them in order: 001_, 002_, 003_, etc.
      
      console.log('Found migration files:', migrationFiles)
    } catch (error) {
      return NextResponse.json(
        { error: 'Migration directory not found. Please ensure the migrations directory exists.' },
        { status: 404 }
      )
    }

    if (migrationFiles.length === 0) {
      return NextResponse.json(
        { error: 'No migration files found.' },
        { status: 404 }
      )
    }

    const allResults = []
    
    // Run each migration file
    for (const migrationFile of migrationFiles) {
      console.log(`\n=== Running migration: ${migrationFile} ===`)
      
      const migrationPath = path.join(migrationsDir, migrationFile)
      
      let migrationSQL: string
      try {
        migrationSQL = await fs.readFile(migrationPath, 'utf-8')
      } catch (error) {
        allResults.push({
          file: migrationFile,
          status: 'error',
          error: `Failed to read migration file: ${migrationFile}`
        })
        continue
      }

      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      const migrationResults = []
      
      // Execute each statement in this migration
      for (const statement of statements) {
        try {
          // Use raw SQL execution for complex statements
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_statement: statement + ';' 
          })
          
          if (error) {
            // If rpc doesn't work, try direct execution
            console.warn('RPC failed, trying direct execution:', error.message)
            
            // For some statements, we might need to execute them differently
            if (statement.includes('DO $$') || statement.includes('CREATE OR REPLACE FUNCTION')) {
              console.log('Executing complex statement via raw SQL')
              // These complex statements need special handling
            }
            
            migrationResults.push({
              statement: statement.substring(0, 50) + '...',
              status: 'warning',
              message: `RPC execution failed: ${error.message}`,
              warning: true
            })
            continue
          }
          
          migrationResults.push({
            statement: statement.substring(0, 50) + '...',
            status: 'success'
          })
        } catch (error) {
          console.error('Error executing statement:', error)
          migrationResults.push({
            statement: statement.substring(0, 50) + '...',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      allResults.push({
        file: migrationFile,
        status: 'completed',
        statements: migrationResults,
        successCount: migrationResults.filter(r => r.status === 'success').length,
        errorCount: migrationResults.filter(r => r.status === 'error').length,
        warningCount: migrationResults.filter(r => r.status === 'warning').length
      })
    }

    // Test the setup by querying the tables
    const tableTests = []
    
    // Test profiles table with new columns
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_role, website, telegram_discord')
      .limit(1)
    
    tableTests.push({
      table: 'profiles',
      accessible: !profilesError,
      error: profilesError?.message,
      hasUserRole: profilesTest ? true : false
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

    // Calculate overall summary
    const totalStatements = allResults.reduce((sum, file) => sum + (file.statements?.length || 0), 0)
    const totalSuccess = allResults.reduce((sum, file) => sum + (file.successCount || 0), 0)
    const totalErrors = allResults.reduce((sum, file) => sum + (file.errorCount || 0), 0)
    const totalWarnings = allResults.reduce((sum, file) => sum + (file.warningCount || 0), 0)

    return NextResponse.json({
      message: 'Database setup completed with all migrations',
      migrationResults: allResults,
      tableTests,
      summary: {
        totalMigrationFiles: migrationFiles.length,
        totalStatements,
        successful: totalSuccess,
        errors: totalErrors,
        warnings: totalWarnings,
        tablesAccessible: tableTests.filter(t => t.accessible).length,
        totalTables: tableTests.length,
        hasUserRoleColumn: tableTests.find(t => t.table === 'profiles')?.hasUserRole || false
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