// This script checks the database for forms
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('Checking database tables and data...\n')

  // Check review_forms table
  console.log('--- REVIEW FORMS ---')
  const { data: forms, error: formsError } = await supabase
    .from('review_forms')
    .select('*')
  
  if (formsError) {
    console.error('Error fetching review forms:', formsError)
  } else {
    console.log(`Found ${forms.length} review forms:`)
    forms.forEach(form => {
      console.log(`- ID: ${form.id}, Name: ${form.name}, Slug: ${form.slug}`)
    })
  }

  // Check companies table
  console.log('\n--- COMPANIES ---')
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
  
  if (companiesError) {
    console.error('Error fetching companies:', companiesError)
  } else {
    console.log(`Found ${companies.length} companies:`)
    companies.forEach(company => {
      console.log(`- ID: ${company.id}, Name: ${company.name}`)
    })
  }

  // Check reviews table
  console.log('\n--- REVIEWS ---')
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
  
  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
  } else {
    console.log(`Found ${reviews.length} reviews:`)
    reviews.forEach(review => {
      console.log(`- ID: ${review.id}, Form ID: ${review.form_id}, Rating: ${review.rating}`)
    })
  }

  // Check users table
  console.log('\n--- USERS ---')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
  
  if (usersError) {
    console.error('Error fetching users:', usersError)
  } else {
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}`)
    })
  }

  // Check auth.users table
  console.log('\n--- AUTH USERS ---')
  const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers()
  
  if (authUsersError) {
    console.error('Error fetching auth users:', authUsersError)
  } else {
    console.log(`Found ${authUsers.users.length} auth users:`)
    authUsers.users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}`)
    })
  }
}

checkDatabase()
  .then(() => {
    console.log('\nDatabase check completed.')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error checking database:', error)
    process.exit(1)
  }) 