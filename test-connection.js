const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment variables check:');
  console.log('─'.repeat(50));
  
  if (!supabaseUrl || supabaseUrl.includes('[YOUR-')) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL: Not configured');
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('[YOUR-')) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Not configured');
    console.log('   Get this from: Supabase Dashboard → Settings → API → anon/public key');
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configured (', supabaseAnonKey.substring(0, 20), '...)');
  }

  if (!supabaseServiceKey || supabaseServiceKey.includes('[YOUR-')) {
    console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY: Not configured');
    console.log('   Get this from: Supabase Dashboard → Settings → API → service_role key');
    console.log('   Note: This is optional but recommended for migrations');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Configured (', supabaseServiceKey.substring(0, 20), '...)');
  }

  console.log('\n' + '─'.repeat(50));

  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl.includes('[YOUR-') || supabaseAnonKey.includes('[YOUR-')) {
    console.log('\n❌ Cannot test connection - missing required configuration');
    console.log('\nPlease update your .env.local file with:');
    console.log('1. Your Supabase project URL');
    console.log('2. Your Supabase anon/public key');
    console.log('3. Your Supabase service role key (optional but recommended)');
    process.exit(1);
  }

  // Test connection with anon key
  console.log('\n📡 Testing database connection...\n');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
        console.log('⚠️  Tables not found in database');
        console.log('\nYou need to run the migrations first:');
        console.log('1. Go to your Supabase SQL Editor');
        console.log('2. Copy the contents of combined-migrations.sql');
        console.log('3. Paste and execute the SQL');
      } else {
        console.log('❌ Connection test failed:', testError.message);
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      
      // Check all tables
      console.log('\n📊 Checking database tables:');
      console.log('─'.repeat(50));
      
      const tables = ['profiles', 'matches', 'bets', 'tournaments', 'match_moves'];
      let allTablesExist = true;

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`  ❌ ${table}: Not found or not accessible`);
          allTablesExist = false;
        } else {
          console.log(`  ✅ ${table}: Ready`);
        }
      }

      if (allTablesExist) {
        console.log('\n🎉 All tables are set up correctly!');
        console.log('\nYour database is ready to use. You can now:');
        console.log('1. Run the development server: npm run dev');
        console.log('2. Access the application at http://localhost:3000');
      } else {
        console.log('\n⚠️  Some tables are missing');
        console.log('Please run the migrations using the SQL Editor');
      }
    }

  } catch (error) {
    console.error('❌ Error testing connection:', error.message);
    process.exit(1);
  }
}

testConnection().catch(console.error);