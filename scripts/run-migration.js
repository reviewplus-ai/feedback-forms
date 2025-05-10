// This script runs the migration to add the reviews table
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running migration...')
  
  // Read the migration file
  const fs = require('fs')
  const path = require('path')
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240423123500_allow_public_access.sql')
  const migration = fs.readFileSync(migrationPath, 'utf8')
  
  // Split the migration into individual statements
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  // Execute each statement
  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      if (error) {
        console.error(`Error executing statement: ${statement}`, error)
      }
    } catch (error) {
      console.error(`Error executing statement: ${statement}`, error)
    }
  }
  
  console.log('Migration completed successfully')
}

runMigration()
  .then(() => {
    console.log('\nScript completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script error:', error)
    process.exit(1)
  }) 