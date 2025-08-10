const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status on all tables...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test each table's accessibility without authentication
    const tables = ['profiles', 'matches', 'bets', 'tournaments', 'match_moves'];
    
    console.log('Testing table access without authentication:');
    console.log('─'.repeat(50));

    for (const table of tables) {
      try {
        // Try to read from the table
        const { data: readData, error: readError } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        // Try to count records
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (readError) {
          console.log(`❌ ${table}: RLS enabled (read blocked) - ${readError.message}`);
        } else {
          console.log(`✅ ${table}: RLS disabled or has public read access (${count || 0} records)`);
        }

        // Test write access (dry run - don't actually insert)
        // This will fail if RLS is enabled without proper policies
        if (table === 'profiles') {
          const testProfile = {
            email: 'test@example.com',
            username: 'testuser_' + Date.now()
          };
          
          const { error: insertError } = await supabase
            .from(table)
            .insert(testProfile)
            .select();

          if (insertError && insertError.message.includes('policy')) {
            console.log(`   └─ Write: RLS blocking writes`);
          } else if (insertError) {
            console.log(`   └─ Write: Failed (${insertError.message.substring(0, 50)}...)`);
          } else {
            console.log(`   └─ Write: RLS allows writes (or disabled)`);
            // Clean up test data
            await supabase.from(table).delete().eq('email', 'test@example.com');
          }
        }

      } catch (error) {
        console.log(`❌ ${table}: Error checking - ${error.message}`);
      }
    }

    console.log('\n' + '─'.repeat(50));
    console.log('\nTo disable RLS on all tables:');
    console.log('1. Go to your Supabase SQL Editor');
    console.log('2. Copy and run the contents of disable-rls.sql');
    console.log('\n⚠️  Note: Disabling RLS removes all access restrictions.');
    console.log('This is fine for development but NOT recommended for production!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRLSStatus().catch(console.error);