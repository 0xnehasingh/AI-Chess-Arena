const fs = require('fs').promises;
const path = require('path');

async function generateCombinedSQL() {
  console.log('🔧 Generating combined migration SQL...\n');

  try {
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:\n`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    
    let combinedSQL = '-- Combined Migration SQL for AI Chess Arena\n';
    combinedSQL += '-- Generated on: ' + new Date().toISOString() + '\n';
    combinedSQL += '-- Execute this in your Supabase SQL Editor\n\n';

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      
      combinedSQL += `\n-- ========================================\n`;
      combinedSQL += `-- Migration: ${file}\n`;
      combinedSQL += `-- ========================================\n\n`;
      combinedSQL += sql;
      combinedSQL += '\n\n';
    }

    // Write combined SQL to file
    const outputPath = path.join(__dirname, 'combined-migrations.sql');
    await fs.writeFile(outputPath, combinedSQL);

    console.log('\n✅ Combined SQL file generated: combined-migrations.sql');
    console.log('\nTo apply these migrations:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Copy the contents of combined-migrations.sql');
    console.log('5. Paste and execute in the SQL Editor');
    console.log('\nAlternatively, you can run each migration file separately in order.');

  } catch (error) {
    console.error('❌ Error generating SQL:', error.message);
    process.exit(1);
  }
}

generateCombinedSQL().catch(console.error);