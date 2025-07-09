import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== APPLYING MISSING MIGRATION FOR PARTNER FIELDS ===')
    
    const supabase = createServerClient()
    
    // Define the columns to add
    const columnsToAdd = [
      {
        name: 'user_role',
        definition: 'VARCHAR(20) DEFAULT \'player\' CHECK (user_role IN (\'player\', \'partner\'))',
        description: 'User role (player or partner)'
      },
      {
        name: 'website',
        definition: 'TEXT',
        description: 'Partner website URL'
      },
      {
        name: 'telegram_discord',
        definition: 'TEXT',
        description: 'Telegram or Discord contact'
      },
      {
        name: 'banner_url',
        definition: 'TEXT',
        description: 'Partner banner image URL'
      },
      {
        name: 'short_bio',
        definition: 'TEXT',
        description: 'Partner short biography'
      },
      {
        name: 'ticket_name',
        definition: 'VARCHAR(100)',
        description: 'Partner ticket name'
      },
      {
        name: 'project_name',
        definition: 'VARCHAR(100)',
        description: 'Partner project name'
      }
    ]

    const results = []

    // First, check which columns already exist
    for (const column of columnsToAdd) {
      console.log(`\nChecking if column '${column.name}' exists...`)
      
      try {
        // Try to select the column to see if it exists
        const { data, error } = await supabase
          .from('profiles')
          .select(column.name)
          .limit(1)
        
        if (error && error.message.includes('does not exist')) {
          // Column doesn't exist, we need to add it
          console.log(`Column '${column.name}' does not exist, adding it...`)
          
          try {
            // Add the column using raw SQL
            const alterSQL = `ALTER TABLE profiles ADD COLUMN ${column.name} ${column.definition};`
            console.log(`Executing: ${alterSQL}`)
            
            // Use the sql method instead of rpc
            const { data: alterData, error: alterError } = await supabase
              .from('profiles')
              .select('count')
              .limit(0) // This is a hack to get a connection, then we'll use raw SQL
            
            // Since we can't execute raw SQL directly, let's try a different approach
            // We'll use the service role client to execute raw SQL
            const { createClient } = await import('@supabase/supabase-js')
            const serviceSupabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            
            // Try direct SQL execution
            const { data: sqlData, error: sqlError } = await serviceSupabase.rpc('exec_sql', {
              sql: alterSQL
            })
            
            if (sqlError) {
              console.error('Failed to add column via RPC:', sqlError.message)
              results.push({
                column: column.name,
                status: 'error',
                error: sqlError.message,
                sql: alterSQL
              })
            } else {
              console.log(`Successfully added column '${column.name}'`)
              results.push({
                column: column.name,
                status: 'success',
                message: 'Column added successfully',
                sql: alterSQL
              })
            }
          } catch (addError) {
            console.error(`Failed to add column '${column.name}':`, addError)
            results.push({
              column: column.name,
              status: 'error',
              error: addError instanceof Error ? addError.message : 'Unknown error',
              note: 'Could not execute ALTER TABLE statement'
            })
          }
        } else if (!error) {
          // Column exists
          console.log(`Column '${column.name}' already exists`)
          results.push({
            column: column.name,
            status: 'exists',
            message: 'Column already exists'
          })
        } else {
          // Some other error
          console.error(`Error checking column '${column.name}':`, error.message)
          results.push({
            column: column.name,
            status: 'error',
            error: error.message
          })
        }
      } catch (checkError) {
        console.error(`Failed to check column '${column.name}':`, checkError)
        results.push({
          column: column.name,
          status: 'error',
          error: checkError instanceof Error ? checkError.message : 'Unknown error'
        })
      }
    }

    // Create index for user_role if it was added
    if (results.some(r => r.column === 'user_role' && r.status === 'success')) {
      console.log('\nCreating index for user_role column...')
      try {
        const indexSQL = 'CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);'
        // For now, we'll skip index creation since we can't execute raw SQL
        results.push({
          column: 'idx_profiles_user_role',
          status: 'skipped',
          message: 'Index creation skipped - requires manual setup',
          sql: indexSQL
        })
      } catch (error) {
        console.error('Failed to create index:', error)
      }
    }

    // Test final state - check which columns exist now
    console.log('\n=== TESTING FINAL STATE ===')
    const finalColumnTests = []
    
    for (const column of columnsToAdd) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(column.name)
          .limit(1)
        
        finalColumnTests.push({
          column: column.name,
          exists: !error,
          error: error?.message
        })
      } catch (error) {
        finalColumnTests.push({
          column: column.name,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successfulColumns = finalColumnTests.filter(t => t.exists).length
    const totalColumns = finalColumnTests.length
    const addedColumns = results.filter(r => r.status === 'success').length
    const existingColumns = results.filter(r => r.status === 'exists').length

    return NextResponse.json({
      message: 'Migration attempt completed',
      migrationResults: results,
      finalColumnTests,
      summary: {
        totalColumns,
        existingColumns,
        addedColumns,
        columnsNowExisting: successfulColumns,
        errors: results.filter(r => r.status === 'error').length,
        migrationSuccessful: successfulColumns >= 7, // At least 7 out of 8 columns should exist
      },
      instructions: successfulColumns < 7 ? {
        message: 'Some columns are still missing. You may need to run these SQL statements manually in your Supabase SQL editor:',
        sqlStatements: results
          .filter(r => r.status === 'error' && r.sql)
          .map(r => r.sql)
      } : null
    })

  } catch (error) {
    console.error('Migration application error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to apply migration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Apply Missing Migration API',
    description: 'Use POST to apply the partner fields migration',
    endpoint: '/api/apply-missing-migration',
    note: 'This API will check for missing columns and attempt to add them'
  })
} 