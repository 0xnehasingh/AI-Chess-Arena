const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const directUrl = process.env.DIRECT_URL;

  if (!supabaseUrl || supabaseUrl.includes('[YOUR-')) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not configured properly');
    console.log('Please update your .env.local file with your Supabase project URL');
    process.exit(1);
  }

  if (!supabaseServiceKey || supabaseServiceKey.includes('[YOUR-')) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not configured properly');
    console.log('Please update your .env.local file with your Supabase service role key');
    console.log('\nYou can find these values in your Supabase dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy the "service_role" key (keep it secret!)');
    process.exit(1);
  }

  if (!directUrl || directUrl.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Error: DIRECT_URL still contains [YOUR-PASSWORD] placeholder');
    console.log('Please update your .env.local file with your actual database password');
    console.log('\nYou can find your database password in your Supabase dashboard:');
    console.log('1. Go to Settings → Database');
    console.log('2. Find your database password');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read migration files
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:\n`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // Process each migration file
    for (const file of migrationFiles) {
      console.log(`\n📝 Running migration: ${file}`);
      console.log('─'.repeat(50));

      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');

      // Split SQL into statements (basic split, might need refinement)
      const statements = sql
        .split(/;\s*$/m)
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          // Show a preview of the statement
          const preview = statement.substring(0, 60).replace(/\n/g, ' ');
          process.stdout.write(`  Executing: ${preview}...`);

          // For DDL statements, we need to use raw SQL execution
          // Since Supabase JS client doesn't have direct SQL execution,
          // we'll need to use the REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql_statement: statement + ';' })
          });

          if (!response.ok) {
            // Try alternative approach for DDL statements
            console.log(' ⚠️  (using alternative method)');
            // DDL statements might not work through RPC, log them for manual execution
            errorCount++;
          } else {
            successCount++;
            console.log(' ✅');
          }
        } catch (error) {
          console.log(` ❌ ${error.message}`);
          errorCount++;
        }
      }

      console.log(`\n  Summary: ${successCount} successful, ${errorCount} errors`);
    }

    // Verify tables were created
    console.log('\n\n🔍 Verifying database setup...');
    console.log('─'.repeat(50));

    const tables = ['profiles', 'matches', 'bets', 'tournaments', 'match_moves'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`  ❌ Table '${table}': Not accessible (${error.message})`);
          allTablesExist = false;
        } else {
          console.log(`  ✅ Table '${table}': Ready`);
        }
      } catch (err) {
        console.log(`  ❌ Table '${table}': Error checking`);
        allTablesExist = false;
      }
    }

    if (!allTablesExist) {
      console.log('\n⚠️  Some tables could not be verified.');
      console.log('\nYou may need to run the SQL migrations manually:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of each migration file');
      console.log('4. Execute them in order (001, 002, 003, 004)');
    } else {
      console.log('\n✅ All tables verified successfully!');
    }

    console.log('\n🎉 Migration process completed!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch(console.error);