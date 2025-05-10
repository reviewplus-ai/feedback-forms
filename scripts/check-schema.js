const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkSchema() {
  console.log('Checking database schema...')

  try {
    // Get table information
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
    })
    
    if (tablesError) {
      console.error('Error getting tables:', tablesError)
      return
    }
    
    console.log('Tables:', tables)
    
    // Get column information for each table
    for (const table of tables) {
      const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = '${table}'
        `
      })
      
      if (columnsError) {
        console.error(`Error getting columns for ${table}:`, columnsError)
        continue
      }
      
      console.log(`\nColumns for ${table}:`, columns)
    }
  } catch (error) {
    console.error('Error checking schema:', error)
  }
}

checkSchema()
  .then(() => {
    console.log('\nScript completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script error:', error)
    process.exit(1)
  }) 